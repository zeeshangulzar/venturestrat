import React from 'react';

const LogoutIcon: React.FC<{ className?: string }> = ({ className = "mr-2" }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M7.41675 6.30001C7.67508 3.30001 9.21675 2.07501 12.5917 2.07501H12.7001C16.4251 2.07501 17.9167 3.56668 17.9167 7.29168V12.725C17.9167 16.45 16.4251 17.9417 12.7001 17.9417H12.5917C9.24175 17.9417 7.70008 16.7333 7.42508 13.7833" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.4999 10H3.0166" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.87492 7.20831L2.08325 9.99998L4.87492 12.7916" stroke="#525A68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default LogoutIcon;
