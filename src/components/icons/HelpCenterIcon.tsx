import React from 'react';

const HelpCenterIcon: React.FC<{ className?: string }> = ({ className = "mr-2" }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g clipPath="url(#clip0_295_1155)">
        <path d="M14.1667 15.3584H10.8334L7.12507 17.825C6.57507 18.1917 5.83341 17.8001 5.83341 17.1334V15.3584C3.33341 15.3584 1.66675 13.6917 1.66675 11.1917V6.19169C1.66675 3.69169 3.33341 2.02502 5.83341 2.02502H14.1667C16.6667 2.02502 18.3334 3.69169 18.3334 6.19169V11.1917C18.3334 13.6917 16.6667 15.3584 14.1667 15.3584Z" stroke="#525A68" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 9.46667V9.29171C10 8.72504 10.35 8.42503 10.7 8.18336C11.0417 7.95003 11.3833 7.65004 11.3833 7.10004C11.3833 6.33337 10.7667 5.71667 10 5.71667C9.23334 5.71667 8.6167 6.33337 8.6167 7.10004" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.99617 11.4584H10.0037" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_295_1155">
          <rect width="20" height="20" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
};

export default HelpCenterIcon;
