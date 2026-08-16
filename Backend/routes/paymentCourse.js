const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const User = require('../models/User');
const Order = require('../models/Order');
const { requireAuth } = require('../middleware/auth');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// =====================================================
// CATALOGUE — the only source of truth for price
// =====================================================
//
// Amounts live here and nowhere else. The browser sends a course key and a
// track key, never a number: a client that can name its own price can pay ₹1
// for a ₹3,500 course. Anything not in this table is rejected outright.
const CATALOGUE = {
    'ecommerce-tshirt-business': {
        title: 'E-Commerce & T-Shirt Business',
        tracks: {
            crash: {
                amount: 3500,
                planType: 'standard',
                label: '12-Class Crash Course',
                note: 'One-time fee for all 12 classes'
            },
            weekend: {
                // The 6-month course is ₹2,000 per month, collected monthly.
                // Checkout takes month 1 only — never the ₹12,000 total — so
                // nobody is charged for months they have not yet attended.
                amount: 2000,
                planType: 'monthly',
                label: '6-Month Weekend Course — Month 1',
                note: '₹2,000 per month × 6 months, billed monthly'
            }
        }
    }
};

// Public: lets the page render prices without hardcoding them in the bundle,
// so a price change here reaches the site without a frontend rebuild.
router.get('/catalogue/:courseKey', (req, res) => {
    const course = CATALOGUE[req.params.courseKey];
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    res.json({
        success: true,
        title: course.title,
        tracks: Object.entries(course.tracks).reduce((acc, [key, t]) => {
            acc[key] = { amount: t.amount, label: t.label, note: t.note };
            return acc;
        }, {})
    });
});

// =====================================================
// CREATE ORDER
// =====================================================
router.post('/create-order', requireAuth, async (req, res) => {
    try {
        const { courseKey, trackKey } = req.body;
        const userId = req.user._id;

        const course = CATALOGUE[courseKey];
        if (!course) return res.status(400).json({ success: false, message: 'Unknown course' });

        const track = course.tracks[trackKey];
        if (!track) return res.status(400).json({ success: false, message: 'Unknown course track' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const order = await razorpay.orders.create({
            amount: Math.round(track.amount * 100),
            currency: 'INR',
            receipt: `crs_${Date.now()}`,
            notes: { orderType: course.title, track: track.label, courseKey, trackKey }
        });

        await new Order({
            userId,
            itemModel: 'Course',
            planType: track.planType,
            basePrice: track.amount,
            amountPaid: track.amount,
            paymentType: trackKey === 'weekend' ? 'installment' : 'one-time',
            razorpayOrderId: order.id,
            status: 'pending'
        }).save();

        res.json({
            success: true,
            key_id: process.env.RAZORPAY_KEY_ID,
            order_id: order.id,
            amount: track.amount,
            description: `${course.title} — ${track.label}`
        });
    } catch (err) {
        console.error('❌ Course Order Creation Failed:', err);
        res.status(500).json({ success: false, message: 'Payment initialization failed' });
    }
});

// =====================================================
// VERIFY PAYMENT
// =====================================================
router.post('/verify-payment', requireAuth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.user._id;

        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expected !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        if (order.status === 'paid') {
            return res.json({ success: true, message: 'Already confirmed' });
        }

        order.status = 'paid';
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.fulfilledVia = 'frontend:verify-payment';
        await order.save();

        // Recorded with an atomic $push rather than user.save(). save() validates
        // the whole document, so unrelated legacy data elsewhere on the account
        // would throw here — after Razorpay has already taken the money. A money
        // path must not depend on the rest of the record being valid.
        await User.updateOne(
            { _id: userId },
            {
                $push: {
                    enrolledCourses: {
                        itemModel: 'Course',
                        planType: order.planType,
                        paymentStatus: order.paymentType === 'installment' ? 'partial' : 'full',
                        amountPaid: order.amountPaid,
                        purchasedAt: new Date()
                    }
                }
            }
        );

        console.log(`✅ Course enrolment recorded for user ${userId} (order ${razorpay_order_id})`);
        res.json({ success: true, message: 'Payment verified, enrolment confirmed!' });
    } catch (err) {
        console.error('❌ Course Verification Error:', err);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
});

module.exports = router;
