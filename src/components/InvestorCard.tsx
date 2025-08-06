'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getApiUrl } from '@lib/api';

type Investor = {
  id: string;
  name: string;
  email: string;
  website: string;
  city: string;
  country: string;
  state: string;
  phone_number: string;
  investment_stage: string;
  investment_focus: string;
  investment_type: string;
  previous_investments: string[];
  social_links: { [key: string]: string };
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
        const data = await res.json();

        const isShortlisted = data.some((entry: any) => entry.investor.id === investor.id);
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

  return (
    <div className="bg-gradient-to-br from-violet-50 to-white border border-purple-100 rounded-xl shadow-md hover:shadow-lg transition-all p-6 mb-6 flex flex-row items-center">
      <img
        src="/avatar.jpeg"
        alt={investor.name}
        className="w-20 h-20 rounded-full border-2 border-purple-300 object-cover shadow mr-6"
      />
      <div className="flex flex-col flex-1">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-purple-800">{investor.name}</h2>
          <p className="text-sm text-gray-600">
            {investor.city}, {investor.state}, {investor.country}
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-700 mb-4">
          <p><span className="font-medium text-purple-700">Phone:</span> {investor.phone_number}</p>
          <p>
            <span className="font-medium text-purple-700">Email:</span>{' '}
            <a href={`mailto:${investor.email}`} className="text-blue-600 hover:underline">
              {investor.email}
            </a>
          </p>
        </div>

        <div className="text-sm text-gray-700 mb-4">
          <p><span className="font-medium text-purple-700">Investment Stage:</span> {investor.investment_stage}</p>
        </div>
        <div className="text-sm text-gray-700 mb-4">
          <p><span className="font-medium text-purple-700">Investment Focus:</span> {investor.investment_focus}</p>
        </div>
        <div className="text-sm text-gray-700 mb-4">
          <p><span className="font-medium text-purple-700">Investment Type:</span> {investor.investment_type}</p>
        </div>

        <div className="space-y-1 text-sm text-gray-700 mb-4">
          <p><span className="font-medium text-purple-700">Previous Investments:</span> {investor.previous_investments.join(', ')}</p>
        </div>

        <div className="flex gap-4 mt-4">
          {Object.entries(investor.social_links).map(([key, url]) => (
            <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </a>
          ))}
        </div>

        <div className="mt-4">
          <a href={investor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Visit Website
          </a>
        </div>

        {user && (
          <button
            disabled={shortlisted || loading}
            onClick={handleShortlist}
            className={`mt-4 px-4 py-2 rounded-md text-white transition-all duration-200 ${
              shortlisted
                ? 'bg-green-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {shortlisted ? 'Shortlisted' : loading ? 'Shortlisting...' : 'Shortlist'}
          </button>
        )}
      </div>
    </div>
  );
};

export default InvestorCard;
