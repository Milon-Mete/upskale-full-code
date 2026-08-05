import { Quote, CheckCircle, Star, Briefcase } from "lucide-react";
import { useRef, useState } from "react";

// 1. Featured Story Data
const featuredStory = {
  name: "Priya Verma",
  role: "Frontend Developer",
  company: "TCS",
  image: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770737461/Picsart_25-11-03_02-12-52-893_rsitda.png",
  story: "I was from a non-tech background and completely confused about where to start. The 3-Month Cohort gave me a structured path. It wasn't just about watching videos; the mentors reviewed my code every week. The mock interviews were a game changer—they asked the exact questions I faced in my real TCS interview. Today, I'm confident in React and building scalable apps.",
  skills: ["React.js", "System Design", "Data Structures"]
};

// 2. Smaller Testimonials Data
const otherTestimonials = [
  {
    name: "Puja Das",
    role: "Data Analyst @ Infosys",
    image: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770750326/Copilot_20260211_003423_l950ue.png",
    story: "The dashboard tracking kept me motivated. Bite-sized lessons made it easy to learn daily.",
  },
  {
    name: "Amit Patel",
    role: "DevOps Engineer @ Wipro",
    image: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770750327/Copilot_20260211_003509_xillrk.png",
    story: "Real projects and GitHub reviews made it feel like a real job, not just a course.",
  },
  {
    name: "Sneha Roy",
    role: "Designer @ Accenture",
    image: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770750326/Copilot_20260211_003303_k1ejvj.png",
    story: "I built my entire portfolio here. The design critiques were brutally honest and helpful.",
  },
];

export default function Testimonials() {
  const sliderRef = useRef(null);
  const [active, setActive] = useState(0);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const index = Math.round(
      sliderRef.current.scrollLeft / sliderRef.current.clientWidth
    );
    setActive(index);
  };

  // COMPONENT: Compact Small Card
  const SmallCard = ({ t }) => (
    <div className="bg-white h-full rounded-xl p-5 shadow-sm border border-gray-100 hover:border-[#008a45]/30 hover:shadow-md transition-all duration-300 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={t.image}
          alt={t.name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div>
          <h4 className="font-bold text-gray-900 text-sm leading-tight">{t.name}</h4>
          <p className="text-[10px] text-gray-500 font-medium uppercase">{t.role}</p>
        </div>
      </div>
      <p className="text-gray-600 text-xs leading-relaxed">
        "{t.story}"
      </p>
      <div className="mt-3 flex text-[#008a45]">
        {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" />)}
      </div>
    </div>
  );

  return (
    <section className="bg-gray-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER (Restored Style) --- */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            From Learning to <span className="text-[#008a45]">Earning</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            See how our students are transforming their careers and landing top tech jobs.
          </p>
        </div>

        {/* --- 1. FEATURED BIG PICTURE STORY --- */}
        <div className="mb-12">
          {/* Layout: Content Left, Image Right */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-[#008a45]/5 border border-[#008a45]/10 flex flex-col-reverse md:flex-row">
            
            {/* LEFT SIDE: Detailed Content */}
            <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center relative">
              <Quote className="absolute top-8 left-8 text-[#008a45]/10 rotate-180" size={60} fill="currentColor" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider mb-6">
                  <Star size={12} fill="currentColor" />
                  Star Performer
                </div>

                <h3 className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium mb-8">
                  "{featuredStory.story}"
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6 border-t border-gray-100">
                  <div>
                    <h4 className="text-xl font-black text-gray-900">{featuredStory.name}</h4>
                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                      <Briefcase size={14} />
                      <span className="text-sm font-medium">{featuredStory.role} at {featuredStory.company}</span>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="sm:ml-auto flex flex-wrap gap-2">
                    {featuredStory.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wide rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Big Image */}
            <div className="md:w-5/12 relative min-h-[300px] md:min-h-full">
              <img 
                src={featuredStory.image} 
                alt="Success Story" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:to-black/10"></div>
              
              {/* Badge */}
              <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur text-[#008a45] px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg animate-fade-in-up">
                <CheckCircle size={18} className="fill-[#008a45] text-white" />
                Placed at {featuredStory.company}
              </div>
            </div>

          </div>
        </div>

        {/* --- 2. OTHER STORIES GRID/SLIDER --- */}
        <div>
           <h3 className="text-xl font-bold text-gray-900 mb-6 px-2">More Success Stories</h3>
           
           {/* Desktop Grid */}
           <div className="hidden md:grid md:grid-cols-3 gap-6">
             {otherTestimonials.map((t, i) => (
               <SmallCard key={i} t={t} />
             ))}
           </div>

           {/* Mobile Slider */}
           <div className="md:hidden">
             <div
               ref={sliderRef}
               onScroll={handleScroll}
               className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
             >
               {otherTestimonials.map((t, i) => (
                 <div key={i} className="min-w-[85vw] snap-center">
                   <SmallCard t={t} />
                 </div>
               ))}
             </div>

             {/* Dots */}
             <div className="flex justify-center gap-2 mt-2">
               {otherTestimonials.map((_, i) => (
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

      </div>
    </section>
  );
}