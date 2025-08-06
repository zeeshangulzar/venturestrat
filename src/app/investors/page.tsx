'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '../../lib/api';
import Filter from '@components/Filter';
import InvestorCard from '@components/InvestorCard';
import Pagination from '@components/Pagination';
import LocationFilter from '@components/LocationFilter';

type Filters = {
  country: string;
  state: string;
  city: string;
  investmentStage: string[];
  investmentFocus: string[];
  investmentType: string[];
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
  investment_focus: string;
  investment_type: string;
  previous_investments: string[];
  social_links: { [key: string]: string };
};

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState<Filters>({
    city: '',
    state: '',
    country: '',
    investmentStage: [],
    investmentFocus: [],
    investmentType: [],
  });

  const investmentOptions = ['Seed', 'Series A', 'Series B', 'Growth'];
  const investmentFocusOptions = ['Technology', 'Fintech', 'Healthcare', 'Retail', 'Blockchain', 'Software'];
  const investmentTypeOptions = ['Venture Capital', 'Private Equity', 'Seed Capital'];

  const fetchInvestors = async () => {
    setLoading(true);
    const url = getApiUrl(
      `/api/investors?page=${currentPage}&itemsPerPage=${itemsPerPage}&search=${searchQuery}&filters=${encodeURIComponent(JSON.stringify(filters))}`
    );
    const res = await fetch(url);
    const data = await res.json();
    setInvestors(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvestors();
  }, [currentPage, searchQuery, filters, itemsPerPage]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        {/* <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search investors"
          className="p-2 border rounded w-full max-w-sm"
        /> */}
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-6 mb-10">
        <LocationFilter
          filters={{ country: filters.country, state: filters.state, city: filters.city }}
          setFilters={(location) => setFilters({ ...filters, ...location })}
        />
        <Filter
          label="Investment Stage"
          options={investmentOptions}
          value={filters.investmentStage}
          onChange={(value) => setFilters({ ...filters, investmentStage: value as string[] })}
        />
        <Filter
          label="Investment Focus"
          options={investmentFocusOptions}
          value={filters.investmentFocus}
          onChange={(value) => setFilters({ ...filters, investmentFocus: value as string[] })}
        />
        <Filter
          label="Investment Type"
          options={investmentTypeOptions}
          value={filters.investmentType}
          onChange={(value) => setFilters({ ...filters, investmentType: value as string[] })}
        />
      </div>

      {/* Investor Cards */}
      <div className="flex flex-col gap-8">
        {loading ? (
          <p>Loading investors...</p>
        ) : investors.length > 0 ? (
          investors.map((investor) => (
            <InvestorCard key={investor.id} investor={investor} />
          ))
        ) : (
          <p>No investors found.</p>
        )}
      </div>
    </div>
  );
}
