'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { getApiUrl } from '@lib/api';
import InvestorCard from '@components/InvestorCard';
import Pagination from '@components/Pagination';
import InvestorFilter from '@components/InvestorFilter';
import PaginationNumbers from '@components/PaginationNumbers';

type Filters = {
  country: string;
  state: string;
  city: string;
  investmentStage: string[];
  investmentFocus: string[];
  investmentType: string[];
  pastInvestment: string[];
};
type Investor = {
  id: string;
  name: string;
  avatar?: string;
  website?: string;
  phone?: string;
  title?: string;
  social_links?: { [key: string]: string };
  city: string;
  state: string;
  country: string;
  companyName?:  string;
  emails: Array<{ id: string; email: string; status: string }>;
  investorTypes: string[];
  stages: string[];
  markets: Array<{ market: { id: string; title: string } }>;
  pastInvestments: Array<{ pastInvestment: { id: string; title: string } }>;
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

export default function FundraisingInvestorsPage() {
  const { user } = useUser();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [shortlistedInvestorIds, setShortlistedInvestorIds] = useState<Set<string>>(new Set());
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

  const filtersRestoredRef = useRef(false);

  const getInitialFilters = (): Filters => ({
    city: '',
    state: '',
    country: '',
    investmentStage: [],
    investmentFocus: [],
    investmentType: [],
    pastInvestment: [],
  });

  const [filters, setFilters] = useState<Filters>(getInitialFilters);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('Filters state changed:', filters);
    console.log('Current URL:', window.location.href);
  }, [filters]);

  useEffect(() => {
    console.log('Current page changed:', currentPage);
  }, [currentPage]);

  // restore filters/page from URL (when coming back from show page)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && !filtersRestoredRef.current) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlFilters = urlParams.get('filters');
        const urlPage = urlParams.get('page');

        if (urlFilters) {
          try {
            const restoredFilters = JSON.parse(decodeURIComponent(urlFilters));
            setFilters(restoredFilters);
            filtersRestoredRef.current = true;

            if (urlPage) {
              const page = parseInt(urlPage);
              if (!isNaN(page) && page > 0) setCurrentPage(page);
            }

            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          } catch (e) {
            console.warn('Failed to parse URL filters:', e);
          }
        } else {
          filtersRestoredRef.current = true;
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPage = urlParams.get('page');
      if (urlPage) {
        const page = parseInt(urlPage);
        if (!isNaN(page) && page > 0 && page !== currentPage) {
          setCurrentPage(page);
        }
      }
    }
  }, [currentPage]);

  const updateFilters = (newFilters: Partial<Filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    if (JSON.stringify(updatedFilters) !== JSON.stringify(filters)) {
      setFilters(updatedFilters);
      setCurrentPage(1);
    }
  };

  const updatePage = (page: number) => setCurrentPage(page);

  const setCurrentPageWrapper = (value: React.SetStateAction<number>) => {
    if (typeof value === 'function') {
      const newPage = value(currentPage);
      updatePage(newPage);
    } else {
      updatePage(value);
    }
  };

  const fetchInvestors = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch both investors and shortlist data simultaneously
      const [investorsRes, shortlistRes] = await Promise.all([
        fetch(getApiUrl(
          `/api/investors?page=${currentPage}&itemsPerPage=${itemsPerPage}&search=${encodeURIComponent(
            searchQuery
          )}&filters=${encodeURIComponent(JSON.stringify(filters))}`
        ), {
          method: 'GET',
          headers: { 'ngrok-skip-browser-warning': 'true' },
        }),
        user?.id ? fetch(getApiUrl(`/api/shortlists/${user.id}`), {
          method: 'GET',
          headers: { 'ngrok-skip-browser-warning': 'true' },
        }) : Promise.resolve(null)
      ]);

      if (!investorsRes.ok) throw new Error(`HTTP error! status: ${investorsRes.status}`);

      const investorsData: ApiResponse = await investorsRes.json();
      setInvestors(investorsData.investors || []);
      setPagination(investorsData.pagination);

      // Process shortlist data if user is logged in
      if (shortlistRes && shortlistRes.ok) {
        const shortlistData: { investor: { id: string } }[] = await shortlistRes.json();
        const shortlistedIds = new Set(shortlistData.map(entry => entry.investor.id));
        setShortlistedInvestorIds(shortlistedIds);
      } else {
        setShortlistedInvestorIds(new Set());
      }
    } catch (err) {
      console.error('Error fetching investors:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setInvestors([]);
      setShortlistedInvestorIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, [currentPage, filters, itemsPerPage, searchQuery]);

  const hasActiveFilters = () =>
    filters.investmentStage.length > 0 ||
    filters.investmentFocus.length > 0 ||
    filters.investmentType.length > 0 ||
    filters.pastInvestment.length > 0 ||
    filters.country !== '' ||
    filters.state !== '' ||
    filters.city !== '';

  return (
    <div className="mx-auto">
      {/* Pagination Header */}
      <div className="flex justify-between items-center">
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPageWrapper}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
        />
      </div>

      {/* Filters */}
      <div>
        <InvestorFilter
          filters={{
            country: filters.country,
            state: filters.state,
            city: filters.city,
            investmentStage: filters.investmentStage, // StageEnum values (strings)
            investmentFocus: filters.investmentFocus, // Market titles
            investmentType: filters.investmentType,   // InvestorType values (strings)
            pastInvestment: filters.pastInvestment,   // Past investment titles
          }}
          setFilters={updateFilters}
        />
      </div>

      {/* Error */}
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
            <InvestorCard
              key={investor.id}
              investor={investor}
              appliedFilters={filters}
              basePath="/fundraising/investors"
              isShortlisted={shortlistedInvestorIds.has(investor.id)}
              onShortlistChange={(investorId, shortlisted) => {
                setShortlistedInvestorIds(prev => {
                  const newSet = new Set(prev);
                  if (shortlisted) {
                    newSet.add(investorId);
                  } else {
                    newSet.delete(investorId);
                  }
                  return newSet;
                });
              }}
            />
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

      {/* Footer pager */}
      <div className="border-t border-[#EDEEEF] bg-white">
        <PaginationNumbers
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={updatePage}
          maxButtons={7}
          showEdges={true}
          totalItems={pagination.totalItems}
        />
      </div>
    </div>
  );
}
