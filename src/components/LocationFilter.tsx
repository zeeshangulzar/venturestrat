'use client';

import React, { useEffect, useState } from 'react';
import { Country, State, City } from 'country-state-city';
import ClientSelect from './ClientSelect';

// Define the type for the select options
type SelectOption = {
  label: string;
  value: string;
};

type Props = {
  filters: {
    country: string;
    state: string;
    city: string;
  };
  setFilters: (filters: { country: string; state: string; city: string }) => void;
};

const LocationFilter: React.FC<Props> = ({ filters, setFilters }) => {
  const [countries, setCountries] = useState<ReturnType<typeof Country.getAllCountries>>([]);
  const [states, setStates] = useState<ReturnType<typeof State.getStatesOfCountry>>([]);
  const [cities, setCities] = useState<ReturnType<typeof City.getCitiesOfState>>([]);

  // Fetch all countries on component mount
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  // Update states based on selected country name
  useEffect(() => {
    if (filters.country) {
      const selectedCountry = countries.find(
        (country) => country.name === filters.country
      );

      if (selectedCountry) {
        const newStates = State.getStatesOfCountry(selectedCountry.isoCode);
        setStates(newStates);
      }

      setFilters({ ...filters, state: '', city: '' });
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
      setFilters({ ...filters, state: '', city: '' });
    }
  }, [filters.country, countries]);

  // Update cities based on selected state and country
  useEffect(() => {
    if (filters.state && filters.country) {
      const selectedCountry = countries.find((country) => country.name === filters.country);
      const selectedState = states.find((state) => state.name === filters.state);

      if (selectedCountry && selectedState) {
        const newCities = City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
        setCities(newCities);
      } else {
        setCities([]);
      }

      setFilters({ ...filters, city: '' });
    } else {
      setCities([]);
      if (filters.city) {
        setFilters({ ...filters, city: '' });
      }
    }
  }, [filters.state, filters.country, states, countries]);

  const countryOptions = countries.map((country) => ({
    label: country.name,
    value: country.name,
  }));

  const stateOptions = states.map((state) => ({
    label: state.name,
    value: state.name,
  }));

  const cityOptions = cities.map((city) => ({
    label: city.name,
    value: city.name,
  }));

  const handleSelectChange = (
    selected: SelectOption | null, 
    type: 'country' | 'state' | 'city'
  ) => {
    setFilters({
      ...filters,
      [type]: selected ? selected.value : '',
      ...(type === 'country' && { state: '', city: '' }), // Reset state and city if country changes
      ...(type === 'state' && { city: '' }), // Reset city if state changes
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Country</label>
        <ClientSelect
          options={countryOptions}
          value={filters.country ? { label: filters.country, value: filters.country } : null}
          onChange={(selected) => handleSelectChange(selected as SelectOption | null, 'country')} // Type assertion here
          className="mt-2"
          classNamePrefix="react-select"
          placeholder="Select Country"
        />
      </div>

      {/* State */}
      <div>
        <label className="block text-sm font-medium text-gray-700">State</label>
        <ClientSelect
          options={stateOptions}
          value={filters.state ? { label: filters.state, value: filters.state } : null}
          onChange={(selected) => handleSelectChange(selected as SelectOption | null, 'state')} // Type assertion here
          className="mt-2"
          classNamePrefix="react-select"
          placeholder="Select State"
          isDisabled={!filters.country}
        />
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700">City</label>
        <ClientSelect
          options={cityOptions}
          value={filters.city ? { label: filters.city, value: filters.city } : null}
          onChange={(selected) => handleSelectChange(selected as SelectOption | null, 'city')}
          className="mt-2"
          classNamePrefix="react-select"
          placeholder="Select City"
          isDisabled={!filters.state}
        />
        {filters.state && cities.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">No cities found for this state</p>
        )}
      </div>
    </div>
  );
};

export default LocationFilter;
