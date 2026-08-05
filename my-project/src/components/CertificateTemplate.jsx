import React from 'react';
import { useParams } from 'react-router-dom';

// --- The specific skills for each course ---
export const COURSE_SKILLS = {
    "Advanced Certification in Generative AI & Cyber Security Ecosystems": [
        "Produce high-converting digital assets, including automated image campaigns, video advertisements, and voice cloning projects.",
        "Master AI-driven personal branding by customizing LLMs (like ChatGPT) and rapidly deploying portfolio websites to boost digital employability.",
        "Automate corporate workflows by instantly generating professional business reports and presentations using advanced Gen AI tools"
    ],
    "Gen AI Tools Mastery": [
        "Generate AI-powered advertisements, scripts, and marketing creatives",
        "Create professional reports, presentations, and structured documents in minutes",
        "Create a portfolio website using advanced generative AI tools"
    ],
    "Power BI & Data Visualization": [
        "Build interactive and insightful dashboards using Microsoft Power BI",
        "Transform raw data into business insights with advanced visuals and calculations",
        "Create automated reports and presentations for decision-making in minutes"
    ],
    "MS Excel with Generative AI": [
        "Clean, organize, and analyze complex datasets using advanced Excel functions",
        "Automate reporting and business calculations with formulas, pivot tables, and macros",
        "Integrate AI tools with Excel workflows for faster insights and enhanced productivity"
    ],
    "default": [
        "Successfully completed the extensive training and requirements for this course",
        "Demonstrated proficiency in the core concepts and practical applications",
        "Ready to apply these newly acquired skills in professional environments"
    ]
};

