const User = require('../models/User');

const DAY = 24 * 60 * 60 * 1000;
const PREFIX = 'biteSizeSubscription.';

// Copies a Razorpay subscription onto the user. Called by the browser's verify
// step and by the webhook, so it sets absolute values and is safe to run twice.
// Access is always derived from what Razorpay reports, never from the client.
const applySubscription = async (sub) => {
    // The Razorpay account also holds older part-payment subscriptions.
    if (sub?.notes?.product !== 'swipes' || !sub.notes.userId) return false;

    const user = await User.findById(sub.notes.userId).select('biteSizeSubscription').lean();
    if (user?.biteSizeSubscription?.razorpaySubscriptionId !== sub.id) return false;

    const fields = {};

    if (sub.status === 'authenticated') {
        // Mandate approved and the upfront Rs 799 paid. Access runs to the first
        // yearly charge, plus a day of grace so that charge and its webhook land
        // before access lapses.
        Object.assign(fields, {
            status: 'active',
            planType: 'yearly',
            expiresAt: new Date(sub.start_at * 1000 + DAY),
            autopayStatus: 'on',
            nextChargeAt: new Date(sub.start_at * 1000)
        });
    } else if (sub.status === 'active' && sub.paid_count > 0) {
        Object.assign(fields, {
            status: 'active',
            planType: 'yearly',
            expiresAt: new Date(sub.current_end * 1000 + DAY),
            autopayStatus: 'on',
            nextChargeAt: sub.charge_at ? new Date(sub.charge_at * 1000) : null
        });
    } else if (sub.status === 'pending' || sub.status === 'halted') {
        // Razorpay is retrying or has given up. Access runs to its existing date.
        fields.autopayStatus = 'failed';
    } else if (['cancelled', 'completed', 'expired'].includes(sub.status)) {
        fields.autopayStatus = 'off';
        fields.nextChargeAt = null;
    } else {
        return false;
    }

    const $set = Object.fromEntries(Object.entries(fields).map(([key, value]) => [PREFIX + key, value]));
    await User.updateOne({ _id: sub.notes.userId }, { $set });
    return true;
};

module.exports = { applySubscription };
