// components/InvestorCard.tsx
import React from 'react';

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
  previous_investments: string[];
  social_links: { [key: string]: string };
};

const InvestorCard: React.FC<{ investor: Investor }> = ({ investor }) => (
  <div className="bg-gradient-to-br from-violet-50 to-white border border-purple-100 rounded-xl shadow-md hover:shadow-lg transition-all p-6 mb-6 flex flex-row items-center">
    {/* Investor Image */}
    <img
      src="/avatar.jpeg" // Replace with actual image URL
      alt={investor.name}
      className="w-20 h-20 rounded-full border-2 border-purple-300 object-cover shadow mr-6"
    />

    {/* Investor Info */}
    <div className="flex flex-col">
      {/* Name and Contact Info */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-purple-800">{investor.name}</h2>
        <p className="text-sm text-gray-600">
          {investor.city}, {investor.state}, {investor.country}
        </p>
      </div>

      {/* Phone and Email */}
      <div className="space-y-2 text-sm text-gray-700 mb-4">
        <p>
          <span className="font-medium text-purple-700">Phone:</span> {investor.phone_number}
        </p>
        <p>
          <span className="font-medium text-purple-700">Email:</span>{' '}
          <a href={`mailto:${investor.email}`} className="text-blue-600 hover:underline">
            {investor.email}
          </a>
        </p>
      </div>

      {/* Investment Stage */}
      <div className="text-sm text-gray-700 mb-4">
        <p>
          <span className="font-medium text-purple-700">Investment Stage:</span> {investor.investment_stage}
        </p>
      </div>

      {/* Previous Investments */}
      <div className="space-y-1 text-sm text-gray-700 mb-4">
        <p>
          <span className="font-medium text-purple-700">Previous Investments:</span>{' '}
          {investor.previous_investments.join(', ')}
        </p>
      </div>

      {/* Social Links */}
      <div className="flex gap-4 mt-4">
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

      {/* Website */}
      <div className="mt-4">
        <a
          href={investor.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Visit Website
        </a>
      </div>
    </div>
  </div>
);

export default InvestorCard;
