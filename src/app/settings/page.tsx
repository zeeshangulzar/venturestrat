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
  const [profileUploadStatus, setProfileUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
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

    // Reset states
    setProfileUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate upload progress (since Clerk doesn't provide progress callbacks)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to Clerk's user profile
      await user?.setProfileImage({ file });
      
      // Complete progress
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      // Force user reload to update the UI
      await user?.reload();
      
      // Show success state
      setProfileUploadStatus('success');
      setTimeout(() => setProfileUploadStatus('idle'), 3000);
    } catch (error) {
      console.error('Profile picture upload error:', error);
      setProfileUploadStatus('error');
      setTimeout(() => setProfileUploadStatus('idle'), 5000);
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
    <main className="min-h-screen">
      <div className="flex items-center bg-[rgba(255, 255, 255, 0.8)] h-[60px] px-5 py-4 border-b border-[#EDEEEF]">
        <h2 className="not-italic font-bold text-[18px] leading-[24px] tracking-[-0.02em] text-[#0C2143]">Setting</h2>
      </div>
      <div className="px-4 py-5 bg-[#F4F6FB]">
        {/* Profile Section */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 mb-8 border border-[#EDEEEF]">
          <h2 className="not-italic font-bold text-[18px] leading-[24px] tracking-[-0.02em] text-[#0C2143] mb-3">Profile</h2>

          {/* Profile Image */}
          <div className="flex mb-8">
            <div className="relative">
              <img
                src={user.imageUrl || '/avatar.jpeg'}
                alt="User avatar"
                className={`w-[80px] h-[80px] rounded-full object-cover ${
                  profileUploadStatus === 'uploading' ? 'opacity-50' : ''
                }`}
              />
              
              {/* Upload Progress Overlay */}
              {profileUploadStatus === 'uploading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
                  <div className="text-white text-xs font-medium">{uploadProgress}%</div>
                </div>
              )}
              
              {/* Success/Error Indicators */}
              {profileUploadStatus === 'success' && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              {profileUploadStatus === 'error' && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              
              <label className={`absolute bottom-0 right-0 bg-[#FFFFFF] text-white p-1 rounded-full hover:bg-[#EDEEEF] transition-colors cursor-pointer ${
                profileUploadStatus === 'uploading' ? 'opacity-50 cursor-not-allowed' : ''
              }`}>
                {profileUploadStatus === 'uploading' ? (
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14" r="14" fill="white"/>
                    <circle cx="14" cy="14" r="12" fill="#EDEEEF"/>
                    <path d="M12.2507 12.8333C12.895 12.8333 13.4173 12.311 13.4173 11.6667C13.4173 11.0223 12.895 10.5 12.2507 10.5C11.6063 10.5 11.084 11.0223 11.084 11.6667C11.084 12.311 11.6063 12.8333 12.2507 12.8333Z" stroke="#525A68" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.5827 8.16675H12.2493C9.33268 8.16675 8.16602 9.33341 8.16602 12.2501V15.7501C8.16602 18.6667 9.33268 19.8334 12.2493 19.8334H15.7493C18.666 19.8334 19.8327 18.6667 19.8327 15.7501V12.8334" stroke="#525A68" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.1875 9.91675H19.3958" stroke="#525A68" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M17.791 11.5208V8.3125" stroke="#525A68" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M8.55664 18.0542L11.4325 16.1233C11.8933 15.8142 12.5583 15.8492 12.9725 16.205L13.165 16.3742C13.62 16.765 14.355 16.765 14.81 16.3742L17.2366 14.2917C17.6916 13.9008 18.4266 13.9008 18.8816 14.2917L19.8325 15.1083" stroke="#525A68" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                  disabled={profileUploadStatus === 'uploading'}
                />
              </label>
            </div>
            
            {/* Upload Status Message */}
            <div className="ml-4 flex flex-col justify-center">
              {profileUploadStatus === 'uploading' && (
                <div className="text-blue-600 text-sm font-medium">
                  Uploading profile picture... {uploadProgress}%
                </div>
              )}
              {profileUploadStatus === 'success' && (
                <div className="text-green-600 text-sm font-medium">
                  Profile picture updated successfully!
                </div>
              )}
              {profileUploadStatus === 'error' && (
                <div className="text-red-600 text-sm font-medium">
                  Failed to upload profile picture. Please try again.
                </div>
              )}
            </div>
          </div>

          {/* First Row: Name, Email, Password */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="not-italic font-medium text-sm leading-6 text-[#525A68] mb-2">Name</label>
              <input
                type="text"
                value={user.fullName || ''}
                className="h-[46px] w-full px-3 py-2 bg-[#F6F6F7] border border-[#EDEEEF] rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 not-italic font-medium text-sm leading-6 text-[#0C2143]"
                readOnly
              />
            </div>
            <div>
              <label className="not-italic font-medium text-sm leading-6 text-[#525A68] mb-2">Email Address</label>
              <input
                type="email"
                value={user.primaryEmailAddress?.emailAddress || ''}
                className="h-[46px] w-full px-3 py-2 bg-[#F6F6F7] border border-[#EDEEEF] rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 not-italic font-medium text-sm leading-6 text-[#0C2143]"
                readOnly
              />
            </div>
            <div>
              <label className="not-italic font-medium text-sm leading-6 text-[#525A68] mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value="************"
                  className="h-[46px] w-full px-3 py-2 bg-[#F6F6F7] border border-[#EDEEEF] rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 not-italic font-medium text-sm leading-6 text-[#0C2143]"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Second Row: Company + Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="not-italic font-medium text-sm leading-6 text-[#525A68] mb-2">Company name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="h-[46px] w-full px-3 py-2 bg-[#F6F6F7] border border-[#EDEEEF] rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 not-italic font-medium text-sm leading-6 text-[#0C2143]"
              />
            </div>
            <div>
              <label className="not-italic font-medium text-sm leading-6 text-[#525A68] mb-2">Country</label>
              <SearchableDropdown
                isMulti={false}
                options={countryOptions}
                value={formData.incorporationCountry}
                onChange={(value) => handleDropdownChange('incorporationCountry', Array.isArray(value) ? '' : value)}
                placeholder="Select country..."
                enableSearch={true}
                showApplyButton={false}
                buttonClassName="bg-[#F6F6F7] border-[#EDEEEF] rounded-[10px] text-[#0C2143] hover:bg-[#EDEEEF] rounded-[10px]"
              />
            </div>
          </div>
        </div>


        {/* Categories and Content Section */}
        <div className='bg-[#FFFFFF] border border-[#EDEEEF] rounded-[14px]'>
          <div className="grid grid-cols-1 lg:grid-cols-4">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1 border-r border-[#EDEEEF]">
              <div className='border-b border-[#EDEEEF]'>
                <h3 className="not-italic text-[#0C2143] font-bold text-lg leading-6 pl-5 py-5">Categories</h3>
              </div>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isDisabled = category.id !== 'financials';
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => !isDisabled && setCurrentCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        currentCategory === category.id
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-l-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="not-italic font-normal text-sm leading-[19px] text-[#0C2143]">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {currentCategory === 'financials' && (
                <div>
                  <div className='border-b border-[#EDEEEF]'>
                    <h2 className="not-italic text-[#0C2143] font-bold text-lg leading-6 pl-5 py-5">Fundraising</h2>
                  </div>
                  
                  <div className="space-y-6 p-5">
                    {/* Question 1 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What industry or sector best describes your business?
                      </label>
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                        {formData.businessSectors.length > 0 
                          ? formData.businessSectors.join(', ')
                          : 'Not specified'
                        }
                      </div>
                    </div>

                    {/* Question 1.5 - Investment Stages */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Which investment stage best defines your business?
                      </label>
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                        {formData.stages.length > 0 
                          ? formData.stages.join(', ')
                          : 'Not specified'
                        }
                      </div>
                    </div>

                    {/* Question 2 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How much are you looking to raise, and in what currency?
                      </label>
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                        {formData.fundingAmount > 0 
                          ? `$${formData.fundingAmount.toLocaleString()} USD`
                          : 'Not specified'
                        }
                      </div>
                    </div>

                    {/* Question 3 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Where is your business incorporated and where do you operate?
                      </label>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-500">Country of Incorporation:</span>
                          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 mt-1">
                            {formData.incorporationCountry || 'Not specified'}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Operating Countries:</span>
                          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 mt-1">
                            {formData.operationalRegions.length > 0 
                              ? formData.operationalRegions.join(', ')
                              : 'Not specified'
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Question 4 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What is your current annual revenue or key traction metric?
                      </label>
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 min-h-[60px]">
                        {formData.revenue || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
