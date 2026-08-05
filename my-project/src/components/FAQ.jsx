import { useState } from "react";

const faqs = [
  {
    q: "How do I receive my certificate after completing a program?",
    a: "Our system automatically tracks your attendance, progress, and assessments. Once you meet the required criteria, your certificate is generated and available in your dashboard for download.",
  },
  {
    q: "Do I need to attend live sessions to get certified?",
    a: "Yes. For masterclasses and cohort programs, attendance is mandatory. For bite-size courses, you must complete lessons and pass the MCQ test to qualify for certification.",
  },
  {
    q: "How does the OTP login system work?",
    a: "You can log in securely using your mobile number and OTP. No passwords to remember. This makes access simple and fast for all students.",
  },
  {
    q: "Are the programs beginner friendly?",
    a: "Absolutely. We start from fundamentals and gradually move to advanced concepts with real projects, making it suitable for beginners as well as working professionals.",
  },
  {
    q: "Will I get job or placement support?",
    a: "Our 3-month and 6-month cohort programs are designed to make you job-ready with projects, mock interviews, and mentorship support.",
  },
  {
    q: "Can I access recordings if I miss a live session?",
    a: "Yes, recordings are provided for masterclasses and cohort sessions so you never miss the learning.",
  },
  {
    q: "Is there any refund policy?",
    a: "Yes. If you are not satisfied after the first session, you can request a refund as per our policy terms.",
  },
];

const FAQItem = ({ q, a, isOpen, toggle }) => {
  return (
    <div className="border-b border-gray-200 py-5">
      <button
        onClick={toggle}
        className="w-full flex justify-between items-center text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900">{q}</h3>
        <span className="text-2xl text-red-600">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <p className="mt-3 text-gray-600 leading-relaxed text-sm">{a}</p>
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
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 text-lg">
            Everything you need to know before joining our programs.
          </p>
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
