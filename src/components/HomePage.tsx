// app/page.tsx

import Navbar from "./Navbar";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dots">
      <div className="sticky top-[28px] z-50 w-[80%] left-auto right-auto mx-auto"><Navbar /></div>
      

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-[85px] text-center">
        
        {/* White overlay behind text */}
        <div className="absolute top-0 left-1/2 h-[800px] w-[800px] -translate-x-1/2 bg-white blur-[125px] rounded-full"></div>

        {/* Actual content */}
        <div className="relative z-10">
          <h1 className="font-poppins font-medium text-[86px] leading-[106px] text-center tracking-[-0.07em] text-black">
            Find the right investors.<br />
            Close your round faster.
          </h1>

          <p className="mt-6 font-inter font-normal text-[20px] leading-[150%] text-center text-[#333333] mx-auto">Stop wasting months on cold outreach to investors who'll never respond.</p>
          <p className="font-inter font-normal text-[20px] leading-[150%] text-center text-[#333333] mx-auto">VentureStrat AI connects you with 120,000+ VCs and angels who actually fund </p>
          <p className="font-inter font-normal text-[20px] leading-[150%] text-center text-[#333333] mx-auto">companies like yours — then automates your fundraising journey.</p>

          <div className="mt-10">
            <Link href="/sign-up" className="flex flex-row justify-center items-center h-[58px] w-[210px] px-[23px] py-[17px] gap-[10px] mx-auto bg-[#0252D6] rounded-[12px] font-poppins font-medium text-[18px] leading-[27px] text-white shadow-lg">
              Start Free Trial
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 13L7 7L1 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <div className="flex items-center justify-center mt-4">
              {/* Avatars */}
              <div className="flex items-center">
                <img src="/avatar1.png" className="w-8 h-8 rounded-full border-2 -mr-2 bg-[#E1E4EA] border-black" />
                <img src="/avatar2.png" className="w-8 h-8 rounded-full border-2 bg-[#E1E4EA] border-black -mr-2" />
                <img src="/avatar3.png" className="w-8 h-8 rounded-full border-2 bg-[#E1E4EA] border-black" />
              </div>

              {/* Text */}
              <p className="ml-3 font-inter font-medium text-[14px] leading-[16px] tracking-[-0.01em] text-black">
                Trusted by 1100+ founders who’ve booked 3500+ investor meetings
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* PRODUCT PREVIEW IMAGE */}
      <section className="relative mx-auto px-6 pb-32">

        {/* LEFT VECTOR */}
        <img 
          src="/vector.png" 
          alt="" 
          className="absolute left-0 top-[155px] w-[460px] opacity-90"
        />

        {/* RIGHT VECTOR */}
        <img 
          src="/vector.png" 
          alt="" 
          className="absolute right-0 top-[155px] w-[460px] opacity-90"
        />

        {/* CRM FRAME */}
        <div className="relative z-10 mx-auto max-w-5xl rounded-[32px] bg-[#F3F4F6] p-4 shadow-xl border border-[#F3F4F6] mt-[155px]">

          <Image
            src="/desktop.png"
            alt="CRM Screenshot"
            width={2000}
            height={863}
            className="rounded-[24px] w-full"
          />

        </div>

      </section>

    </main>
  );
}
