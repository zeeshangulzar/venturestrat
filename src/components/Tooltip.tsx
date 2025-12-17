'use client';

import React, { useState, useRef } from 'react';
import { useSubscription } from '@contexts/SubscriptionContext';

// Shared mask logic
const createPartialMask = (text: string): string => {
  if (!text || text.length <= 3) return '******';

  if (text.includes('@')) {
    const [localPart, domain] = text.split('@');
    const visibleStart = Math.min(4, localPart.length - 3);
    return `${localPart.substring(0, visibleStart)}******@${domain}`;
  }

  if (/^[\d\s\-\+\(\)]+$/.test(text)) {
    const digits = text.replace(/\D/g, '');
    const visibleStart = Math.min(3, digits.length - 3);
    return `${digits.substring(0, visibleStart)}******`;
  }

  const visibleStart = Math.min(3, text.length - 3);
  return `${text.substring(0, visibleStart)}******`;
};

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  shouldMask?: boolean;  // << NEW PROP
}

export default function Tooltip({ 
  content, 
  children, 
  className = '',
  shouldMask = false   // default = no masking
}: TooltipProps) {
  
  const { subscriptionInfo } = useSubscription();

  const isPaid = 
    subscriptionInfo?.plan === 'STARTER' ||
    subscriptionInfo?.plan === 'PRO' ||
    subscriptionInfo?.plan === 'SCALE';

  // Decide what to show
  const tooltipContent =
    shouldMask && !isPaid
      ? createPartialMask(content)
      : content;

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 40,
        left: rect.left + rect.width / 2
      });
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] bg-gray-900 text-white text-sm px-2 py-1 rounded shadow-lg pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {tooltipContent}

          <div className="absolute top-full left-1/2 transform -translate-x-1/2 
            w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </>
  );
}
