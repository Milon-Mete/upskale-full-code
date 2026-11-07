import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, TrendingUp } from 'lucide-react';

/*
 * Netflix-style rail primitives for the dark homepage.
 * RailCard renders one course card; NetflixRail renders a titled
 * horizontal snap rail. All data comes from props — no fake content.
 */

export const RailCard = ({
  to,
  state,
  image,
  fallbackIcon: FallbackIcon,
  ribbon,          // small blue ribbon text, e.g. "TECH & AI" (category only)
  kicker,          // small white line above the big title
  bigTitle,        // huge condensed title
  badge,           // small badge under the title, e.g. "BEGINNER'S COURSE"
  badgeColor = '#FDE047',
  metaLeft,        // { icon, text }
  metaRight,       // { icon, text } — omit when no real data
  onClick,
  rank,            // giant outlined rank number (Trending rail)
}) => {
  const MetaIcon = metaLeft?.icon;
  const MetaRightIcon = metaRight?.icon;

  const card = (
    <div className="rail-card relative rounded-2xl overflow-hidden border border-white/10 bg-[#141416] transition-transform duration-300 hover:-translate-y-1 hover:border-white/25">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-[#1c1c22] via-[#101014] to-[#1c1c22]">
        {image ? (
          <img
            src={image}
            alt={bigTitle}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : null}
        {FallbackIcon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <FallbackIcon size={44} className="text-white/15" />
          </div>
        )}
        {/* Readability gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10 pointer-events-none" />

        {/* Category ribbon */}
        {ribbon && (
          <div className="absolute top-0 left-0 bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] text-white text-[10px] font-black uppercase tracking-[0.12em] px-3 py-1 rounded-br-xl shadow-lg">
            {ribbon}
          </div>
        )}

        {/* Title block */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {kicker && (
            <p className="text-[11px] font-bold text-white/85 uppercase tracking-[0.14em] mb-0.5 line-clamp-1">
              {kicker}
            </p>
          )}
          <h3
            className="font-black uppercase leading-[0.95] tracking-tight text-[26px] text-transparent bg-clip-text line-clamp-2"
            style={{ backgroundImage: `linear-gradient(180deg, #FEF9C3 0%, ${badgeColor} 60%, #D97706 100%)` }}
          >
            {bigTitle}
          </h3>
          {badge && (
            <span
              className="inline-block mt-1.5 text-[10px] font-black uppercase tracking-[0.12em] px-2 py-0.5 rounded"
              style={{ backgroundColor: 'rgba(0,0,0,0.65)', color: badgeColor, border: `1px solid ${badgeColor}55` }}
            >
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#101012]">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-300">
          {MetaIcon && <MetaIcon size={14} className="text-gray-400" />}
          {metaLeft?.text}
        </span>
        {metaRight && (
          <span className={`flex items-center gap-1 text-[12px] ${metaRight.strike ? 'font-medium text-gray-500 line-through' : 'font-bold text-gray-200'}`}>
            {MetaRightIcon && <MetaRightIcon size={14} className="text-amber-400 fill-amber-400" />}
            {metaRight.text}
          </span>
        )}
      </div>
    </div>
  );

  const inner = rank != null ? (
    <div className="relative">
      {/* Giant outlined rank number overlapping bottom-left */}
      <span
        aria-hidden
        className="absolute -bottom-4 -left-1 z-10 font-black leading-none select-none pointer-events-none"
        style={{
          fontSize: '104px',
          color: 'transparent',
          WebkitTextStroke: '3px #B8860B',
          textShadow: '0 4px 24px rgba(0,0,0,0.8)',
        }}
      >
        {rank}
      </span>
      <div className="pl-10">{card}</div>
    </div>
  ) : card;

  if (to) {
    return (
      <Link
        to={to}
        state={state}
        onClick={onClick}
        className="snap-start shrink-0 w-[76%] sm:w-[300px] lg:w-[320px]"
      >
        {inner}
      </Link>
    );
  }
  return <div className="snap-start shrink-0 w-[76%] sm:w-[300px] lg:w-[320px]">{inner}</div>;
};

export const NetflixRail = ({ id, eyebrow, title, titleGold = false, icon: Icon, children }) => (
  <section id={id} className="scroll-mt-24 py-6 md:py-8">
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center gap-2 px-4 md:px-6 mb-4">
        {Icon && <Icon size={20} className={titleGold ? 'text-amber-400' : 'text-gray-400'} />}
        {eyebrow && (
          <span className="hidden sm:inline text-[11px] font-black uppercase tracking-[0.22em] text-gray-500">
            {eyebrow}
          </span>
        )}
        <h2
          className={`text-2xl md:text-3xl font-black tracking-tight ${
            titleGold ? 'text-amber-300' : 'text-white'
          }`}
        >
          {title}
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 md:px-6 pb-4 scrollbar-hide">
        {children}
      </div>
    </div>
  </section>
);

export const RailSkeleton = () => (
  <div className="flex gap-4 px-4 md:px-6 max-w-[1400px] mx-auto">
    {[0, 1, 2].map((i) => (
      <div key={i} className="shrink-0 w-[76%] sm:w-[300px] lg:w-[320px]">
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#141416]">
          <div className="aspect-[16/10] bg-white/5 animate-pulse" />
          <div className="h-10 bg-white/[0.03]" />
        </div>
      </div>
    ))}
  </div>
);

export { BookOpen, Star, TrendingUp };
