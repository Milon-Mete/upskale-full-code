import React, { useEffect, useState } from 'react';
import { Languages, X } from 'lucide-react';

const LanguageSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        const initGoogleTranslate = () => {
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,bn,hi',
                    autoDisplay: false
                }, 'google_translate_element');
            }
        };

        if (!document.querySelector('#google-translate-script')) {
            window.googleTranslateElementInit = initGoogleTranslate;
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    if (!isMounted) return null;

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                .goog-te-banner-frame.skiptranslate, .goog-logo-link, .goog-te-gadget span { display: none !important; }
                body { top: 0px !important; }
                .goog-te-gadget { color: transparent !important; font-size: 0px !important; }
                
                #google_translate_element select {
                    background: #111 !important;
                    color: #fff !important;
                    border: 1px solid #333 !important;
                    padding: 4px 6px !important;
                    border-radius: 4px !important;
                    font-size: 12px !important;
                    outline: none !important;
                    cursor: pointer !important;
                }
                
                .width-transition {
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .goog-tooltip, .goog-tooltip:hover { display: none !important; }
                .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
            `}} />

            <div 
                className={`fixed top-4 right-4 z-[9999] flex items-center width-transition overflow-hidden ${
                    isOpen 
                    ? 'bg-[#0a0a0a] border border-[#222] p-3 rounded-lg shadow-2xl w-[260px]' 
                    : 'bg-white/90 backdrop-blur-sm border border-gray-200 p-2 rounded-full shadow-md w-[36px] h-[36px] hover:bg-white cursor-pointer justify-center'
                }`}
                onClick={() => {
                    if (!isOpen) setIsOpen(true);
                }}
            >
                {/* Closed State - Small White Circle */}
                {!isOpen && (
                    <div className="flex-shrink-0 flex items-center justify-center">
                        <Languages size={16} className="text-gray-700" />
                    </div>
                )}

                {/* Open State - Dark UI */}
                <div className={`flex items-center w-full ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    <div className="flex flex-col whitespace-nowrap border-r border-[#333] pr-3 mr-2 w-full">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter mb-1">
                            Language
                        </span>
                        <div id="google_translate_element"></div>
                    </div>

                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                        }}
                        className="flex-shrink-0 p-1.5 hover:bg-[#222] rounded-md text-gray-500 hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default LanguageSwitcher;