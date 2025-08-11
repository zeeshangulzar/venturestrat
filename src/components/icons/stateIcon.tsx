import React from 'react';

const stateIcon: React.FC<{ className?: string }> = ({ className = "mr-1" }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M18.3332 7.49997V12.5C18.3332 14.5833 17.9165 16.0416 16.9832 16.9833L11.6665 11.6666L18.1082 5.22498C18.2582 5.88331 18.3332 6.63331 18.3332 7.49997Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.1082 5.22496L5.22483 18.1083C2.71649 17.5333 1.6665 15.8 1.6665 12.5V7.49996C1.6665 3.33329 3.33317 1.66663 7.49984 1.66663H12.4998C15.7998 1.66663 17.5332 2.71663 18.1082 5.22496Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.9834 16.9833C16.0418 17.9166 14.5834 18.3333 12.5001 18.3333H7.50011C6.63344 18.3333 5.88343 18.2583 5.2251 18.1083L11.6668 11.6666L16.9834 16.9833Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.20022 6.64998C5.76689 4.20831 9.43356 4.20831 10.0002 6.64998C10.3252 8.08331 9.42521 9.29998 8.63355 10.05C8.05855 10.6 7.15023 10.6 6.5669 10.05C5.77523 9.29998 4.86689 8.08331 5.20022 6.64998Z" stroke="#292D32" strokeWidth="1.5"/>
      <path d="M7.57908 7.25004H7.58657" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>

  );
};

export default stateIcon;