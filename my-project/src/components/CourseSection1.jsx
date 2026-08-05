import { useRef, useState, useEffect, useCallback } from "react";
import CourseCard from "./CourseCard";
import { BASE_URL } from "../config"; // Make sure your config path is correct

export default function CourseSectionm() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const sliderRef = useRef(null);
  const [active, setActive] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  // --- 1. FETCH COURSES FROM BACKEND ---
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetching from your public cohort route
        const res = await fetch(`${BASE_URL}/cohorts`); 
        const data = await res.json();
        
        // Map the backend schema to match what CourseCard expects
        const formattedData = data.map(c => ({
          _id: c._id,
          title: c.title,
          // Using recorded discount as main price, fallback to live discount
          price: c.pricing?.live?.discount || c.pricing?.recorded?.discount || 0,
          originalPrice: c.pricing?.live?.original || c.pricing?.recorded?.original || 0,
          desc: c.description || "Learn and master new skills.",
          tags: c.tags || [],
          lang: c.language || "English",
          image: c.thumbnail,
          // Dynamically generate the URL using the auto-generated slug
          courseUrl: `/course/${c.slug}` 
        }));

        setCourses(formattedData);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // --- 2. SLIDER LOGIC ---
  const scrollToNext = useCallback(() => {
    if (!sliderRef.current || courses.length === 0) return;
    const nextIndex = (active + 1) % courses.length;
    const wrapper = sliderRef.current.querySelector('.course-card-wrapper');
    if (!wrapper) return;

    const scrollAmount = wrapper.offsetWidth + 16;
    sliderRef.current.scrollTo({
      left: nextIndex * scrollAmount,
      behavior: "smooth",
    });
    setActive(nextIndex);
  }, [active, courses.length]);

  // Auto-scroll logic with Interaction Check
  useEffect(() => {
    if (isInteracting || courses.length <= 1) return;

    const interval = setInterval(() => {
      scrollToNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [isInteracting, scrollToNext, courses.length]);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const scrollLeft = sliderRef.current.scrollLeft;
    const wrapper = sliderRef.current.querySelector('.course-card-wrapper');
    if (!wrapper) return;

    const itemWidth = wrapper.offsetWidth;
    const index = Math.round(scrollLeft / (itemWidth + 16));
    if (index !== active && index < courses.length) setActive(index);
  };

  // --- 3. LOADING STATE ---
  if (loading) {
    return (
      <div className="w-full py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#008a45]"></div>
      </div>
    );
  }

  // --- 4. EMPTY STATE ---
  if (courses.length === 0) {
    return null; // Or return a friendly "New courses coming soon!" message
  }

  return (
    <div className="w-full py-8 overflow-hidden">
      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {courses.map((course) => (
          <div key={course._id} className="transition-transform hover:scale-[1.02]">
            <CourseCard {...course} />
          </div>
        ))}
      </div>

      {/* Mobile Slider */}
      <div className="md:hidden">
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          onTouchStart={() => setIsInteracting(true)} 
          onTouchEnd={() => setIsInteracting(false)}
          onMouseDown={() => setIsInteracting(true)} 
          onMouseUp={() => setIsInteracting(false)}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-6 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {courses.map((course) => (
            <div 
              key={course._id} 
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