'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@lib/api';
import InvestorCard from '@components/InvestorCard';
import Pagination from '@components/Pagination';
import InvestorFilter from '@components/InvestorFilter';

type Filters = {
  country: string;
  state: string;
  city: string;
  investmentStage: string[];
  investmentFocus: string[];
  investmentType: string[];
  pastInvestment: string[];
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
  social_links?: { [key: string]: string };
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

type ApiResponse = {
  investors: Investor[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
};

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const [filters, setFilters] = useState<Filters>({
    city: '',
    state: '',
    country: '',
    investmentStage: [],
    investmentFocus: [],
    investmentType: [],
    pastInvestment: [],
  });

  // Separate search query state
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInvestors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = getApiUrl(
        `/api/investors?page=${currentPage}&itemsPerPage=${itemsPerPage}&search=${searchQuery}&filters=${encodeURIComponent(JSON.stringify(filters))}`
      );
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data: ApiResponse = await res.json();
      
      setInvestors(data.investors || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching investors:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setInvestors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, [currentPage, filters, itemsPerPage, searchQuery]);

  return (
    <div className="mx-auto">
      {/* Pagination Header */}
      <div className="flex justify-between items-center">
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
        />
      </div>

      {/* Search Input */}
      {/* <div className="mb-6">
        <input
          type="text"
          placeholder="Search investors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div> */}



      {/* Investment Filters */}
      <div>
        <InvestorFilter
          filters={{
            country: filters.country,
            state: filters.state,
            city: filters.city,
            investmentStage: filters.investmentStage,
            investmentFocus: filters.investmentFocus,
            investmentType: filters.investmentType,
            pastInvestment: filters.pastInvestment,
          }}
          setFilters={(newFilters) => 
            setFilters(prev => ({
              ...prev,
              ...newFilters
            }))
          }
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {/* Investor Cards */}
      <div className="flex flex-col p-8 gap-8 bg-[#f5f6fb]">
        {loading ? (
          <p>Loading investors...</p>
        ) : error ? (
          <p className="text-red-600">Failed to load investors. Please try again.</p>
        ) : investors.length > 0 ? (
          investors.map((investor) => (
            <InvestorCard key={investor.id} investor={investor} />
          ))
        ) : (
          <div>
            <p>No investors found.</p>
            <p className="text-sm text-gray-600 mt-2">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
