'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@lib/api';
import InvestorHeader from '@components/InvestorCardHeader';
import MapPinIcon from './icons/mapPinIcon';

import {
  PhoneIcon,
  GlobeAltIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import EmailIcon from './icons/emailIcon';

type SocialLinks = { [key: string]: string };

type Pipeline = { id: string; title: string; status: string };

type Investor = {
  id: string;
  name: string;
  avatar?: string;
  website?: string;
  phone?: string;
  title?: string;
  social_links?: SocialLinks;
  pipelines?: Pipeline[];
  address?: {
    id: string;
    city: string;
    state: string;
    country: string;
  };
  company?: { id: string; title: string };
  emails: Array<{ id: string; email: string; status: string }>;
  investorTypes: Array<{ investorType: { id: string; title: string } }>;
  stages: Array<{ stage: { id: string; title: string } }>;
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

const InvestorCard: React.FC<{ investor: Investor; appliedFilters?: Filters }> = ({ 
  investor, 
  appliedFilters 
}) => {
  const { user } = useUser();
  const router = useRouter();
  const [shortlisted, setShortlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchShortlist = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(getApiUrl(`/api/shortlists/${user.id}`));
        const data: { investor: { id: string } }[] = await res.json();
        const isShortlisted = data.some((entry) => entry.investor.id === investor.id);
        setShortlisted(isShortlisted);
      } catch (error) {
        console.error('Error fetching shortlists:', error);
      }
    };
    fetchShortlist();
  }, [user, investor.id]);

  const handleCardClick = () => {
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
    
    console.log('Navigating to detail page with filters:', currentFilters);
    console.log('Current page:', currentPage);
    
    // Create URL with filters and page as parameters
    const params = new URLSearchParams();
    params.set('filters', encodeURIComponent(JSON.stringify(currentFilters)));
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    
    const detailUrl = `/investors/${investor.id}?${params.toString()}`;
    console.log('Detail URL:', detailUrl);
    router.push(detailUrl);
  };

  const handleShortlist = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    if (!user?.id || !user.emailAddresses[0]?.emailAddress) return;
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/shortlist'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.emailAddresses[0].emailAddress,
          investorId: investor.id,
        }),
      });
      if (res.ok) setShortlisted(true);
      else console.error('Shortlist error:', (await res.json()).message || 'Unknown error');
    } catch (e) {
      console.error('Error shortlisting investor:', e);
    }
    setLoading(false);
  };

  // helpers
  const getInvestmentStages = () => {
    if (!investor.stages?.length) return 'Not available';
    
    const allStages = investor.stages.map((s) => s.stage.title);
    
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

  const getInvestorTypes = () => {
    if (!investor.investorTypes?.length) return 'Not available';
    
    const allTypes = investor.investorTypes.map((i) => i.investorType.title);
    
    // If there are applied type filters, prioritize showing those
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
        
        return displayTypes.join(', ');
      }
    }
    
    // Default behavior: show first 3 types
    return allTypes.slice(0, 3).join(', ');
  };

  const getPrimaryEmail = () =>
    investor.emails?.length ? investor.emails[0].email : 'No email available';

  const getLocation = () => {
    if (!investor.address) return 'Location not available';
    const { state, country } = investor.address;
    return [ state, country].filter(Boolean).join(', ');
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
    
    const allTypes = investor.investorTypes.map((i) => i.investorType.title);
    
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
      className="group w-full rounded-[14px] border border-[#EDEEEF] bg-white shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer min-h-[103px]"
      onClick={handleCardClick}
    >
      {/* Stack on mobile/tablet; row on large screens */}
      <div className="flex flex-col flex-row-1150 gap-4 lg:gap-0">
        {/* Column 1: Identity */}
        <div className="flex min-w-0 flex-1 items-start gap-4 lg:max-w-[400px] pt-4 pb-2 lg:pb-6 px-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <InvestorHeader
                name={investor.name}
                verified={verified}
                social_links={investor.social_links}
              />
            </div>

            {investor.title && (
              <p className="text-[var(--Dark-D200,#787F89)] leading-[22px] sm:leading-[24px] font-manrope text-[13px] sm:text-[14px] font-normal tracking-[-0.26px] sm:tracking-[-0.28px] mb-2 sm:mb-[10px]">
                {investor.title}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {investorTypeChips.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center justify-center px-[10px] py-[5.5px] gap-[10px] rounded-[40px] text-[var(--Dark-D500,#525A68)] font-manrope text-[11px] sm:text-[12px] font-medium leading-normal tracking-[-0.22px] sm:tracking-[-0.24px] bg-[var(--Primary-P20,#F6F9FE)]"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Divider: horizontal on mobile/tablet, vertical only on lg+ */}
        <div className="mx-4 h-px bg-[var(--Dark-D20,#F6F6F7)] lg:hidden" />
        <div className="hidden lg:block w-px flex-shrink-0 rounded-[14px] border border-[var(--Dark-D20,#F6F6F7)] bg-white" />

        {/* Column 2: Contact */}
        <div className="flex flex-col lg:flex-row flex-wrap gap-3 lg:max-w-md pt-2 lg:pt-4 pb-2 lg:pb-6 px-4">
          {investor.phone && (
            <div className="flex items-center gap-2 w-full sm:w-1/2 lg:w-[200px] overflow-hidden">
              <PhoneIcon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-[var(--Dark,#1E293B)] font-manrope text-[13px] sm:text-[14px] font-normal leading-normal tracking-[-0.26px] sm:tracking-[-0.28px]">
                {investor.phone}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-1/2 lg:w-[200px] overflow-hidden">
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
              className="flex items-center gap-2 hover:underline w-full sm:w-1/2 lg:w-[200px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <GlobeAltIcon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-[var(--Dark,#1E293B)] font-manrope text-[13px] sm:text-[14px] font-normal leading-normal tracking-[-0.26px] sm:tracking-[-0.28px]">
                {domainFromUrl(investor.website)}
              </span>
            </a>
          )}

          <a
            href={`mailto:${getPrimaryEmail()}`}
            className="flex items-center gap-2 hover:underline group-hover:text-[var(--Dark,#1E293B)] transition-colors w-full sm:w-1/2 lg:w-[200px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <EmailIcon className="h-5 w-5 flex-shrink-0" />
            <span className="truncate text-[var(--Dark,#1E293B)] font-manrope text-[13px] sm:text-[14px] font-normal leading-normal tracking-[-0.26px] sm:tracking-[-0.28px]">
              {getPrimaryEmail()}
            </span>
          </a>
        </div>

        {/* Divider: horizontal on mobile/tablet, vertical only on lg+ */}
        <div className="mx-4 h-px bg-[var(--Dark-D20,#F6F6F7)] lg:hidden" />
        <div className="hidden lg:block w-px flex-shrink-0 rounded-[14px] border border-[var(--Dark-D20,#F6F6F7)] bg-white" />

        {/* Column 3: Stage + Button */}
        <div className="flex lg:flex-1 flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-6 px-4 pt-2 lg:pt-4 pb-4 lg:pb-6">
          <div className="flex items-start gap-3 w-full lg:w-auto">
            <div className="w-full lg:w-auto">
              <p className="text-[var(--Dark,#1E293B)] font-manrope text-[13px] sm:text-[14px] font-semibold leading-normal tracking-[-0.26px] sm:tracking-[-0.28px] mb-1">
                Investment Stage
              </p>
              <div
                className={`inline-flex rounded-full py-1 font-manrope text-[13px] sm:text-[14px] font-normal leading-[20px] tracking-[-0.26px] sm:tracking-[-0.28px] text-[var(--Dark-D500,#525A68)]`}
              >
                {getInvestmentStages()}
              </div>

            </div>
          </div>

          {user && (
            <button
              disabled={shortlisted || loading}
              onClick={handleShortlist}
              className={`w-full sm:w-auto inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200 ${
                shortlisted
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={shortlisted ? 'Already targeted' : 'Add to target list'}
            >
              {shortlisted ? 'Targeted ✓' : loading ? 'Adding…' : 'Target +'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestorCard;