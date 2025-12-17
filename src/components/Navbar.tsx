"use client";

import Link from "next/link";
import LogoIcon from "@components/icons/HomeLogoIcon";

export default function Navbar() {
  return (
    <div className="">
      <header className="w-full h-[65px] flex items-center bg-white/45 border-2 border-white shadow-[0px_1px_0px_rgba(255,255,255,0.25)] backdrop-blur-[12.5px] rounded-[12px]">
  <div className="max-w-7xl mx-auto flex items-center justify-between w-full px-6">
    
    {/* Logo */}
    <div className="font-bold text-xl flex items-center gap-2">
      <LogoIcon />
    </div>

    {/* Menu */}
    <nav className="hidden md:flex items-center gap-8 font-poppins font-medium text-[16px] leading-[24px] text-black">
      <Link href="#question-answer">Problem & Solution</Link>
      <Link href="#how-it-works">How it works</Link>
      <Link href="#why-venturestrat">Why Venturestrat</Link>
      <Link href="#resources">Resources</Link>

      <span className="w-[12px] h-1 opacity-15 border-2 border-[#06060B] rotate-90"></span>

      <Link href="/sign-in">Sign In</Link>

      <Link
        href="/book-demo"
        className="flex items-center gap-2 font-poppins font-medium text-[16px] leading-[24px] text-black"
      >
        Book demo
        <span className="flex justify-center items-center w-[34px] h-[34px] bg-[#0252D6] rounded-[6px]">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5.25 12.75L12.75 5.25M12.75 5.25H5.25M12.75 5.25V12.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </Link>
    </nav>
  </div>
</header>

    </div>
  );
}
