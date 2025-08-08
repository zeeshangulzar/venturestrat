'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@lib/api';
import InvestorHeader from '@components/InvestorCardHeader';

import {
  PhoneIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

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
  address?: { id: string; city: string; state: string; country: string };
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
    const { city, state, country } = investor.address;
    return [city, state, country].filter(Boolean).join(', ');
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
      className="group w-full rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between lg:p-6">
        {/* Column 1: Identity */}
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <InvestorHeader
                name={investor.name}
                verified={verified}
                social_links={investor.social_links}
              />
            </div>

            {investor.title && (
              <p className="text-sm font-normal text-slate-600 leading-6 mb-3 font-manrope">{investor.title}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {investorTypeChips.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-full bg-blue-50 text-xs font-medium text-slate-600 leading-4 font-manrope"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Column divider (hidden on mobile) */}
        <div className="hidden lg:block w-px h-16 bg-slate-200 mx-6" />

        {/* Column 2: Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-800 lg:max-w-md">
          {investor.phone && (
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-5 w-5 text-slate-500 flex-shrink-0" />
              <span className="text-sm font-normal text-slate-800 truncate font-manrope">{investor.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-slate-500 flex-shrink-0" />
            <span className="text-sm font-normal text-slate-800 truncate font-manrope">{getLocation()}</span>
          </div>

          {investor.website && (
            <a
              href={investor.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:underline group-hover:text-blue-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <GlobeAltIcon className="h-5 w-5 text-slate-500 flex-shrink-0" />
              <span className="text-sm font-normal text-slate-800 truncate font-manrope">{domainFromUrl(investor.website)}</span>
            </a>
          )}

          <a 
            href={`mailto:${getPrimaryEmail()}`} 
            className="flex items-center gap-2 hover:underline group-hover:text-blue-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <EnvelopeIcon className="h-5 w-5 text-slate-500 flex-shrink-0" />
            <span className="text-sm font-normal text-slate-800 truncate font-manrope">{getPrimaryEmail()}</span>
          </a>
        </div>

        {/* Column divider (hidden on mobile) */}
        <div className="hidden lg:block w-px h-16 bg-slate-200 mx-6" />

        {/* Column 3: Stage + Button */}
        <div className="flex flex-col items-start gap-3 lg:w-auto lg:items-end">
          <div className="w-full lg:w-auto">
            <p className="text-sm font-semibold text-slate-900 mb-1 font-manrope">Investment Stage</p>
            <div className="inline-flex rounded-full px-3 py-1 text-sm font-medium text-slate-700 font-manrope">
              {getInvestmentStages()}
            </div>
          </div>

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
  );
};

export default InvestorCard;
