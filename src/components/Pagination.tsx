// components/Pagination.tsx
import React from 'react';
import ClientSelect from './ClientSelect';

type PaginationProps = {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalItems: number;
};

const Pagination: React.FC<PaginationProps> = ({ currentPage, setCurrentPage, itemsPerPage, setItemsPerPage, totalPages, totalItems }) => {
  const handleNext = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  // Options for the items per page dropdown
  const itemsPerPageOptions = [
    { value: 20, label: '20 Per Page' },
    { value: 50, label: '50 Per Page' },
    { value: 100, label: '100 Per Page' },
  ];

  return (
    <div className="w-full bg-white border-t border-b border-[#EDEEEF] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Fundraising title */}
        <div className="flex items-center">
          <h2 className="text-lg font-bold text-gray-900">Fundraising</h2>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-4">
          {/* Select All */}
          <div className="flex items-center gap-2 border border-[#EDEEEF] rounded-lg px-3 py-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Select All</span>
          </div>

          {/* Profiles Label */}
          <span className="text-sm text-gray-500">Profiles:</span>

          {/* Per Page Dropdown */}
          <div className="w-32">
            <ClientSelect
              isMulti={false}
              options={itemsPerPageOptions}
              value={itemsPerPageOptions.find(option => option.value === itemsPerPage)}
              onChange={(selected: any) => {
                if (selected && !Array.isArray(selected) && selected.value) {
                  setItemsPerPage(selected.value);
                }
              }}
              classNamePrefix="react-select"
              placeholder="Select..."
              isSearchable={false}
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  minHeight: '40px',
                  boxShadow: 'none',
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
          </div>

          {/* View Label */}
          <span className="text-sm text-gray-500">View:</span>

          {/* View Mode Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {/* Grid View Icon */}
            <button className="p-2 rounded-md hover:bg-gray-200 transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            
            {/* List View Icon (Active) */}
            <button className="p-2 rounded-md bg-white shadow-sm transition-colors">
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
