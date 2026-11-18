import React, { useEffect, useState } from 'react';
import { CircleCheck, Coins, Loader2, ShieldCheck } from 'lucide-react';
import { BASE_URL } from '../config';
import { GUARANTEE_DAYS, GUARANTEE_SHARES, SWIPES_PRICE } from '../swipes';

const rupees = (amount) => `₹${amount.toLocaleString('en-IN')}`;
const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const authHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

// Running totals: ₹266, ₹532, ₹799.
const runningTotals = GUARANTEE_SHARES.map((_, i) => GUARANTEE_SHARES.slice(0, i + 1).reduce((a, b) => a + b, 0));

// Shown before buying: the promise, as three coins that fill up.
export const GuaranteePromise = () => (
    <section className="swipe-rise guarantee-card mt-7 text-left" style={{ '--delay': '400ms' }}>
        <div className="flex items-center gap-3">
            <span className="guarantee-seal shrink-0"><ShieldCheck size={26} /></span>
            <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-green-700">Money-back guarantee</p>
                <h2 className="text-xl font-black leading-tight">Finish courses, get your {rupees(SWIPES_PRICE)} back</h2>
            </div>
        </div>

        <ol className="grid grid-cols-3 gap-2 mt-5">
            {runningTotals.map((total, i) => (
                <li key={total} className="guarantee-step" style={{ '--delay': `${i * 0.35}s` }}>
                    <span className="guarantee-coin"><Coins size={18} /></span>
                    <span className="block text-[11px] font-bold text-[#6b3a1a] mt-2">Finish {i + 1} course{i ? 's' : ''}</span>
                    <span className="block text-lg font-black text-green-700 leading-tight">{rupees(total)}</span>
                    <span className="block text-[10px] font-semibold text-[#8a5a35]">back</span>
                </li>
            ))}
        </ol>

        <p className="text-xs text-[#6b3a1a] leading-relaxed mt-4">
            Finish a course within {GUARANTEE_DAYS} days of joining (watch every lesson and earn the certificate) and get {rupees(GUARANTEE_SHARES[0])} back.
            Finish 3 and you get the full {rupees(SWIPES_PRICE)} back. You keep your Swipes Pro access.
        </p>
    </section>
);

// Shown to members: how close they are, and the claim button.
export const GuaranteeTracker = () => {
    const [status, setStatus] = useState(null);
    const [claiming, setClaiming] = useState(false);
    const [note, setNote] = useState('');

    const load = async () => {
        try {
            const res = await fetch(`${BASE_URL}/bitesize-courses/guarantee/status`, { headers: authHeaders(), credentials: 'include' });
            if (res.ok) setStatus(await res.json());
        } catch {
            /* the tracker just stays hidden */
        }
    };

    useEffect(() => { load(); }, []);

    const claim = async () => {
        setClaiming(true);
        setNote('');
        try {
            const res = await fetch(`${BASE_URL}/bitesize-courses/guarantee/claim`, { method: 'POST', headers: authHeaders(), credentials: 'include' });
            const data = await res.json();
            setNote(data.message || (res.ok ? 'Claim sent.' : 'Could not send your claim.'));
            await load();
        } catch {
            setNote('Connection error. Please try again.');
        } finally {
            setClaiming(false);
        }
    };

    if (!status?.eligible) return null;

    const daysLeft = Math.max(0, Math.ceil((new Date(status.deadline) - Date.now()) / 86400000));
    const finished = status.courses.filter((c) => c.finished).length;
    const earned = runningTotals[Math.min(finished, GUARANTEE_SHARES.length) - 1] || 0;

    return (
        <div className="mt-5 text-left border-t border-[#f3dfc4] pt-5">
            <div className="flex items-center justify-between gap-3">
                <p className="font-black flex items-center gap-2"><ShieldCheck size={18} className="text-green-600" /> Money back</p>
                <p className="text-xs font-bold text-[#8a5a35]">
                    {status.windowOpen ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left · till ${formatDate(status.deadline)}` : `Window closed ${formatDate(status.deadline)}`}
                </p>
            </div>

            <div className="guarantee-bar mt-3" aria-label={`${rupees(earned)} of ${rupees(SWIPES_PRICE)} earned back`}>
                <span style={{ width: `${(earned / SWIPES_PRICE) * 100}%` }} />
            </div>
            <p className="text-xs text-[#6b3a1a] mt-1.5"><b className="text-green-700">{rupees(earned)}</b> of {rupees(SWIPES_PRICE)} earned back</p>

            <ul className="mt-4 space-y-2">
                {status.courses.map((course) => (
                    <li key={course.courseId} className="flex items-center gap-3 text-sm">
                        {course.finished
                            ? <CircleCheck size={20} className="text-green-600 shrink-0" />
                            : <span className="w-5 h-5 rounded-full border-2 border-[#e7c9a0] shrink-0" />}
                        <span className="flex-1 min-w-0 font-semibold truncate">{course.title}</span>
                        <span className="text-xs text-[#8a5a35] shrink-0">
                            {course.claimStatus === 'paid' ? 'Refunded'
                                : course.claimStatus === 'pending' ? 'Claimed'
                                    : course.claimStatus === 'rejected' ? 'Not approved'
                                        : course.finished ? 'Finished'
                                            : `${course.lessonsWatched}/${course.lessonsTotal} lessons${course.certificateAt ? '' : ' · no certificate yet'}`}
                        </span>
                    </li>
                ))}
            </ul>

            {status.claimableAmount > 0 && (
                <button onClick={claim} disabled={claiming} className="w-full mt-4 py-3.5 rounded-xl bg-green-600 text-white font-black active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
                    {claiming ? <Loader2 size={20} className="animate-spin" /> : <>Claim {rupees(status.claimableAmount)} back</>}
                </button>
            )}
            {status.claimedAmount > status.refundedAmount && (
                <p className="text-xs text-[#6b3a1a] mt-3">{rupees(status.claimedAmount - status.refundedAmount)} claimed. It goes back to your original payment method within 7 working days.</p>
            )}
            {note && <p className="text-sm font-bold text-green-700 mt-3">{note}</p>}
            <p className="text-[11px] text-[#8a5a35] mt-3">A lesson counts once you watch it to the end. Finish the course quiz to earn its certificate.</p>
        </div>
    );
};
