'use client';

import { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { getApiUrl } from '@lib/api';
import ClientSelect from './ClientSelect'; // Assuming this is a pre-existing component

type FilterOption = {
  label: string;
  value: string;
};

type Props = {
  investmentFilters: {
    investmentStage: string[];
    investmentFocus: string[];
    investmentType: string[];
    pastInvestment: string[];
  };
  setInvestmentFilters: (value: {
    investmentStage: string[];
    investmentFocus: string[];
    investmentType: string[];
    pastInvestment: string[];
  }) => void;
};

const InvestmentFilter: React.FC<Props> = ({ investmentFilters, setInvestmentFilters }) => {
  const [investmentStages, setInvestmentStages] = useState<FilterOption[]>([]);
  const [investmentFocuses, setInvestmentFocuses] = useState<FilterOption[]>([]);
  const [investmentTypes, setInvestmentTypes] = useState<FilterOption[]>([]);
  const [pastInvestment, setPastInvestment] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch the filters data from the API on component mount
  useEffect(() => {
    const fetchInvestmentFilters = async () => {
      try {
        const res = await fetch(getApiUrl('/api/investment-filters'));
        const data = await res.json();
        setInvestmentStages(data.stages.map((stage: string) => ({ label: stage, value: stage })));
        setInvestmentFocuses(data.investmentFocuses.map((focus: string) => ({ label: focus, value: focus })));
        setInvestmentTypes(data.investmentTypes.map((type: string) => ({ label: type, value: type })));
        setPastInvestment(data.pastInvestments.map((investment: string) => ({ label: investment, value: investment })));
      } catch (error) {
        console.error('Error fetching investment filters:', error);
      }
    };

    fetchInvestmentFilters();
  }, []);

  // Debounced function to handle search input
const handleSearch = debounce(async (search: string, type: string) => {
  if (typeof search !== 'string' || !search.trim()) {
    // If the search is empty, clear the respective filter state
    clearFilterState(type);
    return; // Don't proceed if the search is empty
  }

  setLoading(true);

  try {
    const res = await fetch(getApiUrl(`/api/investment-filters?search=${search}&type=${type}&page=1&itemsPerPage=20`));
    const data = await res.json();

    // Handle the results for different types
    if (type === 'pastInvestments') {
      setPastInvestment(data.pastInvestments && data.pastInvestments.length > 0
        ? data.pastInvestments.map((investment: string) => ({ label: investment, value: investment }))
        : []); // Clear if no data
    } else if (type === 'investmentStages') {
      // Preserve previous values and update only the necessary changes
      setInvestmentStages(data.stages && data.stages.length > 0
        ? data.stages.map((stage: string) => ({ label: stage, value: stage }))
        : []); // Clear if no data
    } else if (type === 'investmentFocuses') {
      setInvestmentFocuses(data.investmentFocuses && data.investmentFocuses.length > 0
        ? data.investmentFocuses.map((focus: string) => ({ label: focus, value: focus }))
        : []);
    } else if (type === 'investmentTypes') {
      setInvestmentTypes(data.investmentTypes && data.investmentTypes.length > 0
        ? data.investmentTypes.map((type: string) => ({ label: type, value: type }))
        : []);
    }
  } catch (error) {
    console.error('Error fetching filtered data:', error);
  } finally {
    setLoading(false);
  }
}, 500); // 500ms debounce

// Function to clear the filter state when the search is cleared
const clearFilterState = (type: string) => {
  if (type === 'pastInvestments') {
    setPastInvestment([]);
  } else if (type === 'investmentStages') {
    setInvestmentStages([]);
  } else if (type === 'investmentFocuses') {
    setInvestmentFocuses([]);
  } else if (type === 'investmentTypes') {
    setInvestmentTypes([]);
  }
};



  // Ensure initialization of all state variables as arrays
  const investmentStageOptions: FilterOption[] = investmentStages;
  const investmentFocusOptions: FilterOption[] = investmentFocuses;
  const investmentTypeOptions: FilterOption[] = investmentTypes;
  const pastInvestmentOptions: FilterOption[] = pastInvestment;

  return (
    <div className="flex flex-wrap gap-6">
      {/* Investment Stage Filter */}
      <div className="w-64">
        <label className="block text-sm font-medium text-gray-700">Investment Stage</label>
        <ClientSelect
          isMulti
          options={investmentStageOptions}
          value={investmentFilters.investmentStage.map((val) => ({ label: val, value: val }))}
          onChange={(selected) => {
            setInvestmentFilters({
              ...investmentFilters,
              investmentStage: Array.isArray(selected) ? selected.map((s: { value: string }) => s.value) : [],
            });
          }}
          onInputChange={(search) => handleSearch(search, 'investmentStages')}
          className="mt-2"
          classNamePrefix="react-select"
          placeholder="Select Investment Stage"
        />
      </div>

      {/* Investment Focus Filter */}
      <div className="w-64">
        <label className="block text-sm font-medium text-gray-700">Investment Focus</label>
        <ClientSelect
          isMulti
          options={investmentFocusOptions}
          value={investmentFilters.investmentFocus.map((val) => ({ label: val, value: val }))}
          onChange={(selected) => {
            setInvestmentFilters({
              ...investmentFilters,
              investmentFocus: Array.isArray(selected) ? selected.map((s: { value: string }) => s.value) : [],
            });
          }}
          onInputChange={(search) => handleSearch(search, 'investmentFocuses')}
          className="mt-2"
          classNamePrefix="react-select"
          placeholder="Select Investment Focus"
        />
      </div>

      {/* Investment Type Filter */}
      <div className="w-64">
        <label className="block text-sm font-medium text-gray-700">Investment Type</label>
        <ClientSelect
          isMulti
          options={investmentTypeOptions}
          value={investmentFilters.investmentType.map((val) => ({ label: val, value: val }))}
          onChange={(selected) => {
            setInvestmentFilters({
              ...investmentFilters,
              investmentType: Array.isArray(selected) ? selected.map((s: { value: string }) => s.value) : [],
            });
          }}
          onInputChange={(search) => handleSearch(search, 'investmentTypes')}
          className="mt-2"
          classNamePrefix="react-select"
          placeholder="Select Investment Type"
        />
      </div>

      {/* Past Investment Filter */}
      <div className="w-64">
        <label className="block text-sm font-medium text-gray-700">Past Investment</label>
        <ClientSelect
          isMulti
          options={pastInvestmentOptions}
          value={investmentFilters.pastInvestment.map((val) => ({ label: val, value: val }))}
          onChange={(selected) => {
            setInvestmentFilters({
              ...investmentFilters,
              pastInvestment: Array.isArray(selected) ? selected.map((s: { value: string }) => s.value) : [],
            });
          }}
          onInputChange={(search) => handleSearch(search, 'pastInvestments')}
          className="mt-2"
          classNamePrefix="react-select"
          placeholder="Select Past Investments"
        />
      </div>
    </div>
  );
};

export default InvestmentFilter;
