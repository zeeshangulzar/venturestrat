'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@lib/api';
import InvestorHeader from '@components/InvestorCardHeader';
import MapPinIcon from './icons/mapPinIcon';
import Image from "next/image";
import InitialsAvatar from '@components/InitialsAvatar';
import ContactInfoMask from './ContactInfoMask';
import SubscriptionLimitModal from './SubscriptionLimitModal';

import {
  PhoneIcon,
  GlobeAltIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import EmailIcon from './icons/emailIcon';

type Investor = {
  id: string;
  name: string;
  avatar?: string;
  website?: string;
  phone?: string;
  title?: string;
  social_links?: { [key: string]: string };
  city: string;
  state: string;
  country: string;
  companyName?:  string;
  emails: Array<{ id: string; email: string; status: string }>;
  investorTypes: string[];
  stages: string[];
  markets: Array<{ market: { id: string; title: string } }>;
  pastInvestments: Array<{ pastInvestment: { id: string; title: string } }>;
};

// Add filters prop type
type Filters = {
  country: string;
  state: string;
  city: string;
  investmentStage: string[];
  investmentFocus: string[];
  investmentType: string[];
  pastInvestment: string[];
};

const InvestorCard: React.FC<{ 
  investor: Investor; 
  appliedFilters?: Filters; 
  basePath?: string; 
  hideTargetButton?: boolean;
  isShortlisted?: boolean;
  onShortlistChange?: (investorId: string, shortlisted: boolean) => void;
}> = ({ 
  investor, 
  appliedFilters,
  basePath = '/investors',
  hideTargetButton = false,
  isShortlisted = false,
  onShortlistChange
}) => {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalData, setLimitModalData] = useState<any>(null);

  // Shortlist status is now passed as a prop, no need to fetch individually

  const handleViewProfile = () => {
    // Pass current filters and page as URL parameters for back navigation
    const currentFilters = appliedFilters || {
      country: '',
      state: '',
      city: '',
      investmentStage: [],
      investmentFocus: [],
      investmentType: [],
      pastInvestment: [],
    };
    
    // Get current page from URL or default to 1
    const currentUrl = new URL(window.location.href);
    const pageParam = currentUrl.searchParams.get('page');
    const currentPage = pageParam ? parseInt(pageParam) : 1;
    
    // Create URL with filters and page as parameters
    const params = new URLSearchParams();
    params.set('filters', encodeURIComponent(JSON.stringify(currentFilters)));
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    
    const detailUrl = `${basePath}/${investor.id}?${params.toString()}`;
    console.log('Detail URL:', detailUrl);
    router.push(detailUrl);
  };

  const handleShortlist = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    if (!user?.id || !user.emailAddresses[0]?.emailAddress) return;
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/shortlist'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
         },
        
        body: JSON.stringify({
          userId: user.id,
          email: user.emailAddresses[0].emailAddress,
          investorId: investor.id,
        }),
      });
      
      if (res.ok) {
        onShortlistChange?.(investor.id, true);
      } else {
        const errorData = await res.json();
        
        // Handle subscription limit reached
        if (res.status === 403 && errorData.error === 'Subscription limit reached') {
          setLimitModalData({
            action: 'add_investor',
            currentUsage: errorData.currentUsage,
            limits: errorData.limits
          });
          setShowLimitModal(true);
          return;
        }
        
        console.error('Shortlist error:', errorData.message || 'Unknown error');
      }
    } catch (e) {
      console.error('Error shortlisting investor:', e);
    }
    setLoading(false);
  };

  // helpers
  const getInvestmentStages = () => {
    if (!investor.stages?.length) return 'Not available';
    
    const allStages = investor.stages.map((s) => s);
    
    // If there are applied stage filters, prioritize showing those
    if (appliedFilters?.investmentStage?.length) {
      const filteredStages = allStages.filter(stage => 
        appliedFilters.investmentStage.includes(stage)
      );
      
      if (filteredStages.length > 0) {
        const displayStages = filteredStages.slice(0, 2);
        const remainingSpace = 2 - displayStages.length;
        
        if (remainingSpace > 0) {
          const otherStages = allStages.filter(stage => 
            !appliedFilters.investmentStage.includes(stage)
          ).slice(0, remainingSpace);
          displayStages.push(...otherStages);
        }
        
        return displayStages.join(', ');
      }
    }
    
    // Default behavior: show first 2 stages
    const displayStages = allStages.slice(0, 2);
    return displayStages.join(', ');
  };

  const getPrimaryEmail = () =>
    investor.emails?.length ? investor.emails[0].email : 'No email available';

  const getLocation = () => {
    if (!investor.country) return 'Location not available';
    return [ investor.state, investor.country].filter(Boolean).join(', ');
  };

  const domainFromUrl = (url?: string) => {
    if (!url) return '';
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  const verified = investor.emails?.some(email => email.status === 'VALID') ?? false;

  // Get investor type chips with filter priority
  const getInvestorTypeChips = () => {
    if (!investor.investorTypes?.length) return [];
    
    const allTypes = investor.investorTypes.map((i) => i);
    
    if (appliedFilters?.investmentType?.length) {
      const filteredTypes = allTypes.filter(type => 
        appliedFilters.investmentType.includes(type)
      );
      
      if (filteredTypes.length > 0) {
        const displayTypes = filteredTypes.slice(0, 3);
        const remainingSpace = 3 - displayTypes.length;
        
        if (remainingSpace > 0) {
          const otherTypes = allTypes.filter(type => 
            !appliedFilters.investmentType.includes(type)
          ).slice(0, remainingSpace);
          displayTypes.push(...otherTypes);
        }
        
        return displayTypes;
      }
    }
    
    return allTypes.slice(0, 3);
  };

  const investorTypeChips = getInvestorTypeChips();
  return (
    <div
      className="group w-full rounded-[14px] border border-[#EDEEEF] bg-white shadow-sm transition-all duration-200 hover:shadow-md min-h-[103px]"
    >
      {/* Stack on mobile/tablet; row on large screens */}
      <div className="flex flex-col xl:flex-row gap-4 xl:gap-6 xl:items-start">
        {/* Column 1: Identity */}
        <div className="flex min-w-0 items-start gap-4 pt-4 pb-2 xl:pb-6 px-4
+                 xl:flex-[0_0_370px] xl:max-w-none">
          <div className="flex items-start gap-3">
            {investor.avatar && investor.avatar !== "No Image" ? (
              <img
                src={investor.avatar}
                alt={investor.name || "Investor avatar"}
                width={60}
                height={60}
                className="rounded-full object-cover"
              />
            ) : (
              <InitialsAvatar
                name={investor.name || "Investor"}
                size="lg"
                className="h-[60px] w-[60px] text-xl"
              />
            )}


            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2 mb-2">
                <InvestorHeader
                  name={investor.name}
                  verified={verified}
                  social_links={investor.social_links}
                />
              </div>

              {investor.title && (
                <p className="text-[var(--Dark-D200,#787F89)] leading-[22px] sm:leading-[24px] font-manrope text-[13px] sm:text-[14px] font-normal tracking-[-0.26px] sm:tracking-[-0.28px] mb-2 sm:mb-[10px] break-words">
                  {investor.title}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {investorTypeChips.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center justify-center px-[10px] py-[5.5px] gap-[10px] rounded-[40px] text-[var(--Dark-D500,#525A68)] font-manrope text-[11px] sm:text-[12px] font-medium leading-normal tracking-[-0.22px] sm:tracking-[-0.24px] bg-[var(--Primary-P20,#F6F9FE)] whitespace-nowrap"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider: horizontal on mobile/tablet, vertical only on xl+ */}
        <div className="mx-4 h-px bg-[var(--Dark-D20,#F6F6F7)] xl:hidden" />
        <div className="hidden xl:block w-px flex-shrink-0 rounded-[14px] border border-[var(--Dark-D20,#F6F6F7)] bg-white" />

        {/* Column 2: Contact */}
        <div className="flex flex-col xl:flex-row flex-wrap gap-3 xl:max-w-md pt-2 xl:pt-4 pb-2 xl:pb-6 px-4">
          {investor.phone && (
            <div className="flex items-center gap-2 w-full sm:w-1/2 xl:w-[200px] min-w-0">
              <PhoneIcon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-[var(--Dark,#1E293B)] font-manrope text-[13px] sm:text-[14px] font-normal leading-normal tracking-[-0.26px] sm:tracking-[-0.28px]">
                <ContactInfoMask>
                  {investor.phone}
                </ContactInfoMask>
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-1/2 xl:w-[200px] min-w-0">
            <MapPinIcon className="h-5 w-5 flex-shrink-0" />
            <span className="truncate text-[var(--Dark,#1E293B)] font-manrope text-[13px] sm:text-[14px] font-normal leading-normal tracking-[-0.26px] sm:tracking-[-0.28px]">
              {getLocation()}
            </span>
          </div>

          {investor.website && (
            <a
              href={investor.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:underline w-full sm:w-1/2 xl:w-[200px] min-w-0"
              onClick={(e) => e.stopPropagation()}
            >
              <GlobeAltIcon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-[var(--Dark,#1E293B)] font-manrope text-[13px] sm:text-[14px] font-normal leading-normal tracking-[-0.26px] sm:tracking-[-0.28px]">
                {domainFromUrl(investor.website)}
              </span>
            </a>
          )}
          <div className="flex items-center gap-2 w-full sm:w-1/2 xl:w-[200px] min-w-0">
            <EmailIcon className="h-5 w-5 flex-shrink-0" />
            <span className="truncate text-[var(--Dark,#1E293B)] font-manrope text-[13px] sm:text-[14px] font-normal leading-normal tracking-[-0.26px] sm:tracking-[-0.28px]">
              <ContactInfoMask>
                {getPrimaryEmail()}
              </ContactInfoMask>
            </span>
          </div>
        </div>

        {/* Divider: horizontal on mobile/tablet, vertical only on xl+ */}
        <div className="mx-4 h-px bg-[var(--Dark-D20,#F6F6F7)] xl:hidden" />
        <div className="hidden xl:block w-px flex-shrink-0 rounded-[14px] border border-[var(--Dark-D20,#F6F6F7)] bg-white" />

        {/* Column 3: Stage + Buttons */}
        <div className="flex xl:flex-1 flex-col xl:flex-row items-start xl:items-start justify-between gap-3 xl:gap-4 px-4 pt-2 xl:pt-4 pb-4 xl:pb-6">
          <div className="flex items-start gap-3 w-full xl:w-auto min-w-0 xl:flex-1">
            <div className="w-full xl:w-auto min-w-0">
              <p className="text-[var(--Dark,#1E293B)] font-manrope text-[13px] sm:text-[14px] font-semibold leading-normal tracking-[-0.26px] sm:tracking-[-0.28px] mb-1">
                Investment Stage
              </p>
              <div
                className={`inline-flex rounded-full py-1 font-manrope text-[13px] sm:text-[14px] font-normal leading-[20px] tracking-[-0.26px] sm:tracking-[-0.28px] text-[var(--Dark-D500,#525A68)] break-words max-w-full xl:max-w-[300px]`}
              >
                {getInvestmentStages()}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto xl:flex-shrink-0">
            {/* View Profile Button */}
            <button
              onClick={handleViewProfile}
              className="w-full sm:w-auto xl:w-auto inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex-shrink-0 cursor-pointer whitespace-nowrap"
              title="View investor profile"
            >
              View Profile
            </button>

            {user && !hideTargetButton && (
              <button
                disabled={isShortlisted || loading}
                onClick={handleShortlist}
                className={`w-full sm:w-auto xl:w-auto inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-white transition-all duration-200 ${
                  isShortlisted
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                } disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 whitespace-nowrap`}
                title={isShortlisted ? 'Already shortlisted' : 'Add to shortlist'}
              >
                {isShortlisted ? 'Shortlisted ✓' : loading ? 'Adding…' : 'Shortlist +'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {showLimitModal && limitModalData && (
        <SubscriptionLimitModal
          isOpen={showLimitModal}
          onClose={() => {
            setShowLimitModal(false);
            setLoading(false); // Reset loading state
          }}
          action={limitModalData.action}
          currentUsage={limitModalData.currentUsage}
          limits={limitModalData.limits}
        />
      )}
    </div>
  );
};

export default InvestorCard;