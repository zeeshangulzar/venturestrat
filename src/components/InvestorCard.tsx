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

const InvestorCard: React.FC<{ investor: Investor }> = ({ investor }) => {
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
    router.push(`/investors/${investor.id}`);
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
    const stages = investor.stages.map((s) => s.stage.title);
    const displayStages = stages.slice(0, 1);
    return displayStages.join(', ');
  };

  const getInvestorTypes = () =>
    investor.investorTypes?.length
      ? investor.investorTypes.map((i) => i.investorType.title).join(', ')
      : 'Not available';

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

  // Get investor type chips (limit to 3 for clean display)
  const investorTypeChips = investor.investorTypes?.slice(0, 3).map((i) => i.investorType.title) ?? [];

  return (
    <div 
      className="group w-full rounded-[14px] border border-[#EDEEEF] bg-white shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer min-h-[103px]"
      onClick={handleCardClick}
    >
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Column 1: Identity */}
        <div className="flex min-w-0 flex-1 items-start gap-4 max-w-[400px] pt-4 pb-6 px-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <InvestorHeader
                name={investor.name}
                verified={verified}
                social_links={investor.social_links}
              />
            </div>

            {investor.title && (
              <p
                className=" text-[var(--Dark-D200,#787F89)] leading-[24px] font-manrope text-[14px] font-normal tracking-[-0.28px] mb-[10px]
                "
              >
                {investor.title}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {investorTypeChips.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center justify-center px-[10px] py-[5.5px] gap-[10px] rounded-[40px] bg-[var(--Primary-P20,#F6F9FE)] text-[var(--Dark-D500,#525A68)] font-manrope text-[12px] font-medium leading-normal tracking-[-0.24px]"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Column divider (hidden on mobile) */}
        <div className="w-px flex-shrink-0 rounded-[14px] border border-[var(--Dark-D20,#F6F6F7)] bg-white h-[-webkit-fill-available]" />

        {/* Column 2: Contact */}
        <div className="flex flex-col lg:flex-row flex-wrap gap-3 lg:max-w-md pt-4 pb-6 px-4 h-[fit-content]">
          {investor.phone && (
            <div className="flex items-center gap-2 w-full lg:w-[200px] overflow-hidden">
              <PhoneIcon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-[var(--Dark,#1E293B)] font-manrope text-[14px] font-normal leading-normal tracking-[-0.28px]">
                {investor.phone}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 w-full lg:w-[200px] overflow-hidden">
            <MapPinIcon className="map-icon flex-shrink-0" />
            <span className="truncate text-[var(--Dark,#1E293B)] font-manrope text-[14px] font-normal leading-normal tracking-[-0.28px]">
              {getLocation()}
            </span>
          </div>

          {investor.website && (
            <a
              href={investor.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:underlinetransition-colors w-full lg:w-[200px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <GlobeAltIcon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-[var(--Dark,#1E293B)] font-manrope text-[14px] font-normal leading-normal tracking-[-0.28px]">
                {domainFromUrl(investor.website)}
              </span>
            </a>
          )}

          <a
            href={`mailto:${getPrimaryEmail()}`}
            className="flex items-center gap-2 hover:underline group-hover:text-blue-600 transition-colors w-full lg:w-[200px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <EmailIcon className="flex-shrink-0" />
            <span className="truncate text-[var(--Dark,#1E293B)] font-manrope text-[14px] font-normal leading-normal tracking-[-0.28px]">
              {getPrimaryEmail()}
            </span>
          </a>
        </div> 
        {/* Column divider (hidden on mobile) */}
        <div className="w-px flex-shrink-0 rounded-[14px] border border-[var(--Dark-D20,#F6F6F7)] bg-white h-[-webkit-fill-available]" />

        {/* Column 3: Stage + Button */}
        <div className="flex lg:flex-1 flex-col lg:flex-row items-start justify-between gap-4 lg:gap-6 px-4 pt-4 pb-6">
          <div className="flex items-start gap-3">
            <div className="w-full lg:w-auto">
              <p className="text-[var(--Dark,#1E293B)] font-manrope text-[14px] font-semibold leading-normal tracking-[-0.28px] mb-1 font-manrope">Investment Stage</p>
              <div className="inline-flex rounded-full py-1 text-[var(--Dark-D500,#525A68)] font-manrope text-[14px] font-normal leading-[20px] tracking-[-0.28px]">
                {getInvestmentStages()}
              </div>
            </div>
          </div>
          <div className="flex items-start">
            {user && (
              <button
                disabled={shortlisted || loading}
                onClick={handleShortlist}
                className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200 ${
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
    </div>
  );
};

export default InvestorCard;
