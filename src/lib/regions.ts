export type RegionOption = { label: string; value: string; disabled?: boolean; key?: string };

// UN geoscheme continents and subregions
export const regions: RegionOption[] = [
  // Africa
  { label: 'Africa', value: 'Africa' },
  { label: 'Northern Africa', value: 'Northern Africa' },
  { label: 'Western Africa', value: 'Western Africa' },
  { label: 'Eastern Africa', value: 'Eastern Africa' },
  { label: 'Central Africa', value: 'Central Africa' },
  { label: 'Southern Africa', value: 'Southern Africa' },

  // Asia
  { label: 'Asia', value: 'Asia' },
  { label: 'Central Asia', value: 'Central Asia' },
  { label: 'South Asia', value: 'South Asia' },
  { label: 'South-eastern Asia', value: 'South-eastern Asia' },
  { label: 'Eastern Asia', value: 'Eastern Asia' },
  { label: 'Western Asia', value: 'Western Asia' },
  { label: 'Northern Asia', value: 'Northern Asia' },

  // Europe
  { label: 'Europe', value: 'Europe' },
  { label: 'Northern Europe', value: 'Northern Europe' },
  { label: 'Southern Europe', value: 'Southern Europe' },
  { label: 'Western Europe', value: 'Western Europe' },
  { label: 'Eastern Europe', value: 'Eastern Europe' },
  { label: 'Central Europe', value: 'Central Europe' },

  // Americas
  { label: 'Americas', value: 'Americas' },
  { label: 'North America', value: 'North America' },
  { label: 'South America', value: 'South America' },
  { label: 'Central America', value: 'Central America' },
  { label: 'Caribbean', value: 'Caribbean' },
  { label: 'Latin America', value: 'Latin America' },

  // Oceania
  { label: 'Oceania', value: 'Oceania' },
  { label: 'Australia', value: 'Australia' },
  { label: 'New Zealand', value: 'New Zealand' },
  { label: 'Melanesia', value: 'Melanesia' },
  { label: 'Micronesia', value: 'Micronesia' },
  { label: 'Polynesia', value: 'Polynesia' },
  { label: 'Pacific Islands', value: 'Pacific Islands' },

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


