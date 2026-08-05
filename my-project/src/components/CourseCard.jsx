import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Globe, Video } from 'lucide-react'; // Added Video icon

const CourseCard = ({ title, desc, tags, lang, image, price, originalPrice, courseUrl, enrolledCount }) => {
  
  const cleanPrice = (val) => val ? val.toString().replace('₹', '').trim() : '';

  return (
    <Link to={courseUrl} className="block h-full">
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col hover:-translate-y-1 h-full">
        
        {/* --- IMAGE SECTION --- */}
        <div className="h-48 bg-gray-200 relative overflow-hidden shrink-0">
            {lang && (
            <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-sm text-[#008a45] text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                <Globe size={14} className="stroke-[2.5]" />
                {lang}
            </div>
            )}

            {/* Optional: Enrolled Count Badge (Shows only if > 20) */}
            {enrolledCount > 20 && (
              <div className="absolute top-3 left-3 z-20 bg-[#008a45] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                  {enrolledCount}+ Enrolled
              </div>
            )}

            {image ? (
            <img 
                src={image} 
                alt={title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white/20">
                No Image Provided
            </div>
            )}

            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="p-5 flex-1 flex flex-col">
            
            {/* --- HEADER: TAGS & PRICE --- */}
            <div className="flex justify-between items-start mb-3 w-full">
            
            <div className="flex flex-wrap gap-2 max-w-[65%]">
                {tags?.map((tag, index) => (
                <span key={index} className="px-2.5 py-1 bg-[#008a45]/10 text-[#008a45] text-[10px] uppercase font-bold tracking-wider rounded-full">
                    {tag}
                </span>
                ))}
            </div>

            <div className="flex flex-col items-end shrink-0 ml-2">
                <span className="text-gray-900 font-black leading-none flex items-baseline gap-[1px]">
                {price ? (
                    <>
                    <span className="text-sm font-bold">₹</span>
                    <span className="text-xl tracking-tight">{cleanPrice(price)}</span>
                    </>
                ) : (
                    <span className="text-lg">Free</span>
                )}
                </span>

                {originalPrice && (
                <span className="text-gray-400 text-xs font-medium line-through mt-1 flex items-baseline gap-[1px]">
                    <span className="text-[10px]">₹</span>
                    {cleanPrice(originalPrice)}
                </span>
                )}
            </div>
            </div>

            {/* --- CONTENT --- */}
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-[#008a45] transition-colors duration-300 leading-tight">
            {title}
            </h3>
            
            <p className="text-gray-500 text-sm mb-5 flex-1 leading-relaxed line-clamp-2">
            {desc}
            </p>
            
            {/* --- UPDATED STATS ROW --- */}
            <div className="flex flex-wrap items-center gap-y-2 gap-4 text-gray-400 text-xs font-semibold uppercase tracking-wide mb-6">
                <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#008a45]" /> 
                    <span>3 Months</span>
                </div>
                {/* New Live + Recorded Badge */}
                <div className="flex items-center gap-1.5">
                    <Video size={14} className="text-[#008a45]" /> 
                    <span>Live + Recorded</span>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto w-full py-3 flex items-center justify-center gap-2 border-2 border-[#008a45] text-[#008a45] rounded-xl group-hover:bg-[#008a45] group-hover:text-white transition-all duration-300 font-bold text-sm shadow-[0_4px_14px_0_rgba(0,138,69,0.1)] group-hover:shadow-[0_6px_20px_rgba(0,138,69,0.23)]">
            View Curriculum <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
        </div>
    </Link>
  );
};

export default CourseCard;