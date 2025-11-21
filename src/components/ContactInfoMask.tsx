'use client';

import React from 'react';
import { useSubscription } from '@contexts/SubscriptionContext';

interface ContactInfoMaskProps {
  children: React.ReactNode;
  maskedText?: string;
  redirectToSubscription?: boolean;
}

// Function to create partial mask
const createPartialMask = (text: string): string => {
  if (!text || text.length <= 3) {
    return '******';
  }
  
  // For email addresses
  if (text.includes('@')) {
    const [localPart, domain] = text.split('@');
    if (localPart.length <= 3) {
      return `${localPart.substring(0, 1)}******@${domain}`;
    }
    const visibleStart = Math.min(4, localPart.length - 3);
    return `${localPart.substring(0, visibleStart)}******@${domain}`;
  }
  
  // For phone numbers
  if (/^[\d\s\-\+\(\)]+$/.test(text)) {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 3) {
      return '******';
    }
    const visibleStart = Math.min(3, digits.length - 3);
    return `${digits.substring(0, visibleStart)}******`;
  }
  
  // For other text
  const visibleStart = Math.min(3, text.length - 3);
  return `${text.substring(0, visibleStart)}******`;
};

export default function ContactInfoMask({ 
  children, 
  maskedText,
}: ContactInfoMaskProps) {
  const { subscriptionInfo } = useSubscription();

  // Debug: Check what plan we're getting
  console.log('ContactInfoMask - plan:', subscriptionInfo?.plan, 'subscriptionInfo:', subscriptionInfo);

  // Show full content for paid plans
  if (subscriptionInfo?.plan === 'STARTER' || subscriptionInfo?.plan === 'PRO' || subscriptionInfo?.plan === 'SCALE') {
    console.log('ContactInfoMask - showing full content for paid plan');
    return <>{children}</>;
  }

  const maskedContent = maskedText || createPartialMask(children?.toString() || '');

  return (
    <span 
      className="cursor-pointer"
      title="Upgrade to Pro to see full contact information"
    >
      {maskedContent}
    </span>
  );
}
