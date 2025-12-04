import React from 'react';

const SynergyIcon: React.FC<{ className?: string }> = ({ className = "mr-1" }) => {
  return (
    <svg width="20" height="32" viewBox="0 0 20 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_2041_82)">
      <path d="M0 26.283V32.0004L19.5663 23.2555V17.5381L0 26.283Z" fill="white"/>
      <path d="M0 5.7174V0L19.5663 8.74492V14.4623L0 5.7174Z" fill="white"/>
      <path d="M0 14.4654V8.74805L19.5663 17.493V23.2132L0 14.4654Z" fill="white"/>
      </g>
      <defs>
      <clipPath id="clip0_2041_82">
      <rect width="19.5663" height="32" fill="white"/>
      </clipPath>
      </defs>
    </svg>
  );
};

export default SynergyIcon;