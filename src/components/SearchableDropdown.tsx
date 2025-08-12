import React, { useState, useRef, useEffect, ReactNode } from 'react';

// Dropdown Component
interface DropdownProps {
  children?: ReactNode;
  isOpen: boolean;
  target: ReactNode;
  onClose: () => void;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ children, isOpen, target, onClose, className = '' }) => {
  return (
    <div className="relative">
      {target}
      {isOpen && (
        <>
          {/* Menu */}
          <div className={`absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[250px] max-h-[300px] overflow-hidden ${className}`}>
            {children}
          </div>
          {/* Blanket to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
        </>
      )}
    </div>
  );
};

// Search Icon Component
const SearchIcon = () => (
  <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.625 16.25C12.56 16.25 15.75 13.06 15.75 9.125C15.75 5.18997 12.56 2 8.625 2C4.68997 2 1.5 5.18997 1.5 9.125C1.5 13.06 4.68997 16.25 8.625 16.25Z" stroke="#787F89" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 17L15 15.5" stroke="#787F89" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Chevron Down Icon Component
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

// Checkbox Component
const Checkbox = ({ checked }: { checked: boolean }) => (
  <div
    className={`
      flex items-center justify-center mr-3
      ${checked ? 'bg-[rgba(205,248,219,0.80)]' : 'bg-white border border-gray-300'}
    `}
    style={{
      borderRadius: '6px',
      width: '18px',
      height: '18px',
      flexShrink: 0,
    }}
  >
    {checked && (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="green"
        strokeWidth="3"
      >
        <polyline points="20,6 9,17 4,12" />
      </svg>
    )}
  </div>
);



// Searchable Dropdown Component
interface SearchableDropdownProps {
  options: { label: string; value: string }[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder: ReactNode;
  isMulti?: boolean;
  onSearch?: (searchTerm: string, type: string) => void;
  searchType?: string;
  className?: string;
  disabled?: boolean;
  enableSearch?: boolean; // New prop to enable/disable search functionality
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  isMulti = false,
  onSearch,
  searchType = '',
  className = '',
  disabled = false,
  enableSearch = true // Default to true for backward compatibility
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update filtered options when options change
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    if (onSearch && searchType) {
      onSearch(newSearchTerm, searchType);
    }
  };

  // Handle option selection
  const handleOptionSelect = (selectedOption: { label: string; value: string }) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.includes(selectedOption.value);
      
      if (isSelected) {
        // Remove from selection
        const newValues = currentValues.filter(v => v !== selectedOption.value);
        onChange(newValues);
      } else {
        // Add to selection
        onChange([...currentValues, selectedOption.value]);
      }
    } else {
      onChange(selectedOption.value);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Open dropdown and focus search input
  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Close dropdown and clear search
  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  // Get display value
  const getDisplayValue = () => {
    if (isMulti) {
      const selectedValues = Array.isArray(value) ? value : [];
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option ? (
          <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
            {typeof placeholder === 'object' && React.isValidElement(placeholder) ? 
              React.cloneElement(placeholder as React.ReactElement) : placeholder}
          </div>
        ) : placeholder;
      }
      return (
        <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
          {typeof placeholder === 'object' && React.isValidElement(placeholder) ? 
            React.cloneElement(placeholder as React.ReactElement, {}, 
              `${selectedValues.length} selected`) : 
            `${selectedValues.length} selected`}
        </div>
      );
    } else {
      const selectedOption = options.find(opt => opt.value === value);
      if (selectedOption) {
        return (
          <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
            {typeof placeholder === 'object' && React.isValidElement(placeholder) ? 
              React.cloneElement(placeholder as React.ReactElement, {}, selectedOption.label) : 
              selectedOption.label}
          </div>
        );
      }
      return placeholder;
    }
  };

  // Check if option is selected
  const isOptionSelected = (optionValue: string) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      return currentValues.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={handleClose}
      className={className}
      target={
        <button
          onClick={handleOpen}
          disabled={disabled}
          className={`
            flex items-center justify-between w-auto px-2 py-1 
            border border-[#EDEEEF] rounded-[10px] bg-white text-sm font-medium
            hover:border-gray-300 focus:outline-none focus:border-blue-500
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${isOpen ? 'border-blue-500' : ''}
          `}
        >
          <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
            {getDisplayValue()}
          </div>
          <ChevronDownIcon />
        </button>
      }
    >
      <div className="p-2">
        {/* Search Input - Only show if enableSearch is true */}
        {enableSearch && (
          <div className="relative mb-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search..."
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Options List */}
        <div className="max-h-[200px] overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleOptionSelect(option)}
                className={`
                  px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 rounded
                  ${isOptionSelected(option.value) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                `}
              >
                <div className="flex items-center">
                  {/* Show checkbox for multi-select, nothing for single-select */}
                  {isMulti && (
                    <Checkbox checked={isOptionSelected(option.value)} />
                  )}
                  <span className="flex-1">{option.label}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Dropdown>
  );
};

export default SearchableDropdown;