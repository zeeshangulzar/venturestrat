import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import WarningIcon from '@components/icons/WarningIcon';

// Check Icon for Solution Section
const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#8EE7A0" strokeWidth="2"/>
    <path d="M8 12L11 15L16 9" stroke="#8EE7A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function QuestionAnswer() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
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

  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Transform for the solution card to move up and overlap
  const solutionY = useTransform(scrollYProgress, [0, 0.5], ["48px", "0px"]);
  const solutionOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [1, 1, 1]);

  return (
    <div ref={containerRef} className="relative min-h-[200vh] bg-black">
      <section
        id="question-answer"
        className="rounded-[24px] bg-gradient-to-b text-white py-16 mx-10 mt-40"
        style={{ background: "linear-gradient(180deg, #012B70 0%, #000000 100%)" }}
        ref={sectionRef}
      >
        <h2 className="text-6xl font-medium text-center tracking-[-0.05em] text-white">
          Raise smarter with AI that
        </h2>
        <h2 className="text-6xl font-medium text-center leading-[106px] tracking-[-0.05em] text-white">
          does the heavy lifting
        </h2>
        <p className="text-[#D6D6D6] text-center">
          VentureStrat AI is the fundraising co-pilot that finds your perfect investors,
        </p>
        <p className="text-[#D6D6D6] text-center">
          writes personalized outreach emails, and tracks every conversation — so you
        </p>
        <p className="text-[#D6D6D6] text-center mb-8">
          can spend less time searching and more time closing.
        </p>

        <motion.div
          className="container mx-auto px-6 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          {/* Problem Section - Sticky */}
          <div className="sticky top-20 bg-opacity-25 rounded-xl flex flex-row p-6 gap-10 justify-around border border-[#D60206] bg-[#33333340]">
            <div className="border-[1.5px] border-[#D60206] rounded-full w-[157px] h-[53px] flex items-center justify-center shrink-0">
              <h3 className="font-poppins font-medium text-[24px] leading-[24px] tracking-[0.01em] text-[#D60206]">Problem</h3>
            </div>
            <div>
              <p className="font-poppins font-medium text-[48px] leading-[62px] tracking-[-0.04em] text-white">
                Fundraising shouldn't feel like
              </p>
              <p className="font-poppins font-medium text-[48px] leading-[62px] tracking-[-0.04em] text-white">
                throwing darts in the dark.
              </p>
              <p className="text-[#D6D6D6] font-inter font-medium text-[20px]">
                You're building something incredible. But instead of focusing on
              </p>
              <p className="text-[#D6D6D6] font-inter font-medium text-[20px] mb-12">
                your product, you're stuck doing this:
              </p>
              <ul className="list-none text-lg">
                <li className="flex mb-4 gap-4 font-inter font-semibold text-[20px] leading-[150%] tracking-[-0.01em] text-white">
                  <div className="text-[#D60206] shrink-0"><WarningIcon /></div>
                  <div className="flex gap-1 flex-wrap">
                    <span>Googling investors for hours</span>
                    <span className="text-[#D6D6D6] font-inter font-normal text-[20px] leading-[150%] tracking-[-0.01em]">
                      hoping to find someone relevant
                    </span>
                  </div>
                </li>
                <li className="flex mb-4 gap-4 font-inter font-semibold text-[20px] leading-[150%] tracking-[-0.01em] text-white">
                  <div className="text-[#D60206] shrink-0"><WarningIcon /></div>
                  <div className="flex gap-1 flex-wrap">
                    <span>Sending generic cold emails</span>
                    <span className="text-[#D6D6D6] font-inter font-normal text-[20px] leading-[150%] tracking-[-0.01em]">
                      that get ignored
                    </span>
                  </div>
                </li>
                <li className="flex mb-4 gap-4 font-inter font-semibold text-[20px] leading-[150%] tracking-[-0.01em] text-white">
                  <div className="text-[#D60206] shrink-0"><WarningIcon /></div>
                  <div className="flex gap-1 flex-wrap">
                    <span>Chasing down investors</span>
                    <span className="text-[#D6D6D6] font-inter font-normal text-[20px] leading-[150%] tracking-[-0.01em]">
                      who were never a good fit anyway
                    </span>
                  </div>
                </li>
                <li className="flex mb-4 gap-4 font-inter font-semibold text-[20px] leading-[150%] tracking-[-0.01em] text-white">
                  <div className="text-[#D60206] shrink-0"><WarningIcon /></div>
                  <div className="flex gap-1 flex-wrap">
                    <span>Losing track</span>
                    <span className="text-[#D6D6D6] font-inter font-normal text-[20px] leading-[150%] tracking-[-0.01em]">
                      of who you've contacted and where things stand
                    </span>
                  </div>
                </li>
                <li className="flex mb-4 gap-4 font-inter font-semibold text-[20px] leading-[150%] tracking-[-0.01em] text-white">
                  <div className="text-[#D60206] shrink-0"><WarningIcon /></div>
                  <div className="flex gap-1 flex-wrap">
                    <span>Getting ghosted</span>
                    <span className="text-[#D6D6D6] font-inter font-normal text-[20px] leading-[150%] tracking-[-0.01em]">
                      with no idea why
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Solution Section - Overlapping */}
          <motion.div
            className="sticky top-20 z-10 bg-opacity-95 rounded-xl flex flex-row p-6 gap-10 justify-around border border-[#8EE7A0] bg-[#0a0a0a] mt-12"
            style={{
              y: solutionY,
              opacity: solutionOpacity,
            }}
          >
            <div className="border-[1.5px] border-[#8EE7A0] rounded-full w-[157px] h-[53px] flex items-center justify-center shrink-0">
              <h3 className="font-poppins font-medium text-[24px] leading-[24px] tracking-[0.01em] text-[#8EE7A0]">Solution</h3>
            </div>
            <div>
              <p className="font-poppins font-medium text-[48px] leading-[62px] tracking-[-0.04em] text-white">
                Fundraising shouldn't feel like
              </p>
              <p className="font-poppins font-medium text-[48px] leading-[62px] tracking-[-0.04em] text-white">
                throwing darts in the dark.
              </p>
              <p className="text-[#D6D6D6] font-inter font-medium text-[20px]">
                You're building something incredible. But instead of focusing on
              </p>
              <p className="text-[#D6D6D6] font-inter font-medium text-[20px] mb-12">
                your product, you're stuck doing this:
              </p>
              <ul className="list-none text-lg">
                <li className="flex mb-4 gap-4 font-inter font-semibold text-[20px] leading-[150%] tracking-[-0.01em] text-white">
                  <div className="text-[#D60206] shrink-0"><WarningIcon /></div>
                  <div className="flex gap-1 flex-wrap">
                    <span>Googling investors for hours</span>
                    <span className="text-[#D6D6D6] font-inter font-normal text-[20px] leading-[150%] tracking-[-0.01em]">
                      hoping to find someone relevant
                    </span>
                  </div>
                </li>
                <li className="flex mb-4 gap-4 font-inter font-semibold text-[20px] leading-[150%] tracking-[-0.01em] text-white">
                  <div className="text-[#D60206] shrink-0"><WarningIcon /></div>
                  <div className="flex gap-1 flex-wrap">
                    <span>Sending generic cold emails</span>
                    <span className="text-[#D6D6D6] font-inter font-normal text-[20px] leading-[150%] tracking-[-0.01em]">
                      that get ignored
                    </span>
                  </div>
                </li>
                <li className="flex mb-4 gap-4 font-inter font-semibold text-[20px] leading-[150%] tracking-[-0.01em] text-white">
                  <div className="text-[#D60206] shrink-0"><WarningIcon /></div>
                  <div className="flex gap-1 flex-wrap">
                    <span>Chasing down investors</span>
                    <span className="text-[#D6D6D6] font-inter font-normal text-[20px] leading-[150%] tracking-[-0.01em]">
                      who were never a good fit anyway
                    </span>
                  </div>
                </li>
                <li className="flex mb-4 gap-4 font-inter font-semibold text-[20px] leading-[150%] tracking-[-0.01em] text-white">
                  <div className="text-[#D60206] shrink-0"><WarningIcon /></div>
                  <div className="flex gap-1 flex-wrap">
                    <span>Losing track</span>
                    <span className="text-[#D6D6D6] font-inter font-normal text-[20px] leading-[150%] tracking-[-0.01em]">
                      of who you've contacted and where things stand
                    </span>
                  </div>
                </li>
                <li className="flex mb-4 gap-4 font-inter font-semibold text-[20px] leading-[150%] tracking-[-0.01em] text-white">
                  <div className="text-[#D60206] shrink-0"><WarningIcon /></div>
                  <div className="flex gap-1 flex-wrap">
                    <span>Getting ghosted</span>
                    <span className="text-[#D6D6D6] font-inter font-normal text-[20px] leading-[150%] tracking-[-0.01em]">
                      with no idea why
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}