const CertificateTemplate = ({ data, innerRef }) => {
const qrLink = window.location.origin;
    const { id } = useParams();

    // Fetch the correct skills list based on the selected course
    const skillsList = COURSE_SKILLS[data?.course] || COURSE_SKILLS["default"];

    if (!data) return null;

    // Formatting Date dynamically
    const issuedDate = new Date(data?.issuedDate || Date.now()).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    return (
        <div
            ref={innerRef}
            className="w-[800px] h-[560px] p-2 flex-shrink-0 relative font-sans box-border"
            style={{ 
                backgroundColor: '#ffffff', 
                borderColor: '#111827', 
                borderWidth: '3px', 
                borderStyle: 'solid', 
                color: '#111827', 
                minWidth: '800px', 
                minHeight: '560px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' // Replaced shadow-xl
            }}
        >
            <div className="h-full w-full p-8 flex relative overflow-hidden" style={{ borderColor: '#1f2937', borderWidth: '1px', borderStyle: 'solid', backgroundColor: '#ffffff' }}>

                {/* 🔴 NEW RIGHT COLUMN: SVG RIBBON + QR CODE */}
                <div className="absolute top-0 right-8 w-[190px] h-full flex flex-col items-center z-10">
                    
                    {/* The White Ribbon with Black Border */}
                    <div className="relative w-full h-[360px] flex flex-col items-center pt-10">
                        {/* Custom SVG Ribbon Background */}
                        <svg className="absolute top-0 left-0 w-full h-full -z-10" viewBox="0 0 190 360" preserveAspectRatio="none">
                            <path d="M0 0 L0 320 L95 360 L190 320 L190 0" fill="#ffffff" stroke="#111827" strokeWidth="2" />
                        </svg>

                        <div className="text-[11px] font-black tracking-[0.25em] uppercase mb-2" style={{ color: '#000000' }}>
                            Authenticity
                        </div>
                        <div className="text-2xl font-black italic mb-8 tracking-wide" style={{ color: '#000000' }}>
                            certified
                        </div>

                        {/* ISO Badge Area */}
                        <img
                            src="https://res.cloudinary.com/villain/image/upload/v1771603560/WhatsApp_Image_2026-02-20_at_8.20.42_PM_ohof01.png"
                            alt="ISO Certification"
                            className="w-[110px] h-auto object-contain mb-4" 
                            crossOrigin="anonymous"
                        />
                        <div className="text-[12px] font-black tracking-wide" style={{ color: '#000000' }}>
                            ISO 9001:2015
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: '#000000' }}>
                            Quality Management
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1"></div>

                    {/* QR Code & ID Area */}
                    <div className="mb-4 flex flex-col items-center">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrLink)}`}
                            alt="QR"
                            className="w-[90px] h-[90px] object-contain mb-3"
                            crossOrigin="anonymous"
                        />
                        <div className="text-[10px] font-black uppercase tracking-widest text-black mb-1">
                            Verification ID
                        </div>
                        <div className="text-[11px] font-bold text-black">
                            {id || "CERT-1234567890"}
                        </div>
                    </div>
                </div>

                {/* Left Content Area */}
                <div className="flex-1 flex flex-col z-10 pr-40 relative h-full">
                    <div className="mb-2">
                        <img
                            src="https://res.cloudinary.com/villain/image/upload/v1771437585/20250730_170553_0000_bczvvu.png"
                            alt="Upscale Logo"
                            className="h-20 w-auto object-contain"
                            crossOrigin="anonymous"
                        />
                    </div>

                    <h1 className="text-5xl font-serif font-bold mb-2 mt-[-30px] tracking-wide" style={{ color: '#111827' }}>Certificate</h1>
                    <p className="text-lg italic mb-6 pl-1 font-serif" style={{ color: '#4b5563' }}>
                        of {data.score >= 75 ? "Excellence" : "Completion"} Awarded to
                    </p>
                    
                    <div className="mb-6 inline-block">
                        <h2 className="text-4xl font-bold uppercase mb-1" style={{ color: '#1e3a8a', lineHeight: '1.2' }}>
                            {data.name || "Student Name"}
                        </h2>
                        <div style={{ width: '90%', height: '2px', backgroundColor: '#111827', marginTop: '20px' }}></div>
                    </div>

                    <div className="mb-6 mt-[-20px] max-w-lg z-10 relative">
                        <p className="text-sm mb-1 leading-relaxed" style={{ color: '#374151' }}>
                            This certifies that the above-named individual has successfully completed the extensive training and requirements for the course:
                        </p>

                        <span className="font-bold text-xl block " style={{ color: '#000000' }}>
                            {data.course || "Course Name"}
                        </span>

                        <div
                            className="mt-4 mb-2 py-1 px-2 rounded-r border-l-[2.5px]"
                            style={{
                                
                                borderLeftColor: '#008a45' 
                            }}
                        >
                            <p className="text-[11px] font-bold mb-0.5" style={{ color: '#111827' }}>
                                Holder of this certificate can:
                            </p>
                            <ul className="list-disc pl-4 text-[10px] leading-tight space-y-0" style={{ color: '#4b5563' }}>
                                {skillsList.map((skill, index) => (
                                    <li key={index} className="pl-0.5 mb-0.5">{skill}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Footer: Signatures & Date */}
                    <div className="mt-auto flex justify-between items-end w-full pr-12 pb-2">
                        <div className="flex gap-16">
                            <div className="text-center flex flex-col items-center">
                                <h1 className=" w-auto mb-2 object-contain text-[18px]" style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive", color: '#000000' }}>Debkanta Chakraborty</h1>
                                <div style={{ width: '100%', height: '1px', backgroundColor: '#9ca3af', marginBottom: '4px' }}></div>
                                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#111827' }}>Debkanta Chakraborty</div>
                                <div className="text-[9px]" style={{ color: '#6b7280' }}>Founder & CEO of Upskale</div>
                            </div>
                            
                            <div className="text-center flex flex-col items-center">
                                <h1 className=" w-auto mb-2 object-contain text-[18px]" style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive", color: '#000000' }}>Soumyadeep Datta</h1>
                                <div style={{ width: '100%', height: '1px', backgroundColor: '#9ca3af', marginBottom: '4px' }}></div>
                                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#111827' }}>Soumyadeep Datta</div>
                                <div className="text-[9px]" style={{ color: '#6b7280' }}>Program Mentor</div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <div className="flex flex-col items-center text-center pb-2 pl-4">
                            <div className="text-[11px] font-black uppercase tracking-widest text-black mb-1">
                                Date Issued
                            </div>
                            <div className="text-[16px] font-medium text-black">
                                {issuedDate}
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateTemplate;