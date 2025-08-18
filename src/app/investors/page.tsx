'use client';

import { useState, useEffect, useRef } from 'react';
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

  // Ref to track if filters have been restored
  const filtersRestoredRef = useRef(false);

  // Initialize filters - always start with defaults
  const getInitialFilters = (): Filters => {
    return {
      city: '',
      state: '',
      country: '',
      investmentStage: [],
      investmentFocus: [],
      investmentType: [],
      pastInvestment: [],
    };
  };

  const [filters, setFilters] = useState<Filters>(getInitialFilters);

  // Separate search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Monitor filter changes for debugging
  useEffect(() => {
    console.log('Filters state changed:', filters);
    console.log('Current URL:', window.location.href);
  }, [filters]);

  // Monitor currentPage changes for debugging
  useEffect(() => {
    console.log('Current page changed:', currentPage);
  }, [currentPage]);

  // Handle filter restoration when coming back from detail page
  useEffect(() => {
    // Use a small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && !filtersRestoredRef.current) {
        // Check if we have URL parameters (coming back from detail page)
        const urlParams = new URLSearchParams(window.location.search);
        const urlFilters = urlParams.get('filters');
        const urlPage = urlParams.get('page');
        
        console.log('Checking URL parameters:', { urlFilters, urlPage });
        console.log('Current filters state:', filters);
        console.log('Filters already restored:', filtersRestoredRef.current);
        
        if (urlFilters) {
          try {
            const restoredFilters = JSON.parse(decodeURIComponent(urlFilters));
            console.log('Restoring filters:', restoredFilters);
            setFilters(restoredFilters);
            filtersRestoredRef.current = true;
            
            // Set the page if it exists
            if (urlPage) {
              const page = parseInt(urlPage);
              if (!isNaN(page) && page > 0) {
                console.log('Restoring page:', page);
                setCurrentPage(page);
              }
            }
            
            // Clear the URL parameters after restoring
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
            console.log('Cleared URL parameters');
          } catch (e) {
            console.warn('Failed to parse URL filters:', e);
          }
        } else {
          console.log('No URL filters found, keeping default filters');
          filtersRestoredRef.current = true; // Mark as processed even if no filters
        }
      }
    }, 100); // Small delay to ensure component is ready

    return () => clearTimeout(timer);
  }, []); // Only run once when component mounts

  // Handle page parameter changes
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
  }, [currentPage]); // Run when currentPage changes

  // Update filters when they change
  const updateFilters = (newFilters: Partial<Filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    
    // Only update if filters actually changed
    if (JSON.stringify(updatedFilters) !== JSON.stringify(filters)) {
      console.log('Updating filters from:', filters, 'to:', updatedFilters);
      setFilters(updatedFilters);
      
      // Reset to first page when filters change
      setCurrentPage(1);
    } else {
      console.log('Filters unchanged, skipping update');
    }
  };

  // Update page in URL and state
  const updatePage = (page: number) => {
    setCurrentPage(page);
  };

  // Wrapper for setCurrentPage that matches React.Dispatch type
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
      const url = getApiUrl(
        `/api/investors?page=${currentPage}&itemsPerPage=${itemsPerPage}&search=${searchQuery}&filters=${encodeURIComponent(JSON.stringify(filters))}`
      );
      
      const res = await fetch(url,{
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      
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

  // Helper function to check if any filters are active
  const hasActiveFilters = () => {
    return (
      filters.investmentStage.length > 0 ||
      filters.investmentFocus.length > 0 ||
      filters.investmentType.length > 0 ||
      filters.pastInvestment.length > 0 ||
      filters.country !== '' ||
      filters.state !== '' ||
      filters.city !== ''
    );
  };

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
          setFilters={updateFilters}
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
            <InvestorCard 
              key={investor.id} 
              investor={investor}
              appliedFilters={filters}
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
          maxButtons={7}     // tweak if you want fewer/more buttons
          showEdges={true}
          totalItems={pagination.totalItems}   // show 1 and last with ellipses
        />
      </div>
    </div>
  );
}
