import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import VerifiedBadgeIcon from './icons/verifiedBadgeIcon';

const SOCIAL_ORDER = ['twitter', 'linkedin', 'facebook'] as const;

function SocialIcon({ type }: { type: (typeof SOCIAL_ORDER)[number] }) {
  const base = 'h-6 w-6';
  switch (type) {
    case 'twitter':
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${base} transition-transform hover:scale-110`}
          fill="#1DA1F2" // Official Twitter blue
        >
          <path d="M22 5.92a8.4 8.4 0 0 1-2.36.65 4.14 4.14 0 0 0 
            1.82-2.27 8.28 8.28 0 0 1-2.62 1 4.13 4.13 0 0 0-7.03 
            3.76 11.72 11.72 0 0 1-8.51-4.31 4.13 4.13 0 0 0 1.28 
            5.51 4.06 4.06 0 0 1-1.87-.52v.05a4.13 4.13 0 0 0 
            3.31 4.05c-.47.13-.97.2-1.49.07a4.13 4.13 0 0 0 
            3.86 2.87A8.29 8.29 0 0 1 2 18.58a11.72 11.72 0 0 0 
            6.34 1.86c7.61 0 11.77-6.3 11.77-11.77 0-.18 
            0-.35-.01-.53A8.42 8.42 0 0 0 22 5.92z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${base} transition-transform hover:scale-110`}
          fill="#0077B5" // Official LinkedIn blue
        >
          <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 
            9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 
            3.77-1.95 4.03 0 4.78 2.65 4.78 6.09V21h-4v-5.33c0-1.27-.02-2.9-1.77-2.9-1.77 
            0-2.04 1.38-2.04 2.8V21H9z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${base} transition-transform hover:scale-110`}
          fill="#1877F2" // Official Facebook blue
        >
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 
            1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 
            0-1.62.77-1.62 1.56V12h2.76l-.44 2.89h-2.32v6.99A10 
            10 0 0 0 22 12z" />
        </svg>
      );
  }
}

// Custom Verified Badge Component
function VerifiedBadge() {
  return (
    <VerifiedBadgeIcon/>
  );
}

type InvestorCardHeaderProps = {
  name: string;
  verified?: boolean;
  social_links?: Record<string, string>;
};

export default function InvestorHeader({ name, verified, social_links }: InvestorCardHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <h2
        className="
          truncate
          text-[var(--Dark,#1E293B)]
          text-[16px]
          font-semibold
          leading-[24px]
          tracking-[-0.32px]
          font-manrope
          "
      >
        {name}
      </h2>

      {verified && <VerifiedBadge />}

      {social_links && (
        <div className="ml-2 flex items-center gap-3">
          {SOCIAL_ORDER.map((platform) => {
            const href = social_links[platform];
            if (!href) return null;
            return (
              <a
                key={platform}
                href={href}
                target="_blank"
                rel="noreferrer"
                title={platform}
                aria-label={platform}
                className="transition-transform hover:scale-105 hover:opacity-80"
              >
                <SocialIcon type={platform} />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
