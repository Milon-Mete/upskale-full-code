import { useState } from "react";

const faqs = [
  {
    q: "How do I get my certificate?",
    a: "Finish the course and clear the final assessment — your certificate unlocks automatically in your profile. Download it anytime.",
  },
  {
    q: "Are the courses beginner-friendly?",
    a: "Yes. Every course starts from zero and builds up with real, practical lessons. No prior experience needed.",
  },
  {
    q: "How do I sign in?",
    a: "One tap with your Google account. No passwords, no OTPs to wait for.",
  },
  {
    q: "What is Swipes Pro?",
    a: "Our short-course subscription. New members try it for ₹1 for 3 days. Autopay then charges ₹799 for the first year, and ₹1,299 for each year after. Cancel anytime. Every course comes with a certificate.",
  },
  {
    q: "Do I get recordings of live sessions?",
    a: "Yes. Every live masterclass and cohort session is recorded — miss nothing, rewatch anytime.",
  },
  {
    q: "What if I'm not happy with a course?",
    a: "Tell us after the first session and we'll sort a refund as per our policy. Simple.",
  },
];

const FAQItem = ({ q, a, isOpen, toggle }) => {
  return (
    <div className="border-b border-white/10 py-5">
      <button
        onClick={toggle}
        className="w-full flex justify-between items-center text-left gap-4"
      >
        <h3 className="text-[16px] font-bold text-white">{q}</h3>
        <span className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-lg transition-all ${isOpen ? 'bg-red-600 border-red-600 text-white' : 'border-white/20 text-gray-400'}`}>
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && (
        <p className="mt-3 text-gray-400 leading-relaxed text-sm pr-10">{a}</p>
      )}
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-[#0A0A0B]">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-500 mb-2">
            Got questions?
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Quick answers.
          </h2>
        </div>

        <div>
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === index}
              toggle={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
