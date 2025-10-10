'use client';

import { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { getApiUrl } from '@lib/api';
import { Country, State, City } from 'country-state-city';
import React from 'react';

// Import your existing icons
import InvestorTypeIcon from './icons/investorTypeIcon';
import InvestorFocusIcon from './icons/investorFocusIcon';
import InvestorStageIcon from './icons/investorStageIcon';
import MapPinIcon from './icons/mapPinIcon';
import CountryIcon from './icons/countryIcon';
import StateIcon from './icons/stateIcon';

// Import the updated SearchableDropdown component
import SearchableDropdown from './SearchableDropdown'; // Adjust path as needed

type FilterOption = { label: string; value: string };

type InvestorFilters = {
  country: string;
  state: string;
  city: string;
  investmentStage: string[];
  investmentFocus: string[];
  investmentType: string[];
};

type Props = {
  filters: InvestorFilters;
  setFilters: (filters: InvestorFilters) => void;
};

export default function InvestorFilter({ filters, setFilters }: Props) {
  /** Location state */
  const countries = Country.getAllCountries();
  const [states, setStates] = useState(State.getStatesOfCountry(''));
  const [cities, setCities] = useState(City.getCitiesOfState('', ''));

  /** Investment state - original options */
  const [originalInvestmentStages, setOriginalInvestmentStages] = useState<FilterOption[]>([]);
  const [originalInvestmentFocuses, setOriginalInvestmentFocuses] = useState<FilterOption[]>([]);
  const [originalInvestmentTypes, setOriginalInvestmentTypes] = useState<FilterOption[]>([]);

  /** Investment state - current options (filtered or original) */
  const [investmentStages, setInvestmentStages] = useState<FilterOption[]>([]);
  const [investmentFocuses, setInvestmentFocuses] = useState<FilterOption[]>([]);
  const [investmentTypes, setInvestmentTypes] = useState<FilterOption[]>([]);
  
  const [loading, setLoading] = useState(false);

  // Abort controller for cleanup
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Normalize names for robust comparisons
  const normalize = (value?: string) =>
    (value ?? '').toLowerCase().trim();

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /** Load investment filters */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(getApiUrl('/api/investment-filters'), {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const data = await res.json();
        
        const stages = data.stages.map((v: string) => ({ label: v, value: v }));
        const focuses = data.investmentFocuses.map((v: string) => ({ label: v, value: v }));
        const types = data.investmentTypes.map((v: string) => ({ label: v, value: v }));
        
        // Set both original and current options
        setOriginalInvestmentStages(stages);
        setOriginalInvestmentFocuses(focuses);
        setOriginalInvestmentTypes(types);
        
        setInvestmentStages(stages);
        setInvestmentFocuses(focuses);
        setInvestmentTypes(types);
      } catch (err) {
        console.error('Error fetching investment filters:', err);
      }
    })();
  }, []);

  // Sync external filters with internal state
  useEffect(() => {
    console.log('InvestorFilter: External filters changed:', filters);
  }, [filters]);

  /** Handle location changes */
  useEffect(() => {
    if (filters.country) {
      const selectedCountry = countries.find((c) => c.name === filters.country);
      const nextStates = selectedCountry ? State.getStatesOfCountry(selectedCountry.isoCode) : [];
      setStates(nextStates);

      const isExistingStateValid = Boolean(
        filters.state && nextStates.some((s) => normalize(s.name) === normalize(filters.state))
      );

      if (!isExistingStateValid) {
        // Country changed or restored without a valid state; clear dependent fields
        setFilters({ ...filters, state: '', city: '' });
        setCities([]);
      } else {
        // When state remains valid, proactively populate cities to avoid empty dropdowns
        const selectedState = nextStates.find((s) => normalize(s.name) === normalize(filters.state));
        if (selectedCountry && selectedState) {
          const nextCities = City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
          setCities(nextCities);
        }
      }
      // If state remains valid, do not clear state/city here; city handling occurs in the state effect
    } else {
      setStates([]);
      setCities([]);
      if (filters.state || filters.city) {
        setFilters({ ...filters, state: '', city: '' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.country]);

  useEffect(() => {
    if (filters.state && filters.country) {
      const selectedCountry = countries.find((c) => c.name === filters.country);
      const statesForCountry = selectedCountry
        ? State.getStatesOfCountry(selectedCountry.isoCode)
        : [];
      const selectedState = statesForCountry.find((s) => normalize(s.name) === normalize(filters.state));

      if (selectedCountry && selectedState) {
        const nextCities = City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
        setCities(nextCities);
        // Do not auto-clear city; preserve existing selection and ensure it's visible in options
      } else {
        setCities([]);
      }
    } else {
      setCities([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.state, filters.country]);

  // Helper function to merge selected values with search results
  const mergeSelectedWithOptions = (
    searchResults: FilterOption[], 
    selectedValues: string[], 
    originalOptions: FilterOption[]
  ): FilterOption[] => {
    // Create a set of values that are already in search results
    const existingValues = new Set(searchResults.map(option => option.value));
    
    // Find selected options that are not in search results
    const missingSelectedOptions = selectedValues
      .filter(value => !existingValues.has(value))
      .map(value => {
        // Try to find the option in original options first
        const originalOption = originalOptions.find(opt => opt.value === value);
        return originalOption || { label: value, value: value };
      });

    // Combine missing selected options with search results
    // Put selected options at the top for better UX
    return [...missingSelectedOptions, ...searchResults];
  };

  /** Investment search */
  const handleSearch = debounce(async (search: string, type: string) => {
    if (typeof search !== 'string' || !search.trim()) {
      // When search is empty, restore original options but include selected values
      restoreOriginalOptionsWithSelected(type);
      return;
    }

    // For all other types, use local search
    const searchLower = search.toLowerCase();
    let filteredOptions: FilterOption[] = [];

    if (type === 'investmentStages') {
      filteredOptions = originalInvestmentStages.filter(option =>
        option.label.toLowerCase().includes(searchLower)
      );
      const mergedOptions = mergeSelectedWithOptions(filteredOptions, filters.investmentStage, originalInvestmentStages);
      setInvestmentStages(mergedOptions);
    } else if (type === 'investmentFocuses') {
      filteredOptions = originalInvestmentFocuses.filter(option =>
        option.label.toLowerCase().includes(searchLower)
      );
      const mergedOptions = mergeSelectedWithOptions(filteredOptions, filters.investmentFocus, originalInvestmentFocuses);
      setInvestmentFocuses(mergedOptions);
    } else if (type === 'investmentTypes') {
      filteredOptions = originalInvestmentTypes.filter(option =>
        option.label.toLowerCase().includes(searchLower)
      );
      const mergedOptions = mergeSelectedWithOptions(filteredOptions, filters.investmentType, originalInvestmentTypes);
      setInvestmentTypes(mergedOptions);
    }
  }, 300);

  // Restore original options when search is cleared or dropdown is opened
  const restoreOriginalOptions = (type: string) => {
    if (type === 'investmentStages') setInvestmentStages(originalInvestmentStages);
    else if (type === 'investmentFocuses') setInvestmentFocuses(originalInvestmentFocuses);
    else if (type === 'investmentTypes') setInvestmentTypes(originalInvestmentTypes);
  };

  // New function to restore original options while ensuring selected values are visible
  const restoreOriginalOptionsWithSelected = (type: string) => {
    if (type === 'investmentStages') {
      const mergedOptions = mergeSelectedWithOptions(originalInvestmentStages, filters.investmentStage, originalInvestmentStages);
      setInvestmentStages(mergedOptions);
    } else if (type === 'investmentFocuses') {
      const mergedOptions = mergeSelectedWithOptions(originalInvestmentFocuses, filters.investmentFocus, originalInvestmentFocuses);
      setInvestmentFocuses(mergedOptions);
    } else if (type === 'investmentTypes') {
      const mergedOptions = mergeSelectedWithOptions(originalInvestmentTypes, filters.investmentType, originalInvestmentTypes);
      setInvestmentTypes(mergedOptions);
    }
  };

  /** Location options */
  const countryOptions = countries.map((c) => ({ label: c.name, value: c.name }));
  const stateOptions = (() => {
    const base = states.map((s) => ({ label: s.name, value: s.name }));
    if (filters.state && !base.some((opt) => normalize(opt.value) === normalize(filters.state))) {
      return [{ label: filters.state, value: filters.state }, ...base];
    }
    return base;
  })();

  const cityOptions = (() => {
    const base = cities.map((c) => ({ label: c.name, value: c.name }));
    if (filters.city && !base.some((opt) => normalize(opt.value) === normalize(filters.city))) {
      return [{ label: filters.city, value: filters.city }, ...base];
    }
    return base;
  })();

  return (
    <div className="investor-filters flex flex-wrap gap-[11px] bg-white items-center border-b border-[#EDEEEF] py-[24px] px-5">
      <span className="font-manrope font-semibold text-base">Filters:</span>

      {/* Investor Type - Using SearchableDropdown with Apply Button */}
      <div className="flex-shrink-0 min-w-fit">
        <SearchableDropdown
          isMulti
          options={investmentTypes}
          value={filters.investmentType}
          onChange={(value) => setFilters({
            ...filters,
            investmentType: Array.isArray(value) ? value : []
          })}
          placeholder={
            <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
              <InvestorTypeIcon />
              <span className="">Investor Type</span>
            </div>
          }
          onSearch={handleSearch}
          searchType="investmentTypes"
          showApplyButton={true} // Enable apply button for multi-select
          onOpen={() => restoreOriginalOptionsWithSelected('investmentTypes')}
        />
      </div>

      {/* Investment Focus - Using SearchableDropdown with Apply Button */}
      <div className="flex-shrink-0 min-w-fit">
        <SearchableDropdown
          isMulti
          options={investmentFocuses}
          value={filters.investmentFocus}
          onChange={(value) => setFilters({
            ...filters,
            investmentFocus: Array.isArray(value) ? value : []
          })}
          placeholder={
            <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
              <InvestorFocusIcon />
              <span>Investment Focus</span>
            </div>
          }
          onSearch={handleSearch}
          searchType="investmentFocuses"
          showApplyButton={true} // Enable apply button for multi-select
          onOpen={() => restoreOriginalOptionsWithSelected('investmentFocuses')}
        />
      </div>

      {/* Country - Single select with immediate change (no apply button needed) */}
      <div className="flex-shrink-0 min-w-fit">
        <SearchableDropdown
          isMulti={false}
          options={[{ label: 'Select', value: '__ALL__' }, ...countryOptions]}
          value={filters.country}
          onChange={(val) => {
            const v = Array.isArray(val) ? '' : val;
            if (v === '__ALL__' || !v) {
              setFilters({ ...filters, country: '', state: '', city: '' });
            } else {
              setFilters({ ...filters, country: v, state: '', city: '' });
            }
          }}
          placeholder={
            <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
              <CountryIcon />
              <span className="">Country</span>
            </div>
          }
          enableSearch={true}
          showApplyButton={false} // No apply button for single select
        />
      </div>

      {/* State - Single select with immediate change (no apply button needed) */}
      <div className="flex-shrink-0 min-w-fit">
        <SearchableDropdown
          isMulti={false}
          options={[{ label: 'Select', value: '__ALL__' }, ...stateOptions]}
          value={filters.state}
          onChange={(val) => {
            const v = Array.isArray(val) ? '' : val;
            if (v === '__ALL__' || !v) {
              setFilters({ ...filters, state: '', city: '' });
            } else {
              setFilters({ ...filters, state: v, city: '' });
            }
          }}
          placeholder={
            <div className="flex items-center whitespace-nowrap text-[14px] font-manrope font-medium">
              <StateIcon />
              <span className="">State Name</span>
            </div>
          }
          disabled={!filters.country}
          enableSearch={true}
          showApplyButton={false} // No apply button for single select
        />
      </div>

      {/* City - Single select with immediate change (no apply button needed) */}
      <div className="flex-shrink-0 min-w-fit">
        <SearchableDropdown
          isMulti={false}
          options={[{ label: 'Select', value: '__ALL__' }, ...cityOptions]}
          value={filters.city}
          onChange={(val) => {
            const v = Array.isArray(val) ? '' : val;
            if (v === '__ALL__' || !v) {
              setFilters({ ...filters, city: '' });
            } else {
              setFilters({ ...filters, city: v });
            }
          }}
          placeholder={
            <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
              <MapPinIcon />
              <span className="">City</span>
            </div>
          }
          disabled={!filters.state}
          enableSearch={true}
          showApplyButton={false} // No apply button for single select
        />
      </div>

      {/* Investment Stage - Using SearchableDropdown with Apply Button */}
      <div className="flex-shrink-0 min-w-fit">
        <SearchableDropdown
          isMulti
          options={investmentStages}
          value={filters.investmentStage}
          onChange={(value) => setFilters({
            ...filters,
            investmentStage: Array.isArray(value) ? value : []
          })}
          placeholder={
            <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
              <InvestorStageIcon />
              <span className="">Investment Stage</span>
            </div>
          }
          onSearch={handleSearch}
          searchType="investmentStages"
          showApplyButton={true} // Enable apply button for multi-select
          onOpen={() => restoreOriginalOptionsWithSelected('investmentStages')}
        />
      </div>
    </div>
  );
}