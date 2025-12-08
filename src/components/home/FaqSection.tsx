"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How accurate is the AI matching?",
    answer:
      "Our AI is trained by ex-VCs and fundraising experts on real deal data. It analyzes investor thesis, portfolio fit, check size, and stage to surface the investors most likely to invest in you. Most founders see a 3–5x improvement in response rates compared to cold outreach.",
  },
  {
    question: "Can I use my own email to send messages?",
    answer: "Yes, you can connect your own email provider easily.",
  },
  {
    question: "What if I don't get responses?",
    answer:
      "Our system optimizes follow-up sequences automatically to increase engagement.",
  },
  {
    question: "How many investors are in your database?",
    answer:
      "We track over 100,000 verified investors across venture capital, angel syndicates, and family offices.",
  },
  {
    question: "Do you guarantee I'll raise funding?",
    answer:
      "We cannot guarantee funding, but we significantly increase your odds through targeting and automation.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. All plans are flexible with no long-term commitments.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <section className="w-full mx-auto bg-white pb-40">
      <div className="max-w-4xl mx-auto p-10 bg-[#6CA2FC]/5 rounded-[24px] shadow-[0_0_40px_rgba(0,0,0,0.05)]">

      {/* Badge */}
        <div
          className="bg-[rgba(2,_82,_214,_0.1)] border-[1.5px] border-[#0252D6] backdrop-blur-[2px] rounded-[90px] px-6 py-2 inline-block mb-6"
          
        >
          <p className="font-poppins font-medium text-[24px] leading-[36px] text-center text-[#0252D6]">
            FAQs
          </p>
        </div>

        {/* Heading */}
        <h2 className="font-poppins font-medium text-[48px] leading-[62px] tracking-[-0.04em] text-black">
          Got questions?
          <br />
          <span className="font-poppins font-medium text-[48px] leading-[62px] tracking-[-0.04em] text-[#0252D6]">We've got Answers.</span>
        </h2>

        <div className="mt-10">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={index}>

                {/* FAQ Header */}
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between py-5 text-left group"
                >
                  <span className="font-poppins font-medium text-[24px] leading-[34px] tracking-[-0.02em] text-black">
                    {faq.question}
                  </span>

                  <span className="text-[28px] text-[#0252D6] font-light select-none">
                    {isOpen ? "−" : 
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                  </span>
                </button>

                {/* FAQ Content */}
                {isOpen && (
                  <div className="pb-4 pr-12">
                    <p className="font-inter font-normal text-[20px] leading-[150%] text-[#333333]">
                      {faq.answer}
                    </p>
                  </div>
                )}

                {/* Separator line */}
                <div className="border border-dashed border-[#333333] opacity-[0.45]"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
