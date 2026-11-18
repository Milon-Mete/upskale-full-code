import React from 'react';

// The ₹199 offer poster, drawn in HTML so the text stays sharp and needs no
// image download. "compact" is the small homepage thumbnail.
const Icicles = () => (
    <svg className="winter-icicles" viewBox="0 0 300 26" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0h300v6c-6 0-8 14-11 14s-4-12-9-12-5 18-9 18-5-16-10-16-4 10-8 10-5-14-10-14-4 20-9 20-5-18-10-18-4 9-8 9-5-13-10-13-4 16-9 16-5-12-10-12-4 8-8 8-6-15-10-15-4 19-9 19-5-17-10-17-4 11-8 11-5-12-10-12-4 15-9 15-5-11-10-11-4 7-8 7-5-14-10-14-4 18-9 18-5-16-10-16-4 9-8 9-5-12-10-12-4 13-9 13-5-10-10-10-4 6-8 6-5-12-10-12-4 16-9 16-5-14-10-14V0z" fill="rgba(224,242,254,0.9)" />
    </svg>
);

const WinterPoster = ({ compact = false, price = 199, mrp = 2997 }) => {
    if (compact) {
        return (
            <div className="winter-poster winter-poster-sm" aria-hidden="true">
                <span className="winter-aurora" />
                <span className="relative text-[8px] md:text-[10px] font-black tracking-[0.2em] text-sky-200">2027</span>
                <span className="winter-title relative text-lg md:text-2xl leading-[0.9] mt-1">WINTER<br />ARC</span>
                <span className="relative text-[9px] md:text-xs font-black text-white mt-1.5">₹{price}</span>
            </div>
        );
    }

    return (
        <div className="winter-poster">
            <span className="winter-aurora" />
            <Icicles />
            <div className="relative flex flex-col items-center text-center px-6 pt-12 pb-8">
                <p className="text-xs md:text-sm font-black uppercase tracking-[0.35em] text-sky-200">New Year · New You</p>
                <h2 className="winter-title text-[4.2rem] md:text-[5.5rem] leading-[0.85] mt-4">WINTER<br />ARC</h2>
                <p className="mt-5 text-lg md:text-xl font-black text-white">Data Analyst Starter Pack</p>
                <p className="text-sm text-sky-100/80 mt-1">Start 2027 job-ready</p>

                <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {['MS Excel', 'Power BI', 'AI Tools'].map((name) => (
                        <span key={name} className="px-3 py-1.5 rounded-full bg-white/10 border border-sky-200/30 text-white text-sm font-bold backdrop-blur">{name}</span>
                    ))}
                </div>

                <div className="mt-7 flex items-end gap-3">
                    <span className="text-xl font-bold text-sky-100/50 line-through">₹{mrp.toLocaleString('en-IN')}</span>
                    <span className="text-6xl md:text-7xl font-black text-white leading-none winter-glow-text">₹{price}</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-200 mt-2">3 recorded courses · certificates</p>

                <span className="mt-7 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#0b1530] font-black tracking-wide">
                    BUY NOW
                </span>
            </div>
        </div>
    );
};

export default WinterPoster;
