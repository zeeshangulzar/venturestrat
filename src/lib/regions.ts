export type RegionOption = { label: string; value: string; disabled?: boolean; key?: string };

// UN geoscheme continents and subregions
export const regions: RegionOption[] = [
  { label: 'Worldwide', value: 'Worldwide' },
  { label: 'North America', value: 'North America' },
  { label: 'Latin America / South America', value: 'Latin America / South America' },
  { label: 'Europe', value: 'Europe' },
  { label: 'Middle East', value: 'Middle East' },
  { label: 'Africa', value: 'Africa' },
  { label: 'Asia', value: 'Asia' },
  { label: 'Central Asia', value: 'Central Asia' },
  { label: 'Southeast Asia', value: 'Southeast Asia' },
  { label: 'East Asia', value: 'East Asia' },
  { label: 'South Asia', value: 'South Asia' },
];

export const buildRegionCountryOptions = (
  countries: { name: string }[]
): RegionOption[] => {
  const separatorOption: RegionOption = { label: '─────────────────', value: 'separator', disabled: true };
  
  // Filter out Antarctica (continent/region, not a sovereign country)
  const filteredCountries = countries.filter(c => c.name !== 'Antarctica');
  
  // Create country options
  const countryOptions = filteredCountries.map(c => ({ 
    label: c.name, 
    value: c.name, 
    key: `country:${c.name}` 
  }));
  const regionOptionsWithKeys = regions.map(r => ({ ...r, key: `region:${r.value}` }));
  
  return [
    ...regionOptionsWithKeys,
    separatorOption,
    ...countryOptions
  ];
};

export const buildCountryOptions = (
  countries: { name: string }[]
): RegionOption[] => {
  // Filter out Antarctica (continent/region, not a sovereign country)
  const filteredCountries = countries.filter(c => c.name !== 'Antarctica');
  
  // Create country options only
  const countryOptions = filteredCountries.map(c => ({ 
    label: c.name, 
    value: c.name, 
    key: `country:${c.name}` 
  }));
  
  return countryOptions;
};


