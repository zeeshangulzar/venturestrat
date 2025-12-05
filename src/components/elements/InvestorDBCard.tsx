import { motion } from 'framer-motion';
import Link from 'next/link';
import InvestorCard from './InvestorCard';

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
          <div className="mt-24.25 ml-20.75 bg-[rgba(2,_82,_214,_0.1)] border-[1.5px] border-[#0252D6] backdrop-blur-[2px] rounded-[90px] w-[353px] h-[49px] flex items-center justify-center">
            <p className="font-poppins font-medium text-[24px] leading-[36px] text-center text-[#0252D6]">
              Largest Investor Datatabase
            </p>
          </div>
          <div className="flex flex-col items-start ml-20.75 mt-45 mr-22 gap-10">
            <p className="font-inter font-medium text-xl text-[#333333] leading-[150%] text-start">
              We've built the most comprehensive <br />investor database for early-stage <br />startups. VCs, angels, accelerators, <br />syndicates — all in one place.
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
        <div className="rounded-[20px] m-2.5">  
          <img src="/investor-db-card.png" alt="" />
          <div className='w-[fit-content] top-[-485px] relative left-[25px]'>
            <InvestorCard />
          </div>
          <div className='w-[fit-content] top-[-605px] relative left-[520px]'>
            <InvestorCard />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

