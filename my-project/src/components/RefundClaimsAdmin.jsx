import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { BASE_URL } from '../config';

const formatDate = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const hoursBetween = (a, b) => (a && b ? Math.round((new Date(b) - new Date(a)) / 36e5) : null);

// Swipes Pro money-back claims. This screen moves no money: refund the
// payment in the Razorpay dashboard first, then mark the claim refunded.
const RefundClaimsAdmin = () => {
    const [status, setStatus] = useState('pending');
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/bitesize-courses/admin/refund-claims?status=${status}`, { credentials: 'include' });
            const data = await res.json();
            setClaims(data.success ? data.claims : []);
        } catch {
            setClaims([]);
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => { load(); }, [load]);

    const decide = async (claim, next) => {
        const question = next === 'paid'
            ? `Have you already refunded ₹${claim.amount} in Razorpay (payment ${claim.paymentId || 'see subscription ' + claim.subscriptionId})? This only marks it done.`
            : `Reject this ₹${claim.amount} claim? The student will see "Not approved".`;
        if (!window.confirm(question)) return;
        const note = next === 'rejected' ? window.prompt('Reason (optional, for your records):') || '' : '';
        setBusyId(claim._id);
        try {
            const res = await fetch(`${BASE_URL}/bitesize-courses/admin/refund-claims/${claim._id}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: next, note })
            });
            if (!res.ok) alert((await res.json()).message || 'Could not update the claim.');
            await load();
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="p-2 md:p-6 text-white min-h-[500px]">
            <h2 className="text-2xl font-black mb-1 flex items-center gap-2"><ShieldCheck className="text-green-500" /> Money-back claims</h2>
            <p className="text-gray-400 text-sm mb-5">
                Refund in the Razorpay dashboard (Payments → search the payment id → Refund → partial amount), then mark it refunded here.
                Check the evidence: very fast finishes can mean skipped lessons.
            </p>

            <div className="flex gap-2 mb-5">
                {['pending', 'paid', 'rejected'].map((s) => (
                    <button key={s} onClick={() => setStatus(s)} className={`px-4 py-2 rounded-xl text-sm font-bold capitalize ${status === s ? 'bg-green-600' : 'bg-white/5'}`}>
                        {s === 'paid' ? 'Refunded' : s}
                    </button>
                ))}
            </div>

            {loading ? (
                <Loader2 className="animate-spin text-green-500 mx-auto" size={28} />
            ) : claims.length === 0 ? (
                <p className="text-gray-500 text-center py-12">No {status === 'paid' ? 'refunded' : status} claims.</p>
            ) : (
                <div className="space-y-4">
                    {claims.map((claim) => (
                        <div key={claim._id} className="bg-[#141414] border border-white/10 rounded-2xl p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-black text-lg">₹{claim.amount}</p>
                                    <p className="text-sm">{claim.user?.name} · {claim.user?.email} · {claim.user?.phone || 'no phone'}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Paid {formatDate(claim.paidAt)} · claimed {formatDate(claim.createdAt)}
                                    </p>
                                    <p className="text-xs text-gray-400">Payment: <span className="font-mono text-gray-200 select-all">{claim.paymentId || 'not found'}</span> · Subscription: <span className="font-mono select-all">{claim.subscriptionId}</span></p>
                                </div>
                                {claim.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button disabled={busyId === claim._id} onClick={() => decide(claim, 'paid')} className="px-4 py-2 rounded-xl bg-green-600 font-bold text-sm">Mark refunded</button>
                                        <button disabled={busyId === claim._id} onClick={() => decide(claim, 'rejected')} className="px-4 py-2 rounded-xl bg-white/10 font-bold text-sm">Reject</button>
                                    </div>
                                )}
                                {claim.status !== 'pending' && (
                                    <p className="text-xs text-gray-400">{claim.status === 'paid' ? 'Refunded' : 'Rejected'} {formatDate(claim.decidedAt)}{claim.adminNote ? ` · ${claim.adminNote}` : ''}</p>
                                )}
                            </div>
                            <table className="w-full text-xs mt-3">
                                <thead className="text-gray-500 text-left">
                                    <tr><th className="py-1">Course</th><th>₹</th><th>Lessons</th><th>Started</th><th>Certificate</th><th>Took</th></tr>
                                </thead>
                                <tbody>
                                    {claim.courses.map((c) => {
                                        const took = hoursBetween(c.firstActivityAt, c.certificateAt);
                                        return (
                                            <tr key={c.course} className="border-t border-white/5">
                                                <td className="py-1.5 pr-2">{c.title}</td>
                                                <td>{c.amount}</td>
                                                <td>{c.lessonsWatched}/{c.lessonsTotal}</td>
                                                <td>{formatDate(c.firstActivityAt)}</td>
                                                <td>{formatDate(c.certificateAt)}</td>
                                                <td className={took !== null && took < 1 ? 'text-red-400 font-bold' : ''}>{took === null ? '—' : took < 1 ? 'under 1 hr' : `${took} hrs`}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RefundClaimsAdmin;
