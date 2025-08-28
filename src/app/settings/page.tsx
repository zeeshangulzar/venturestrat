'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Country } from 'country-state-city';
import Loader from '@components/Loader';
import SearchableDropdown from '@components/SearchableDropdown';
import LogoIcon from '@components/icons/LogoWithText';
import { getApiUrl } from '@lib/api';
import HomeIcon from '@components/icons/HomeIcon';
import TaskManagerIcon from '@components/icons/TaskManagerIcon';
import LegalIcon from '@components/icons/LegalIcon';
import FinancialsIcon from '@components/icons/FinancialsIcon';
import PresentationsIcon from '@components/icons/PresentationsIcon';
import BusinessPlanningIcon from '@components/icons/BusinessPlanningIcon';
import MarketingIcon from '@components/icons/MarketingIcon';

type FilterOption = { label: string; value: string };

type OnboardingData = {
  companyName: string;
  siteUrl: string;
  incorporationCountry: string;
  operationalRegions: string[];
  revenue: string;
  stages: string[];
  businessSectors: string[];
  fundingAmount: number;
};

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [currentCategory, setCurrentCategory] = useState('financials');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [formData, setFormData] = useState<OnboardingData>({
    companyName: '',
    siteUrl: '',
    incorporationCountry: '',
    operationalRegions: [],
    revenue: '',
    stages: [],
    businessSectors: [],
    fundingAmount: 0
  });

  // API data state for stages and business sectors
  const [originalStages, setOriginalStages] = useState<FilterOption[]>([]);
  const [originalBusinessSectors, setOriginalBusinessSectors] = useState<FilterOption[]>([]);
  const [stages, setStages] = useState<FilterOption[]>([]);
  const [businessSectors, setBusinessSectors] = useState<FilterOption[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Get countries for dropdowns
  const countries = Country.getAllCountries();
  const countryOptions = countries.map((c) => ({ label: c.name, value: c.name }));

  // Fetch stages and business sectors from API
  useEffect(() => {
    const fetchFilters = async () => {
      setLoadingFilters(true);
      try {
        const res = await fetch(getApiUrl('/api/investment-filters'), {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const data = await res.json();
        
        const stagesData = data.stages?.map((v: string) => ({ label: v, value: v })) || [];
        const businessSectorsData = data.investmentFocuses?.map((v: string) => ({ label: v, value: v })) || [];
        
        // Set both original and current options
        setOriginalStages(stagesData);
        setOriginalBusinessSectors(businessSectorsData);
        setStages(stagesData);
        setBusinessSectors(businessSectorsData);
      } catch (err) {
        console.error('Error fetching filters:', err);
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilters();
  }, []);

  // Load user data from public metadata
  useEffect(() => {
    if (isLoaded && user) {
      const metadata = user.publicMetadata;
      setFormData({
        companyName: (metadata.companyName as string) || '',
        siteUrl: (metadata.siteUrl as string) || '',
        incorporationCountry: (metadata.incorporationCountry as string) || '',
        operationalRegions: (metadata.operationalRegions as string[]) || [],
        revenue: (metadata.revenue as string) || '',
        stages: (metadata.stages as string[]) || [],
        businessSectors: (metadata.businessSectors as string[]) || [],
        fundingAmount: (metadata.fundingAmount as number) || 0
      });
    }
  }, [isLoaded, user]);

  // Ensure dropdowns show all options when data is loaded
  useEffect(() => {
    if (stages.length > 0) {
      handleDropdownOpen('investmentStages');
    }
    if (businessSectors.length > 0) {
      handleDropdownOpen('investmentFocuses');
    }
  }, [stages.length, businessSectors.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Auto-save after input change
    setTimeout(() => autoSave({ ...formData, [name]: value }), 1000);
  };

  const handleDropdownChange = (field: keyof OnboardingData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Auto-save after dropdown change
    setTimeout(() => autoSave({ ...formData, [field]: value }), 1000);
  };

  const handleNumberChange = (field: keyof OnboardingData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Auto-save after number change
    setTimeout(() => autoSave({ ...formData, [field]: value }), 1000);
  };

  const autoSave = async (data: OnboardingData) => {
    setSaveStatus('saving');
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          isComplete: false
        }),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to Clerk's user profile
      await user?.setProfileImage({ file });
      
      // Force user reload to update the UI
      await user?.reload();
    } catch (error) {
      console.error('Profile picture upload error:', error);
      alert('Failed to upload profile picture. Please try again.');
    }
  };

  // Search functionality for dropdowns
  const handleSearch = async (search: string, type: string) => {
    if (typeof search !== 'string' || !search.trim()) {
      // When search is empty, restore original options but include selected values
      restoreOriginalOptionsWithSelected(type);
      return;
    }

    try {
      const res = await fetch(
        getApiUrl(`/api/investment-filters?search=${encodeURIComponent(search)}&type=${type}`)
      );

      if (res.ok) {
        const data = await res.json();
        
        if (type === 'investmentStages') {
          const searchResults = (data.stages ?? []).map((v: string) => ({ label: v, value: v }));
          const mergedOptions = mergeSelectedWithOptions(searchResults, formData.stages, originalStages);
          setStages(mergedOptions);
        } else if (type === 'investmentFocuses') {
          const searchResults = (data.investmentFocuses ?? []).map((v: string) => ({ label: v, value: v }));
          const mergedOptions = mergeSelectedWithOptions(searchResults, formData.businessSectors, originalBusinessSectors);
          setBusinessSectors(mergedOptions);
        }
      }
    } catch (err) {
      console.error('Error fetching filtered data:', err);
    }
  };

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

  // Restore original options when search is cleared or dropdown is opened
  const restoreOriginalOptionsWithSelected = (type: string) => {
    if (type === 'investmentStages') {
      // Always show all original options, with selected ones at the top
      const mergedOptions = mergeSelectedWithOptions(originalStages, formData.stages, originalStages);
      setStages(mergedOptions);
    } else if (type === 'investmentFocuses') {
      // Always show all original options, with selected ones at the top
      const mergedOptions = mergeSelectedWithOptions(originalBusinessSectors, formData.businessSectors, originalBusinessSectors);
      setBusinessSectors(mergedOptions);
    }
  };

  // Ensure dropdowns show all options when opened
  const handleDropdownOpen = (type: string) => {
    restoreOriginalOptionsWithSelected(type);
  };



  const categories = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'task-manager', label: 'Task Manager', icon: TaskManagerIcon },
    { id: 'legal', label: 'Legal', icon: LegalIcon },
    { id: 'financials', label: 'Fundraising', icon: FinancialsIcon },
    { id: 'presentations', label: 'Presentations', icon: BusinessPlanningIcon },
    { id: 'business-planning', label: 'Business Planning', icon: BusinessPlanningIcon },
    { id: 'marketing', label: 'Marketing', icon: MarketingIcon },
  ];

  // Show loading state while user data is loading
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading settings..." />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="pt-20 px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        
        {/* Profile Section */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Avatar */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={user.imageUrl || '/avatar.jpeg'}
                  alt="User avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* User Info Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={user.fullName || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={user.primaryEmailAddress?.emailAddress || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value="************"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                  <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <SearchableDropdown
                  isMulti={false}
                  options={countryOptions}
                  value={formData.incorporationCountry}
                  onChange={(value) => handleDropdownChange('incorporationCountry', Array.isArray(value) ? '' : value)}
                  placeholder="Select country..."
                  enableSearch={true}
                  showApplyButton={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories and Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setCurrentCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      currentCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-l-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {currentCategory === 'financials' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Fundraising</h2>
                
                <div className="space-y-6">
                  {/* Question 1 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What industry or sector best describes your business?
                    </label>
                    {loadingFilters ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                        Loading sectors...
                      </div>
                    ) : (
                      <SearchableDropdown
                        isMulti={true}
                        options={businessSectors}
                        value={formData.businessSectors}
                        onChange={(value) => handleDropdownChange('businessSectors', Array.isArray(value) ? value : [])}
                        placeholder="Select..."
                        enableSearch={true}
                        showApplyButton={true}
                        onSearch={handleSearch}
                        searchType="investmentFocuses"
                        onOpen={() => handleDropdownOpen('investmentFocuses')}
                      />
                    )}
                  </div>

                  {/* Question 1.5 - Investment Stages */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Which investment stage best defines your business?
                    </label>
                    {loadingFilters ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                        Loading stages...
                      </div>
                    ) : (
                      <SearchableDropdown
                        isMulti={true}
                        options={stages}
                        value={formData.stages}
                        onChange={(value) => handleDropdownChange('stages', Array.isArray(value) ? value : [])}
                        placeholder="Select investment stages..."
                        enableSearch={true}
                        showApplyButton={true}
                        onSearch={handleSearch}
                        searchType="investmentStages"
                        onOpen={() => handleDropdownOpen('investmentStages')}
                      />
                    )}
                  </div>

                  {/* Question 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How much are you looking to raise, and in what currency?
                    </label>
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          name="fundingAmount"
                          value={formData.fundingAmount}
                          onChange={(e) => handleNumberChange('fundingAmount', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter amount..."
                          min="0"
                          step="1000"
                        />
                      </div>
                      <div className="w-32">
                        <SearchableDropdown
                          isMulti={false}
                          options={[
                            { label: 'USD', value: 'USD' },
                            { label: 'EUR', value: 'EUR' },
                            { label: 'GBP', value: 'GBP' }
                          ]}
                          value="USD"
                          onChange={() => {}}
                          placeholder="Select currency..."
                          enableSearch={false}
                          showApplyButton={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Question 3 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Where is your business incorporated and where do you operate?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SearchableDropdown
                        isMulti={false}
                        options={countryOptions}
                        value={formData.incorporationCountry}
                        onChange={(value) => handleDropdownChange('incorporationCountry', Array.isArray(value) ? '' : value)}
                        placeholder="Country of Incorporation..."
                        enableSearch={true}
                        showApplyButton={false}
                      />
                      <SearchableDropdown
                        isMulti={true}
                        options={countryOptions}
                        value={formData.operationalRegions}
                        onChange={(value) => handleDropdownChange('operationalRegions', Array.isArray(value) ? value : [])}
                        placeholder="Operating Countries (multi-selection)..."
                        enableSearch={true}
                        showApplyButton={true}
                      />
                    </div>
                  </div>

                  {/* Question 4 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What is your current annual revenue or key traction metric? (Example: $25,000 MRR and $3.6 CAC)
                    </label>
                    <textarea
                      name="revenue"
                      value={formData.revenue}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </div>

                {/* Auto-save indicator */}
                <div className="mt-8">
                  {saveStatus === 'saving' && (
                    <div className="text-sm text-blue-600 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Saving...
                    </div>
                  )}
                  {saveStatus === 'saved' && (
                    <div className="text-sm text-green-600 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Changes saved successfully!
                    </div>
                  )}
                  {saveStatus === 'error' && (
                    <div className="text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Failed to save changes
                    </div>
                  )}

                </div>
              </div>
            )}

            {currentCategory !== 'financials' && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">
                  {categories.find(c => c.id === currentCategory)?.label} content coming soon...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
