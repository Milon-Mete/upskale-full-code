import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, ArrowLeft, Share2, Loader2, CheckCircle, Check, AlertCircle, Linkedin, Award, ArrowUpRight } from 'lucide-react';
import { BASE_URL } from '../config'; 

// 🔴 IMPORT YOUR NEW EXTRACTED TEMPLATE HERE
import CertificateTemplate from '../components/CertificateTemplate';

const StudentCertificateView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const printRef = useRef(null);
    const [certData, setCertData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = id ? `${window.location.origin}/view-certificate/${id}` : window.location.href;
    const LINKEDIN_ORG_ID = "106505459"; 

    useEffect(() => {
        const fetchCertificate = async () => {
            if (!id) { setError("Invalid Certificate Link"); setLoading(false); return; }
            try {
                const response = await fetch(`${BASE_URL}/public/certificate/${id}`);
                const result = await response.json();
                if (result.success) setCertData(result.data);
                else setError(result.message || "Certificate not found.");
            } catch (err) { setError("Failed to load certificate."); } 
            finally { setLoading(false); }
        };
        fetchCertificate();
    }, [id]);

    const handleShare = async () => {
        if (navigator.share) {
            try { await navigator.share({ title: 'UPSKALE Certificate', text: `Check out my verified certificate for ${certData.course} from UPSKALE!`, url: shareUrl }); } 
            catch (err) { console.log('Share closed'); }
        } else {
            try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } 
            catch (err) { alert("Failed to copy link"); }
        }
    };

    const handleDownload = async () => {
        if (!printRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(printRef.current, { 
                scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false, width: 800, height: 560
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
            pdf.save(`UPSKALE_Certificate_${certData.name.replace(/\s+/g, '_')}.pdf`);
        } catch (err) { alert("Download failed."); } 
        finally { setIsGenerating(false); }
    };

    const handleAddToLinkedIn = () => {
        if (!certData) return;
        let issueYear = "", issueMonth = "";
        const dateString = certData.issuedDate || certData.date;
        if (dateString) {
            const d = new Date(dateString);
            if (!isNaN(d.getTime())) { issueYear = d.getFullYear(); issueMonth = d.getMonth() + 1; } 
            else if (dateString.includes('/')) {
                const parts = dateString.split('/');
                if (parts.length === 3) { issueYear = parts[2]; issueMonth = parts[1]; }
            }
        }
        const certName = encodeURIComponent(certData.course || "Certificate of Completion");
        const certUrl = encodeURIComponent(shareUrl);
        const certId = encodeURIComponent(id);
        const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationId=${LINKEDIN_ORG_ID}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${certUrl}&certId=${certId}`;
        window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
    };

    const handleShareToFeed = () => {
        if (!certData) return;
        const postText = `I'm thrilled to share that I've successfully completed the ${certData.course} certification from UPSKALE! 🚀\n\nA huge thanks to the mentors for the incredible learning experience. Excited to apply these skills!\n\nYou can verify my credential here: ${shareUrl}\n\n#UPSKALE #Certification #ContinuousLearning #${certData.course.replace(/\s+/g, '')}`;
        const encodedText = encodeURIComponent(postText);
        const feedUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`;
        window.open(feedUrl, '_blank', 'noopener,noreferrer');
    };

    if (loading) return <div className="min-h-screen bg-[#030303] flex items-center justify-center text-white"><Loader2 className="animate-spin text-[#008a45]" size={48} /></div>;
    if (error) return (
        <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white p-4">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Certificate Not Found</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">Go Home</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#030303] text-white flex flex-col items-center py-16 px-4 relative overflow-hidden font-sans">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#008a45]/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#0A66C2]/10 blur-[150px] rounded-full pointer-events-none" />

           {/* Hidden Print Template */}
            <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
                <CertificateTemplate data={certData} innerRef={printRef} shareUrl={shareUrl} />
            </div>

            <div className="w-full max-w-6xl flex justify-between items-center mb-10 z-10 relative">
                <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>
                <div className="flex items-center gap-2 bg-[#008a45]/10 border border-[#008a45]/30 px-4 py-2 rounded-full">
                    <CheckCircle size={16} className="text-[#00d26a]" />
                    <span className="font-bold uppercase tracking-wider text-xs text-[#00d26a]">Verified Credential</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-stretch max-w-6xl w-full z-10 relative">
                
                {/* Left: The Certificate Viewer */}
                <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 p-0 sm:p-8 rounded-3xl flex justify-center items-center w-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="transform scale-[0.45] sm:scale-[0.6] md:scale-[0.8] xl:scale-[0.9] origin-center -my-[170px] sm:-my-[110px] md:-my-[55px] xl:-my-[28px] transition-transform duration-300">
                         {/* Using the extracted component here */}
                         <CertificateTemplate data={certData} innerRef={null} shareUrl={shareUrl} /> 
                    </div>
                </div>

                {/* Right: Modern Action Panel */}
                <div className="w-full lg:w-[380px] flex flex-col gap-6">
                    
                    {/* Details & Download Card */}
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#008a45]/10 rounded-full blur-[40px] group-hover:bg-[#008a45]/20 transition-colors" />
                        
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
                            <Award className="text-[#00d26a]" size={24} />
                        </div>
                        
                        <h2 className="text-2xl font-black mb-1 text-white leading-tight">{certData.course}</h2>
                        <p className="text-gray-400 text-sm mb-8 font-medium">Issued to <span className="text-gray-200">{certData.name}</span> on {certData.issuedDate || certData.date || "N/A"}</p>
                        
                        <button 
                            onClick={handleDownload} 
                            disabled={isGenerating} 
                            className="w-full py-4 bg-[#008a45] hover:bg-[#00d26a] text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_10px_30px_rgba(0,138,69,0.3)] hover:shadow-[0_10px_40px_rgba(0,138,69,0.5)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Download size={20}/>}
                            {isGenerating ? "Generating High-Res PDF..." : "Download Certificate"}
                        </button>
                    </div>

                    {/* Social & Sharing Card */}
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative overflow-hidden">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Share Your Success</h3>
                        
                        <div className="space-y-4">
                            {/* 1. Share as Post */}
                            <button 
                                onClick={handleShareToFeed} 
                                className="w-full py-4 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 bg-[#0A66C2] hover:bg-[#0A66C2]/80 text-white shadow-[0_10px_30px_rgba(10,102,194,0.2)] hover:shadow-[0_10px_40px_rgba(10,102,194,0.4)] hover:-translate-y-1 active:translate-y-0"
                            >
                                <Linkedin size={20} />
                                Share as LinkedIn Post
                            </button>

                            {/* 2. Add to Profile */}
                            <button 
                                onClick={handleAddToLinkedIn} 
                                className="w-full py-4 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:border-[#0A66C2]/50 hover:text-[#0A66C2]"
                            >
                                <ArrowUpRight size={18} />
                                Add to LinkedIn Profile
                            </button>

                            {/* 3. Copy Link */}
                            <button 
                                onClick={handleShare} 
                                className={`w-full py-4 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 border ${copied ? "bg-[#008a45]/20 border-[#008a45] text-[#00d26a]" : "bg-transparent hover:bg-white/5 text-gray-400 border-dashed border-white/20 hover:border-white/40 hover:text-white"}`}
                            >
                                {copied ? <Check size={18}/> : <Share2 size={18}/>} 
                                {copied ? "Link Copied!" : "Copy Verification Link"}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentCertificateView;