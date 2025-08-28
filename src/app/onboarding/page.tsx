'use client';

import { useUser, useSession } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Country } from 'country-state-city';
import Loader from '@components/Loader';
import SearchableDropdown from '@components/SearchableDropdown';
import LogoIcon from '@components/icons/LogoWithText';
import { getApiUrl } from '@lib/api';

type FilterOption = { label: string; value: string };

type OnboardingData = {
  // Step 1
  companyName: string;
  siteUrl: string;
  incorporationCountry: string;
  operationalRegions: string[];
  
  // Step 2
  revenue: string;
  stages: string[];
  businessSectors: string[];
};

export default function OnboardingPage() {
  const { session } = useSession();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nextStepLoading, setNextStepLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    companyName: '',
    siteUrl: '',
    incorporationCountry: '',
    operationalRegions: [],
    revenue: '',
    stages: [],
    businessSectors: []
  });

  // API data state
  const [stages, setStages] = useState<FilterOption[]>([]);
  const [businessSectors, setBusinessSectors] = useState<FilterOption[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Get countries for dropdowns
  const countries = Country.getAllCountries();
  const countryOptions = countries.map((c) => ({ label: c.name, value: c.name }));

  // Calculate progress percentage based on completed fields
  const calculateProgress = () => {
    if (currentStep === 1) {
      let completedFields = 0;
      const totalFields = 3; // companyName, incorporationCountry, operationalRegions
      
      if (formData.companyName.trim()) completedFields++;
      if (formData.incorporationCountry) completedFields++;
      if (formData.operationalRegions.length > 0) completedFields++;
      
      return Math.round((completedFields / totalFields) * 50); // Max 50% for step 1
    } else {
      let completedFields = 0;
      const totalFields = 3; // revenue, stages, businessSectors
      
      if (formData.revenue.trim()) completedFields++;
      if (formData.stages.length > 0) completedFields++;
      if (formData.businessSectors.length > 0) completedFields++;
      
      return 50 + Math.round((completedFields / totalFields) * 50); // 50% + up to 50% for step 2
    }
  };

  const progressPercentage = calculateProgress();
  const backgroundColor = `linear-gradient(180deg, #2563EB 0%, #90AFF2 100%)`;

  // Check if all required fields are completed for current step
  const isStepComplete = () => {
    if (currentStep === 1) {
      return formData.companyName.trim() && 
             formData.incorporationCountry && 
             formData.operationalRegions.length > 0;
    } else {
      return formData.revenue.trim() && 
             formData.stages.length > 0 && 
             formData.businessSectors.length > 0;
    }
  };

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

  // Check for existing onboarding data and restore step
  useEffect(() => {
    if (isLoaded && user) {
      const existingData = user.publicMetadata;
      
      // If user has started onboarding but not completed it, restore their data
      if (existingData.companyName && !existingData.onboardingComplete) {
        setFormData({
          companyName: existingData.companyName as string || '',
          siteUrl: existingData.siteUrl as string || '',
          incorporationCountry: existingData.incorporationCountry as string || '',
          operationalRegions: existingData.operationalRegions as string[] || [],
          revenue: existingData.revenue as string || '',
          stages: existingData.stages as string[] || [],
          businessSectors: existingData.businessSectors as string[] || []
        });

        if (existingData.companyName && existingData.incorporationCountry && Array.isArray(existingData.operationalRegions) && existingData.operationalRegions.length > 0) {
          setCurrentStep(2);
        }
      }
    }
  }, [isLoaded, user]);

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

  const saveProgress = async () => {
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isComplete: false
        }),
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const nextStep = async () => {
    setNextStepLoading(true);
    
    try {
      if (currentStep === 1) {
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
    
    setLoading(true);

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isComplete: true
        }),
      });

      if (response.ok) {
        console.log('Onboarding completed successfully');
        
        // Force session reload and wait for it to complete
        await Promise.all([
          session?.reload(),
          user?.reload()
        ]);

        // Add a small delay to ensure session is fully synchronized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use window.location.href for a hard redirect to bypass client-side routing
        window.location.href = '/';
        return;
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

      // Show loading state while user data is loading
    if (!isLoaded || !user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader size="lg" text="Loading onboarding..." />
        </div>
      );
    }

  const renderStep1 = () => (
    <div className="space-y-8">
      <div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Enter your company name"
              className="bg-white/10 border border-white/10 rounded-[10px] w-full h-[40px] font-normal text-sm leading-[22px] opacity-80  text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Site URL
            </label>
            <input
              type="url"
              name="siteUrl"
              value={formData.siteUrl}
              onChange={handleInputChange}
              placeholder="https://example.com (optional)"
              className="bg-white/10 border border-white/10 rounded-[10px] w-full h-[40px] font-normal text-sm leading-[22px] opacity-80  text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <h2 className="ont-semibold text-lg leading-[22px] tracking-[-0.02em] text-white mb-4">
            Where is your business incorporated and where do you operate?
          </h2>
          <div className='flex gap-[14px]'>
            <SearchableDropdown
              isMulti={false}
              options={countryOptions}
              value={formData.incorporationCountry}
              onChange={(value) => handleDropdownChange('incorporationCountry', Array.isArray(value) ? '' : value)}
              placeholder={<span className="font-normal text-sm leading-[22px] opacity-80  text-white ">Select incorporation country...</span>}
              enableSearch={true}
              showApplyButton={false}
              buttonClassName="bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)] rounded-[10px]"
              dropdownClassName="bg-[#1b2130] border border-[rgba(37,99,235,0.1)] rounded-[14px] shadow-2xl"
              isOnboarding={true}
            />
            <SearchableDropdown
              isMulti={true}
              options={countryOptions}
              value={formData.operationalRegions}
              onChange={(value) => handleDropdownChange('operationalRegions', Array.isArray(value) ? value : [])}
              placeholder={<span className="font-normal text-sm leading-[22px] opacity-80  text-white">Select operational regions...</span>}
              enableSearch={true}
              showApplyButton={true}
              buttonClassName="bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)] rounded-[10px]"
              dropdownClassName="bg-[#1b2130] border border-[rgba(37,99,235,0.1)] rounded-[14px] shadow-2xl"
              isOnboarding={true}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div>
        <div className="space-y-6">       
          <div>
            <h2 className="font-semibold text-lg leading-[22px] tracking-[-0.02em] text-white mb-2">
              What industry or sector best describes your business?
            </h2>
            <div className="w-fit">
              <SearchableDropdown
                isMulti={true}
                options={businessSectors}
                value={formData.businessSectors}
                onChange={(value) => handleDropdownChange('businessSectors', Array.isArray(value) ? value : [])}
                placeholder={<span className="font-normal text-sm leading-[22px] opacity-80  text-white">Select business sectors...</span>}
                enableSearch={true}
                showApplyButton={true}
                buttonClassName="bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)] rounded-[10px]"
                dropdownClassName="bg-[#1b2130] border border-[rgba(37,99,235,0.1)] rounded-[14px] shadow-2xl"
                isOnboarding={true}
              />
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-lg leading-[22px] tracking-[-0.02em] text-white mb-4">
              Which growth stage best describes your company?
            </h2>
            <div className="w-fit">
                <SearchableDropdown
                  isMulti={true}
                  options={stages}
                  value={formData.stages}
                  onChange={(value) => handleDropdownChange('stages', Array.isArray(value) ? value : [])}
                  placeholder={<span className="font-normal text-sm leading-[22px] opacity-80  text-white">Select business stages...</span>}
                  enableSearch={true}
                  showApplyButton={true}
                  buttonClassName="bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)] rounded-[10px]"
                  dropdownClassName="bg-[#1b2130] border border-[rgba(37,99,235,0.1)] rounded-[14px] shadow-2xl"
                  isOnboarding={true}
                />
              </div>
          </div>
          <div>
            <h2 className="font-semibold text-lg leading-[22px] tracking-[-0.02em] text-white mb-2">
              What is your current annual revenue or key traction metric?
            </h2>
            <input
              type="text"
              name="revenue"
              value={formData.revenue}
              onChange={handleInputChange}
              placeholder="e.g. $140,000"
              className="bg-white/10 border border-white/10 rounded-[10px] w-full h-[40px] font-normal text-sm leading-[22px] opacity-80  text-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0c2143] relative w-full">
      {/* Top left logo */}
      <div className="absolute top-6 left-6">
        <LogoIcon />
      </div>
      
      {/* Center content */}
      <div className="min-h-screen flex items-center justify-start p-6">
        <div className="flex flex-row gap-[36px] p-[50px]">
          {/* Progress indicator */}
          <div className="flex top-0">
            <div className="absolute">
              {/* Top dot */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="8" fill="white"/>
                  <circle cx="8" cy="8" r="6" fill="#2563EB"/>
                </svg>
              </div>
                                             {/* Progress bar */}
                <div className="w-2 h-[344px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.8)_96.28%)] rounded-[20px] overflow-hidden">
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
          <div>
            <div className="mb-[18px]">
              <h1 className="font-bold text-2xl leading-7 text-white mb-2">Let&apos;s Get to Know Your Business</h1>
              <p className="text-[#a5a6ac] font-normal text-base leading-[22px]">Before we get started, we need a little more information about your business.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {currentStep === 1 ? renderStep1() : renderStep2()}

              <div className="pt-6 flex justify-between">
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
                
                {currentStep < 2 ? (
                  <button
                    type="button"
                    onClick={() => nextStep()}
                    disabled={nextStepLoading || !isStepComplete()}
                    className="px-[32px] py-[13px] bg-[#ffffff] border-[rgba(255,255,255,0.1)] text-[#0C2143] hover:bg-[#f2f5f9] rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1 text-[#0C2143] font-bold text-sm leading-[19px] tracking-[-0.02em] capitalize">
                      {nextStepLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0C2143] mr-2"></div>
                          Processing...
                        </>
                      ) : !isStepComplete() ? (
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
                    disabled={loading || loadingFilters || !isStepComplete()}
                    className="px-[32px] py-[13px] bg-[#ffffff] border-[rgba(255,255,255,0.1)] text-[#0C2143] font-bold text-sm leading-[19px] tracking-[-0.02em] capitalize hover:bg-[#f2f5f9] rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                  >
                    {loading ? 'Completing...' : !isStepComplete() ? 'Complete Required Fields' : 'Complete Onboarding'}
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