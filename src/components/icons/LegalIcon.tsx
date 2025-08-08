import React from 'react';

const LegalIcon: React.FC<{ className?: string }> = ({ className = "mr-2" }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g clipPath="url(#clip0_295_1224)">
        <path d="M10.8333 8.33337L16.9858 14.515C17.6716 15.1984 17.6716 16.305 16.9858 16.9875C16.6563 17.3153 16.2105 17.4992 15.7458 17.4992C15.281 17.4992 14.8352 17.3153 14.5058 16.9875L8.33325 10.8334" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 7.5L8.33333 10.8333" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.8333 8.33333L7.5 5" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.5 17.5H8.33333" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.66079 13.1608L2.67246 10.1725C2.51623 10.0162 2.42847 9.80426 2.42847 9.58329C2.42847 9.36232 2.51623 9.1504 2.67246 8.99412L4.58329 7.08329L4.99996 7.49996L7.49996 4.99996L7.08329 4.58329L8.99412 2.67246C9.1504 2.51623 9.36232 2.42847 9.58329 2.42847C9.80426 2.42847 10.0162 2.51623 10.1725 2.67246L13.1608 5.66079C13.317 5.81706 13.4048 6.02899 13.4048 6.24996C13.4048 6.47093 13.317 6.68285 13.1608 6.83912L11.25 8.74996L10.8333 8.33329L8.33329 10.8333L8.74996 11.25L6.83912 13.1608C6.68285 13.317 6.47093 13.4048 6.24996 13.4048C6.02899 13.4048 5.81706 13.317 5.66079 13.1608Z" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_295_1224">
          <rect width="20" height="20" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
};

export default LegalIcon;
