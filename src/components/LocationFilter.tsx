'use client';

import React, { useEffect, useState } from 'react';
import { Country, State, City } from 'country-state-city';
import ClientSelect from './ClientSelect';

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
      // Find the country object that matches the country name
      const selectedCountry = countries.find(
        (country) => country.name === filters.country
      );

      if (selectedCountry) {
        const newStates = State.getStatesOfCountry(selectedCountry.isoCode);
        setStates(newStates);
      }

      // Reset state and city when country changes
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
      // Find the country object that matches the country name
      const selectedCountry = countries.find((country) => country.name === filters.country);
      // Find the state object that matches the state name
      const selectedState = states.find((state) => state.name === filters.state);

      if (selectedCountry && selectedState) {
        // Use country ISO code and state ISO code for getting cities
        const newCities = City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
        setCities(newCities);
        console.log('Cities loaded:', newCities.length, 'for', filters.state, filters.country);
      } else {
        setCities([]);
        console.log('Country or state not found');
      }

      // Reset city when state changes
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

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Country</label>
        <ClientSelect
          options={countryOptions}
          value={filters.country ? { label: filters.country, value: filters.country } : null}
          onChange={(selected) => {
            setFilters({
              ...filters,
              country: selected ? selected.value : '',
              state: '',
              city: '',
            });
          }}
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
          onChange={(selected) => {
            setFilters({
              ...filters,
              state: selected ? selected.value : '',
              city: '',
            });
          }}
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
          onChange={(selected) => {
            setFilters({
              ...filters,
              city: selected ? selected.value : '',
            });
          }}
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