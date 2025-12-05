import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from "react";

export default function AiMatchingCard({inView}: {inView: boolean})  {
  return (
    <motion.div
      className="mb-18 w-[1440px]"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 50 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="bg-gradient-to-b from-[#D3E3FF] to-[#F8FAFF] rounded-[32px] h-[700px] flex justify-between">
        <div className="">
          <div className="mt-24.25 ml-20.75 bg-[rgba(2,_82,_214,_0.1)] border-[1.5px] border-[#0252D6] backdrop-blur-[2px] rounded-[90px] w-[254px] h-[49px] flex items-center justify-center">
            <p className="font-poppins font-medium text-[24px] leading-[36px] text-center text-[#0252D6]">
              Smarter AI matching
            </p>
          </div>
          <div className="flex flex-col items-start ml-20.75 mt-45 mr-22 gap-10">
            <p className="font-inter font-medium text-xl text-[#333333] leading-[150%] text-start">
              Our model is trained by ex-VCs and <br /> fundraising experts
            </p>
            <p className="font-inter font-medium text-xl text-[#333333] leading-[150%] text-start">
              We don't just match keywords — <br />we understand investor behavior, portfolio <br /> fit, and deal patterns.
            </p>
            <Link
              href="/sign-up"
              className="flex flex-row justify-center items-center h-[58px] w-[254px] px-[23px] py-[17px] gap-[10px] bg-gradient-to-r from-[#0252D6] to-[#012B70] rounded-[900px] font-poppins font-medium text-base leading-[27px] text-white"
            >
              Learn More
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
          </div>
        </div>
        <div className="bg-black rounded-[20px] m-2.5">
          <div className="">
            <img src="/group.png" alt="" />
          </div>
          <div className=" flex flex-col items-start ml-15 mt-25">
            <p className="font-poppins font-semibold text-2xl leading-[140%] tracking-[-0.01em] text-white"> You get investors who are </p>
            <p className="font-poppins font-semibold text-2xl leading-[140%] tracking-[-0.01em] text-white">actually likely to say yes.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

