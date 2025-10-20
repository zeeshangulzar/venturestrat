'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Select, { ActionMeta, SingleValue } from 'react-select';

type OptionType = {
  value: number;
  label: string;
};

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

type PaginationProps = {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalItems: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchDebounceDelay?: number; // Optional debounce delay in milliseconds
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  totalPages,
  totalItems,
  searchQuery = '',
  onSearchChange,
  searchDebounceDelay = 500, // Default 500ms delay
}) => {
  const [isClient, setIsClient] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounce the search query with configurable delay
  const debouncedSearchQuery = useDebounce(localSearchQuery, searchDebounceDelay);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update the parent component when debounced value changes
  useEffect(() => {
    if (onSearchChange && debouncedSearchQuery !== searchQuery) {
      onSearchChange(debouncedSearchQuery);
      setIsSearching(false);
    }
  }, [debouncedSearchQuery, onSearchChange, searchQuery]);

  // Update local state when searchQuery prop changes (e.g., from external filters)
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearchQuery(value);
    setIsSearching(true);
  }, []);

  // Options for the items per page dropdown
  const itemsPerPageOptions: OptionType[] = [
    { value: 20, label: '20 Per Page' },
    { value: 50, label: '50 Per Page' },
    { value: 100, label: '100 Per Page' },
  ];

  // Handle select change with proper typing
  const handleItemsPerPageChange = (
    selected: SingleValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => {
    if (selected && selected.value) {
      setItemsPerPage(selected.value);
    }
  };

  return (
    <div className="w-full bg-white border-t border-b border-[#EDEEEF] px-5 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Fundraising title */}
        <div className="flex items-center">
          <h2 className="text-[18px] font-bold text-gray-900">Investor Directory</h2>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-4">
          {/* Search Box */}
          {onSearchChange && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search investors..."
                value={localSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-64 px-4 py-2 pl-10 pr-4 text-sm border border-[#EDEEEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                ) : (
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* Profiles Label */}
          <span className="text-sm text-gray-500">Profiles:</span>

          {/* Per Page Dropdown */}
          <div className="mn-w-[125px]">
            {isClient ? (
              <Select<OptionType>
                isMulti={false}
                options={itemsPerPageOptions}
                value={itemsPerPageOptions.find(option => option.value === itemsPerPage)}
                onChange={handleItemsPerPageChange}
                components={{ IndicatorSeparator: () => null }}
                classNamePrefix="react-select"
                isSearchable={false}
                instanceId="items-per-page-select"
                menuPlacement="auto"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    minHeight: '40px',
                    boxShadow: 'none',
                    width: 'fit-content',
                    '&:hover': {
                      borderColor: '#9ca3af',
                    },
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
                    color: state.isSelected ? 'white' : '#374151',
                    '&:hover': {
                      backgroundColor: state.isSelected ? '#3b82f6' : '#f3f4f6',
                    },
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: '#374151',
                    fontSize: '0.875rem',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }),
                }}
              />
            ) : (
              <div className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse"></div>
            )}
          </div>

          {/* View Label */}
          {/* <span className="text-sm text-gray-500">View:</span> */}

          {/* View Mode Selector */}
          {/* <div className="flex bg-gray-100 rounded-lg p-1"> */}
            {/* Grid View Icon */}
            {/* <button className="p-2 rounded-md hover:bg-gray-200 transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button> */}
            
            {/* List View Icon (Active) */}
            {/* <button className="p-2 rounded-md bg-white shadow-sm transition-colors">
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button> */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

export default Pagination;