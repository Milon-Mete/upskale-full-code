import React from 'react';
import { ShieldCheck, BadgeCheck, ExternalLink } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   ACCREDITATIONS

   Trust strip for the home, masterclass and cohort pages.

   Wording here is deliberately literal, because both of these
   certify narrower things than they're often used to imply:

   • ISO 9001:2015 certifies the QUALITY MANAGEMENT SYSTEM — the
     company's processes. It is not an accreditation of course
     content and confers no academic standing. The scope printed
     on the certificate is "providing services of academic
     coaching and skill training".

   • DPIIT recognition means the company is recognised as a
     STARTUP under the Startup India scheme. It is not government
     affiliation, approval, accreditation or endorsement of the
     courses. Saying otherwise on a page that sells courses would
     be a false claim.

   Both certificates are issued to the operating company, not to
   the UPSKALE brand, so the legal entity is named below them —
   otherwise the numbers can't be checked against the registries.

   The images served here are watermarked copies. Anyone can lift a
   certificate off a public page and pass it off as their own, so no
   clean high-resolution original is published — the watermark is the
   only version that exists on the web server.
   ───────────────────────────────────────────────────────────── */

const CREDENTIALS = [
    {
        icon: ShieldCheck,
        title: 'ISO 9001:2015 Certified',
        subtitle: 'Quality Management System',
        scope: 'Scope: providing services of academic coaching and skill training',
        ref: 'Certificate No. LCL/3751/0824',
        validity: 'Valid to 23 Aug 2027',
        image: '/certificates/iso-9001-2015.jpg',
        imageAlt: 'ISO 9001:2015 quality management system certificate issued to Chakraborty & Banerjee Associates Private Limited by London Cert Ltd, certificate number LCL/3751/0824',
        href: '/certificates/iso-9001-2015.jpg',
        verifyLabel: 'View full size'
    },
    {
        icon: BadgeCheck,
        title: 'DPIIT Recognised Startup',
        subtitle: 'Startup India · Ministry of Commerce & Industry, Government of India',
        scope: 'Recognised in the Education industry, E-learning sector',
        ref: 'Certificate No. DIPP276171',
        validity: 'Valid to 11 Aug 2032',
        image: '/certificates/dpiit-startup-india.jpg',
        imageAlt: 'Government of India DPIIT certificate of recognition naming Chakraborty & Banerjee Associates Private Limited as a recognised startup, certificate number DIPP276171',
        href: '/certificates/dpiit-startup-india.jpg',
        verifyLabel: 'View full size'
    }
];

const Accreditations = ({
    accent = '#008a45',
    heading = 'Recognised & Certified',
    className = ''
}) => {
    return (
        <section className={`py-14 px-4 sm:px-6 lg:px-8 ${className}`} aria-labelledby="accreditations-heading">
            <div className="max-w-5xl mx-auto">

                <div className="text-center mb-9">
                    <h2
                        id="accreditations-heading"
                        className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 mb-2"
                    >
                        {heading}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium max-w-xl mx-auto">
                        UPSKALE is operated by Chakraborty &amp; Banerjee Associates Private Limited,
                        incorporated in India in 2022.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {CREDENTIALS.map(c => {
                        const Icon = c.icon;
                        return (
                            <div
                                key={c.ref}
                                className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
                            >
                                {/* The certificate itself. Both scans are different shapes
                                    (ISO portrait, DPIIT landscape), so they share a fixed-height
                                    stage and are contained inside it rather than cropped. */}
                                <a
                                    href={c.image}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-xl border border-gray-200 bg-gray-50 overflow-hidden mb-4 group"
                                >
                                    <img
                                        src={c.image}
                                        alt={c.imageAlt}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-[300px] sm:h-[340px] object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                                    />
                                </a>

                                <div className="flex gap-4">
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ background: `${accent}14`, color: accent }}
                                        aria-hidden="true"
                                    >
                                        <Icon size={22} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-[15px] font-black text-gray-900 leading-snug">
                                            {c.title}
                                        </h3>
                                        <p className="text-[12.5px] font-semibold text-gray-500 leading-snug mt-0.5">
                                            {c.subtitle}
                                        </p>

                                        <p className="text-[12px] text-gray-500 leading-relaxed mt-2">
                                            {c.scope}
                                        </p>

                                        <div className="flex items-center gap-2 flex-wrap mt-2.5 text-[11.5px] font-semibold text-gray-400">
                                            <span>{c.ref}</span>
                                            <span aria-hidden="true">·</span>
                                            <span>{c.validity}</span>
                                        </div>

                                        <a
                                            href={c.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 mt-2.5 text-[12px] font-bold hover:underline"
                                            style={{ color: accent }}
                                        >
                                            {c.verifyLabel}
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="text-[11.5px] text-gray-400 text-center mt-6 max-w-2xl mx-auto leading-relaxed">
                    ISO 9001:2015 certifies our quality management system. DPIIT recognition is startup
                    recognition under the Startup India scheme. Neither is an accreditation of course
                    content, nor a government endorsement, and our programmes do not lead to a degree.
                </p>
            </div>
        </section>
    );
};

export default Accreditations;
