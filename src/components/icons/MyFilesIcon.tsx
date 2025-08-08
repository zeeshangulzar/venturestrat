import React from 'react';

const MyFilesIcon: React.FC<{ className?: string }> = ({ className = "mr-2" }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M18.3334 9.16669V14.1667C18.3334 17.5 17.5001 18.3334 14.1667 18.3334H5.83341C2.50008 18.3334 1.66675 17.5 1.66675 14.1667V5.83335C1.66675 2.50002 2.50008 1.66669 5.83341 1.66669H7.08341C8.33341 1.66669 8.60841 2.03335 9.08341 2.66669L10.3334 4.33335C10.6501 4.75002 10.8334 5.00002 11.6667 5.00002H14.1667C17.5001 5.00002 18.3334 5.83335 18.3334 9.16669Z" stroke="#525A68" strokeWidth="1.5" strokeMiterlimit="10"/>
      <path d="M6.66675 1.66669H14.1667C15.8334 1.66669 16.6667 2.50002 16.6667 4.16669V5.31669" stroke="#525A68" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default MyFilesIcon;
