'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '../../lib/api';
import InvestorCard from '@components/InvestorCard';
import Pagination from '@components/Pagination';
import LocationFilter from '@components/LocationFilter';
import InvestmentFilter from '@components/InvestmentFilter';

type Filters = {
  country: string;
  state: string;
  city: string;
  investmentStage: string[];
  investmentFocus: string[];
  investmentType: string[];
  pastInvestment: string[]; // Added pastInvestment to the filters
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
  pipelines?: Pipeline[]; // specify the type of each pipeline here
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
  const [searchQuery, setSearchQuery] = useState('');
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
    pastInvestment: [], // Ensure pastInvestment is included
  });

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
  }, [currentPage, searchQuery, filters, itemsPerPage]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
        />
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-6 mb-10">
        <LocationFilter
          filters={{ country: filters.country, state: filters.state, city: filters.city }}
          setFilters={(location) => setFilters({ ...filters, ...location })}
        />
        <InvestmentFilter
          investmentFilters={{
            investmentStage: filters.investmentStage,
            investmentFocus: filters.investmentFocus,
            investmentType: filters.investmentType,
            pastInvestment: filters.pastInvestment, // Pass pastInvestment filter
          }}
          setInvestmentFilters={(value) => setFilters({ ...filters, ...value })}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {/* Investor Cards */}
      <div className="flex flex-col gap-8">
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
