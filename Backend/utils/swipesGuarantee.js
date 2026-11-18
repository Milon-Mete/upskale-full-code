const User = require('../models/User');
const BiteSizeCourse = require('../models/BiteSizeCourse');
const Certificate = require('../models/Certificate');
const VideoProgress = require('../models/VideoProgress');
const RefundClaim = require('../models/RefundClaim');

// Swipes Pro money-back guarantee. Finish a course (every lesson watched to
// the end, certificate earned) within 30 days of paying and that course earns
// back a share of the Rs 799. Three courses earn back all of it.
// Keep in step with GUARANTEE_* in my-project/src/swipes.js.
const GUARANTEE_DAYS = 30;
const SHARES = [266, 266, 267];
const DAY = 24 * 60 * 60 * 1000;

// Same rule as realSwipes() on the frontend: demo records never count.
const isRealCourse = (course) => {
    const lessons = (course.chapters || []).reduce((n, ch) => n + (ch.modules || []).length, 0);
    return lessons > 0 && !/demo|ignore/i.test(`${course.tag} ${course.highlight}`);
};

const videoModuleIds = (course) => (course.chapters || [])
    .flatMap((ch) => ch.modules || [])
    .filter((m) => m.type === 'video')
    .map((m) => m._id.toString());

// When the student paid. Recorded on payment from now on; for anyone who paid
// before that, Razorpay's creation time of their subscription is used once.
const resolvePaidAt = async (user, razorpay) => {
    const sub = user.biteSizeSubscription || {};
    if (sub.paidAt) return new Date(sub.paidAt);
    if (!sub.razorpaySubscriptionId || sub.status !== 'active') return null;
    const rz = await razorpay.subscriptions.fetch(sub.razorpaySubscriptionId);
    if (!rz?.created_at) return null;
    const paidAt = new Date(rz.created_at * 1000);
    await User.updateOne(
        { _id: user._id, 'biteSizeSubscription.paidAt': null },
        { $set: { 'biteSizeSubscription.paidAt': paidAt } }
    );
    return paidAt;
};

const guaranteeStatus = async (userId, razorpay) => {
    const user = await User.findById(userId).select('biteSizeSubscription').lean();
    const sub = user?.biteSizeSubscription || {};
    // Only the Rs 799 autopay plan carries the guarantee, not the retired plans.
    if (!user || !sub.razorpaySubscriptionId || sub.planType !== 'yearly') return { eligible: false };

    const paidAt = await resolvePaidAt(user, razorpay);
    if (!paidAt) return { eligible: false };
    const deadline = new Date(paidAt.getTime() + GUARANTEE_DAYS * DAY);

    const all = await BiteSizeCourse.find({}).select('title highlight tag chapters').lean();
    const courses = all.filter(isRealCourse);
    const courseIds = courses.map((c) => c._id);

    const [progress, certificates, claims] = await Promise.all([
        VideoProgress.find({ user: userId, courseId: { $in: courseIds } }).select('courseId moduleId completed createdAt').lean(),
        Certificate.find({ user: userId, course: { $in: courseIds } }).select('course issuedDate createdAt').lean(),
        RefundClaim.find({ user: userId }).select('courses status amount').lean()
    ]);

    const claimed = new Map();
    claims.forEach((claim) => claim.courses.forEach((c) => claimed.set(c.course.toString(), claim.status)));

    const list = courses.map((course) => {
        const id = course._id.toString();
        const videos = new Set(videoModuleIds(course));
        const mine = progress.filter((p) => p.courseId.toString() === id);
        const watched = new Set(mine.filter((p) => p.completed && videos.has(p.moduleId.toString())).map((p) => p.moduleId.toString()));
        const firstActivityAt = mine.reduce((min, p) => (!min || p.createdAt < min ? p.createdAt : min), null);
        const cert = certificates.find((c) => c.course.toString() === id);
        const certificateAt = cert ? new Date(cert.createdAt || cert.issuedDate) : null;
        const inWindow = certificateAt && certificateAt >= paidAt && certificateAt <= deadline;
        return {
            courseId: id,
            title: course.title,
            lessonsTotal: videos.size,
            lessonsWatched: watched.size,
            firstActivityAt,
            certificateAt,
            finished: videos.size > 0 && watched.size >= videos.size && Boolean(inWindow),
            claimStatus: claimed.get(id) || null
        };
    });

    const slotsUsed = claimed.size;
    const claimable = list.filter((c) => c.finished && !c.claimStatus);
    const claimableAmount = claimable
        .slice(0, Math.max(0, SHARES.length - slotsUsed))
        .reduce((sum, _c, i) => sum + SHARES[slotsUsed + i], 0);

    return {
        eligible: true,
        paidAt,
        deadline,
        windowOpen: Date.now() <= deadline.getTime(),
        shares: SHARES,
        courses: list,
        claimedAmount: claims.filter((c) => c.status !== 'rejected').reduce((sum, c) => sum + c.amount, 0),
        refundedAmount: claims.filter((c) => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0),
        claimableAmount
    };
};

const createClaim = async (userId, razorpay) => {
    const status = await guaranteeStatus(userId, razorpay);
    if (!status.eligible) return { error: 'The money-back guarantee is for Swipes Pro members.' };

    const slotsUsed = status.courses.filter((c) => c.claimStatus).length;
    if (slotsUsed >= SHARES.length) return { error: 'You have already claimed the full ₹799.' };
    const ready = status.courses.filter((c) => c.finished && !c.claimStatus).slice(0, Math.max(0, SHARES.length - slotsUsed));
    if (ready.length === 0) return { error: 'Finish a course within 30 days of joining to claim money back.' };

    const user = await User.findById(userId).select('biteSizeSubscription').lean();
    const subscriptionId = user.biteSizeSubscription.razorpaySubscriptionId;

    // The payment id lets the owner find the Rs 799 in Razorpay to refund it.
    let paymentId = null;
    try {
        const invoices = await razorpay.invoices.all({ subscription_id: subscriptionId });
        const paid = (invoices.items || []).filter((inv) => inv.payment_id).sort((a, b) => a.created_at - b.created_at);
        paymentId = paid[0]?.payment_id || null;
    } catch (err) {
        console.error('Guarantee: could not look up the payment id', err.message);
    }

    const courses = ready.map((c, i) => ({
        course: c.courseId,
        title: c.title,
        amount: SHARES[slotsUsed + i],
        lessonsWatched: c.lessonsWatched,
        lessonsTotal: c.lessonsTotal,
        firstActivityAt: c.firstActivityAt,
        certificateAt: c.certificateAt
    }));

    try {
        const claim = await RefundClaim.create({
            user: userId,
            subscriptionId,
            paymentId,
            paidAt: status.paidAt,
            courses,
            amount: courses.reduce((sum, c) => sum + c.amount, 0)
        });
        return { claim };
    } catch (err) {
        if (err.code === 11000) return { error: 'You have already claimed for this course.' };
        throw err;
    }
};

module.exports = { guaranteeStatus, createClaim, GUARANTEE_DAYS, SHARES };
