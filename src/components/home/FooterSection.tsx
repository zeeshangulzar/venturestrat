"use client";

import Image from "next/image";
import LogoIcon from "@components/icons/HomeLogoIcon";
import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="relative w-full bg-white">

      {/* BACKGROUND VECTOR (top-left blue shape) */}
      <Image
        src="/vector.png"
        alt="Decorative vector"
        width={368}
        height={398}
        className="absolute -top-52  pointer-events-none select-none z-11"
      />

      {/* HERO CALL-TO-ACTION ABOVE FOOTER */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="rounded-[28px] overflow-hidden">
          <div className="relative h-[340px] rounded-[28px] overflow-hidden">

            {/* Background Image */}
            <div className="relative w-[108%] h-[200%]">
              <Image
                src="/persons.png"
                alt="People working together"
                fill
                className="object-cover"
              />
            </div>


            {/* Black Overlay */}
            <div className="absolute inset-0 bg-black/60">
            <svg className="right-4 top-4 absolute" width="196" height="161" viewBox="0 0 196 161" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 5.13291V75.0492C0 77.8872 2.29486 80.1647 5.1153 80.1647H43.2351C46.0906 80.1647 48.403 77.8522 48.403 74.9967V5.11538C48.403 2.27738 46.1081 0 43.2876 0H5.13284C2.29488 0 0.0174819 2.29489 0.0174819 5.11538L0 5.13291Z" fill="white"/>
              <path d="M145.893 2.38249L98.0502 77.7997C97.1042 79.2887 95.475 80.1821 93.7231 80.1821H53.2559C50.418 80.1821 48.1406 82.4771 48.1406 85.2976V155.214C48.1406 158.052 50.4355 160.329 53.2559 160.329H93.7231C95.475 160.329 97.1042 159.436 98.0502 157.947L145.893 82.5297C146.839 81.0406 148.468 80.1472 150.22 80.1472H190.687C193.525 80.1472 195.802 77.8523 195.802 75.0318V5.11538C195.802 2.27738 193.507 0 190.687 0H150.22C148.468 0 146.839 0.893418 145.893 2.38249Z" fill="white"/>
            </svg>

            </div>

            {/* CTA CONTENT */}
            <div className="absolute inset-0 p-10 flex flex-col justify-center gap-6">
              <h2 className="font-poppins font-medium text-[48px] leading-[58px] tracking-[-0.05em] text-white max-w-[520px]">
                Ready to stop wasting time
                <br /> and start raising?
              </h2>

              <p className="font-inter font-normal text-[18px] leading-[150%] text-white max-w-[520px]">
                Join 1,100+ founders who are finding investors, booking meetings,
                and closing rounds faster with VentureStrat AI.
              </p>

              <div className="flex items-center gap-6 mt-4">
                <button className="px-6 py-3 bg-gradient-to-r from-[#0252D6] to-[#012B70] rounded-full text-white font-poppins flex items-center gap-2">
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
                </button>
                <span className="text-white font-inter font-normal text-[18px]">
                  Set up in 5 minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER CONTENT */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 mt-20 pb-20 
      grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12">

        {/* Column 1 — Logo + Description */}
        <div>
          <div className="font-bold text-xl flex items-center gap-2 mb-8">
            <LogoIcon />
          </div>

          <p className="font-inter font-normal text-[18px] leading-[150%] text-[#333333] max-w-[280px]">
            VentureStrat AI connects you with 120,000+ VCs and angels who actually fund
            companies like yours — then automates your fundraising journey.
          </p>

          <div className="flex items-center gap-3 mt-8">
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M9.89353 7.26557C10.2039 6.98353 10.4974 6.67304 10.8344 6.42058C11.3941 6.00117 12.0588 5.83919 12.7429 5.77581C13.6835 5.68865 14.6125 5.73818 15.4899 6.13636C16.4062 6.55208 16.9885 7.27595 17.3545 8.19396C17.6855 9.02404 17.8226 9.89605 17.8359 10.779C17.8686 12.9422 17.8694 15.1059 17.8783 17.2696C17.8803 17.7601 17.633 17.9982 17.1454 17.9988C16.3068 17.9998 15.4682 18.0004 14.6296 17.9985C14.1697 17.9975 13.9441 17.7705 13.9439 17.3079C13.943 15.451 13.9545 13.594 13.9363 11.7373C13.932 11.3012 13.8689 10.8565 13.7647 10.4326C13.5596 9.59948 12.9954 9.13408 12.1906 9.06356C11.3319 8.98828 10.6438 9.37932 10.2753 10.1472C10.0187 10.6816 9.89248 11.2435 9.893 11.8364C9.89466 13.6483 9.89383 15.4603 9.89346 17.2723C9.89338 17.7672 9.66313 17.9982 9.16822 17.9987C8.36704 17.9997 7.56594 17.9999 6.76476 17.9986C6.28747 17.9978 6.04366 17.7572 6.04351 17.2839C6.04276 13.7349 6.04284 10.1858 6.04344 6.63676C6.04352 6.15495 6.2752 5.92643 6.75896 5.9262C7.58257 5.92575 8.40618 5.9253 9.2298 5.92643C9.65605 5.92703 9.89082 6.16406 9.89323 6.59348C9.89466 6.82538 9.89353 7.05729 9.89353 7.26557Z" fill="black"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M4.40695 11.97C4.40703 13.7063 4.40741 15.4426 4.4068 17.1788C4.40665 17.761 4.17008 17.9989 3.5932 17.9992C2.82981 17.9998 2.06649 18.0006 1.3031 17.9989C0.802621 17.9978 0.55882 17.754 0.55882 17.2566C0.558518 13.7241 0.558518 10.1917 0.55882 6.6592C0.55882 6.16565 0.79404 5.92719 1.28081 5.92667C2.08162 5.92591 2.88242 5.92569 3.68323 5.92674C4.15472 5.92742 4.40537 6.18168 4.40605 6.67124C4.40823 8.43754 4.40688 10.2037 4.40695 11.97Z" fill="black"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M4.95224 2.48739C4.95096 3.84257 3.83847 4.97305 2.48239 4.96169C1.11578 4.95017 0.00809442 3.90022 4.04635e-05 2.47512C-0.00778768 1.1116 1.12127 0.00105453 2.4717 7.42495e-07C3.83576 -0.00105305 4.95345 1.11973 4.95224 2.48739Z" fill="black"/>
              </svg>

            </div>
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M9.89353 7.26557C10.2039 6.98353 10.4974 6.67304 10.8344 6.42058C11.3941 6.00117 12.0588 5.83919 12.7429 5.77581C13.6835 5.68865 14.6125 5.73818 15.4899 6.13636C16.4062 6.55208 16.9885 7.27595 17.3545 8.19396C17.6855 9.02404 17.8226 9.89605 17.8359 10.779C17.8686 12.9422 17.8694 15.1059 17.8783 17.2696C17.8803 17.7601 17.633 17.9982 17.1454 17.9988C16.3068 17.9998 15.4682 18.0004 14.6296 17.9985C14.1697 17.9975 13.9441 17.7705 13.9439 17.3079C13.943 15.451 13.9545 13.594 13.9363 11.7373C13.932 11.3012 13.8689 10.8565 13.7647 10.4326C13.5596 9.59948 12.9954 9.13408 12.1906 9.06356C11.3319 8.98828 10.6438 9.37932 10.2753 10.1472C10.0187 10.6816 9.89248 11.2435 9.893 11.8364C9.89466 13.6483 9.89383 15.4603 9.89346 17.2723C9.89338 17.7672 9.66313 17.9982 9.16822 17.9987C8.36704 17.9997 7.56594 17.9999 6.76476 17.9986C6.28747 17.9978 6.04366 17.7572 6.04351 17.2839C6.04276 13.7349 6.04284 10.1858 6.04344 6.63676C6.04352 6.15495 6.2752 5.92643 6.75896 5.9262C7.58257 5.92575 8.40618 5.9253 9.2298 5.92643C9.65605 5.92703 9.89082 6.16406 9.89323 6.59348C9.89466 6.82538 9.89353 7.05729 9.89353 7.26557Z" fill="black"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M4.40695 11.97C4.40703 13.7063 4.40741 15.4426 4.4068 17.1788C4.40665 17.761 4.17008 17.9989 3.5932 17.9992C2.82981 17.9998 2.06649 18.0006 1.3031 17.9989C0.802621 17.9978 0.55882 17.754 0.55882 17.2566C0.558518 13.7241 0.558518 10.1917 0.55882 6.6592C0.55882 6.16565 0.79404 5.92719 1.28081 5.92667C2.08162 5.92591 2.88242 5.92569 3.68323 5.92674C4.15472 5.92742 4.40537 6.18168 4.40605 6.67124C4.40823 8.43754 4.40688 10.2037 4.40695 11.97Z" fill="black"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M4.95224 2.48739C4.95096 3.84257 3.83847 4.97305 2.48239 4.96169C1.11578 4.95017 0.00809442 3.90022 4.04635e-05 2.47512C-0.00778768 1.1116 1.12127 0.00105453 2.4717 7.42495e-07C3.83576 -0.00105305 4.95345 1.11973 4.95224 2.48739Z" fill="black"/>
              </svg>
            </div>
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.709 16.4996L13.6197 10.9996M8.3816 10.9996L2.29235 16.4996M1.83398 6.41626L9.31849 11.6554C9.92457 12.0797 10.2276 12.2918 10.5572 12.374C10.8484 12.4465 11.1529 12.4465 11.4441 12.374C11.7737 12.2918 12.0767 12.0797 12.6828 11.6554L20.1673 6.41626M6.23398 18.3329H15.7673C17.3075 18.3329 18.0775 18.3329 18.6658 18.0332C19.1832 17.7695 19.6039 17.3488 19.8676 16.8314C20.1673 16.2431 20.1673 15.4731 20.1673 13.9329V8.06626C20.1673 6.52612 20.1673 5.75604 19.8676 5.16779C19.6039 4.65034 19.1832 4.22964 18.6658 3.96599C18.0775 3.66626 17.3075 3.66626 15.7673 3.66626H6.23398C4.69384 3.66626 3.92377 3.66626 3.33551 3.96599C2.81806 4.22964 2.39737 4.65034 2.13372 5.16779C1.83398 5.75604 1.83398 6.52612 1.83398 8.06626V13.9329C1.83398 15.4731 1.83398 16.2431 2.13372 16.8314C2.39737 17.3488 2.81806 17.7695 3.33551 18.0332C3.92377 18.3329 4.69384 18.3329 6.23398 18.3329Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.1709 0C17.3185 0.000251138 19.8913 2.50753 19.9971 5.62988L20 5.8291V14.1709C19.9997 17.3185 17.4925 19.8913 14.3701 19.9971L14.1709 20H5.8291C2.68147 19.9998 0.108746 17.4925 0.00292969 14.3701L0 14.1709V5.8291C0.000250674 2.68147 2.50753 0.108746 5.62988 0.00292969L5.8291 0H14.1709ZM5.83008 1.39355C3.44549 1.39355 1.49356 3.28601 1.39746 5.64746L1.39355 5.8291V14.1699C1.39355 16.5545 3.28601 18.5064 5.64746 18.6025L5.83008 18.6064H14.1709C16.5553 18.6063 18.5064 16.7139 18.6025 14.3525L18.6064 14.1699V5.8291C18.6062 3.3837 16.6163 1.39375 14.1709 1.39355H5.83008ZM10 5.13281C12.6841 5.13298 14.8672 7.31589 14.8672 10C14.8672 12.6216 12.7845 14.7648 10.1865 14.8633L10 14.8672L9.81348 14.8633C7.21539 14.765 5.13282 12.6218 5.13281 10C5.13282 7.31579 7.31578 5.13281 10 5.13281ZM9.82715 6.53027C7.99209 6.6208 6.52637 8.14292 6.52637 10C6.52638 11.9151 8.08494 13.4736 10 13.4736C11.915 13.4735 13.4736 11.915 13.4736 10C13.4736 8.14302 12.0078 6.62095 10.1729 6.53027L10 6.52637L9.82715 6.53027ZM14.9189 3.58398C15.5087 3.58398 15.9883 4.06358 15.9883 4.65332C15.9883 5.24305 15.5087 5.72266 14.9189 5.72266C14.3293 5.72255 13.8496 5.24299 13.8496 4.65332C13.8496 4.06364 14.3293 3.58409 14.9189 3.58398Z" fill="black"/>
              </svg>
            </div>
          </div>

          <p className="font-inter font-normal text-[18px] leading-[150%] text-[#333333] mt-6">
            © 2025 Venturestrat | All rights reserved.
          </p>
        </div>

        {/* Column 2 – Company */}
        <div>
          <h4 className="font-poppins font-medium text-[18px] mb-4">Company</h4>
          <ul className="space-y-3 font-poppins font-medium text-[16px] leading-[24px] text-black opacity-65">
            <li><Link href="/">Home</Link></li>
            <li>About us</li>
            <li>Contact us</li>
            <li><Link href="/sign-in">Sign In</Link></li>
            <li>Blog</li>
          </ul>
        </div>

        {/* Column 3 – Product */}
        <div>
          <h4 className="font-poppins font-medium text-[18px] mb-4">Product</h4>
          <ul className="space-y-3 font-poppins font-medium text-[16px] leading-[24px] text-black opacity-65">
            <li><Link href="#how-it-works">How it works</Link></li>
            <li><Link href="#pricing">Pricing</Link></li>
            <li>Free resources</li>
            <li><Link href="#why-venturestrat">Investor database</Link></li>
            <li>Book a demo</li>
          </ul>
        </div>

        {/* Column 4 – Resources */}
        <div>
          <h4 className="font-poppins font-medium text-[18px] mb-4">Resources</h4>
          <ul className="space-y-3 font-poppins font-medium text-[16px] leading-[24px] text-black opacity-65">
            <li><Link href="#resources">Resources</Link></li>
            <li>Documentations</li>
            <li>Legal</li>
            <li><Link href="/privacy-policy">Privacy policy</Link></li>
          </ul>
        </div>

      </div>


    </footer>
  );
}
