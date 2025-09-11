'use client';

import { useState, useRef, useEffect } from 'react';

interface InvestorStatusDropdownProps {
  buttonText?: string;
  buttonColor?: string;
}

const statusOptions = [
  { value: 'target', label: 'Target' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'no-response', label: 'No Response' },
  { value: 'not-interested', label: 'Not Interested' },
  { value: 'interested', label: 'Interested' },
];

export default function InvestorStatusDropdown({ 
  buttonText = 'Contacted', 
  buttonColor = 'bg-[rgba(218,156,22,0.14)] text-[#C58A09]' 
}: InvestorStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = () => {
    // Just close the dropdown, do nothing else
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Status Button and Dropdown Icon */}
      <div className="flex items-center">
        {/* Static Status Button - Not clickable */}
        <div 
          className={`px-4 py-2 rounded-[40px] font-medium text-[14px] not-italic text-sm leading-6 whitespace-nowrap ${buttonColor}`}
        >
          {buttonText}
        </div>
        
        {/* Dropdown SVG - Only this is clickable */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-100 rounded transition-colors ml-2"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <g clipPath="url(#clip0_1403_3264)">
              <path d="M2 5L6.58579 9.58579C7.36683 10.3668 8.63316 10.3668 9.41421 9.58579L14 5" fill="#787F89"/>
            </g>
            <defs>
              <clipPath id="clip0_1403_3264">
                <rect width="16" height="16" fill="white" transform="matrix(1 0 0 -1 0 16)"/>
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={handleOptionClick}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-gray-700"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
