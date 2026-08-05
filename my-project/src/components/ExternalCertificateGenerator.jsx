import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Calendar, UserCheck, Loader2, ChevronDown } from 'lucide-react';
import { BASE_URL } from '../config';

// --- ADDED: The specific skills for each course ---
const COURSE_SKILLS = {
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
    "Excel Mastery with AI Tools": [
        "Clean, organize, and analyze complex datasets using advanced Excel functions",
        "Automate reporting and business calculations with formulas, pivot tables, and macros",
        "Integrate AI tools with Excel workflows for faster insights and enhanced productivity"
    ],
    // ✅ NEW: Added exact database title to ensure skills match properly
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

// --- 1. The Certificate Component ---
const CertificateTemplate = ({ data, innerRef }) => {
    // Fetch the correct skills list based on the selected course
    const skillsList = COURSE_SKILLS[data.course] || COURSE_SKILLS["default"];

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
                    <div className="mb-2 flex flex-col items-center">
                        <div className="p-1.5 border-2 rounded-lg mb-2" style={{ backgroundColor: '#ffffff', borderColor: '#000000', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                    data.certId ? `${window.location.origin}/view-certificate/${data.certId}` : window.location.origin
                                )}`}
                                alt="QR"
                                className="w-[85px] h-[85px] object-contain"
                                crossOrigin="anonymous"
                            />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#000000' }}>
                            Verification ID
                        </div>
                        <div className="text-[10px] font-bold text-black" >
                            {data.certId || "PENDING..."}
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
                            <div className="text-right mb-2">
                                <div className="text-[10px] font-bold uppercase" style={{ color: '#6b7280' }}>Date Issued</div>
                                <div className="text-sm font-bold" style={{ color: '#1f2937' }}>{data.date || "DD/MM/YYYY" }</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 2. External Certificate Generator Component ---
const ExternalCertificateGenerator = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '+91 ', 
        course: '',
        date: '',
        planType: 'recorded',
        score: '',
        certId: '' 
    });

    const [isIssuing, setIsIssuing] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    
    const [availableCourses, setAvailableCourses] = useState([]);
    const printRef = useRef(null);

    // ✅ FIX: Fetch from Courses, Masterclasses, AND Cohorts to populate the dropdown
    useEffect(() => {
        const fetchAllOptions = async () => {
            try {
                // 🔴 FIXED: Use proper Auth headers instead of raw user-id
                const token = localStorage.getItem('token') || '';
                const headers = { 
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                };
                
                // 🔴 FIXED: Added credentials: 'include'
                const mcRes = await fetch(`${BASE_URL}/masterclasses/admin/all`, { headers, credentials: 'include' });
                const mcData = await mcRes.json();

                const cohortRes = await fetch(`${BASE_URL}/cohorts/admin/all`, { headers, credentials: 'include' });
                const cohortData = await cohortRes.json();

                let combinedList = [];
                if (Array.isArray(mcData)) combinedList = [...combinedList, ...mcData];
                if (Array.isArray(cohortData)) combinedList = [...combinedList, ...cohortData];

                setAvailableCourses(combinedList);
            } catch (error) {
                console.error("Failed to fetch data for dropdown", error);
            }
        };
        fetchAllOptions();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Prevent user from deleting the +91 prefix
        if (name === 'phone') {
            if (!value.startsWith('+91 ')) {
                return;
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const setToday = () => {
        const today = new Date().toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        setFormData(prev => ({ ...prev, date: today }));
    };

    const handleIssueExternal = async () => {
        if (!formData.name || !formData.course || !formData.date || formData.phone.length <= 4) {
            return alert("Name, Phone Number, Course, and Date are required!");
        }
        setIsIssuing(true);

        try {
            // 🔴 FIXED: Use proper Auth headers and credentials: 'include'
            const token = localStorage.getItem('token') || '';
            const response = await fetch(`${BASE_URL}/admin/issue-external-certificate`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '' 
                },
                credentials: 'include',
                body: JSON.stringify({
                    studentName: formData.name,
                    phone: formData.phone,
                    courseName: formData.course,
                    certificateDate: formData.date,
                    planType: formData.planType,
                    score: Number(formData.score) || null
                })
            });
            const data = await response.json();
            
            if (data.success) {
                alert(`✅ ${data.message}`);
                setFormData(prev => ({ ...prev, certId: data.certificateId }));
            } else {
                alert("❌ Error: " + data.message);
            }
        } catch (error) {
            console.error("Issue Error:", error);
            alert("Server Error");
        } finally {
            setIsIssuing(false);
        }
    };
    const handleDownload = async () => {
        if (!printRef.current) return;
        setIsGeneratingPdf(true);
        try {
            const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`UPSKALE_External_Cert_${formData.name.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            alert("Download failed.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans text-gray-900">
            
            {/* Hidden Print Template */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <CertificateTemplate data={formData} innerRef={printRef} />
            </div>

            {/* Left Panel: Preview */}
            <div className="w-full lg:w-2/3 bg-gray-200 p-8 flex items-center justify-center overflow-hidden relative">
                <div className="transform scale-[0.85] shadow-2xl transition-all">
                    <CertificateTemplate data={formData} innerRef={null} />
                </div>
            </div>

            {/* Right Panel: Manual Input Controls */}
            <div className="w-full lg:w-1/3 bg-white border-l border-gray-200 p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold text-indigo-900 mb-2">Quick Issue</h2>
                <p className="text-sm text-gray-500 mb-6">Generate certificates for external or old students.</p>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500" placeholder="Student Name" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                        <input 
                            type="text" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleChange} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded font-mono focus:ring-indigo-500 focus:border-indigo-500" 
                            placeholder="+91 9876543210" 
                            maxLength={14} 
                        />
                        <p className="text-[10px] text-gray-400 mt-1">*Required to link to student's future account.</p>
                    </div>

                    {/* Course Name with Datalist Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Course Name *</label>
                        <input 
                            type="text" 
                            name="course" 
                            list="course-options" 
                            value={formData.course} 
                            onChange={handleChange} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500" 
                            placeholder="Select or type a course..." 
                            autoComplete="off"
                        />
                        <datalist id="course-options">
                            {availableCourses.map((c, idx) => (
                                <option key={idx} value={c.title} />
                            ))}
                        </datalist>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Plan Type</label>
                            <select name="planType" value={formData.planType} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="recorded">Recorded</option>
                                <option value="live">Live</option>
                                <option value="masterclass">Masterclass</option>
                                <option value="cohort">Cohort</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Score (%)</label>
                            <input type="number" name="score" value={formData.score} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. 85" min="0" max="100" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Completion Date *</label>
                        <div className="flex gap-2">
                            <input type="text" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500" placeholder="Date" />
                            <button type="button" onClick={setToday} className="mt-1 px-3 bg-gray-100 rounded border hover:bg-gray-200 transition-colors"><Calendar size={16} /></button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-6 border-t">
                        <button onClick={handleIssueExternal} disabled={isIssuing || !formData.name} className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 flex justify-center items-center gap-2 transition-colors disabled:opacity-50">
                            {isIssuing ? <Loader2 className="animate-spin" /> : <UserCheck />} Generate & Save ID
                        </button>
                        
                        <button onClick={handleDownload} disabled={!formData.certId || isGeneratingPdf} className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 flex justify-center items-center gap-2 transition-colors disabled:opacity-50">
                            {isGeneratingPdf ? <Loader2 className="animate-spin" /> : <Download />} Download PDF
                        </button>
                        {!formData.certId && formData.name && <p className="text-[10px] text-red-500 text-center font-bold">*Click 'Generate & Save ID' first to create the scannable QR Code</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExternalCertificateGenerator;