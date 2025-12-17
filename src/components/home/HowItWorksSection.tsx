import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function HowItWorks() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  const steps = [
    {
      number: "1",
      title: "Tell us about your startup",
      description:
        "Complete your profile in 5 minutes. Tell us your sector, stage, location, and what you're raising.",
      icon: (
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M27.3333 36.6673L19.3333 28.6673M27.3333 36.6673C31.0583 35.2506 34.6317 33.4639 38 31.334M27.3333 36.6673V50.0007C27.3333 50.0007 35.4133 48.534 38 44.6673C40.88 40.3473 38 31.334 38 31.334M19.3333 28.6673C20.7524 24.9858 22.5392 21.4568 24.6667 18.134C27.7738 13.166 32.1003 9.07546 37.2347 6.25157C42.369 3.42768 48.1404 1.96432 54 2.00066C54 9.25399 51.92 22.0007 38 31.334M19.3333 28.6673H6C6 28.6673 7.46667 20.5873 11.3333 18.0007C15.6533 15.1207 24.6667 18.0007 24.6667 18.0007M7.33333 40.6673C3.33333 44.0273 2 54.0007 2 54.0007C2 54.0007 11.9733 52.6673 15.3333 48.6673C17.2267 46.4273 17.2 42.9873 15.0933 40.9073C14.0568 39.918 12.6914 39.3464 11.2593 39.3021C9.82709 39.2578 8.429 39.744 7.33333 40.6673Z"
            stroke="#0252D6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      highlight: false,
    },
    {
      number: "2",
      title: "Get matched with the right investors",
      description:
        "Explore 120,000+ investors and find the best fit based on their location, investment thesis, portfolio companies, and preferred stages.",
      icon: (
        <svg
          width="47"
          height="57"
          viewBox="0 0 47 57"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.9012 35.152C16.7338 36.7373 18.3962 37.8187 20.3111 37.8187H26C28.9455 37.8187 31.3333 35.4309 31.3333 32.4853C31.3333 29.5398 28.9455 27.152 26 27.152H20.6667C17.7211 27.152 15.3333 24.7642 15.3333 21.8187C15.3333 18.8731 17.7211 16.4853 20.6667 16.4853H26.3556C28.2705 16.4853 29.9329 17.5666 30.7654 19.152M23.3333 12.4853V16.4853M23.3333 37.8187V41.8187M44.6667 28.4853C44.6667 41.5745 30.3894 51.0944 25.1946 54.125C24.6043 54.4694 24.3091 54.6416 23.8925 54.731C23.5692 54.8003 23.0975 54.8003 22.7742 54.731C22.3576 54.6416 22.0624 54.4694 21.472 54.125C16.2772 51.0944 2 41.5745 2 28.4853V15.7323C2 13.6002 2 12.5342 2.34869 11.6179C2.65673 10.8084 3.15729 10.0861 3.80709 9.51341C4.54265 8.86517 5.5408 8.49087 7.53708 7.74226L21.8352 2.38046C22.3896 2.17257 22.6668 2.06862 22.952 2.02741C23.2049 1.99086 23.4618 1.99086 23.7147 2.02741C23.9999 2.06862 24.2771 2.17257 24.8315 2.38046L39.1296 7.74226C41.1259 8.49087 42.124 8.86517 42.8596 9.51341C43.5094 10.0861 44.0099 10.8084 44.318 11.6179C44.6667 12.5342 44.6667 13.6002 44.6667 15.7323V28.4853Z"
            stroke="#0252D6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      highlight: true,
    },
    {
      number: "3",
      title: "Reach out",
      description:
        "Use AI to draft outreach emails that mention their portfolio and why your startup fits their thesis. Send directly from VentureStrat, track opens and replies, and move forward.",
      icon: (
        <svg
          width="58"
          height="55"
          viewBox="0 0 58 55"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M33.3172 3.99521L53.3919 17.0438C54.1013 17.5048 54.456 17.7354 54.7129 18.0429C54.9404 18.3151 55.1113 18.63 55.2155 18.969C55.3333 19.3521 55.3333 19.7751 55.3333 20.6211V40.1723C55.3333 44.6528 55.3333 46.893 54.4614 48.6043C53.6944 50.1096 52.4705 51.3334 50.9653 52.1004C49.254 52.9723 47.0138 52.9723 42.5333 52.9723H14.8C10.3196 52.9723 8.07937 52.9723 6.36808 52.1004C4.86278 51.3334 3.63893 50.1096 2.87195 48.6043C2 46.893 2 44.6528 2 40.1723V20.6211C2 19.7751 2 19.3521 2.11779 18.969C2.22205 18.63 2.39292 18.3151 2.62039 18.0429C2.87736 17.7354 3.23204 17.5048 3.94138 17.0438L24.0161 3.99521M33.3172 3.99521C31.6339 2.90105 30.7923 2.35398 29.8854 2.14112C29.0838 1.95296 28.2495 1.95296 27.4479 2.14112C26.5411 2.35398 25.6994 2.90105 24.0161 3.99521M33.3172 3.99521L49.8297 14.7283C51.664 15.9206 52.5811 16.5167 52.8987 17.2727C53.1763 17.9334 53.1763 18.678 52.8987 19.3386C52.5811 20.0946 51.664 20.6908 49.8297 21.883L33.3172 32.6161C31.6339 33.7103 30.7923 34.2574 29.8854 34.4702C29.0838 34.6584 28.2495 34.6584 27.4479 34.4702C26.5411 34.2574 25.6994 33.7103 24.0161 32.6161L7.50363 21.883C5.66937 20.6908 4.75224 20.0946 4.4346 19.3386C4.15701 18.678 4.15701 17.9334 4.4346 17.2727C4.75224 16.5167 5.66937 15.9206 7.50363 14.7283L24.0161 3.99521M54 47.639L36.2858 31.639M21.0475 31.639L3.33333 47.639"
            stroke="#0252D6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      highlight: false,
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger animation when entering view
        if (entry.isIntersecting) {
          setInView(true);
        } else {
          // Reset animation when leaving view
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

  return (
    <section
      id="how-it-works"
      className="max-w-7xl mx-auto text-center flex justify-center flex-col items-center px-6 mt-40"
      ref={sectionRef}
    >
      <motion.div
        className="bg-[rgba(2,_82,_214,_0.1)] border-[1.5px] border-[#0252D6] backdrop-blur-[2px] rounded-[90px] w-[195px] h-[49px] flex items-center justify-center mb-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 50 }}
        transition={{ duration: 0.8 }}
      >
        <p className="font-poppins font-medium text-[24px] leading-[36px] text-center text-[#0252D6]">
          How It Works
        </p>
      </motion.div>

      <motion.h2
        className="leading-[62px] mb-13"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 50 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <p className="font-inter font-semibold text-4xl text-center tracking-[-0.04em] text-black">From zero to pitch-ready</p>
        <p className="font-inter font-semibold text-4xl text-center tracking-[-0.04em] text-black">in 3 simple steps</p>
      </motion.h2>

      <div className="w-full bg-dots rounded-[36px] p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className={`relative flex h-full flex-col gap-6 rounded-[30px] border-[2px] border-[#1C73E8] border-dotted px-10 pt-14 pb-12 text-left transition-transform duration-200 ease-out hover:-translate-y-1 ${
                step.highlight ? "bg-gradient-to-b from-[#E5EFFF] to-white" : "bg-white"
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 50 }}
              transition={{ duration: 0.8, delay: 0.4 + index * 0.2 }}
            >
              <div className="absolute -top-7 left-15 h-12 w-12 -translate-x-1/2 rounded-full bg-white text-center text-lg font-semibold leading-[48px] shadow-sm">
                {step.number}
              </div>

              <div className="flex flex-col gap-4">
                <div className="h-14 w-14 mb-25.5">{step.icon}</div>
                <h3 className="font-inter font-semibold text-2xl leading-[145%] tracking-[-0.02em] text-black">
                  {step.title}
                </h3>
                <p className="font-inter font-normal text-base leading-[150%] text-[#333333]">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Text */}
      <motion.div 
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 30 }}
        transition={{ duration: 0.8, delay: 1.0 }}
      >
        <p className="font-inter font-medium text-xl leading-[150%] text-center text-[#333333]">If they don't respond? We automatically send follow-ups.</p>
      </motion.div>

      {/* CTA Button */}
      <motion.div 
        className="text-center mt-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 30 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <Link
            href="/sign-up"
            className="flex flex-row justify-center items-center h-[58px] w-[254px] px-[23px] py-[17px] gap-[10px] mx-auto bg-gradient-to-r from-[#0252D6] to-[#012B70] rounded-[900px] font-poppins font-medium text-base leading-[27px] text-white"
          >
            Start Free Trial
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path
                d="M1 13L7 7L1 1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
      </motion.div>
    </section>
  );
}
