'use client';

import React from 'react';
import { useSubscription } from '@contexts/SubscriptionContext';

interface SocialLinkMaskProps {
  url: string;
  children: React.ReactNode; // the icon
  title?: string;
  platform?: string;
}

export default function SocialLinkMask({
  url,
  children,
  title,
  platform,
}: SocialLinkMaskProps) {
  const { subscriptionInfo } = useSubscription();

  const isPaid =
    subscriptionInfo?.plan === 'STARTER' ||
    subscriptionInfo?.plan === 'PRO' ||
    subscriptionInfo?.plan === 'SCALE';

  if (isPaid) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        title={title || platform}
        aria-label={platform}
        className="transition-transform hover:scale-105 hover:opacity-80"
      >
        {children}
      </a>
    );
  }

  return (
    <span
      title="Upgrade to unlock social links"
      aria-label={platform}
      className="transition-transform opacity-50 cursor-not-allowed"
      onClick={(e) => e.preventDefault()}
    >
      {children}
    </span>
  );
}
