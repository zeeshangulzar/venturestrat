export type RegionOption = { label: string; value: string; disabled?: boolean; key?: string };

// UN geoscheme continents and subregions
export const regions: RegionOption[] = [
  // Africa
  { label: 'Africa', value: 'Africa' },
  { label: 'Eastern Africa', value: 'Eastern Africa' },
  { label: 'Middle Africa', value: 'Middle Africa' },
  { label: 'Northern Africa', value: 'Northern Africa' },
  { label: 'Southern Africa', value: 'Southern Africa' },
  { label: 'Western Africa', value: 'Western Africa' },
  // Americas
  { label: 'Americas', value: 'Americas' },
  { label: 'Northern America', value: 'Northern America' },
  { label: 'Latin America and the Caribbean', value: 'Latin America and the Caribbean' },
  { label: 'Caribbean', value: 'Caribbean' },
  { label: 'Central America', value: 'Central America' },
  { label: 'South America', value: 'South America' },
  // Asia
  { label: 'Asia', value: 'Asia' },
  { label: 'Central Asia', value: 'Central Asia' },
  { label: 'Eastern Asia', value: 'Eastern Asia' },
  { label: 'South-eastern Asia', value: 'South-eastern Asia' },
  { label: 'Southern Asia', value: 'Southern Asia' },
  { label: 'Western Asia', value: 'Western Asia' },
  // Europe
  { label: 'Europe', value: 'Europe' },
  { label: 'Eastern Europe', value: 'Eastern Europe' },
  { label: 'Northern Europe', value: 'Northern Europe' },
  { label: 'Southern Europe', value: 'Southern Europe' },
  { label: 'Western Europe', value: 'Western Europe' },
  // Oceania
  { label: 'Oceania', value: 'Oceania' },
  { label: 'Australia and New Zealand', value: 'Australia and New Zealand' },
  { label: 'Melanesia', value: 'Melanesia' },
  { label: 'Polynesia', value: 'Polynesia' },
  // Antarctica
  { label: 'Antarctica', value: 'Antarctica' }
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


