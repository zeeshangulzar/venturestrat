import React from 'react';

const investorStageIcon: React.FC<{ className?: string }> = ({ className = "mr-1" }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g clipPath="url(#clip0_295_1400)">
      <path d="M3.6556 2.5H16.3439C16.4759 2.5001 16.606 2.53154 16.7234 2.59174C16.8409 2.65194 16.9423 2.73917 17.0195 2.84625C17.0966 2.95333 17.1472 3.0772 17.1671 3.20767C17.187 3.33813 17.1756 3.47146 17.1339 3.59667L12.8798 16.36C12.7692 16.692 12.5569 16.9808 12.273 17.1854C11.9891 17.39 11.648 17.5001 11.2981 17.5H8.70143C8.35149 17.5001 8.0104 17.39 7.72651 17.1854C7.44263 16.9808 7.23035 16.692 7.11976 16.36L2.86643 3.59667C2.82475 3.47152 2.81337 3.33827 2.83323 3.20787C2.85309 3.07747 2.90362 2.95365 2.98066 2.84659C3.0577 2.73952 3.15906 2.65228 3.2764 2.59202C3.39373 2.53177 3.5237 2.50023 3.6556 2.5Z" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.1665 7.5H15.8332" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.8335 12.5H14.1668" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
      <clipPath id="clip0_295_1400">
      <rect width="20" height="20" fill="white"/>
      </clipPath>
      </defs>
    </svg>
  );
};

export default investorStageIcon;