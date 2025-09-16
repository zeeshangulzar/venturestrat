'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updateInvestorStatus } from '@lib/api';

interface InvestorStatusDropdownProps {
  buttonText?: string;
  buttonColor?: string;
  status?: string;
  shortlistId?: string;
  onStatusChange?: (newStatus: string) => void;
}

const statusOptions = [
  { value: 'TARGET', label: 'Target' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'NO_RESPONSE', label: 'No Response' },
  { value: 'NOT_INTERESTED', label: 'Not Interested' },
  { value: 'INTERESTED', label: 'Interested' },
];

// Function to get color based on status
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'TARGET':
      return 'bg-[rgba(218,156,22,0.14)] text-[#C58A09]';
    case 'CONTACTED':
      return 'bg-[rgba(34,197,94,0.14)] text-[#16A34A]';
    case 'NO_RESPONSE':
      return 'bg-[rgba(239,68,68,0.14)] text-[#DC2626]';
    case 'NOT_INTERESTED':
      return 'bg-[rgba(107,114,128,0.14)] text-[#6B7280]';
    case 'INTERESTED':
      return 'bg-[rgba(59,130,246,0.14)] text-[#2563EB]';
    default:
      return 'bg-[rgba(218,156,22,0.14)] text-[#C58A09]';
  }
};

export default function InvestorStatusDropdown({ 
  buttonText,
  buttonColor,
  status = 'TARGET',
  shortlistId,
  onStatusChange
}: InvestorStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const lastUpdateRef = useRef<number>(0);

  // Get current status display info
  const currentStatus = statusOptions.find(option => option.value === status) || statusOptions[0];
  const displayText = buttonText || currentStatus.label;
  const displayColor = buttonColor || getStatusColor(status);

  // Calculate position before opening dropdown
  const calculatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // w-48 = 12rem = 192px
      const dropdownHeight = 200; // Approximate height
      
      let left = rect.left;
      let top = rect.bottom + 8;
      
      // Check if dropdown would go off the right edge
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 16; // 16px margin
      }
      
      // Check if dropdown would go off the left edge
      if (left < 16) {
        left = 16;
      }
      
      // Check if dropdown would go off the bottom edge
      if (top + dropdownHeight > window.innerHeight) {
        top = rect.top - dropdownHeight - 8; // Position above the button
      }
      
      return { top, left };
    }
    return { top: 0, left: 0 };
  };

  // Update dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        const position = calculatePosition();
        setDropdownPosition(position);
        setIsPositioned(true);
      };
      
      // Calculate position immediately
      updatePosition();
      
      // Update position on scroll and resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else {
      setIsPositioned(false);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = async (newStatus: string) => {
    if (newStatus === status || !shortlistId) {
      setIsOpen(false);
      return;
    }

    // Rate limiting: prevent multiple calls within 1 second
    const now = Date.now();
    if (now - lastUpdateRef.current < 1000) {
      console.log('Rate limit: Please wait before making another update');
      setIsRateLimited(true);
      setTimeout(() => setIsRateLimited(false), 1000);
      setIsOpen(false);
      return;
    }

    lastUpdateRef.current = now;
    setIsUpdating(true);
    
    try {
      await updateInvestorStatus(shortlistId, newStatus);
      onStatusChange?.(newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update investor status:', error);
      // Reset the rate limit on error so user can retry
      lastUpdateRef.current = 0;
      // You might want to show a toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative" ref={buttonRef}>
      {/* Status Button and Dropdown Icon */}
      <div className="flex items-center">
        {/* Static Status Button - Not clickable */}
        <div 
          className={`px-4 py-2 rounded-[40px] font-medium text-[14px] not-italic text-sm leading-6 whitespace-nowrap ${displayColor} ${isUpdating ? 'opacity-50' : ''} ${isRateLimited ? 'opacity-50' : ''}`}
        >
          {isUpdating ? 'Updating...' : isRateLimited ? 'Please wait...' : displayText}
        </div>
        
        {/* Dropdown SVG - Only this is clickable */}
        <button 
          onClick={() => {
            if (!isOpen && !isUpdating) {
              // Calculate position before opening
              const position = calculatePosition();
              setDropdownPosition(position);
              setIsPositioned(true);
            }
            setIsOpen(!isOpen);
          }}
          disabled={isUpdating || isRateLimited}
          className="p-1 hover:bg-gray-100 rounded transition-colors ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Dropdown Menu - Rendered as Portal */}
      {isOpen && isPositioned && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <div className="py-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  option.value === status ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
                disabled={isUpdating}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
