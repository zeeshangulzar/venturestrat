"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function PricingSection() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Intersection Observer for fade-in text
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);
    const tickMark = (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_4_39864)">
        <path d="M19.5562 8.74032L18.1961 7.16071C17.9361 6.86078 17.7261 6.30092 17.7261 5.90102V4.20145C17.7261 3.14171 16.8561 2.27193 15.796 2.27193H14.0959C13.7059 2.27193 13.1358 2.06198 12.8358 1.80205L11.2557 0.442389C10.5657 -0.147463 9.43561 -0.147463 8.73556 0.442389L7.16543 1.81205C6.86541 2.06198 6.29538 2.27193 5.90535 2.27193H4.17525C3.11519 2.27193 2.24514 3.14171 2.24514 4.20145V5.91102C2.24514 6.30092 2.03512 6.86078 1.78511 7.16071L0.435026 8.75032C-0.145009 9.44015 -0.145009 10.5599 0.435026 11.2497L1.78511 12.8393C2.03512 13.1392 2.24514 13.6991 2.24514 14.089V15.7986C2.24514 16.8583 3.11519 17.7281 4.17525 17.7281H5.90535C6.29538 17.7281 6.86541 17.938 7.16543 18.198L8.74557 19.5576C9.43561 20.1475 10.5657 20.1475 11.2657 19.5576L12.8458 18.198C13.1458 17.938 13.7059 17.7281 14.1059 17.7281H15.806C16.8661 17.7281 17.7361 16.8583 17.7361 15.7986V14.099C17.7361 13.7091 17.9461 13.1392 18.2061 12.8393L19.5662 11.2597C20.1463 10.5699 20.1462 9.43015 19.5562 8.74032ZM14.1559 8.11048L9.3256 12.9393C9.18559 13.0792 8.99558 13.1592 8.79557 13.1592C8.59556 13.1592 8.40554 13.0792 8.26554 12.9393L5.84535 10.5199C5.55533 10.2299 5.55533 9.75007 5.84535 9.46014C6.13537 9.17021 6.6154 9.17021 6.90542 9.46014L8.79557 11.3497L13.0958 7.05073C13.3858 6.76081 13.8659 6.76081 14.1559 7.05073C14.4459 7.34066 14.4459 7.82054 14.1559 8.11048Z" fill="#0252D6"/>
        </g>
        <defs>
        <clipPath id="clip0_4_39864">
        <rect width="20" height="20" fill="white"/>
        </clipPath>
        </defs>
      </svg>
    )
  return (
    
    <section id="pricing" ref={sectionRef} className="w-full py-24 flex flex-col items-center px-4 bg-gradient-to-b from-transparent via-white/80 to-white">      
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
        transition={{ duration: 0.6 }}
        className="bg-[rgba(2,82,214,0.1)] border border-[#0252D6] rounded-[90px] px-6 py-2 mb-10"
      >
        <p className="font-poppins font-medium text-[24px] text-[#0252D6] leading-[36px]">
          Pricing
        </p>
      </motion.div>

      {/* Main Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 30 }}
        transition={{ duration: 0.7 }}
        className="font-poppins font-medium text-[86px] leading-[106px] text-center tracking-[-0.05em] text-black"
      >
        Simple pricing. Serious results.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: inView ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="font-inter font-medium text-[20px] text-[#333] text-center mt-4"
      >
        No contracts. No hidden fees. Cancel anytime. Choose the plan  
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: inView ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="font-inter font-medium text-[20px] text-[#333] text-center"
      >
        that fits your fundraising stage.
      </motion.p>

      {/* Pricing Cards */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-[1200px] w-full">

        {/* STARTER CARD */}
        <motion.div
          whileHover={{ y: -20 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="box-border bg-gradient-to-b from-[#D3E3FF] to-[#F8FAFF] rounded-[32px] p-10 shadow-sm cursor-pointer"
        >
          <h3 className="font-poppins font-medium text-[48px] leading-[62px] tracking-[-0.04em] text-black mb-4">Starter</h3>
          <p className="font-poppins font-bold text-[24px] leading-[62px] tracking-[-0.04em] text-black mb-2.5">$49/mo</p>
          <p className="mt-3 font-inter font-medium text-[20px] leading-[150%] text-[#333333] mb-8">Perfect for pre-seed founders</p>

          <ul className="mt-6 space-y-4 font-poppins font-normal text-[18px] leading-[150%] text-black">
            <li className="flex items-center gap-2"> {tickMark} 100,000+ investor database</li>
            <li className="flex items-center gap-2">{tickMark}Advanced search & filters</li>
            <li className="flex items-center gap-2">{tickMark}AI-powered email generation</li>
            <li className="flex items-center gap-2">{tickMark}CRM pipeline & tracking</li>
            <li className="flex items-center gap-2">{tickMark}Up to 10 outreach emails / month</li>
          </ul>

          <Link
              href="#"
              className="flex flex-row justify-center items-center px-[17px] py-[17px] gap-[10px] bg-gradient-to-r from-[#0252D6] to-[#012B70] rounded-[900px] font-poppins font-medium text-base leading-[27px] text-white mt-14"
            >
              Start your free trial
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

        {/* PRO CARD — MOST POPULAR */}
        <motion.div
          whileHover={{ y: -20 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="relative rounded-[32px] bg-gradient-to-b from-[#FFFFFF] to-[#F8FAFF] box-border p-10 border border-[#F8FAFF] shadow-lg cursor-pointer overflow-hidden"
        >
          {/* Most Popular Ribbon */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] overflow-hidden pointer-events-none">
            <div 
              className="absolute w-[250px] h-[40px] bg-gradient-to-r from-[#0252D6] to-[#012B70] flex items-center justify-center shadow-lg"
              style={{ 
                transform: 'rotate(45deg)',
                transformOrigin: 'center',
                top: '30px',
                right: '-75px'
              }}
            >
              <span className="font-inter font-semibold text-[14px] leading-[20px] text-white tracking-widest uppercase">
                MOST POPULAR
              </span>
            </div>
          </div>

          <h3 className="font-poppins font-medium text-[48px] leading-[62px] tracking-[-0.04em] text-[#0252D6] mb-4">Pro</h3>
          <p className="font-poppins font-bold text-[24px] leading-[62px] tracking-[-0.04em] text-black mb-2.5">$89/mo</p>
          <p className="mt-3 font-inter font-medium text-[20px] leading-[150%] text-[#333333] mb-8">Best for active fundraisers</p>

          <ul className="mt-6 space-y-4 font-poppins font-normal text-[18px] leading-[150%] text-black">
            <li className="flex items-center gap-2 "> {tickMark} Everything in Starter</li>
            <li className="flex items-center gap-2"> {tickMark} Unlimited outreach emails</li>
            <li className="flex items-center gap-2"> {tickMark} Automated follow-up sequences</li>
            <li className="flex items-center gap-2"> {tickMark} Priority AI matching</li>
            <li className="flex items-center gap-2"> {tickMark} Advanced analytics + 5 team seats</li>
          </ul>

          <Link
            href="#"
            className="flex flex-row justify-center items-center px-[17px] py-[17px] gap-[10px] bg-gradient-to-r from-[#0252D6] to-[#012B70] rounded-[900px] font-poppins font-medium text-base leading-[27px] text-white mt-14"
          >
            Start your free trial
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

        {/* SCALE CARD */}
        <motion.div
          whileHover={{ y: -20 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="box-border bg-gradient-to-b from-[#D3E3FF] to-[#F8FAFF] rounded-[32px] p-10 shadow-sm cursor-pointer"
        >
          <h3 className="font-poppins font-medium text-[48px] leading-[62px] tracking-[-0.04em] text-black mb-4">Scale</h3>
          <p className="font-poppins font-bold text-[24px] leading-[62px] tracking-[-0.04em] text-black mb-2.5">$149/mo</p>
          <p className="mt-3 font-inter font-medium text-[20px] leading-[150%] text-[#333333] mb-8">For teams closing larger rounds</p>

          <ul className="mt-6 space-y-4 font-poppins font-normal text-[18px] leading-[150%] text-black">
            <li className="flex items-center gap-2"> {tickMark} Everything in Pro</li>
            <li className="flex items-center gap-2"> {tickMark} 15 team seats</li>
            <li className="flex items-center gap-2"> {tickMark} Custom investor imports</li>
            <li className="flex items-center gap-2"> {tickMark} White-glove onboarding</li>
            <li className="flex items-center gap-2"> {tickMark} API access</li>
            <li className="flex items-center gap-2"> {tickMark} Dedicated support</li>
          </ul>
          <Link
              href="#"
              className="flex flex-row justify-center items-center px-[17px] py-[17px] gap-[10px] bg-gradient-to-r from-[#0252D6] to-[#012B70] rounded-[900px] font-poppins font-medium text-base leading-[27px] text-white mt-14"
            >
              Start your free trial
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
      </div>

      {/* Bottom Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: inView ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="mt-12 text-center text-[#333] font-inter text-[18px]"
      >
        <span className="font-inter font-medium text-[20px] leading-[150%] text-center underline text-black">*All plans include a 3-day free trial</span>
      </motion.p>

    </section>
  );
}
