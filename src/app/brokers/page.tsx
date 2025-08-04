'use client';

import { useEffect, useState } from 'react';

type Broker = {
  id: string;
  name: string;
  email: string;
  website: string;
  city: string;
  country: string;
  phone_number: string;
  investment_stage: string;
  previous_investments: string[];
  social_links: {
    linkedin?: string;
    twitter?: string;
  };
};

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrokers = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brokers`);
      const data = await res.json();
      setBrokers(data);
      setLoading(false);
    };

    fetchBrokers();
  }, []);

  if (loading) {
    return <p className="p-4 text-gray-500">Loading brokers...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-10 text-purple-700">Brokers Directory</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {brokers.map((broker) => (
          <div
            key={broker.id}
            className="bg-gradient-to-br from-violet-50 to-white border border-purple-100 rounded-xl shadow-md hover:shadow-lg transition-all p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src="/avatar.jpeg"
                alt={broker.name}
                className="w-14 h-14 rounded-full border-2 border-purple-300 object-cover shadow"
              />
              <div>
                <h2 className="text-xl font-semibold text-purple-800">{broker.name}</h2>
                <p className="text-sm text-gray-600">{broker.city}, {broker.country}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium text-purple-700">Stage:</span> {broker.investment_stage}
              </p>
              <p>
                <span className="font-medium text-purple-700">Email:</span>{' '}
                <a href={`mailto:${broker.email}`} className="text-blue-600 hover:underline">
                  {broker.email}
                </a>
              </p>
              <p>
                <span className="font-medium text-purple-700">Phone:</span> {broker.phone_number}
              </p>
              <p>
                <span className="font-medium text-purple-700">Investments:</span>{' '}
                {broker.previous_investments.join(', ')}
              </p>
            </div>

            <div className="flex gap-4 mt-4">
              {broker.social_links?.linkedin && (
                <a
                  href={broker.social_links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                >
                  LinkedIn
                </a>
              )}
              {broker.social_links?.twitter && (
                <a
                  href={broker.social_links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-500 hover:text-sky-700 hover:underline text-sm"
                >
                  Twitter
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
