'use client';

import { useUser, useSession } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Country } from 'country-state-city';
import { buildRegionCountryOptions, buildCountryOptions } from '@lib/regions';
import Loader from '@components/Loader';
import SearchableDropdown from '@components/SearchableDropdown';
import LogoIcon from '@components/icons/LogoWithText';
import { getApiUrl, updateUserData, fetchUserData } from '@lib/api';


// Debounce utility function for search
const debounceSearch = (func: (search: string, type: string) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (search: string, type: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(search, type), wait);
  };
};

type FilterOption = { label: string; value: string; disabled?: boolean };

type OnboardingData = {
  // Step 1
  companyName: string;
  // Step 2
  incorporationCountry: string;
  operationalRegions: string[];
  // Step 3
  stages: string[];
  // Step 4
  businessSectors: string[];
  // Step 5
  revenue: string;
};

export default function OnboardingPage() {
  const { session } = useSession();
  const { user, isLoaded } = useUser();
  const [nextStepLoading, setNextStepLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    companyName: '',
    incorporationCountry: '',
    operationalRegions: [],
    stages: [],
    businessSectors: [],
    revenue: ''
  });

  // API data state
  const [originalStages, setOriginalStages] = useState<FilterOption[]>([]);
  const [originalBusinessSectors, setOriginalBusinessSectors] = useState<FilterOption[]>([]);
  const [stages, setStages] = useState<FilterOption[]>([]);
  const [businessSectors, setBusinessSectors] = useState<FilterOption[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Get countries for dropdowns
  const countries = Country.getAllCountries();
  
  // Countries only for incorporation
  const countryOptions = buildCountryOptions(countries);
  
  // Regions + separator + countries for operational regions
  const regionCountryOptions = buildRegionCountryOptions(countries);

  // Calculate progress percentage based on completed fields
  const calculateProgress = () => {
    if (currentStep === 1) {
      let completedFields = 0;
      const totalFields = 1; // companyName
      
      if (formData.companyName.trim()) completedFields++;
      
      return Math.round((completedFields / totalFields) * 20); // Max 20% for step 1
    } else if (currentStep === 2) {
      let completedFields = 0;
      const totalFields = 2; // incorporationCountry, operationalRegions
      
      if (formData.incorporationCountry) completedFields++;
      if (formData.operationalRegions.length > 0) completedFields++;
      
      return 20 + Math.round((completedFields / totalFields) * 20); // 20% + up to 20% for step 2
    } else if (currentStep === 3) {
      let completedFields = 0;
      const totalFields = 1; // businessSectors
      
      if (formData.businessSectors.length > 0) completedFields++;
      
      return 40 + Math.round((completedFields / totalFields) * 20); // 40% + up to 20% for step 3
    } else if (currentStep === 4) {
      let completedFields = 0;
      const totalFields = 1; // stages
      
      if (formData.stages.length > 0) completedFields++;
      
      return 60 + Math.round((completedFields / totalFields) * 20); // 60% + up to 20% for step 4
    } else {
      let completedFields = 0;
      const totalFields = 1; // revenue
      
      if (formData.revenue.trim()) completedFields++;
      
      return 80 + Math.round((completedFields / totalFields) * 20); // 80% + up to 20% for step 5
    }
  };

  const progressPercentage = calculateProgress();
  const backgroundColor = `linear-gradient(180deg, #2563EB 0%, #90AFF2 100%)`;

  // Check if current step is complete
  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return formData.companyName.trim() !== '';
      case 2:
        return formData.incorporationCountry !== '' && formData.operationalRegions.length > 0;
      case 3:
        return formData.businessSectors.length > 0;
      case 4:
        return formData.stages.length > 0;
      case 5:
        return formData.revenue.trim() !== '';
      default:
        return false;
    }
  };

  // Fetch stages and business sectors from API
  useEffect(() => {
    const fetchFilters = async () => {
      setLoadingFilters(true);
      try {
        const apiUrl = getApiUrl('/api/investment-filters');
        const res = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        const stagesData = data.stages?.map((v: string) => ({ label: v, value: v })) || [];
        const businessSectorsData = data.investmentFocuses?.map((v: string) => ({ label: v, value: v })) || [];
        
        // Set both original and current options
        setOriginalStages(stagesData);
        setOriginalBusinessSectors(businessSectorsData);
        setStages(stagesData);
        setBusinessSectors(businessSectorsData);
      } catch {
        // Error handling without logging
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilters();
  }, []);

  // Check for existing onboarding data and restore step
  useEffect(() => {
    if (isLoaded && user?.id) {
      const loadExistingData = async () => {
        try {
          // Try to load data from backend first
          const userData = await fetchUserData(user.id) as { 
            user?: { 
              publicMetaData?: { 
                companyName?: string; 
                incorporationCountry?: string; 
                operationalRegions?: string[]; 
                stages?: string[]; 
                businessSectors?: string[]; 
                revenue?: string; 
              }; 
              onboardingComplete?: boolean 
            }; 
            publicMetaData?: { 
              companyName?: string; 
              incorporationCountry?: string; 
              operationalRegions?: string[]; 
              stages?: string[]; 
              businessSectors?: string[]; 
              revenue?: string; 
            }; 
            onboardingComplete?: boolean 
          } | null;
          console.log('Loaded user data from backend:', userData);
          
          if (userData === null) {
            // User doesn't exist in backend yet (new user), start fresh
            console.log('New user - no existing data in backend');
            return;
          }
          
          // Handle nested user object structure from backend
          const actualUserData = userData.user || userData;
          
          // Check if user has already completed onboarding
          if (actualUserData.onboardingComplete) {
            setIsRedirecting(true);
            // Emit event to notify AuthFlowManager that onboarding is complete
            window.dispatchEvent(new CustomEvent('onboarding:complete'));
            // Use window.location.href for a hard redirect to bypass client-side routing
            window.location.href = '/';
            return;
          }
          
          // If user has started onboarding but not completed it, restore their data
          if (actualUserData.publicMetaData?.companyName) {
            const backendData = actualUserData.publicMetaData;
            console.log('Restoring onboarding data from backend:', backendData);
            setFormData({
              companyName: backendData.companyName || '',
              incorporationCountry: backendData.incorporationCountry || '',
              operationalRegions: backendData.operationalRegions || [],
              stages: backendData.stages || [],
              businessSectors: backendData.businessSectors || [],
              revenue: backendData.revenue || ''
            });

            // Determine which step to show based on completed data from backend
            if (backendData.companyName && backendData.incorporationCountry && 
                Array.isArray(backendData.operationalRegions) && backendData.operationalRegions.length > 0 &&
                Array.isArray(backendData.businessSectors) && backendData.businessSectors.length > 0 &&
                Array.isArray(backendData.stages) && backendData.stages.length > 0 &&
                backendData.revenue) {
              setCurrentStep(5);
            } else if (backendData.companyName && backendData.incorporationCountry && 
                       Array.isArray(backendData.operationalRegions) && backendData.operationalRegions.length > 0 &&
                       Array.isArray(backendData.businessSectors) && backendData.businessSectors.length > 0 &&
                       Array.isArray(backendData.stages) && backendData.stages.length > 0) {
              setCurrentStep(4);
            } else if (backendData.companyName && backendData.incorporationCountry && 
                       Array.isArray(backendData.operationalRegions) && backendData.operationalRegions.length > 0 &&
                       Array.isArray(backendData.businessSectors) && backendData.businessSectors.length > 0) {
              setCurrentStep(3);
            } else if (backendData.companyName && backendData.incorporationCountry && 
                       Array.isArray(backendData.operationalRegions) && backendData.operationalRegions.length > 0) {
              setCurrentStep(2);
            } else if (backendData.companyName) {
              setCurrentStep(1);
            }
          } else {
            console.log('No existing onboarding data found in backend');
          }
        } catch (error) {
          console.error('Failed to load user data from backend:', error);
          // Fallback to Clerk metadata if backend fails
          const existingData = user.publicMetadata;
          
          if (existingData.companyName && !existingData.onboardingComplete) {
            setFormData({
              companyName: existingData.companyName as string || '',
              incorporationCountry: existingData.incorporationCountry as string || '',
              operationalRegions: existingData.operationalRegions as string[] || [],
              stages: existingData.stages as string[] || [],
              businessSectors: existingData.businessSectors as string[] || [],
              revenue: existingData.revenue as string || ''
            });

            // Determine which step to show based on completed data
            if (existingData.companyName && existingData.incorporationCountry && 
                Array.isArray(existingData.operationalRegions) && existingData.operationalRegions.length > 0 &&
                Array.isArray(existingData.businessSectors) && existingData.businessSectors.length > 0 &&
                Array.isArray(existingData.stages) && existingData.stages.length > 0 &&
                existingData.revenue) {
              setCurrentStep(5);
            } else if (existingData.companyName && existingData.incorporationCountry && 
                       Array.isArray(existingData.operationalRegions) && existingData.operationalRegions.length > 0 &&
                       Array.isArray(existingData.businessSectors) && existingData.businessSectors.length > 0 &&
                       Array.isArray(existingData.stages) && existingData.stages.length > 0) {
              setCurrentStep(4);
            } else if (existingData.companyName && existingData.incorporationCountry && 
                       Array.isArray(existingData.operationalRegions) && existingData.operationalRegions.length > 0 &&
                       Array.isArray(existingData.businessSectors) && existingData.businessSectors.length > 0) {
              setCurrentStep(3);
            } else if (existingData.companyName && existingData.incorporationCountry && 
                       Array.isArray(existingData.operationalRegions) && existingData.operationalRegions.length > 0) {
              setCurrentStep(2);
            } else if (existingData.companyName) {
              setCurrentStep(1);
            }
          }
        }
      };
      
      loadExistingData();
    }
  }, [isLoaded, user]);

  // Initialize dropdowns with all options when data is first loaded
  useEffect(() => {
    if (originalStages.length > 0 && stages.length === 0) {
      setStages(originalStages);
    }
    if (originalBusinessSectors.length > 0 && businessSectors.length === 0) {
      setBusinessSectors(originalBusinessSectors);
    }
  }, [originalStages.length, originalBusinessSectors.length, stages.length, businessSectors.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDropdownChange = (field: keyof OnboardingData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Search functionality for dropdowns - now using local search
  const handleSearch = debounceSearch((search: string, type: string) => {
    if (typeof search !== 'string' || !search.trim()) {
      // When search is empty, restore original options but include selected values
      restoreOriginalOptionsWithSelected(type);
      return;
    }

    // Use local search instead of API calls
    const searchLower = search.toLowerCase();

    if (type === 'investmentStages') {
      const filteredOptions = originalStages.filter(option =>
        option.label.toLowerCase().includes(searchLower)
      );
      const mergedOptions = mergeSelectedWithOptions(filteredOptions, formData.stages, originalStages);
      setStages(mergedOptions);
    } else if (type === 'investmentFocuses') {
      const filteredOptions = originalBusinessSectors.filter(option =>
        option.label.toLowerCase().includes(searchLower)
      );
      const mergedOptions = mergeSelectedWithOptions(filteredOptions, formData.businessSectors, originalBusinessSectors);
      setBusinessSectors(mergedOptions);
    }
  }, 300);

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
      // Show all original options, with selected ones at the top
      const mergedOptions = mergeSelectedWithOptions(originalStages, formData.stages, originalStages);
      setStages(mergedOptions);
    } else if (type === 'investmentFocuses') {
      // Show all original options, with selected ones at the top
      const mergedOptions = mergeSelectedWithOptions(originalBusinessSectors, formData.businessSectors, originalBusinessSectors);
      setBusinessSectors(mergedOptions);
    }
  };

  // Ensure dropdowns show all options when opened
  const handleDropdownOpen = (type: string) => {
    // Only restore options when dropdown is opened, not when options change
    restoreOriginalOptionsWithSelected(type);
  };

  const saveProgress = async () => {
    try {
      if (!user?.id) return;
      
      // Include user's first and last name from Clerk along with onboarding data
      const dataToSave = {
        ...formData,
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      };
      
      // Save to backend API on every continue with publicMetaData structure
      await updateUserData(user.id, dataToSave, false);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const nextStep = async () => {
    setNextStepLoading(true);
    
    try {
      if (currentStep < 5) {
        // Save progress before moving to next step
        await saveProgress();
      }
      setCurrentStep(currentStep + 1);
    } finally {
      setNextStepLoading(false);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set local loading state immediately to prevent button text changes
    setIsSubmitting(true);
    
    // Emit event to notify AuthFlowManager that onboarding is starting
    // The AuthFlowManager will handle the global loading state
    window.dispatchEvent(new CustomEvent('onboarding:start'));
    
    // Small delay to ensure button state changes before AuthFlowManager shows loading
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      if (!user?.id) {
        throw new Error('User not found');
      }

      // Include user's first and last name from Clerk along with onboarding data
      const dataToSave = {
        ...formData,
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      };

      // Save to backend API with publicMetaData structure and mark as complete
      const result = await updateUserData(user.id, dataToSave, true) as { success?: boolean; error?: string; message?: string };

      // Check if the backend save was successful
      if (result && result.success !== false) {
        // Force session reload and wait for it to complete
        await Promise.all([
          session?.reload(),
          user?.reload()
        ]);

        // Add a small delay to ensure session is fully synchronized
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Set redirecting state to prevent UI from showing
        setIsRedirecting(true);
        
        // Emit event to notify AuthFlowManager that onboarding is complete
        // The AuthFlowManager will handle the redirect and loading state
        window.dispatchEvent(new CustomEvent('onboarding:complete'));
        
        // Use window.location.href for a hard redirect to bypass client-side routing
        window.location.href = '/';
        return;
      } else {
        // Backend save failed
        const errorMessage = result?.error || result?.message || 'Backend save failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to complete onboarding. Please try again.');
      setIsSubmitting(false);
      // Emit event to notify AuthFlowManager that onboarding failed
      window.dispatchEvent(new CustomEvent('onboarding:complete'));
    }
  };

  // Show loading state while user data is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0c2143] flex items-center justify-center">
        <div className="bg-[#1b2130] rounded-[14px] border border-[rgba(37,99,235,0.1)] p-8 shadow-2xl max-w-sm w-full">
          <Loader size="lg" text="Loading onboarding..." textColor="text-[#FFFFFF]" spinnerColor="border-[#2563EB]" />
        </div>
      </div>
    );
  }

  // Show loading state when redirecting
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-[#0c2143] flex items-center justify-center">
        <div className="bg-[#1b2130] rounded-[14px] border border-[rgba(37,99,235,0.1)] p-8 shadow-2xl max-w-sm w-full">
          <Loader size="lg" text="Redirecting to dashboard..." textColor="text-[#FFFFFF]" spinnerColor="border-[#2563EB]" />
        </div>
      </div>
    );
  }

  // Render step content based on current step
  const renderStepContent = () => {
    const renderHeader = () => (
      <div className="flex flex-col">
        <h1 className="font-bold text-xl lg:text-2xl leading-7 text-white mb-2">Let&apos;s Get to Know Your Business</h1>
        <p className="text-[#a5a6ac] font-normal text-sm lg:text-base leading-[22px] mb-[18px]">Before we get started, we need a little more information about your business.</p>
      </div>
    );

    switch (currentStep) {
      case 1:
        return (
          <div className="">
            {renderHeader()}
            
            <div className="flex flex-col">
              <h2 className="font-semibold text-base lg:text-lg leading-[22px] tracking-[-0.02em] text-white mb-4">
                What is your company name?
              </h2>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter your company name"
                className="w-full lg:w-[35%] bg-white/10 border border-white/10 rounded-[10px] h-[40px] font-normal text-sm leading-[22px] opacity-80 text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="">
            {renderHeader()}
            
            <div className="flex flex-col">
              <h2 className="font-semibold text-base lg:text-lg leading-[22px] tracking-[-0.02em] text-white mb-4">
                Where is your business incorporated and where do you operate?
              </h2>
              <div className="space-y-4 flex gap-5">
                <div className="w-full lg:w-fit">
                  <SearchableDropdown
                    isMulti={false}
                    options={countryOptions}
                    value={formData.incorporationCountry}
                    onChange={(value) => handleDropdownChange('incorporationCountry', Array.isArray(value) ? '' : value)}
                    placeholder={<span className="font-normal text-sm leading-[22px] opacity-80 text-white">Select incorporation country</span>}
                    enableSearch={true}
                    showApplyButton={false}
                    buttonClassName="bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)] rounded-[10px]"
                    dropdownClassName="bg-[#1b2130] border border-[rgba(37,99,235,0.1)] rounded-[14px] shadow-2xl"
                    isOnboarding={true}
                  />
                </div>
                <div className="w-full lg:w-fit">
                  <SearchableDropdown
                    isMulti={true}
                    options={regionCountryOptions}
                    value={formData.operationalRegions}
                    onChange={(value) => handleDropdownChange('operationalRegions', Array.isArray(value) ? value : [])}
                    placeholder={<span className="text-[#a5a6ac] font-normal text-sm leading-[22px] opacity-80 text-white">Select operational regions</span>}
                    enableSearch={true}
                    showApplyButton={true}
                    buttonClassName="bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)] rounded-[10px]"
                    dropdownClassName="bg-[#1b2130] border border-[rgba(37,99,235,0.1)] rounded-[14px] shadow-2xl"
                    isOnboarding={true}
                    showSelectedValues={true}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="">
            {renderHeader()}
            
            <div className="flex flex-col">
              <h2 className="font-semibold text-base lg:text-lg leading-[22px] tracking-[-0.02em] text-white mb-4">
                What industry or sector best describes your business?
              </h2>
              <div className="w-full lg:w-fit">
                {loadingFilters ? (
                  <div className="w-full px-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white/60 text-sm">
                    Loading sectors...
                  </div>
                ) : (
                  <SearchableDropdown
                    isMulti={true}
                    options={businessSectors}
                    value={formData.businessSectors}
                    onChange={(value) => handleDropdownChange('businessSectors', Array.isArray(value) ? value : [])}
                    placeholder={<span className="text-[#a5a6ac] font-normal text-sm leading-[22px] opacity-80 text-white">Select business sector</span>}
                    enableSearch={true}
                    showApplyButton={true}
                    onSearch={handleSearch}
                    searchType="investmentFocuses"
                    onOpen={() => handleDropdownOpen('investmentFocuses')}
                    buttonClassName="bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)] rounded-[10px]"
                    dropdownClassName="bg-[#1b2130] border border-[rgba(37,99,235,0.1)] rounded-[14px] shadow-2xl"
                    isOnboarding={true}
                    showSelectedValues={true}
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="">
            {renderHeader()}
            
            <div className="flex flex-col">
              <h2 className="font-semibold text-base lg:text-lg leading-[22px] tracking-[-0.02em] text-white mb-4">
                Which growth stage best describes your company?
              </h2>
              <div className="w-full lg:w-fit">
                {loadingFilters ? (
                  <div className="w-full px-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white/60 text-sm">
                    Loading stages...
                  </div>
                ) : (
                  <SearchableDropdown
                    isMulti={true}
                    options={stages}
                    value={formData.stages}
                    onChange={(value) => handleDropdownChange('stages', Array.isArray(value) ? value : [])}
                    placeholder={<span className="text-[#a5a6ac] font-normal text-sm leading-[22px] opacity-80 text-white">Select business stage</span>}
                    enableSearch={true}
                    showApplyButton={true}
                    onSearch={handleSearch}
                    searchType="investmentStages"
                    onOpen={() => handleDropdownOpen('investmentStages')}
                    buttonClassName="bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)] rounded-[10px]"
                    dropdownClassName="bg-[#1b2130] border border-[rgba(37,99,235,0.1)] rounded-[14px] shadow-2xl"
                    isOnboarding={true}
                    showSelectedValues={true}
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="">
            {renderHeader()}
            
            <div className="flex flex-col">
              <h2 className="font-semibold text-base lg:text-lg leading-[22px] tracking-[-0.02em] text-white mb-4">
                What is your current annual revenue or key traction metric?
              </h2>
              <input
                type="text"
                name="revenue"
                value={formData.revenue}
                onChange={handleInputChange}
                placeholder="e.g. $140,000 in revenue and $3.6 CAC"
                className="w-full lg:w-[35%] bg-white/10 border border-white/10 rounded-[10px] h-[40px] font-normal text-sm leading-[22px] opacity-80 text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#0c2143] relative w-full">
      {/* Top left logo - responsive positioning */}
      <div className="absolute top-4 lg:top-6 left-4 lg:left-6 z-10">
        <LogoIcon />
      </div>
      
      {/* Center content - responsive layout */}
      <div className="min-h-screen flex items-center justify-start p-4 lg:p-6 pt-20 lg:pt-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-[36px] p-4 lg:p-[50px] w-full">
          {/* Progress indicator - hidden on mobile, shown on desktop */}
          <div className="hidden lg:flex top-0">
            <div className="absolute">
              {/* Top dot */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="8" fill="white"/>
                  <circle cx="8" cy="8" r="6" fill="#2563EB"/>
                </svg>
              </div>
              {/* Progress bar */}
              <div className="w-2 h-[272px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.8)_96.28%)] rounded-[20px] overflow-hidden">
                <div 
                  className="w-2 rounded-full transition-all duration-500 ease-in-out"
                  style={{ 
                    height: `${progressPercentage}%`, 
                    background: backgroundColor,
                    transformOrigin: 'bottom'
                  }}
                ></div>
              </div>
              
              {/* Bottom dot */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="8" fill="white"/>
                  <circle cx="8" cy="8" r="6" fill="#2563EB"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Mobile progress indicator */}
          <div className="lg:hidden w-full mb-6">
            <div className="flex items-center justify-between text-white text-sm mb-2">
              <span>Step {currentStep} of 5</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-[rgba(255,255,255,0.2)] rounded-full overflow-hidden">
              <div 
                className="h-2 rounded-full transition-all duration-500 ease-in-out"
                style={{ 
                  width: `${progressPercentage}%`, 
                  background: backgroundColor
                }}
              ></div>
            </div>
          </div>

          <div className='w-full'>
            <div className="">
              {renderStepContent()}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="pt-6 flex flex-col sm:flex-row gap-5">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="p-3 bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)] rounded-[10px] cursor-pointer"
                  >
                    <span className="flex items-center gap-1 font-bold text-sm leading-[19px] tracking-[-0.02em] capitalize">
                      <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.665 10h11.667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4.665 10l3.333-3.333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4.665 10l3.333 3.333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Previous
                    </span>
                  </button>
                )}
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => nextStep()}
                    disabled={nextStepLoading || !isStepComplete()}
                    className="px-[32px] py-[13px] bg-[#ffffff] border-[rgba(255,255,255,0.1)] text-[#0C2143] hover:bg-[#f2f5f9] rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer order-1 sm:order-2 w-full sm:w-auto"
                  >
                    <span className="inline-flex items-center gap-1 text-[#0C2143] font-bold text-sm leading-[19px] tracking-[-0.02em] capitalize">
                      {nextStepLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0C2143] mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          Continue
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_1168_2734)">
                            <path d="M15.832 10H4.16536" stroke="#0C2143" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15.832 10L12.4987 13.3333" stroke="#0C2143" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15.832 10.0001L12.4987 6.66675" stroke="#0C2143" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_1168_2734">
                            <rect width="20" height="20" fill="white" transform="matrix(-1 0 0 1 20 0)"/>
                            </clipPath>
                            </defs>
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || loadingFilters || !isStepComplete()}
                    className="px-[32px] py-[13px] bg-[#ffffff] border-[rgba(255,255,255,0.1)] text-[#0C2143] font-bold text-sm leading-[19px] tracking-[-0.02em] capitalize hover:bg-[#f2f5f9] rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer w-full sm:w-auto"
                  >
                    {!isStepComplete() ? 'Complete Required Fields' : 'Complete Onboarding'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}