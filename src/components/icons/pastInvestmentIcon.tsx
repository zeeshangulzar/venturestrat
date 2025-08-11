import React from 'react';

const pastInvestmentIcon: React.FC<{ className?: string }> = ({ className = "mr-1" }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M18.3335 4.99996V7.01662C18.3335 8.33329 17.5002 9.16663 16.1835 9.16663H13.3335V3.34162C13.3335 2.41662 14.0918 1.66663 15.0168 1.66663C15.9252 1.67496 16.7585 2.04162 17.3585 2.64162C17.9585 3.24996 18.3335 4.08329 18.3335 4.99996Z" stroke="#1E293B" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.6665 5.83329V17.5C1.6665 18.1916 2.44984 18.5833 2.99984 18.1666L4.42484 17.1C4.75817 16.85 5.22484 16.8833 5.52484 17.1833L6.90817 18.575C7.23317 18.9 7.7665 18.9 8.0915 18.575L9.4915 17.175C9.78317 16.8833 10.2498 16.85 10.5748 17.1L11.9998 18.1666C12.5498 18.575 13.3332 18.1833 13.3332 17.5V3.33329C13.3332 2.41663 14.0832 1.66663 14.9998 1.66663H5.83317H4.99984C2.49984 1.66663 1.6665 3.15829 1.6665 4.99996V5.83329Z" stroke="#1E293B" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.5 10.8417H10" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.5 7.5083H10" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.99609 10.8334H5.00358" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.99609 7.5H5.00358" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default pastInvestmentIcon;