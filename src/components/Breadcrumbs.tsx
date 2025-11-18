'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Home
    breadcrumbs.push({ label: 'Home', href: '/' });

    // Handle fundraising routes
    if (segments[0] === 'fundraising') {
      // Make Fundraising non-clickable since it's a dropdown
      breadcrumbs.push({ label: 'Fundraising' });
      
      if (segments[1] === 'crm') {
        breadcrumbs.push({ label: 'Fundraising CRM' });
      } else if (segments[1] === 'investors') {
        breadcrumbs.push({ label: 'Investors' });
      }
    }
    // Handle other routes
    else if (segments[0] === 'investors') {
      breadcrumbs.push({ label: 'Investors' });
    }
    else if (segments[0] === 'admin') {
      breadcrumbs.push({ label: 'Admin' });
      if (segments[1] === 'users') {
        breadcrumbs.push({ label: 'Users' });
      } else if (segments[1] === 'investors') {
        breadcrumbs.push({ label: 'Investors' });
      }
    }
    else if (segments[0] === 'settings') {
      breadcrumbs.push({ label: 'Settings' });
    }
    else if (segments[0] === 'subscription') {
      breadcrumbs.push({ label: 'Subscription' });
    }
    else if (segments[0] === 'onboarding') {
      breadcrumbs.push({ label: 'Onboarding' });
    }
    // Default case - just show the current page
    else if (segments.length > 0) {
      breadcrumbs.push({ label: segments[0].charAt(0).toUpperCase() + segments[0].slice(1) });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <svg 
              className="w-4 h-4 text-gray-400 mx-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href ? (
            <Link 
              href={item.href}
              className="not-italic font-normal text-[14px] leading-[19px] tracking-[-0.02em] text-[#787F89]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="not-italic font-medium text-[14px] leading-[19px] tracking-[-0.02em] text-[#525A68]">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
