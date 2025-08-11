import React from 'react';

const RIcon: React.FC<{ className?: string }> = () => {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="34" height="34" rx="10" fill="url(#paint0_linear_295_1322)"/>
      <path d="M25.28 25H20.7517L18.515 20.82H14.2983V25H9.69667V9.6H18.2583C22.4933 9.6 24.8217 11.47 24.8217 15.3567C24.8217 17.465 23.85 18.9683 22.4567 19.8667L25.28 25ZM14.2983 13.4317V17.355H17.965C19.4317 17.355 20.22 16.6583 20.22 15.3933C20.22 14.1283 19.4317 13.4317 17.965 13.4317H14.2983Z" fill="url(#paint1_linear_295_1322)"/>
      <defs>
      <linearGradient id="paint0_linear_295_1322" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
      <stop stopColor="#2536EB"/>
      <stop offset="1" stopColor="#25CDEB"/>
      </linearGradient>
      <linearGradient id="paint1_linear_295_1322" x1="8.5" y1="7" x2="25" y2="26.5" gradientUnits="userSpaceOnUse">
      <stop stopColor="white" stopOpacity="0.8"/>
      <stop offset="1" stopColor="white"/>
      </linearGradient>
      </defs>
    </svg>
  );
};

export default RIcon;