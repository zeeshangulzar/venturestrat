'use client';

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import AiMatchingCard from "@components/elements/AIMatchingCard";
import InvestorDBCard from "@components/elements/InvestorDBCard";
import FollowUpCard from "@components/elements/FollowUpCard";
import MarketingCard from "@components/elements/MarketingCard";

export default function WhyVentureStrat() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);
  const cardsContainerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        } else {
          setInView(false);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: cardsContainerRef,
    offset: ["start end", "end start"]
  });

  const CARD_GAP = 720; // Roughly a full card height so they start fully separated even on small viewports

  const card1Y = useTransform(scrollYProgress, [0, 1], [0, 0]);
  const card2Y = useTransform(scrollYProgress, [0.04, 0.3], [CARD_GAP * 1.6, 0]); // extra initial space so it doesn't cover card 1 at start
  const card3Y = useTransform(scrollYProgress, [0.2, 0.55], [CARD_GAP * 2.2, 0]);
  const card4Y = useTransform(scrollYProgress, [0.35, 0.8], [CARD_GAP * 3.2, 0]); // finish earlier so it snaps on top by 80% scroll

  // Scroll effect for section header
  const { scrollYProgress: headerScrollY } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });
  const headerOpacity = useTransform(headerScrollY, [0, 0.5], [1, 0]);

  return (
    <section
      id="why-venturestrat"
      className="relative mx-auto text-center flex justify-center flex-col items-center mt-40"
      ref={sectionRef}
    >
      <motion.div
        className="bg-[rgba(2,_82,_214,_0.1)] border-[1.5px] border-[#0252D6] backdrop-blur-[2px] rounded-[90px] w-[254px] h-[49px] flex items-center justify-center mb-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 50 }}
        transition={{ duration: 0.8 }}
      >
        <p className="font-poppins font-medium text-[24px] leading-[36px] text-center text-[#0252D6]">
          Why VentureStrat
        </p>
      </motion.div>

      <motion.h2
        className="leading-[62px] mb-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 50 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <span className="font-poppins font-medium text-4xl leading-[62px] text-right tracking-[-0.04em] text-black">Why founders choose</span>
        <span className="font-inter font-semibold text-4xl text-center tracking-[-0.04em] text-[#0252D6]"> VentureStrat AI</span>
      </motion.h2>

      {/* Cards Container with Drawer Effect */}
      <div ref={cardsContainerRef} className="relative w-full min-h-[520vh]">
        <div className="sticky top-20 w-full">
          {/* Card 1 - AI Matching - LOWEST z-index (bottom of stack) */}
          <motion.div
            className="absolute top-0 left-0 right-0 mx-auto max-w-fit"
            style={{ y: card1Y, zIndex: 10 }}
          >
            <AiMatchingCard inView={true} />
          </motion.div>

          {/* Card 2 - Investor DB */}
          <motion.div
            className="absolute top-0 left-0 right-0 mx-auto max-w-fit"
            style={{ y: card2Y, zIndex: 20 }}
          >
            <InvestorDBCard inView={true} />
          </motion.div>

          {/* Card 3 - Follow Up */}
          <motion.div
            className="absolute top-0 left-0 right-0 mx-auto max-w-fit"
            style={{ y: card3Y, zIndex: 30 }}
          >
            <FollowUpCard inView={true} />
          </motion.div>

          {/* Card 4 - Marketing - HIGHEST z-index (top of stack) */}
          <motion.div
            className="absolute top-0 left-0 right-0 mx-auto max-w-fit"
            style={{ y: card4Y, zIndex: 40 }}
          >
            <MarketingCard inView={true} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
