import TestimonialCard from "@components/elements/TestimonialCard";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

export default function Resources() {
  const testimonials = [
    {
      quote: "VentureStrat cut my investor research time from weeks to minutes. I went from 0 meetings to 5 term sheets in 2 months.",
      avatar: "/avatar1.png",
      name: "Simone Brüderli",
      role: "COO, ESCMID",
      amount: "$10.5M",
      amountLabel: "Raised",
    },
    {
      quote: "The AI emails are ridiculously good. Investors actually reply because the outreach feels personal — not like spam.",
      avatar: "/avatar2.png",
      name: "Jānis Bleiferts",
      role: "Project Management, DPD",
      amount: "$22.7M",
      amountLabel: "Raised",
    },
    {
      quote: "VentureStrat cut my investor research time from weeks to minutes. I went from 0 meetings to 5 term sheets in 2 months.",
      avatar: "/avatar3.png",
      name: "Simone Brüderli",
      role: "COO, ESCMID",
      amount: "$37M",
      amountLabel: "Raised",
    },
    {
      quote: "With VentureStrat, I streamlined my pitch process significantly, leading to more engaging and fruitful conversations with investors.",
      avatar: "/avatar1.png",
      name: "Liam O'Reilly",
      role: "Founder, TechNova",
      amount: "$15M",
      amountLabel: "Raised",
    },
    {
      quote: "Thanks to VentureStrat, I found the right investors faster than ever, and my funding journey turned from daunting to straightforward.",
      avatar: "/avatar3.png",
      name: "Elena Martinez",
      role: "CEO, GreenTech Innovations",
      amount: "$15M",
      amountLabel: "Raised",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    const controls = animate(x, [0, -50], {
      duration: 30,
      ease: "linear",
      repeat: Infinity,
    });

    const unsubscribe = x.on("change", (latest) => {
      const progress = Math.abs(latest) / 50;
      const index = Math.floor(progress * testimonials.length) % testimonials.length;
      setCurrentIndex(index);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [testimonials.length]);

  const getDotStyle = (index: number) => {
    const distance = Math.abs(currentIndex - index);
    
    if (distance === 0) {
      return "w-[30px] h-[14px] opacity-100";
    } else if (distance === 1) {
      return "w-[14px] h-[14px] opacity-50";
    } else if (distance === 2) {
      return "w-[10px] h-[10px] opacity-25";
    } else {
      return "w-[8px] h-[8px] opacity-15";
    }
  };

  return (
    <>
      <div className="relative w-full mx-auto max-w-[100vw] mt-[845px]">
        {/* Top Right Vector - Half outside the section */}
        <img 
          src="/vector-2.png" 
          alt="" 
          width={368} 
          height={398} 
          className="absolute z-1 right-0 top-[-155px] w-[368px] h-[398px] opacity-90 pointer-events-none"
        />
        
        {/* Bottom Left Vector - Half outside the section */}
        <img 
          src="/rectangle-vector.png" 
          alt="" 
          width={131} 
          height={204} 
          className="absolute left-[45px] bottom-[-1025px] w-[131px] h-[204px] opacity-90 pointer-events-none z-1"
        />
      </div>
    

      <section
        id="resources"
        className="relative max-w-[96vw] w-full mx-auto rounded-[24px] bg-gradient-to-b text-white py-16 min-h-[80vh] overflow-hidden"
        style={{ background: "linear-gradient(180deg, #012B70 0%, #000000 100%)" }}
      >
        <div className="flex items-center justify-center flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[rgba(108,162,252,0.1)] border border-[#6CA2FC] rounded-[90px] px-[15px] py-[12px] w-[fit-content] mb-12">
            <span className="font-poppins font-medium text-[24px] leading-[36px] text-[#6CA2FC]">What our customers say</span>
          </div>

          <h2 className="text-6xl font-medium text-center tracking-[-0.05em] text-white">
            Join 1,000+ founders
          </h2>
          <h2 className="text-6xl font-medium text-center leading-[106px] tracking-[-0.05em] text-white">
            who are raising smarter
          </h2>
        </div>

        <div className="relative w-full overflow-hidden mt-12">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-[160px] bg-gradient-to-r from-[#012B70] to-transparent z-20" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-[160px] bg-gradient-to-l from-[#000000] to-transparent z-20" />
          
          <motion.div
            className="flex gap-6 w-fit"
            style={{ x: useTransform(x, (v) => `${v}%`) }}
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <TestimonialCard
                key={index}
                quote={testimonial.quote}
                avatar={testimonial.avatar}
                name={testimonial.name}
                role={testimonial.role}
                amount={testimonial.amount}
                amountLabel={testimonial.amountLabel}
              />
            ))}
          </motion.div>
        </div>

        {/* Pagination Container */}
        <div className="flex justify-center items-center mt-8 relative z-30">
          <div className="bg-[rgba(51,51,51,0.25)] border border-[#333333] rounded-[900px] px-[26px] py-[18px] w-fit h-[50px] flex items-center justify-center">
            <div className="flex items-center gap-[10px]">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`bg-white rounded-[900px] transition-all duration-300 ${getDotStyle(index)}`}
                  onClick={() => {
                    const targetX = -(index * (100 / testimonials.length));
                    animate(x, targetX, { duration: 1 });
                  }}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}