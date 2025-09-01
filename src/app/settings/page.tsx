'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Country } from 'country-state-city';
import { buildRegionCountryOptions } from '@lib/regions';
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

type FilterOption = { label: string; value: string; disabled?: boolean };

type OnboardingData = {
  firstName: string;
  lastName: string;
  companyName: string;
  siteUrl: string;
  incorporationCountry: string;
  operationalRegions: string[];
  revenue: string;
  stages: string[];
  businessSectors: string[];
  fundingAmount: number;
  fundingCurrency: string;
  currency: string;
};

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [currentCategory, setCurrentCategory] = useState('financials');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [profileUploadStatus, setProfileUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    companyName: '',
    siteUrl: '',
    incorporationCountry: '',
    operationalRegions: [],
    revenue: '',
    stages: [],
    businessSectors: [],
    fundingAmount: 0,
    fundingCurrency: '',
    currency: ''
  });

  // API data state for stages and business sectors
  const [originalStages, setOriginalStages] = useState<FilterOption[]>([]);
  const [originalBusinessSectors, setOriginalBusinessSectors] = useState<FilterOption[]>([]);
  const [stages, setStages] = useState<FilterOption[]>([]);
  const [businessSectors, setBusinessSectors] = useState<FilterOption[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Debounced auto-save functionality
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Define autoSave function first
  const autoSave = useCallback(async (data: OnboardingData) => {
    // Validate required fields before saving
    const errors: Record<string, string> = {};
    
    if (!data.firstName.trim()) {
      errors.firstName = "First name can't be blank";
    }
    
    if (!data.lastName.trim()) {
      errors.lastName = "Last name can't be blank";
    }
    
    if (!data.companyName.trim()) {
      errors.companyName = "Company name can't be blank";
    }
    
    // If there are validation errors, don't save and show errors
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }
    
    setSaveStatus('saving');
    try {
      console.log('Auto-saving data:', data); // Debug log
      
      // Update Clerk user profile if firstName or lastName changed
      if (user && (data.firstName !== user.firstName || data.lastName !== user.lastName)) {
        try {
          await user.update({
            firstName: data.firstName,
            lastName: data.lastName,
          });
          console.log('Clerk user profile updated');
        } catch (profileError) {
          console.error('Failed to update Clerk user profile:', profileError);
          // Continue with API save even if profile update fails
        }
      }
      
      // Save to API endpoint
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          isComplete: false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API response error:', errorData);
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Auto-save result:', result); // Debug log

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [user]);
  
  const debouncedAutoSave = useCallback((data: OnboardingData) => {
    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for 1.5 seconds after user stops typing
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(data);
    }, 1500);
  }, [autoSave]);

  // Get countries for dropdowns
  const countries = Country.getAllCountries();
  const countryOptions = buildRegionCountryOptions(countries);

  // Currency options
  const currencyOptions = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'CAD - Canadian Dollar', value: 'CAD' },
    { label: 'AUD - Australian Dollar', value: 'AUD' },
    { label: 'JPY - Japanese Yen', value: 'JPY' },
    { label: 'CHF - Swiss Franc', value: 'CHF' },
    { label: 'CNY - Chinese Yuan', value: 'CNY' },
    { label: 'INR - Indian Rupee', value: 'INR' },
    { label: 'BRL - Brazilian Real', value: 'BRL' },
    { label: 'MXN - Mexican Peso', value: 'MXN' },
    { label: 'SGD - Singapore Dollar', value: 'SGD' },
    { label: 'HKD - Hong Kong Dollar', value: 'HKD' },
    { label: 'KRW - South Korean Won', value: 'KRW' },
    { label: 'SEK - Swedish Krona', value: 'SEK' },
    { label: 'NOK - Norwegian Krone', value: 'NOK' },
    { label: 'DKK - Danish Krone', value: 'DKK' },
    { label: 'PLN - Polish Zloty', value: 'PLN' },
    { label: 'CZK - Czech Koruna', value: 'CZK' },
    { label: 'HUF - Hungarian Forint', value: 'HUF' }
  ];

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
      console.log('Loading user metadata:', metadata); // Debug log
      const newFormData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        companyName: (metadata.companyName as string) || '',
        siteUrl: (metadata.siteUrl as string) || '',
        incorporationCountry: (metadata.incorporationCountry as string) || '',
        operationalRegions: (metadata.operationalRegions as string[]) || [],
        revenue: (metadata.revenue as string) || '',
        stages: (metadata.stages as string[]) || [],
        businessSectors: (metadata.businessSectors as string[]) || [],
        fundingAmount: (metadata.fundingAmount as number) || 0,
        fundingCurrency: (metadata.fundingCurrency as string) || '',
        currency: (metadata.currency as string) || ''
      };
      console.log('Setting form data:', newFormData); // Debug log
      setFormData(newFormData);
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
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      // Use debounced auto-save instead of immediate timeout
      debouncedAutoSave(newData);
      return newData;
    });
  };

  const handleDropdownChange = (field: keyof OnboardingData, value: string | string[]) => {
    console.log(`Dropdown change - Field: ${field}, Value:`, value); // Debug log
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('Updated formData:', newData); // Debug log
      // Use debounced auto-save instead of immediate timeout
      debouncedAutoSave(newData);
      return newData;
    });
  };

  const handleNumberChange = (field: keyof OnboardingData, value: number) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      // Use debounced auto-save instead of immediate timeout
      debouncedAutoSave(newData);
      return newData;
    });
  };

  const handleNumberIncrement = (field: keyof OnboardingData, increment: number = 1) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: (prev[field] as number) + increment
      };
      // Use debounced auto-save instead of immediate timeout
      debouncedAutoSave(newData);
      return newData;
    });
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

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

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
              {profileUploadStatus === 'error' && (
                <div className="text-red-600 text-sm font-medium">
                  Failed to upload profile picture. Please try again.
                </div>
              )}
            </div>
          </div>

          {/* First Row: First Name, Last Name, Email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="not-italic font-medium text-sm leading-6 text-[#525A68] mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`h-[46px] w-full px-3 py-2 bg-[#F6F6F7] border rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 not-italic font-medium text-sm leading-6 text-[#0C2143] ${
                  fieldErrors.firstName 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-[#EDEEEF]'
                }`}
                placeholder="Enter first name"
              />
              {fieldErrors.firstName && (
                <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.firstName}</p>
              )}
            </div>
            <div>
              <label className="not-italic font-medium text-sm leading-6 text-[#525A68] mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`h-[46px] w-full px-3 py-2 bg-[#F6F6F7] border rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 not-italic font-medium text-sm leading-6 text-[#0C2143] ${
                  fieldErrors.lastName 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-[#EDEEEF]'
                }`}
                placeholder="Enter last name"
              />
              {fieldErrors.lastName && (
                <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.lastName}</p>
              )}
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
          </div>

          {/* Second Row: Password, Company + Country */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
            <div>
              <label className="not-italic font-medium text-sm leading-6 text-[#525A68] mb-2">Company name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className={`h-[46px] w-full px-3 py-2 bg-[#F6F6F7] border rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 not-italic font-medium text-sm leading-6 text-[#0C2143] ${
                  fieldErrors.companyName 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-[#EDEEEF]'
                }`}
                placeholder="Enter company name"
              />
              {fieldErrors.companyName && (
                <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.companyName}</p>
              )}
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
                      <label className="not-italic font-semibold text-base leading-6 tracking-[-0.02em] text-[#0C2143] mb-2">
                        What industry or sector best describes your business?
                      </label>
                      <SearchableDropdown
                        isMulti={true}
                        options={businessSectors}
                        value={formData.businessSectors}
                        onChange={(value) => handleDropdownChange('businessSectors', Array.isArray(value) ? value : [])}
                        placeholder="Select business sectors..."
                        enableSearch={true}
                        showApplyButton={true}
                        onSearch={(search) => handleSearch(search, 'investmentFocuses')}
                        searchType="investmentFocuses"
                        onOpen={() => handleDropdownOpen('investmentFocuses')}
                        buttonClassName="bborder border-[#EDEEEF] rounded-[10px] h-[46px] text-[#787F89] not-italic font-medium text-sm leading-6 hover:bg-[#EDEEEF] h-[46px] w-full px-3 py-2 bg-[#F6F6F7]"
                        showSelectedValues={true}
                      />
                    </div>

                    {/* Question 1.5 - Investment Stages */}
                    <div>
                      <label className="not-italic font-semibold text-base leading-6 tracking-[-0.02em] text-[#0C2143] mb-2">
                        Which investment stage best defines your business?
                      </label>
                      <SearchableDropdown
                        isMulti={true}
                        options={stages}
                        value={formData.stages}
                        onChange={(value) => handleDropdownChange('stages', Array.isArray(value) ? value : [])}
                        placeholder="Select business stages..."
                        enableSearch={true}
                        showApplyButton={true}
                        onSearch={(search) => handleSearch(search, 'investmentStages')}
                        searchType="investmentStages"
                        onOpen={() => handleDropdownOpen('investmentStages')}
                        buttonClassName="border border-[#EDEEEF] rounded-[10px] h-[46px] text-[#787F89] not-italic font-medium text-sm leading-6 hover:bg-[#EDEEEF] h-[46px] w-full px-3 py-2 bg-[#F6F6F7]"
                        showSelectedValues={true}
                      />
                    </div>

                    {/* Question 2 */}
                    {/* <div>
                      <label className="not-italic font-semibold text-base leading-6 tracking-[-0.02em] text-[#0C2143] mb-2">
                        How much are you looking to raise, and in what currency?
                      </label>
                      <div className="flex items-center space-x-3">
                        <div className='w-full'>
                          <div className="mt-1 relative">
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => handleNumberIncrement('fundingAmount', -1)}
                                className="h-[42px] px-3 py-2 bg-[#F6F6F7] border border-r-0 border-[#EDEEEF] rounded-l-[10px] text-[#0C2143] hover:bg-[#EDEEEF] transition-colors"
                                aria-label="Decrease amount"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 12H4" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              <input
                                type="number"
                                name="fundingAmount"
                                value={formData.fundingAmount || ''}
                                onChange={(e) => handleNumberChange('fundingAmount', Number(e.target.value) || 0)}
                                placeholder="Enter amount"
                                className="px-3 py-2 bg-[#F6F6F7] border-t border-b border-[#EDEEEF] text-[#0C2143] w-full text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleNumberIncrement('fundingAmount', 1)}
                                className="h-[42px] px-3 py-2 bg-[#F6F6F7] border border-l-0 border-[#EDEEEF] rounded-r-[10px] text-[#0C2143] hover:bg-[#EDEEEF] transition-colors"
                                aria-label="Increase amount"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className='w-full'>
                          <div className="mt-1">
                            <SearchableDropdown
                              isMulti={false}
                              options={currencyOptions}
                              value={formData.fundingCurrency}
                              onChange={(value) => handleDropdownChange('fundingCurrency', Array.isArray(value) ? '' : value)}
                              placeholder="Select currency..."
                              enableSearch={true}
                              showApplyButton={false}
                              buttonClassName="w-full bg-[#F6F6F7] border-[#EDEEEF] rounded-[10px] text-[#0C2143] hover:bg-[#EDEEEF]"
                            />
                          </div>
                        </div>    
                      </div>
                    </div> */}

                    {/* Question 3 */}
                    <div>
                      <label className="not-italic font-semibold text-base leading-6 tracking-[-0.02em] text-[#0C2143] mb-2">
                        Where is your business incorporated and where do you operate?
                      </label>
                      <div className="space-y-3 flex gap-2">
                        <div className='w-full'>
                          <div className="mt-1">
                            <SearchableDropdown
                              isMulti={false}
                              options={countryOptions}
                              value={formData.incorporationCountry}
                              onChange={(value) => handleDropdownChange('incorporationCountry', Array.isArray(value) ? '' : value)}
                              placeholder="Select country..."
                              enableSearch={true}
                              showApplyButton={false}
                              buttonClassName="border border-[#EDEEEF] rounded-[10px] h-[46px] text-[#787F89] not-italic font-medium text-sm leading-6 hover:bg-[#EDEEEF] h-[46px] w-full px-3 py-2 bg-[#F6F6F7]"
                            />
                          </div>
                        </div>
                        <div className='w-full'>
                          <div className="mt-1">
                            <SearchableDropdown
                              isMulti={true}
                              options={countryOptions}
                              value={formData.operationalRegions}
                              onChange={(value) => handleDropdownChange('operationalRegions', Array.isArray(value) ? value : [])}
                              placeholder="Select operating countries..."
                              enableSearch={true}
                              showApplyButton={true}
                              buttonClassName="border border-[#EDEEEF] rounded-[10px] h-[46px] text-[#787F89] not-italic font-medium text-sm leading-6 hover:bg-[#EDEEEF] h-[46px] w-full px-3 py-2 bg-[#F6F6F7]"
                              showSelectedValues={true}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Question 4 */}
                    <div>
                      <label className="not-italic font-semibold text-base leading-6 tracking-[-0.02em] text-[#0C2143] mb-2">
                        What is your current annual revenue or key traction metric?
                      </label>
                      <input
                        type="text"
                        name="revenue"
                        value={formData.revenue}
                        onChange={handleInputChange}
                        placeholder="e.g. $140,000"
                        className="w-full px-3 py-2 border border-[#EDEEEF] rounded-[10px] h-[46px] text-[#787F89] not-italic font-medium text-sm leading-6 hover:bg-[#EDEEEF] bg-[#F6F6F7]"
                      />
                    </div>

                    {/* Question 5 - Business Currency */}
                    {/* <div>
                      <label className="not-italic font-semibold text-base leading-6 tracking-[-0.02em] text-[#0C2143] mb-2">
                        What currency do you use for your business operations and financial reporting?
                      </label>
                      <SearchableDropdown
                        isMulti={false}
                        options={currencyOptions}
                        value={formData.currency}
                        onChange={(value) => handleDropdownChange('currency', Array.isArray(value) ? '' : value)}
                        placeholder="Select business currency..."
                        enableSearch={true}
                        showApplyButton={false}
                        buttonClassName="w-full bg-[#F6F6F7] border border-[#EDEEEF] rounded-[10px] text-[#0C2143] hover:bg-[#EDEEEF] h-[46px]"
                      />
                    </div> */}


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
