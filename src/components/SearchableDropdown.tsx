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
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const targetRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && targetRef.current && menuRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // Check if there's enough space below
      const spaceBelow = viewportHeight - targetRect.bottom;
      const spaceAbove = targetRect.top;
      
      // If not enough space below but enough above, open upward
      if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={targetRef}>
      {target}
      {isOpen && (
        <>
          {/* Menu */}
          <div 
            ref={menuRef}
            className={`
              absolute z-50 min-w-[250px] overflow-hidden 
              ${position === 'bottom' ? 'mt-2 top-full' : 'mb-2 bottom-full'}
              ${className || 'bg-white border border-gray-200 rounded-lg shadow-lg'}
            `}
          >
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
const Checkbox = ({ checked, isDarkTheme = false, isOnboarding = false }: { checked: boolean; isDarkTheme?: boolean; isOnboarding?: boolean }) => (
  <div
    className={`
      flex items-center justify-center mr-3
      ${checked ? (isOnboarding ? '' : 'bg-[rgba(205,248,219,0.80)]') : ''}
      ${isDarkTheme ? 'bg-[#0C111D] border border-[#ffffff1a]' : 'bg-white border border-gray-300'}
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
        stroke={isOnboarding ? "white" : "green"}
        strokeWidth="3"
      >
        <polyline points="20,6 9,17 4,12" />
      </svg>
    )}
  </div>
);

// Searchable Dropdown Component
interface SearchableDropdownProps {
  options: { label: string; value: string; disabled?: boolean; key?: string }[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder: ReactNode;
  isMulti?: boolean;
  onSearch?: (searchTerm: string, type: string) => void;
  searchType?: string;
  className?: string;
  disabled?: boolean;
  enableSearch?: boolean;
  showApplyButton?: boolean;
  onOpen?: () => void; // New prop for handling dropdown open
  buttonClassName?: string; // New prop for custom button styling
  dropdownClassName?: string; // New prop for custom dropdown styling
  isOnboarding?: boolean; // New prop for onboarding page
  showSelectedValues?: boolean; // New prop to show comma-separated values instead of count
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
  enableSearch = true,
  showApplyButton = false, // Default to false for backward compatibility
  onOpen, // New onOpen callback
  buttonClassName, // New prop for custom button styling
  dropdownClassName, // New prop for custom dropdown styling
  isOnboarding, // New isOnboarding prop
  showSelectedValues = false // New prop to show comma-separated values instead of count
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [tempValue, setTempValue] = useState<string | string[]>(value); // Temporary value for apply button mode
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update temp value when actual value changes
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  // Update filtered options when options or selection change
  useEffect(() => {
    // Helper to get selected values (respects apply mode)
    const getSelectedValues = (): string[] => {
      const current = value;
      if (Array.isArray(current)) return current;
      if (typeof current === 'string' && current) return [current];
      return [];
    };

    // Helper to reorder options with selected values on top
    const reorderWithSelectedOnTop = (
      inputOptions: { label: string; value: string }[],
      selectedValues: string[]
    ) => {
      if (!selectedValues || selectedValues.length === 0) return inputOptions;
      const selectedSet = new Set(selectedValues);
      const selected: { label: string; value: string }[] = [];
      const unselected: { label: string; value: string }[] = [];
      for (const opt of inputOptions) {
        if (selectedSet.has(opt.value)) selected.push(opt);
        else unselected.push(opt);
      }
      return [...selected, ...unselected];
    };

    const selectedValues = getSelectedValues();

    if (searchTerm.trim() === '') {
      setFilteredOptions(reorderWithSelectedOnTop(options, selectedValues));
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(reorderWithSelectedOnTop(filtered, selectedValues));
    }
  }, [options, value, searchTerm]);

  // No-op: filtering is handled in the options/selection effect above

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    if (onSearch && searchType) {
      onSearch(newSearchTerm, searchType);
    }
  };

  // Handle option selection
  const handleOptionSelect = (selectedOption: { label: string; value: string; disabled?: boolean }) => {
    // Don't allow selection of disabled options
    if (selectedOption.disabled) {
      return;
    }
    if (showApplyButton) {
      // In apply button mode, update temp value instead of actual value
      if (isMulti) {
        const currentValues = Array.isArray(tempValue) ? tempValue : [];
        const isSelected = currentValues.includes(selectedOption.value);
        
        if (isSelected) {
          const newValues = currentValues.filter(v => v !== selectedOption.value);
          setTempValue(newValues);
        } else {
          setTempValue([...currentValues, selectedOption.value]);
        }
      } else {
        setTempValue(selectedOption.value);
      }
    } else {
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
    }
  };

  // Handle apply button click
  const handleApply = () => {
    onChange(tempValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle cancel button click
  const handleCancel = () => {
    setTempValue(value); // Reset temp value to actual value
    setIsOpen(false);
    setSearchTerm('');
  };

  // Open dropdown and focus search input
  const handleOpen = () => {
    if (disabled) return;
    
    // Call the onOpen callback if provided
    if (onOpen) {
      onOpen();
    }
    
    setIsOpen(true);
    setSearchTerm('');
    if (onSearch && searchType) onSearch('', searchType); // restore originals in parent
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Close dropdown and clear search
  const handleClose = () => {
    if (showApplyButton) {
      setTempValue(value); // reset temp selection if user didn't apply
    }
    setIsOpen(false);
    setSearchTerm('');
    if (onSearch && searchType) onSearch('', searchType); // important
  };

  // Get display value
  const getDisplayValue = () => {
    const displayValue = showApplyButton ? tempValue : value;

    if (isMulti) {
      const selectedValues = Array.isArray(displayValue) ? displayValue : [];
      if (selectedValues.length === 0) return placeholder;
      
      // If showSelectedValues is true, display comma-separated values with cap
      if (showSelectedValues && selectedValues.length > 0) {
        const selectedLabels = selectedValues.map(value => {
          const option = options.find(opt => opt.value === value);
          return option ? option.label : value;
        });

        const MAX_TO_DISPLAY = 4;
        const visible = selectedLabels.slice(0, MAX_TO_DISPLAY);
        const hiddenCount = selectedLabels.length - visible.length;
        const displayText = hiddenCount > 0
          ? `${visible.join(', ')} +${hiddenCount} more`
          : visible.join(', ');

        return (
          <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            {typeof placeholder === 'object' && React.isValidElement(placeholder)
              ? React.cloneElement(placeholder as React.ReactElement, {}, displayText)
              : displayText}
          </div>
        );
      }
      
      // Default behavior: show count for multiple selections
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option ? (
          <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
            {typeof placeholder === 'object' && React.isValidElement(placeholder)
              ? React.cloneElement(placeholder as React.ReactElement, {}, option.label)
              : option.label}
          </div>
        ) : placeholder;
      }
      return (
        <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
          {typeof placeholder === 'object' && React.isValidElement(placeholder)
            ? React.cloneElement(placeholder as React.ReactElement, {}, `${selectedValues.length} selected`)
            : `${selectedValues.length} selected`}
        </div>
      );
    } else {
      const selectedOption = options.find(opt => opt.value === displayValue);
      if (selectedOption) {
        return (
          <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
            {typeof placeholder === 'object' && React.isValidElement(placeholder)
              ? React.cloneElement(placeholder as React.ReactElement, {}, selectedOption.label)
              : selectedOption.label}
          </div>
        );
      }
      return placeholder;
    }
  };

  // Check if option is selected
  const isOptionSelected = (optionValue: string) => {
    const checkValue = showApplyButton ? tempValue : value;
    
    if (isMulti) {
      const currentValues = Array.isArray(checkValue) ? checkValue : [];
      return currentValues.includes(optionValue);
    }
    return checkValue === optionValue;
  };

  // Check if there are changes to apply
  const hasChanges = () => {
    if (!showApplyButton) return false;
    
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      const tempValues = Array.isArray(tempValue) ? tempValue : [];
      
      if (currentValues.length !== tempValues.length) return true;
      return currentValues.some(v => !tempValues.includes(v)) || 
             tempValues.some(v => !currentValues.includes(v));
    } else {
      return value !== tempValue;
    }
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={handleClose}
      className={dropdownClassName}
      target={
        <button
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className={`
            flex items-center justify-between w-full h-[42px] px-3 py-2 
            ${buttonClassName || 'border border-gray-200 rounded-[10px] bg-white text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:border-blue-500'}
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
              className={`w-full pl-10 pr-3 py-2 border rounded-[10px] text-sm focus:outline-none focus:border-blue-500 ${
                dropdownClassName ? 'border-[#ffffff1a] bg-[#0C111D] text-white placeholder-[#a5a6ac]' : 'border-gray-200 bg-white text-gray-700 placeholder-gray-400'
              }`}
            />
          </div>
        )}

        {/* Options List */}
        <div className="max-h-[200px] overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className={`px-3 py-2 text-sm ${
              dropdownClassName ? 'text-[#a5a6ac]' : 'text-gray-500'
            }`}>
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.key ?? option.value}
                onClick={() => !option.disabled && handleOptionSelect(option)}
                className={`
                  px-3 py-2 text-sm rounded mb-1
                  ${option.disabled 
                    ? 'cursor-default opacity-50' 
                    : 'cursor-pointer'
                  }
                  ${isOptionSelected(option.value) 
                    ? 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]' 
                    : dropdownClassName 
                      ? 'hover:bg-[#ffffff0a] text-white' 
                      : 'hover:bg-[#EDEEEF] text-gray-700'
                  }
                `}
              >
                <div className="flex items-center">
                  {/* Show checkbox for multi-select, nothing for single-select */}
                  {isMulti && !option.disabled && (
                    <Checkbox checked={isOptionSelected(option.value)} isDarkTheme={!!dropdownClassName} isOnboarding={isOnboarding} />
                  )}
                  <span className="flex-1">{option.label}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Apply/Cancel Buttons - Only show if showApplyButton is true */}
        {showApplyButton && (
          <div className={`flex gap-2 mt-3 pt-2 border-t ${
            dropdownClassName ? 'border-[#ffffff1a]' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={handleApply}
              disabled={!hasChanges()}
              className={`
                w-[-webkit-fill-available] h-[30px] flex-shrink-0 text-sm text-white rounded-[10px] transition-colors
                ${hasChanges()
                  ? 'bg-[#2563EB] hover:bg-blue-700'
                  : 'bg-[#a5a6ac] cursor-not-allowed'
                }
              `}
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </Dropdown>
  );
};

export default SearchableDropdown;