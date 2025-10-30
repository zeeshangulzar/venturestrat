'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import InvestorHeader from '@components/InvestorCardHeader';
import { getApiUrl } from '@lib/api';
import Link from 'next/link';
import Image from 'next/image';
import InitialsAvatar from '@components/InitialsAvatar';

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
  city: string; 
  state: string; 
  country: string;
  companyName?: string;
  emails: Array<{ id: string; email: string; status: string }>;
  investorTypes: string[];
  stages: string[];
  markets: Array<{ market: { id: string; title: string } }>;
  pastInvestments: Array<{ pastInvestment: { id: string; title: string } }>;
};

export default function InvestorShowPage() {
  const params = useParams();
  const investorId = params.investorId;

  const [investor, setInvestor] = useState<Investor | null>(null);
  const [loading, setLoading] = useState(true);
  const [backUrl, setBackUrl] = useState('/fundraising/investors');

  useEffect(() => {
    // Get filters and page from URL parameters for back navigation
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlFilters = urlParams.get('filters');
      const urlPage = urlParams.get('page');
      
      if (urlFilters || urlPage) {
        // Create back URL with filters and page to fundraising investors list
        let url = '/fundraising/investors';
        const params = new URLSearchParams();
        
        if (urlFilters) {
          params.set('filters', urlFilters);
        }
        if (urlPage && urlPage !== '1') {
          params.set('page', urlPage);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        setBackUrl(url);
        console.log('Created back URL:', url);
      }
    }
  }, []);

  useEffect(() => {
    if (!investorId) return;

    const fetchInvestorDetails = async () => {
      try {
        const res = await fetch(getApiUrl(`/api/investors/${investorId}`), {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setInvestor(data.investor);
      } catch (error) {
        console.error('Error fetching investor details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestorDetails();
  }, [investorId]);

  if (loading) return <p>Loading...</p>;
  if (!investor) return <p>Investor not found</p>;

  const verified = investor.emails?.some((e) => e.status === 'VALID') ?? false;
  const location = investor.country
    ? [investor.city, investor.state, investor.country]
        .filter(Boolean)
        .join(', ')
    : '—';

  const investorTypes = investor.investorTypes?.map((i) => i) ?? [];
  const stages = investor.stages?.map((s) => s) ?? [];
  const markets = investor.markets?.map((m) => m.market.title) ?? [];
  const pastInvestments = investor.pastInvestments?.map((p) => p.pastInvestment.title) ?? [];
  const pipelines = investor.pipelines ?? [];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4">
        <Link href={backUrl} className="text-sm text-slate-600 hover:underline">
          ← Back to investors
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-start gap-4">
            {investor.avatar ? (
              <Image
                src={investor.avatar}
                alt={investor.name || 'Investor avatar'}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <InitialsAvatar
                name={investor.name || 'Investor'}
                size="lg"
                className="h-16 w-16 text-xl"
              />
            )}

            <div className="min-w-0 flex-1">
              <InvestorHeader
                name={investor.name}
                verified={verified}
                social_links={investor.social_links}
              />
              {investor.title && (
                <p className="mt-1 text-sm font-medium text-slate-700">{investor.title}</p>
              )}
              {investorTypes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {investorTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid gap-8 p-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Contact Information */}
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Contact Information</h3>
              <div className="space-y-3">
                <Row label="Phone" value={investor.phone || '—'} />
                <Row
                  label="Website"
                  value={
                    investor.website ? (
                      <a
                        href={investor.website}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {investor.website}
                      </a>
                    ) : (
                      '—'
                    )
                  }
                />
                <Row label="Company" value={investor.companyName || '—'} />
                <Row label="Location" value={location} />
              </div>
            </section>

            {/* Emails */}
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Emails</h3>
              <div className="space-y-2">
                {investor.emails?.length ? (
                  investor.emails.map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="text-sm text-slate-800">{e.email}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                          e.status === 'VALID'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : 'bg-slate-100 text-slate-700 ring-slate-200'
                        }`}
                      >
                        {e.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                    <p className="text-sm text-slate-500">No emails</p>
                  </div>
                )}
              </div>
            </section>

            {/* Social Links */}
            {investor.social_links && Object.keys(investor.social_links).length > 0 && (
              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">Social Links</h3>
                <div className="space-y-3">
                  {Object.entries(investor.social_links).map(([platform, url]) => (
                    <div key={platform} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="text-sm font-medium text-slate-600 capitalize">{platform}</span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {url}
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Investment Stages */}
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Investment Stages</h3>
              {stages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stages.map((stage) => (
                    <span
                      key={stage}
                      className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                  <p className="text-sm text-slate-500">No investment stages specified</p>
                </div>
              )}
            </section>

            {/* Markets */}
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Markets</h3>
              {markets.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {markets.map((market) => (
                    <span
                      key={market}
                      className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                    >
                      {market}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                  <p className="text-sm text-slate-500">No markets specified</p>
                </div>
              )}
            </section>

            {/* Past Investments */}
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Past Investments</h3>
              {pastInvestments.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {pastInvestments.map((investment) => (
                    <span
                      key={investment}
                      className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700"
                    >
                      {investment}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                  <p className="text-sm text-slate-500">No past investments listed</p>
                </div>
              )}
            </section>
            
            {/* Pipelines */}
            {pipelines.length > 0 && (
              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">Pipelines</h3>
                <div className="space-y-2">
                  {pipelines.map((pipeline) => (
                    <div key={pipeline.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="text-sm text-slate-800">{pipeline.title}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                          pipeline.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : 'bg-slate-100 text-slate-700 ring-slate-200'
                        }`}
                      >
                        {pipeline.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-28 shrink-0 text-sm font-medium text-slate-600">{label}</span>
      <div className="text-sm">{value}</div>
    </div>
  );
}
