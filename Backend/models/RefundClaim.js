const mongoose = require('mongoose');

// A Swipes Pro money-back claim: the student finished courses within the
// guarantee window and asked for their share of the Rs 799 back. Nothing is
// refunded automatically. The owner checks the evidence, refunds in the
// Razorpay dashboard, then marks the claim paid (or rejected).
const refundClaimSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: String, default: null },
    paymentId: { type: String, default: null },
    paidAt: { type: Date, default: null },
    courses: [{
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'BiteSizeCourse', required: true },
        title: { type: String, default: '' },
        amount: { type: Number, required: true },
        lessonsWatched: { type: Number, default: 0 },
        lessonsTotal: { type: Number, default: 0 },
        firstActivityAt: { type: Date, default: null },
        certificateAt: { type: Date, default: null }
    }],
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'rejected'], default: 'pending' },
    adminNote: { type: String, default: '' },
    decidedAt: { type: Date, default: null }
}, { timestamps: true });

// A course can be claimed once per student, across all their claims. The
// unique multikey index makes a double tap fail instead of paying twice.
refundClaimSchema.index({ user: 1, 'courses.course': 1 }, { unique: true });
refundClaimSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.models.RefundClaim || mongoose.model('RefundClaim', refundClaimSchema);
