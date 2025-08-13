import React from 'react';

const HomeIcon: React.FC<{ className?: string }> = ({ className = "mr-2" }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className={className}  fill="currentColor">
      
      <g clipPath="url(#clip0_295_1206)">
        <path d="M17.3584 6.67498L11.9 2.30831C10.8334 1.45831 9.16672 1.44997 8.10838 2.29997L2.65005 6.67498C1.86672 7.29998 1.39172 8.54997 1.55838 9.53331L2.60838 15.8166C2.85005 17.225 4.15838 18.3333 5.58338 18.3333H14.4167C15.825 18.3333 17.1584 17.2 17.4 15.8083L18.45 9.52497C18.6 8.54997 18.125 7.29998 17.3584 6.67498ZM10.625 15C10.625 15.3416 10.3417 15.625 10 15.625C9.65838 15.625 9.37505 15.3416 9.37505 15V12.5C9.37505 12.1583 9.65838 11.875 10 11.875C10.3417 11.875 10.625 12.1583 10.625 12.5V15Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip0_295_1206">
          <rect width="20" height="20" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
};

export default HomeIcon;
