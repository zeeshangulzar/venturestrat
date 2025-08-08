import React from 'react';

const TaskManagerIcon: React.FC<{ className?: string }> = ({ className = "mr-2" }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g clipPath="url(#clip0_295_1212)">
        <path d="M10.8333 4.16663H17.4999" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.8333 7.5H14.9999" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.8333 12.5H17.4999" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.8333 15.8334H14.9999" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.5 4.16671C2.5 3.94569 2.5878 3.73373 2.74408 3.57745C2.90036 3.42117 3.11232 3.33337 3.33333 3.33337H6.66667C6.88768 3.33337 7.09964 3.42117 7.25592 3.57745C7.4122 3.73373 7.5 3.94569 7.5 4.16671V7.50004C7.5 7.72105 7.4122 7.93302 7.25592 8.0893C7.09964 8.24558 6.88768 8.33337 6.66667 8.33337H3.33333C3.11232 8.33337 2.90036 8.24558 2.74408 8.0893C2.5878 7.93302 2.5 7.72105 2.5 7.50004V4.16671Z" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.5 12.5C2.5 12.2789 2.5878 12.067 2.74408 11.9107C2.90036 11.7544 3.11232 11.6666 3.33333 11.6666H6.66667C6.88768 11.6666 7.09964 11.7544 7.25592 11.9107C7.4122 12.067 7.5 12.2789 7.5 12.5V15.8333C7.5 16.0543 7.4122 16.2663 7.25592 16.4225C7.09964 16.5788 6.88768 16.6666 6.66667 16.6666H3.33333C3.11232 16.6666 2.90036 16.5788 2.74408 16.4225C2.5878 16.2663 2.5 16.0543 2.5 15.8333V12.5Z" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_295_1212">
          <rect width="20" height="20" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
};

export default TaskManagerIcon;
