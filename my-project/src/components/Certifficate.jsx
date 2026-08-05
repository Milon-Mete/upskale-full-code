import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Calendar, Trash2, Search, UserCheck, Loader2, ChevronDown, CheckCircle } from 'lucide-react';
import { BASE_URL } from '../config';

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
const CertificateSystem = () => {

    const [formData, setFormData] = useState({
        name: '',
        course: '',
        date: '',
        phone: '',
        planType: 'recorded',
        score: '',
        certId: '',
        itemModel: 'Course' // Defaulted to Course
    });

    const [userCourses, setUserCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [isIssuing, setIsIssuing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [database, setDatabase] = useState([]);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const printRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

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
                console.error("Failed to fetch courses/masterclasses/cohorts for dropdown", error);
            }
        };
        fetchAllOptions();
    }, []);

    const setToday = () => {
        const today = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        setFormData(prev => ({ ...prev, date: today }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSearchUser = async (e) => {
        e.preventDefault();
        if (!formData.phone) return alert("Please enter a phone number");
        setIsSearching(true);
        setUserCourses([]);
        
        // Reset the form before populating
        setFormData(prev => ({ ...prev, name: '', course: '', planType: 'recorded', score: '', date: '', certId: '', itemModel: 'Course' }));

        try {
            // 🔴 FIXED: Use proper Auth headers and credentials
            const token = localStorage.getItem('token') || '';
            const res = await fetch(`${BASE_URL}/admin/all-users`, {
                headers: { 
                    'Authorization': token ? `Bearer ${token}` : '' 
                },
                credentials: 'include'
            });

            const data = await res.json();
            // ... rest of the function stays exactly the same

            if (data.success) {
                const user = data.users.find(u =>
                    u.phone.replace(/\s+/g, '').includes(formData.phone.replace(/\s+/g, ''))
                );

                if (user) {
                    const firstCourse = user.courseList && user.courseList.length > 0 ? user.courseList[0] : null;

                    // ✅ UPDATED: Safely grab the type (itemModel), score, and issuedDate (mapped to 'date' state)
                    setFormData(prev => ({
                        ...prev,
                        name: user.name,
                        course: firstCourse ? firstCourse.title : '',
                        planType: firstCourse ? firstCourse.planType : 'recorded',
                        phone: user.phone,
                        score: firstCourse && firstCourse.score ? firstCourse.score : '',
                        date: firstCourse && firstCourse.issuedDate ? firstCourse.issuedDate : '',
                        itemModel: firstCourse && firstCourse.type ? firstCourse.type : 'Course'
                    }));

                    if (user.courseList && user.courseList.length > 0) {
                        setUserCourses(user.courseList);
                        setShowDropdown(true);
                    } else {
                        setUserCourses([]);
                        alert("User found, but they haven't enrolled in any courses.");
                    }
                } else {
                    alert("User not found with this phone number.");
                }
            }
        } catch (err) {
            console.error("Search Error:", err);
            alert("Error searching for user.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleIssueToUser = async () => {
        if (!formData.phone || !formData.course || !formData.date) return alert("Please fill Phone, Course, and Date.");
        setIsIssuing(true);

        let cleanPhone = formData.phone.replace(/[\s-]/g, '');
        if (cleanPhone.length === 10) cleanPhone = `+91${cleanPhone}`;

        try {
            // 🔴 FIXED: Proper secure POST request
            const token = localStorage.getItem('token') || '';
            const response = await fetch(`${BASE_URL}/admin/issue-certificate`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                credentials: 'include',
                body: JSON.stringify({
                    phone: cleanPhone,
                    courseName: formData.course,
                    certificateDate: formData.date,
                    planType: formData.planType,
                    score: Number(formData.score),
                    itemModel: formData.itemModel
                })
            });
            const data = await response.json();
            // ... rest of the function stays exactly the same

            if (data.success) {
                alert(`✅ ${data.message}`);

                setFormData(prev => ({
                    ...prev,
                    certId: data.certificateId
                }));

                handleSaveLocal();
            } else {
                alert("❌ Error: " + (data.message || "Could not issue certificate"));
            }
        } catch (error) {
            console.error("Issue Error:", error);
            alert("Server Error");
        } finally {
            setIsIssuing(false);
        }
    };

    const handleSaveLocal = () => {
        if (!formData.name) return;
        const newEntry = { id: Date.now(), ...formData, createdAt: new Date().toISOString() };
        setDatabase([newEntry, ...database]);
    };

    const handleDownload = async () => {
        if (!printRef.current) return;
        setIsGeneratingPdf(true);

        try {
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 800,
                height: 560,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 1000
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`UPSKALE_Certificate_${formData.name.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error("Error generating PDF", err);
            alert("Download failed.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleDelete = (id) => {
        setDatabase(database.filter(item => item.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans text-gray-900">

            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <CertificateTemplate data={formData} innerRef={printRef} />
            </div>

            <div className="w-full lg:w-2/3 bg-gray-200 p-4 md:p-8 flex items-center justify-center overflow-hidden relative min-h-[350px] lg:min-h-screen order-1 lg:order-2">
                <div className="absolute top-4 left-4 z-10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Live Preview
                </div>
                <div className="transform scale-[0.42] sm:scale-[0.6] lg:scale-[0.85] origin-center shadow-2xl transition-all">
                    <CertificateTemplate data={formData} innerRef={null} />
                </div>
            </div>

            <div className="w-full lg:w-1/3 bg-white border-t lg:border-t-0 lg:border-r border-gray-200 p-6 overflow-y-auto h-auto lg:h-screen order-2 lg:order-1 z-20 shadow-[0_-5px_25px_rgba(0,0,0,0.05)] lg:shadow-none">
                <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                    Certificate <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Manager</span>
                </h2>

                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="block text-xs font-bold uppercase text-blue-800 mb-2">Find Student</label>
                    <div className="flex gap-2">
                        <input
                            type="text" name="phone" value={formData.phone} onChange={handleChange}
                            className="flex-1 p-2 border border-blue-200 rounded text-sm outline-none min-w-0" placeholder="Enter Phone (+91...)"
                        />
                        <button onClick={handleSearchUser} disabled={isSearching} className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700 shrink-0">
                            {isSearching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Student Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm bg-gray-100" readOnly
                        />
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-sm font-medium text-gray-700">Course Name</label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                name="course"
                                list="all-courses"
                                value={formData.course}
                                onChange={handleChange}
                                onClick={() => setShowDropdown(true)}
                                className="block w-full p-2 pr-8 border border-gray-300 rounded shadow-sm"
                                placeholder="Type or select..."
                                autoComplete="off"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 cursor-pointer text-gray-500" onClick={() => setShowDropdown(!showDropdown)}>
                                <ChevronDown size={16} />
                            </div>
                        </div>

                        {showDropdown && userCourses.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto bottom-full mb-1">
                                <div className="px-3 py-2 text-[10px] font-bold uppercase text-gray-400 border-b border-gray-100 bg-gray-50">
                                    Already Enrolled In
                                </div>
                                {userCourses.map((courseObj, idx) => (
                                    <div
                                        key={idx}
                                        className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                                        onClick={() => {
                                            // ✅ UPDATED: Auto-fill the existing score and date when selecting from dropdown
                                            setFormData({
                                                ...formData,
                                                course: courseObj.title,
                                                planType: courseObj.planType || 'recorded',
                                                itemModel: courseObj.type || 'Course',
                                                score: courseObj.score || '',
                                                date: courseObj.issuedDate || formData.date 
                                            });
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <span className="truncate">{courseObj.title}</span>
                                        <span className="text-[10px] uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-2 shrink-0 font-bold tracking-wider">
                                            {courseObj.type || 'Course'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <datalist id="all-courses">
                            {availableCourses.map((c, idx) => (
                                <option key={idx} value={c.title} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Plan Type (For New Enrollment)</label>
                        <select
                            name="planType"
                            value={formData.planType}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="recorded">Recorded</option>
                            <option value="live">Live</option>
                            <option value="masterclass">Masterclass</option>
                            <option value="cohort">Cohort</option>
                        </select>
                        <p className="text-[10px] text-gray-400 mt-1">*Used if user is not already enrolled.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Student Score (%)</label>
                        <input
                            type="number"
                            name="score"
                            value={formData.score}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 85"
                            min="0"
                            max="100"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">*Score of 75 or higher triggers "Certificate of Excellence"</p>
                    </div>

                    {/* ✅ FIXED: Input explicitly tracks the 'date' state */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Completion Date</label>
                        <div className="flex gap-2">
                            <input type="text" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm" placeholder="October 26th, 2025" />
                            <button type="button" onClick={setToday} className="mt-1 px-3 bg-gray-100 text-gray-700 rounded border border-gray-300 text-sm font-medium">
                                <Calendar size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <button onClick={handleIssueToUser} disabled={isIssuing || !formData.name} className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 flex justify-center items-center gap-2 shadow-lg disabled:opacity-50">
                            {isIssuing ? <Loader2 className="animate-spin" size={20} /> : <UserCheck size={20} />} Generate & Save ID
                        </button>
                        <button onClick={handleDownload} disabled={!formData.certId || isGeneratingPdf} className="w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 flex justify-center items-center gap-2 text-sm disabled:opacity-50">
                            {isGeneratingPdf ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                            {isGeneratingPdf ? "Generating..." : "Download PDF"}
                        </button>
                        {!formData.certId && formData.name && <p className="text-[10px] text-red-500 text-center">*Click 'Generate & Save ID' first to create the scannable QR Code</p>}
                    </div>
                </div>

                {/* History */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Recent History</h3>
                    <ul className="space-y-2">
                        {database.map((item) => (
                            <li key={item.id} className="bg-white p-2 rounded border border-gray-100 flex justify-between items-center text-sm hover:shadow-sm">
                                <div className="truncate pr-2">
                                    <div className="font-semibold text-gray-800">{item.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{item.course}</div>
                                </div>
                                <div className="flex shrink-0">
                                    <button onClick={() => setFormData(item)} className="text-blue-500 hover:text-blue-700 p-1">Load</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CertificateSystem;