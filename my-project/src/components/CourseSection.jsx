import { useRef, useState, useEffect,useCallback } from "react";
import CourseCard from "./CourseCard";

const courses = [
  {
    title: "MS Excel with Generative AI",
    price: "2499",
    originalPrice: "3999",
    desc: "Supercharge your spreadsheets. Learn to use AI formula bots and automated data cleaning.",
    tags: ["Productivity", "Automation"],
    lang: "Bengali + Hindi",
    image: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770749468/EXCEL_WITH_AI_aqwtoe.png",
    courseUrl: "/excel-mastery-with-ai-tools" // <--- ADDED THIS (matches your new page route)
  },
  {
    title: "GEN AI Tools Mastery",
    price: "2499",
    originalPrice: "3999",
    desc: "Master the 'Big Three' and beyond. A deep dive into ChatGPT, Claude, and Midjourney.",
    tags: ["GenAI", "Creative"],
    lang: "Bengali + Hindi",
    image: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1767046713/file_000000002cf47206bca15ee9dc788a8a_im45mg.png",
    courseUrl: "/generative-ai-toolset-mastery" // <--- Added placeholder (create this page later)
  },
  {
    title: "Power BI & Data Visualization",
    price: "3499",
    originalPrice: "4999",
    courseUrl: "/power-bi-data-visualization", // <--- This was already correct
    desc: "Transform raw data into interactive dashboards. Master DAX and AI-driven insights.",
    tags: ["Data Science", "Analytics"],
    lang: "Bengali + Hindi",
    image: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770737460/Power_Bi_3_Month_cohort_thumbnail_ucc0fo.png",
  },
];

export default function CourseSection() {
  const sliderRef = useRef(null);
  const [active, setActive] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false); // Track user interaction

  // Move logic into a reusable function
  const scrollToNext = useCallback(() => {
    if (!sliderRef.current) return;
    const nextIndex = (active + 1) % courses.length;
    const wrapper = sliderRef.current.querySelector('.course-card-wrapper');
    if (!wrapper) return;

    const scrollAmount = wrapper.offsetWidth + 16;
    sliderRef.current.scrollTo({
      left: nextIndex * scrollAmount,
      behavior: "smooth",
    });
    setActive(nextIndex);
  }, [active]);

  // Auto-scroll logic with Interaction Check
  useEffect(() => {
    // If user is touching the screen, don't start the timer
    if (isInteracting) return;

    const interval = setInterval(() => {
      scrollToNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [isInteracting, scrollToNext]);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const scrollLeft = sliderRef.current.scrollLeft;
    const wrapper = sliderRef.current.querySelector('.course-card-wrapper');
    if (!wrapper) return;

    const itemWidth = wrapper.offsetWidth;
    const index = Math.round(scrollLeft / (itemWidth + 16));
    if (index !== active) setActive(index);
  };

  return (
    <div className="w-full py-8 overflow-hidden">
      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {courses.map((course, i) => (
          <div key={i} className="transition-transform hover:scale-[1.02]">
            <CourseCard {...course} />
          </div>
        ))}
      </div>

      {/* Mobile Slider */}
      <div className="md:hidden">
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          // --- NEW: INTERACTION HANDLERS ---
          onTouchStart={() => setIsInteracting(true)} 
          onTouchEnd={() => setIsInteracting(false)}
          onMouseDown={() => setIsInteracting(true)} // For mouse dragging
          onMouseUp={() => setIsInteracting(false)}
          // ---------------------------------
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-6 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {courses.map((course, i) => (
            <div 
              key={i} 
              className="course-card-wrapper min-w-[calc(100vw-60px)] snap-center"
            >
              <CourseCard {...course} />
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {courses.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                active === i ? "w-6 bg-[#008a45]" : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}