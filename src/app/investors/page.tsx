// app/investor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '../../lib/api';
import Filter from '@components/Filter';
import InvestorCard from '@components/InvestorCard';
import Pagination from '@components/Pagination';

type Filters = {
  city: string;
  state: string;
  investmentStage: string;
  country: string;
};

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

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Default value is 20
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    city: '',
    state: '',
    country: '',
    investmentStage: '',
  });

  const countryOptions = ['USA', 'Canada', 'UK', 'Germany'];
  const stateOptions = ['California', 'New York', 'Texas', 'Florida'];
  const cityOptions = ['San Francisco', 'New York', 'London', 'Berlin'];

  // Fetch data from backend using dynamic URL
  const fetchInvestors = async () => {
    setLoading(true);
    const url = getApiUrl(
      `/api/investors?page=${currentPage}&itemsPerPage=${itemsPerPage}&search=${searchQuery}&filters=${JSON.stringify(filters)}`
    );
    const res = await fetch(url);
    const data = await res.json();
    setInvestors(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvestors();
  }, [currentPage, searchQuery, filters, itemsPerPage]); // Re-fetch when itemsPerPage changes

  if (loading) {
    return <p className="p-4 text-gray-500">Loading investors...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-10 text-purple-700">Investors Directory</h1>

     <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search investors"
          className="p-2 border rounded"
        />
        <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
      </div>
      <div className="grid grid-cols-1 gap-8">
        {/* First Row: Filters */}
        <div className="flex gap-8">
          <Filter
            label="Country"
            options={countryOptions}
            value={filters.country}
            onChange={(value) => setFilters({ ...filters, country: value })}
          />
          <Filter
            label="State"
            options={stateOptions}
            value={filters.state}
            onChange={(value) => setFilters({ ...filters, state: value })}
          />
          <Filter
            label="City"
            options={cityOptions}
            value={filters.city}
            onChange={(value) => setFilters({ ...filters, city: value })}
          />
          <Filter
            label="Investment Stage"
            options={['Seed', 'Series A', 'Series B']}
            value={filters.investmentStage}
            onChange={(value) => setFilters({ ...filters, investmentStage: value })}
          />
        </div>

        {/* Third Row: Investor Cards */}
        <div className="flex flex-col gap-8">
          {investors.length > 0 ? (
            investors.map((investor) => (
              <InvestorCard key={investor.id} investor={investor} />
            ))
          ) : (
            <p>No investors found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
