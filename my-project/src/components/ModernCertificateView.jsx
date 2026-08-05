import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import { Loader2, Download, ChevronLeft, Share2 } from 'lucide-react';
// 🔴 CHANGED: Removed jsPDF entirely, added toBlob
import { toPng, toBlob } from 'html-to-image'; 

const ModernCertificateView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const certRef = useRef(null);
    const containerRef = useRef(null); 

    const [certData, setCertData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState('');
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const res = await fetch(`${BASE_URL}/public/certificate/${id}`);
                const data = await res.json();

                if (data.success) {
                    setCertData(data.data);
                } else {
                    setError('Certificate not found or invalid.');
                }
            } catch (err) {
                setError('Failed to load certificate.');
            } finally {
                setLoading(false);
            }
        };
        fetchCertificate();
    }, [id]);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const availableWidth = containerRef.current.offsetWidth;
                setScale(availableWidth < 600 ? availableWidth / 600 : 1);
            }
        };
        setTimeout(handleResize, 50);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [loading]);

    // 🔴 1. DOWNLOAD AS HIGH-QUALITY PNG
    const handleDownload = async () => {
        if (!certRef.current) return;

        try {
            setIsDownloading(true);
            const element = certRef.current;

            // Generate Base64 Image URL
            const dataUrl = await toPng(element, {
                quality: 1,
                pixelRatio: 2, // High resolution
                backgroundColor: '#121212',
                width: 600,
                height: 800,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                    margin: 0
                }
            });

            // Create a fake link and click it to trigger download
            const link = document.createElement('a');
            link.download = `${certData.name.replace(/\s+/g, '_')}_MicroSkill_Certificate.png`;
            link.href = dataUrl;
            link.click();

        } catch (err) {
            console.error("Error generating image:", err);
            alert("Failed to download certificate. Check device memory or browser permissions.");
        } finally {
            setIsDownloading(false);
        }
    };

    // 🔴 2. SHARE AS IMAGE FOR WHATSAPP STATUS/INSTAGRAM
    const handleShareFile = async () => {
        if (!certRef.current) return;

        try {
            setIsDownloading(true); 
            const element = certRef.current;

            // Generate Image Blob instead of Base64 (Required for sharing files natively)
            const blob = await toBlob(element, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: '#121212',
                width: 600,
                height: 800,
                style: { transform: 'scale(1)', transformOrigin: 'top left', margin: 0 }
            });

            if (!blob) throw new Error("Could not generate image blob");

            const fileName = `${certData.name.replace(/\s+/g, '_')}_Certificate.png`;
            const file = new File([blob], fileName, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                const certUrl = window.location.href; 
                const courseName = certData?.courseName || "a new tech skill";

                // 🔴 PRO TIP: Combine the URL into the text. 
                // WhatsApp Status sometimes drops the `url` parameter but ALWAYS keeps the `text` parameter as the image caption.
                const quirkyMessage = `Just leveled up my brain 🧠! Officially certified in ${courseName} by Upskale. If you're still learning the slow way, you're missing out. Join the 1% club and try Upskale PRO for ₹1 here: ${certUrl}`;

                await navigator.share({
                    files: [file],
                    title: 'Upskale Certificate',
                    text: quirkyMessage 
                });
            } else {
                // Fallback for Desktop browsers that don't support file sharing
                alert("Direct image sharing isn't supported on this device. Downloading the image instead so you can post it.");
                const link = document.createElement('a');
                link.download = fileName;
                link.href = URL.createObjectURL(blob);
                link.click();
            }

        } catch (err) {
            console.error("Error sharing Image:", err);
            if (err.name !== 'AbortError') { 
                alert("Failed to share the certificate. Check your browser permissions.");
            }
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="animate-spin text-[#008a45]" size={40} /></div>;
    if (error) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-bold text-xl text-red-500">{error}</div>;

    const issuedDate = new Date(certData.issuedDate || Date.now()).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] py-8 md:py-12 px-4 md:px-64 font-sans flex flex-col items-center overflow-x-hidden">

            {/* HEADER BAR */}
            <div className="flex items-center justify-start flex-nowrap gap-3 mb-8 w-full overflow-x-auto pb-2">
                <button 
                    onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')} 
                    className="flex items-center text-gray-400 hover:text-white transition-colors shrink-0 whitespace-nowrap"
                >
                    <ChevronLeft size={20} /> 
                    <span className="ml-1">Back</span>
                </button>
                
                {/* 🔴 CHANGED: Button text updated to reflect Image instead of PDF */}
                <button
                    onClick={handleShareFile}
                    disabled={isDownloading}
                    className="bg-[#25D366] hover:bg-[#1ebd5c] disabled:bg-[#25D366]/50 text-white px-3 py-2 md:px-4 md:py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors active:scale-95 shadow-lg shrink-0 whitespace-nowrap"
                >
                    {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                    <span className="hidden sm:inline">{isDownloading ? 'Processing...' : 'Share Image'}</span>
                </button>

                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="bg-[#008a45] hover:bg-[#006e37] disabled:bg-[#008a45]/50 text-white px-3 py-2 md:px-4 md:py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors active:scale-95 shadow-lg shrink-0 whitespace-nowrap"
                >
                    {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    <span className="hidden sm:inline">{isDownloading ? 'Generating...' : 'Save Image'}</span>
                </button>
            </div>

            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-[#008a45] to-[#eab308] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

            {/* SCALING WRAPPER */}
            <div
                ref={containerRef}
                className="relative flex justify-center w-full max-w-[600px] transition-all duration-300 mx-auto"
                style={{ height: `${800 * scale}px` }}
            >
                <div
                    className="absolute top-0 origin-top"
                    style={{
                        transform: `scale(${scale})`,
                        width: '600px',
                        height: '800px'
                    }}
                >
                    {/* THE ACTUAL CERTIFICATE */}
                    <div
                        ref={certRef}
                        className="w-[600px] h-[800px] bg-[#121212] rounded-xl shadow-2xl overflow-hidden border border-white/10 shrink-0 flex flex-col relative"
                    >
                        <div className="absolute top-0 right-0 w-[90%] h-[90%] border-[60px] border-white/5 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-[70%] h-[70%] border-[40px] border-white/5 rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col h-full p-12">
                            <div className="text-white font-bold tracking-widest text-lg mb-8 opacity-90">
                                <img
                                    src="https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png"
                                    alt="UPSKALE Logo"
                                    className="h-6 w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_0_15px_rgba(0,138,69,0.3)]"
                                    crossOrigin="anonymous" 
                                />
                            </div>

                            <h3 className="text-5xl font-semibold text-white leading-[1.1] mb-6 tracking-tight">
                                Certificate of<br />Completion
                            </h3>

                            <div className="mb-8">
                                <span className="inline-block px-3 py-1.5 bg-[#eab308]/10 text-[#eab308] text-sm font-black uppercase tracking-widest rounded border border-[#eab308]/20">
                                    Micro-Skill Certification
                                </span>
                            </div>

                            <p className="text-gray-400 text-sm leading-relaxed mb-10 opacity-90 pr-8">
                                Congratulations on taking your next leap towards accelerating your career growth.<br />Keep learning, keep growing!
                            </p>

                            <div className="flex-1">
                                <p className="text-gray-400 text-xs mb-2 opacity-80 tracking-wide uppercase">This certificate is proudly awarded to</p>
                                <h4 className="text-4xl font-bold text-white mb-8 tracking-tight line-clamp-1">
                                    {certData.name}
                                </h4>

                                <p className="text-gray-400 text-xs mb-2 opacity-80 tracking-wide uppercase">for successfully mastering the micro-skill</p>
                                <h5 className="text-2xl font-medium text-[#00d26a] leading-tight line-clamp-2">
                                    {certData.courseName || certData.course}
                                </h5>
                            </div>

                            <div className="flex justify-between items-end mt-8 pt-8">
                                <div className="w-[35%]">
                                    <div className="border-t-[2px] border-white/30 mb-3"></div>
                                    <p className="text-white text-lg font-medium mb-1 whitespace-nowrap">
                                        {issuedDate}
                                    </p>
                                    <p className="text-gray-500 text-[10px] opacity-80 uppercase tracking-widest">Date</p>
                                </div>

                                <div className="w-[45%] text-right relative">
                                    <h1 className=" w-auto mb-2  object-contain text-[18px]" style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive", color: '#ffffff' }}>Debkanta Chakraborty</h1>
                                    <div className="border-t-[2px] border-white/30 mb-3"></div>
                                    <p className="text-white text-sm font-medium mb-1 whitespace-nowrap">Debkanta Chakraborty</p>
                                    <p className="text-gray-500 text-[10px] opacity-80 leading-tight">Founder & CEO, Upskale</p>
                                </div>
                            </div>

                            <div className="absolute bottom-4 left-12">
                                <p className="text-[8px] text-gray-600 font-mono tracking-widest">ID: {id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernCertificateView;