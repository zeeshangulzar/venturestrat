import React from 'react';

const investorFocusIcon: React.FC<{ className?: string }> = ({ className = "mr-1" }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g clipPath="url(#clip0_295_1366)">
      <path d="M9.16675 9.99996C9.16675 10.221 9.25455 10.4329 9.41083 10.5892C9.56711 10.7455 9.77907 10.8333 10.0001 10.8333C10.2211 10.8333 10.4331 10.7455 10.5893 10.5892C10.7456 10.4329 10.8334 10.221 10.8334 9.99996C10.8334 9.77895 10.7456 9.56698 10.5893 9.4107C10.4331 9.25442 10.2211 9.16663 10.0001 9.16663C9.77907 9.16663 9.56711 9.25442 9.41083 9.4107C9.25455 9.56698 9.16675 9.77895 9.16675 9.99996Z" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.99992 5.83337C9.17583 5.83337 8.37025 6.07774 7.68504 6.53558C6.99984 6.99342 6.46579 7.64417 6.15042 8.40553C5.83506 9.16689 5.75254 10.0047 5.91332 10.8129C6.07409 11.6212 6.47092 12.3636 7.05364 12.9463C7.63636 13.529 8.37879 13.9259 9.18704 14.0866C9.9953 14.2474 10.8331 14.1649 11.5944 13.8495C12.3558 13.5342 13.0065 13.0001 13.4644 12.3149C13.9222 11.6297 14.1666 10.8241 14.1666 10" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.8332 2.54579C9.2883 2.37246 7.72767 2.68352 6.36724 3.43593C5.00681 4.18834 3.91381 5.34492 3.23944 6.74567C2.56507 8.14643 2.34265 9.72213 2.60296 11.2548C2.86326 12.7875 3.59342 14.2014 4.69244 15.301C5.79146 16.4006 7.20501 17.1314 8.73757 17.3925C10.2701 17.6536 11.8459 17.432 13.247 16.7583C14.6481 16.0846 15.8053 14.9922 16.5583 13.6322C17.3114 12.2721 17.6233 10.7117 17.4507 9.16662" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.5 5V7.5H15L17.5 5H15V2.5L12.5 5Z" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.5 7.5L10 10" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
      <clipPath id="clip0_295_1366">
      <rect width="20" height="20" fill="white"/>
      </clipPath>
      </defs>
    </svg>

  );
};

export default investorFocusIcon;