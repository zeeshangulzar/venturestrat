'use client';

import { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { getApiUrl } from '@lib/api';
import { Country, State, City } from 'country-state-city';
import ClientSelect from './ClientSelect';
import React from 'react';

import InvestorTypeIcon from './icons/investorTypeIcon';
import InvestorFocusIcon from './icons/investorFocusIcon';
import InvestorStageIcon from './icons/investorStageIcon';
import PastInvestmentIcon from './icons/pastInvestmentIcon';
import MapPinIcon from './icons/mapPinIcon';
import CountryIcon from './icons/countryIcon';
import StateIcon from './icons/stateIcon';

type FilterOption = { label: string; value: string };

type InvestorFilters = {
  country: string;
  state: string;
  city: string;
  investmentStage: string[];
  investmentFocus: string[];
  investmentType: string[];
  pastInvestment: string[];
};

type Props = {
  filters: InvestorFilters;
  setFilters: (filters: InvestorFilters) => void;
};

function isOptionArray(x: unknown): x is readonly FilterOption[] {
  return (
    Array.isArray(x) &&
    x.every(
      (o) =>
        o &&
        typeof o === 'object' &&
        'label' in o &&
        'value' in o &&
        typeof (o as { label: unknown }).label === 'string' &&
        typeof (o as { value: unknown }).value === 'string'
    )
  );
}
function isOption(x: unknown): x is FilterOption {
  return (
    !!x &&
    typeof x === 'object' &&
    'value' in x &&
    typeof (x as { value: unknown }).value === 'string'
  );
}

export default function InvestorFilter({ filters, setFilters }: Props) {
  /** Location state */
  const countries = Country.getAllCountries();
  const [states, setStates] = useState(State.getStatesOfCountry(''));
  const [cities, setCities] = useState(City.getCitiesOfState('', ''));

  /** Investment state - original options */
  const [originalInvestmentStages, setOriginalInvestmentStages] = useState<FilterOption[]>([]);
  const [originalInvestmentFocuses, setOriginalInvestmentFocuses] = useState<FilterOption[]>([]);
  const [originalInvestmentTypes, setOriginalInvestmentTypes] = useState<FilterOption[]>([]);
  const [originalPastInvestments, setOriginalPastInvestments] = useState<FilterOption[]>([]);

  /** Investment state - current options (filtered or original) */
  const [investmentStages, setInvestmentStages] = useState<FilterOption[]>([]);
  const [investmentFocuses, setInvestmentFocuses] = useState<FilterOption[]>([]);
  const [investmentTypes, setInvestmentTypes] = useState<FilterOption[]>([]);
  const [pastInvestments, setPastInvestments] = useState<FilterOption[]>([]);
  
  const [loading, setLoading] = useState(false);

  // Abort controller for cleanup
  const abortControllerRef = React.useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /** Load investment filters */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(getApiUrl('/api/investment-filters'));
        const data = await res.json();
        
        const stages = data.stages.map((v: string) => ({ label: v, value: v }));
        const focuses = data.investmentFocuses.map((v: string) => ({ label: v, value: v }));
        const types = data.investmentTypes.map((v: string) => ({ label: v, value: v }));
        const investments = data.pastInvestments.map((v: string) => ({ label: v, value: v }));
        
        // Set both original and current options
        setOriginalInvestmentStages(stages);
        setOriginalInvestmentFocuses(focuses);
        setOriginalInvestmentTypes(types);
        setOriginalPastInvestments(investments);
        
        setInvestmentStages(stages);
        setInvestmentFocuses(focuses);
        setInvestmentTypes(types);
        setPastInvestments(investments);
      } catch (err) {
        console.error('Error fetching investment filters:', err);
      }
    })();
  }, []);

  /** Handle location changes */
  useEffect(() => {
    if (filters.country) {
      const country = countries.find((c) => c.name === filters.country);
      if (country) {
        setStates(State.getStatesOfCountry(country.isoCode));
      }
      setFilters({ ...filters, state: '', city: '' });
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
      setFilters({ ...filters, state: '', city: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.country]);

  useEffect(() => {
    if (filters.state && filters.country) {
      const country = countries.find((c) => c.name === filters.country);
      const state = states.find((s) => s.name === filters.state);
      if (country && state) {
        setCities(City.getCitiesOfState(country.isoCode, state.isoCode));
      } else {
        setCities([]);
      }
      setFilters({ ...filters, city: '' });
    } else {
      setCities([]);
      if (filters.city) setFilters({ ...filters, city: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.state]);

  /** Investment search */
  const handleSearch = debounce(async (search: string, type: string) => {
    if (typeof search !== 'string' || !search.trim()) {
      // When search is empty, restore original options
      restoreOriginalOptions(type);
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const res = await fetch(
        getApiUrl(`/api/investment-filters?search=${encodeURIComponent(search)}&type=${type}`),
        { signal: abortControllerRef.current.signal }
      );

      if (res.ok) {
        const data = await res.json();
        if (type === 'pastInvestments') {
          setPastInvestments(
            (data.pastInvestments ?? []).map((v: string) => ({ label: v, value: v }))
          );
        } else if (type === 'investmentStages') {
          setInvestmentStages((data.stages ?? []).map((v: string) => ({ label: v, value: v })));
        } else if (type === 'investmentFocuses') {
          setInvestmentFocuses(
            (data.investmentFocuses ?? []).map((v: string) => ({ label: v, value: v }))
          );
        } else if (type === 'investmentTypes') {
          setInvestmentTypes(
            (data.investmentTypes ?? []).map((v: string) => ({ label: v, value: v }))
          );
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error fetching filtered data:', err);
      }
    } finally {
      setLoading(false);
    }
  }, 500);

  // Restore original options when search is cleared or dropdown is opened
  const restoreOriginalOptions = (type: string) => {
    if (type === 'pastInvestments') setPastInvestments(originalPastInvestments);
    else if (type === 'investmentStages') setInvestmentStages(originalInvestmentStages);
    else if (type === 'investmentFocuses') setInvestmentFocuses(originalInvestmentFocuses);
    else if (type === 'investmentTypes') setInvestmentTypes(originalInvestmentTypes);
  };

  // Safe input change handler
  const handleInputChange = (inputValue: string, type: string) => {
    if (typeof inputValue === 'string') {
      handleSearch(inputValue, type);
    }
  };

  // Handle dropdown open - restore original options
  const handleMenuOpen = (type: string) => {
    restoreOriginalOptions(type);
  };

  // Handle dropdown close - also restore original options to ensure consistency
  const handleMenuClose = (type: string) => {
    restoreOriginalOptions(type);
  };

  /** Location options */
  const countryOptions = countries.map((c) => ({ label: c.name, value: c.name }));
  const stateOptions = states.map((s) => ({ label: s.name, value: s.name }));
  const cityOptions = cities.map((c) => ({ label: c.name, value: c.name }));

  return (
    <div className="flex flex-wrap gap-6 bg-white items-center border-b border-[#EDEEEF] py-[24px] px-6">
      <span className="font-manrope font-semibold text-base">Filters:</span>

      {/* Investor Type */}
      <div className="flex-shrink-0 min-w-fit">
        <ClientSelect
          isMulti
          options={investmentTypes}
          components={{ IndicatorSeparator: () => null }}
          value={filters.investmentType.map((v) => ({ label: v, value: v }))}
          onChange={(sel) =>
            setFilters({
              ...filters,
              investmentType: isOptionArray(sel) ? sel.map((o) => o.value) : [],
            })
          }
          placeholder={
            <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
              <InvestorTypeIcon />
              <span className="ml-1">Investor Type</span>
            </div>
          }
          onInputChange={(s) => handleInputChange(s, 'investmentTypes')}
          onMenuOpen={() => handleMenuOpen('investmentTypes')}
          onMenuClose={() => handleMenuClose('investmentTypes')}
          styles={{
            control: (provided) => ({
              ...provided,
              minWidth: 'fit-content',
              width: 'auto',
              border: '1px solid #EDEEEF',
              borderRadius: '10px',
            }),
            container: (provided) => ({
              ...provided,
              minWidth: 'fit-content',
            }),
          }}
        />
      </div>

      {/* Investment Focus */}
      <div className="flex-shrink-0 min-w-fit">
        <ClientSelect
          isMulti
          options={investmentFocuses}
          value={filters.investmentFocus.map((v) => ({ label: v, value: v }))}
          onChange={(sel) =>
            setFilters({
              ...filters,
              investmentFocus: isOptionArray(sel) ? sel.map((o) => o.value) : [],
            })
          }
          components={{ IndicatorSeparator: () => null }}
          placeholder={
            <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
              <InvestorFocusIcon />
              <span>Investment Focus</span>
            </div>
          }
          onInputChange={(s) => handleInputChange(s, 'investmentFocuses')}
          onMenuOpen={() => handleMenuOpen('investmentFocuses')}
          onMenuClose={() => handleMenuClose('investmentFocuses')}
          styles={{
            control: (provided) => ({
              ...provided,
              minWidth: 'fit-content',
              width: 'auto',
              border: '1px solid #EDEEEF',
              borderRadius: '10px',
            }),
            container: (provided) => ({
              ...provided,
              minWidth: 'fit-content',
            }),
          }}
        />
      </div>

      {/* Country */}
      <div className="flex-shrink-0 min-w-fit">
        <ClientSelect
          options={countryOptions}
          value={filters.country ? { label: filters.country, value: filters.country } : null}
          placeholder={
            <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
              <CountryIcon />
              <span className="ml-2">Country</span>
            </div>
          }
          components={{ IndicatorSeparator: () => null }}
          onChange={(sel) =>
            setFilters({
              ...filters,
              country: isOption(sel) ? sel.value : '',
              state: '',
              city: '',
            })
          }
          styles={{
            control: (provided) => ({
              ...provided,
              minWidth: 'fit-content',
              width: 'auto',
              border: '1px solid #EDEEEF',
              borderRadius: '10px',
            }),
            container: (provided) => ({
              ...provided,
              minWidth: 'fit-content',
            }),
          }}
        />
      </div>

      {/* City */}
      <div className="flex-shrink-0 min-w-fit">
        <ClientSelect
          options={cityOptions}
          value={filters.city ? { label: filters.city, value: filters.city } : null}
          onChange={(sel) =>
            setFilters({
              ...filters,
              city: isOption(sel) ? sel.value : '',
            })
          }
          components={{ IndicatorSeparator: () => null }}
          placeholder={
            <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
              <MapPinIcon />
              <span className="ml-2">City</span>
            </div>
          }
          isDisabled={!filters.state}
          styles={{
            control: (provided) => ({
              ...provided,
              minWidth: 'fit-content',
              width: 'auto',
              border: '1px solid #EDEEEF',
              borderRadius: '10px',
            }),
            container: (provided) => ({
              ...provided,
              minWidth: 'fit-content',
            }),
          }}
        />
      </div>

      {/* State */}
      <div className="flex-shrink-0 min-w-fit">
        <ClientSelect
          options={stateOptions}
          value={filters.state ? { label: filters.state, value: filters.state } : null}
          onChange={(sel) =>
            setFilters({
              ...filters,
              state: isOption(sel) ? sel.value : '',
              city: '',
            })
          }
          components={{ IndicatorSeparator: () => null }}
          placeholder={
            <div className="flex items-center whitespace-nowrap text-[14px] font-manrope font-medium">
              <StateIcon />
              <span className="ml-2">State Name</span>
            </div>
          }
          isDisabled={!filters.country}
          styles={{
            control: (provided) => ({
              ...provided,
              minWidth: 'fit-content',
              width: 'auto',
              border: '1px solid #EDEEEF',
              borderRadius: '10px',
            }),
            container: (provided) => ({
              ...provided,
              minWidth: 'fit-content',
            }),
          }}
        />
      </div>

      {/* Investment Stage */}
      <div className="flex-shrink-0 min-w-fit">
        <ClientSelect
          isMulti
          options={investmentStages}
          value={filters.investmentStage.map((v) => ({ label: v, value: v }))}
          onChange={(sel) =>
            setFilters({
              ...filters,
              investmentStage: isOptionArray(sel) ? sel.map((o) => o.value) : [],
            })
          }
          components={{ IndicatorSeparator: () => null }}
          placeholder={
            <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
              <InvestorStageIcon />
              <span className="ml-2">Investment Stage</span>
            </div>
          }
          onInputChange={(s) => handleInputChange(s, 'investmentStages')}
          onMenuOpen={() => handleMenuOpen('investmentStages')}
          onMenuClose={() => handleMenuClose('investmentStages')}
          styles={{
            control: (provided) => ({
              ...provided,
              minWidth: 'fit-content',
              width: 'auto',
              border: '1px solid #EDEEEF',
              borderRadius: '10px',
            }),
            container: (provided) => ({
              ...provided,
              minWidth: 'fit-content',
            }),
          }}
        />
      </div>

      {/* Past Investment */}
      <div className="flex-shrink-0 min-w-fit">
        <ClientSelect
          isMulti
          options={pastInvestments}
          value={filters.pastInvestment.map((v) => ({ label: v, value: v }))}
          components={{ IndicatorSeparator: () => null }}
          placeholder={
            <div className="flex items-center text-[14px] font-manrope font-medium whitespace-nowrap">
              <PastInvestmentIcon />
              <span className="ml-2">Past Investment</span>
            </div>
          }
          onChange={(sel) =>
            setFilters({
              ...filters,
              pastInvestment: isOptionArray(sel) ? sel.map((o) => o.value) : [],
            })
          }
          onInputChange={(s) => handleInputChange(s, 'pastInvestments')}
          onMenuOpen={() => handleMenuOpen('pastInvestments')}
          onMenuClose={() => handleMenuClose('pastInvestments')}
          styles={{
            control: (provided) => ({
              ...provided,
              minWidth: 'fit-content',
              width: 'auto',
              border: '1px solid #EDEEEF',
              borderRadius: '10px',
            }),
            container: (provided) => ({
              ...provided,
              minWidth: 'fit-content',
            }),
          }}
        />
      </div>
    </div>
  );
}
