'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getApiUrl } from '@lib/api';

type SocialLinks = {
  [key: string]: string;
};

type Pipeline = {
  id: string;
  title: string;
  status: string;
};

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
  company?: {
    id: string;
    title: string;
  };
  emails: Array<{
    id: string;
    email: string;
    status: string;
  }>;
  investorTypes: Array<{
    investorType: {
      id: string;
      title: string;
    };
  }>;
  stages: Array<{
    stage: {
      id: string;
      title: string;
    };
  }>;
  markets: Array<{
    market: {
      id: string;
      title: string;
    };
  }>;
  pastInvestments: Array<{
    pastInvestment: {
      id: string;
      title: string;
    };
  }>;
};

const InvestorCard: React.FC<{ investor: Investor }> = ({ investor }) => {
  const { user } = useUser();
  const [shortlisted, setShortlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchShortlist = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(getApiUrl(`/api/shortlists/${user.id}`));
        const data: { investor: { id: string } }[] = await res.json(); // Type data correctly

        const isShortlisted = data.some((entry) => entry.investor.id === investor.id);
        setShortlisted(isShortlisted);
      } catch (error) {
        console.error('Error fetching shortlists:', error);
      }
    };

    fetchShortlist();
  }, [user, investor.id]);

  const handleShortlist = async () => {
    if (!user?.id || !user.emailAddresses[0]?.emailAddress) return;

    setLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/shortlist'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.emailAddresses[0].emailAddress,
          investorId: investor.id,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('Shortlist error:', error.message || 'Unknown error');
      } else {
        setShortlisted(true);
      }
    } catch (error) {
      console.error('Error shortlisting investor:', error);
    }

    setLoading(false);
  };

  // Helper functions to extract data from nested structures
  const getInvestmentStages = () => {
    if (!investor.stages || investor.stages.length === 0) return 'Not available';
    return investor.stages.map(item => item.stage.title).join(', ');
  };

  const getInvestmentFocus = () => {
    if (!investor.markets || investor.markets.length === 0) return 'Not available';
    return investor.markets.map(item => item.market.title).join(', ');
  };

  const getInvestorTypes = () => {
    if (!investor.investorTypes || investor.investorTypes.length === 0) return 'Not available';
    return investor.investorTypes.map(item => item.investorType.title).join(', ');
  };

  const getPastInvestments = () => {
    if (!investor.pastInvestments || investor.pastInvestments.length === 0) return 'No previous investments available';
    return investor.pastInvestments.map(item => item.pastInvestment.title).join(', ');
  };

  const getPrimaryEmail = () => {
    if (!investor.emails || investor.emails.length === 0) return 'No email available';
    return investor.emails[0].email;
  };

  const getLocation = () => {
    if (!investor.address) return 'Location not available';
    const { city, state, country } = investor.address;
    return `${city}, ${state}, ${country}`;
  };

  const getCompanyName = () => {
    return investor.company?.title || 'Company not specified';
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 to-white border border-purple-100 rounded-xl shadow-md hover:shadow-lg transition-all p-6 mb-6 flex flex-row items-start">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-purple-800">{investor.name}</h2>
          {investor.title && (
            <p className="text-sm text-purple-600 font-medium">{investor.title}</p>
          )}
          <p className="text-sm text-gray-600">{getLocation()}</p>
          <p className="text-sm text-gray-600">{getCompanyName()}</p>
        </div>

        <div className="space-y-2 text-sm text-gray-700 mb-4">
          {investor.phone && (
            <p><span className="font-medium text-purple-700">Phone:</span> {investor.phone}</p>
          )}
          <p>
            <span className="font-medium text-purple-700">Email:</span>{' '}
            <a href={`mailto:${getPrimaryEmail()}`} className="text-blue-600 hover:underline">
              {getPrimaryEmail()}
            </a>
          </p>
        </div>

        {/* Investment Information */}
        <div className="space-y-2 text-sm text-gray-700 mb-4">
          <p>
            <span className="font-medium text-purple-700">Investment Stage:</span>{' '}
            <span className="text-gray-600">{getInvestmentStages()}</span>
          </p>
          <p>
            <span className="font-medium text-purple-700">Investment Focus:</span>{' '}
            <span className="text-gray-600">{getInvestmentFocus()}</span>
          </p>
          <p>
            <span className="font-medium text-purple-700">Investor Type:</span>{' '}
            <span className="text-gray-600">{getInvestorTypes()}</span>
          </p>
        </div>

        {/* Previous Investments */}
        <div className="text-sm text-gray-700 mb-4">
          <p>
            <span className="font-medium text-purple-700">Previous Investments:</span>{' '}
            <span className="text-gray-600">{getPastInvestments()}</span>
          </p>
        </div>

        {/* Social Links */}
        {investor.social_links && Object.keys(investor.social_links).length > 0 && (
          <div className="flex flex-wrap gap-4 mb-4">
            <span className="text-sm font-medium text-purple-700">Social Links:</span>
            {Object.entries(investor.social_links).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </a>
            ))}
          </div>
        )}

        {/* Website Link */}
        {investor.website && (
          <div className="mb-4">
            <a
              href={investor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Visit Website →
            </a>
          </div>
        )}

        {/* Shortlist Button */}
        {user && (
          <div className="mt-auto pt-4">
            <button
              disabled={shortlisted || loading}
              onClick={handleShortlist}
              className={`px-4 py-2 rounded-md text-white transition-all duration-200 text-sm font-medium ${
                shortlisted
                  ? 'bg-green-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
              }`}
            >
              {shortlisted ? '✓ Shortlisted' : loading ? 'Shortlisting...' : 'Add to Shortlist'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorCard;
