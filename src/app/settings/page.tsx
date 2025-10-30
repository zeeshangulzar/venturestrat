'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUserDataRefresh } from '../../contexts/UserDataContext';
import { Country } from 'country-state-city';
import { buildRegionCountryOptions, buildCountryOptions } from '@lib/regions';

import SearchableDropdown from '@components/SearchableDropdown';
import { getApiUrl, updateUserData, fetchUserData } from '@lib/api';
import PageLoader from '@components/PageLoader';
import HomeIcon from '@components/icons/HomeIcon';
import TaskManagerIcon from '@components/icons/TaskManagerIcon';
import LegalIcon from '@components/icons/LegalIcon';
import FinancialsIcon from '@components/icons/FinancialsIcon';
import PresentationsIcon from '@components/icons/PresentationsIcon';
import BusinessPlanningIcon from '@components/icons/BusinessPlanningIcon';
import MarketingIcon from '@components/icons/MarketingIcon';
import { hasVerifiedExternalAccount } from '@utils/externalAccounts';

type FilterOption = { label: string; value: string; disabled?: boolean };

const debounceSearch = (func: (search: string, type: string) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (search: string, type: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(search, type), wait);
  };
};

type OnboardingData = {
  firstName: string;
  lastName: string;
  companyName: string;
  siteUrl: string;
  companyWebsite: string;
  companyLogo: string;
  userCountry: string;
  incorporationCountry: string;
  operationalRegions: string[];
  revenue: string;
  stages: string;
  businessSectors: string[];
  fundingAmount: number;
  fundingCurrency: string;
  currency: string;
};

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const { triggerRefresh } = useUserDataRefresh();
  const [currentCategory, setCurrentCategory] = useState('financials');
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [profileUploadStatus, setProfileUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [logoUploadStatus, setLogoUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    companyName: '',
    siteUrl: '',
    companyWebsite: '',
    companyLogo: '',
    userCountry: '',
    incorporationCountry: '',
    operationalRegions: [],
    revenue: '',
    stages: '',
    businessSectors: [],
    fundingAmount: 0,
    fundingCurrency: '',
    currency: ''
  });

  // Email integration state
  const [isConnecting, setIsConnecting] = useState<null | 'google' | 'microsoft'>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const hasGoogleAccount = useMemo(
    () => hasVerifiedExternalAccount(user?.externalAccounts, 'google'),
    [user?.externalAccounts],
  );
  const hasMicrosoftAccount = useMemo(
    () => hasVerifiedExternalAccount(user?.externalAccounts, 'microsoft'),
    [user?.externalAccounts],
  );

  const googleAccount = useMemo(() => {
    const accounts = user?.externalAccounts || [];
    return accounts.find((a: any) => {
      const providerId = a.provider;
      return providerId === 'google' || providerId === 'oauth_google' || providerId?.includes('google');
    });
  }, [user?.externalAccounts]);

  const microsoftAccount = useMemo(() => {
    const accounts = user?.externalAccounts || [];
    return accounts.find((a: any) => {
      const providerId = a.provider;
      return providerId === 'microsoft' || providerId === 'oauth_microsoft' || providerId?.includes('microsoft');
    });
  }, [user?.externalAccounts]);

  const googleApprovedScopes = (googleAccount?.approvedScopes ?? '').toString();
  const msApprovedScopes = (microsoftAccount?.approvedScopes ?? '').toString();

  const hasGoogleRequiredScopes = useMemo(() => {
    if (!googleApprovedScopes) return false;
    const s = googleApprovedScopes;
    return (
      (s.includes('https://www.googleapis.com/auth/gmail.send') || s.includes('gmail.send')) &&
      (s.includes('https://www.googleapis.com/auth/gmail.readonly') || s.includes('gmail.readonly'))
    );
  }, [googleApprovedScopes]);

  const hasMicrosoftRequiredScopes = useMemo(() => {
    if (!msApprovedScopes) return false;
    const s = msApprovedScopes;
    return (
      (s.includes('https://graph.microsoft.com/Mail.Send') || s.includes('Mail.Send')) &&
      (s.includes('https://graph.microsoft.com/Mail.Read') || s.includes('Mail.Read'))
    );
  }, [msApprovedScopes]);

  const needsGoogleReconnect = hasGoogleAccount && !hasGoogleRequiredScopes;
  const needsMicrosoftReconnect = hasMicrosoftAccount && !hasMicrosoftRequiredScopes;

  const openPopupAndWait = (url: string) => {
    return new Promise<void>((resolve) => {
      const popup = window.open(
        url,
        'oauth-connect',
        'width=500,height=600,scrollbars=yes,resizable=yes,location=yes,toolbar=no'
      );
      if (!popup) {
        resolve();
        return;
      }
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          resolve();
        } else {
          try {
            const href = popup.location?.href ?? '';
            if (href.includes(window.location.origin)) {
              popup.close();
              clearInterval(timer);
              resolve();
            }
          } catch (_) {
            // ignore cross-origin errors while still on provider domain
          }
        }
      }, 1000);
      // safety auto-close after 2 minutes
      setTimeout(() => {
        try { popup.close(); } catch {}
        clearInterval(timer);
        resolve();
      }, 120000);
    });
  };

  const handleConnect = async (provider: 'google' | 'microsoft') => {
    if (!user) return;
    if (provider === 'google' && hasMicrosoftAccount) {
      alert('Microsoft is already connected. Disconnect it before connecting Google.');
      return;
    }
    if (provider === 'microsoft' && hasGoogleAccount) {
      alert('Google is already connected. Disconnect it before connecting Microsoft.');
      return;
    }

    setIsConnecting(provider);
    try {
      const externalAccount = await user.createExternalAccount({
        strategy: provider === 'google' ? 'oauth_google' : 'oauth_microsoft',
        additionalScopes:
          provider === 'google'
            ? [
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/gmail.readonly',
                'openid',
                'email',
                'profile',
              ]
            : [
                'https://graph.microsoft.com/Mail.Send',
                'https://graph.microsoft.com/Mail.Read',
                'offline_access',
              ],
        redirectUrl: window.location.origin,
      });

      const verificationUrl = externalAccount?.verification?.externalVerificationRedirectURL?.toString();
      if (verificationUrl) {
        await openPopupAndWait(verificationUrl);
      }
      await user.reload();
    } catch (e: any) {
      const message = (e && (e.message || e.errors?.[0]?.message)) || '';
      const alreadyConnected = typeof message === 'string' && message.toLowerCase().includes('already connected');
      if (alreadyConnected) {
        // If account exists, try reauthorization (incremental consent) instead
        await handleReconnect(provider);
      } else {
        console.error('Connect failed', e);
        alert('Unable to connect account. Please try again.');
      }
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;
    const account: any = googleAccount || microsoftAccount;
    if (!account) return;
    if (!confirm('Disconnect your email account? Emails cannot be sent until reconnected.')) return;
    setIsDisconnecting(true);
    try {
      if (typeof account.destroy === 'function') {
        await account.destroy();
      } else {
        // Fallback: attempt through user resource if available
        // @ts-expect-error - unlinkExternalAccount is not typed on the User resource in Clerk SDK
        if (typeof user.unlinkExternalAccount === 'function') {
          // @ts-expect-error - unlinkExternalAccount is not typed on the User resource in Clerk SDK
          await user.unlinkExternalAccount(account.id);
        }
      }
      await user.reload();
    } catch (e: any) {
      const message = (e && (e.message || e.errors?.[0]?.message)) || '';
      const needsReauth = typeof message === 'string' && message.toLowerCase().includes('additional verification');
      if (needsReauth) {
        try {
          alert('This action needs a quick re-verification. A sign-in dialog will open. After verifying, we will retry disconnect automatically.');
          await openSignIn({ afterSignInUrl: typeof window !== 'undefined' ? window.location.href : undefined });

          const originalAccountId = account.id;
          const providerId = account.provider;
          let attempts = 0;
          const retry = async (): Promise<void> => {
            attempts += 1;
            try {
              await user.reload?.();
              const freshAccounts = user?.externalAccounts || [];
              const freshAccount: any =
                freshAccounts.find((a: any) => a.id === originalAccountId) ||
                freshAccounts.find((a: any) => a.provider === providerId);
              if (!freshAccount) {
                return; // already disconnected
              }
              if (typeof freshAccount.destroy === 'function') {
                await freshAccount.destroy();
              } else if (typeof (user as any).unlinkExternalAccount === 'function') {
                await (user as any).unlinkExternalAccount(freshAccount.id);
              }
              await user.reload?.();
            } catch (err: any) {
              const msg = (err && (err.message || err.errors?.[0]?.message)) || '';
              const stillNeeds = typeof msg === 'string' && msg.toLowerCase().includes('additional verification');
              if (stillNeeds && attempts < 10) {
                setTimeout(retry, 2000);
              } else if (!stillNeeds) {
                console.error('Disconnect retry failed:', err);
                alert('Failed to disconnect. Please try again.');
              }
            }
          };
          setTimeout(retry, 1500);
        } catch (openErr) {
          console.error('Reverification prompt failed:', openErr);
          alert('Please sign out and sign back in, then try disconnecting again.');
        }
      } else {
        console.error('Disconnect failed', e);
        alert('Failed to disconnect. Please try again.');
      }
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleReconnect = async (provider: 'google' | 'microsoft') => {
    if (!user) return;
    setIsConnecting(provider);
    try {
      const account: any = provider === 'google' ? googleAccount : microsoftAccount;
      const scopes = provider === 'google'
        ? [
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.readonly',
            'openid',
            'email',
            'profile',
          ]
        : [
            'https://graph.microsoft.com/Mail.Send',
            'https://graph.microsoft.com/Mail.Read',
            'offline_access',
          ];

      if (account && typeof account.reauthorize === 'function') {
        // Preferred: reauthorize existing connection with incremental scopes
        const result = await account.reauthorize({
          additionalScopes: scopes,
          redirectUrl: window.location.origin,
        });
        const verificationUrl = result?.verification?.externalVerificationRedirectURL?.toString();
        if (verificationUrl) {
          await openPopupAndWait(verificationUrl);
        }
        await user.reload();
        return;
      }

      // Fallback: destroy then connect again with required scopes
      if (account && typeof account.destroy === 'function') {
        await account.destroy();
        await user.reload();
      }

      const newAccount = await user.createExternalAccount({
        strategy: provider === 'google' ? 'oauth_google' : 'oauth_microsoft',
        additionalScopes: scopes,
        redirectUrl: window.location.origin,
      });
      const verificationUrl = newAccount?.verification?.externalVerificationRedirectURL?.toString();
      if (verificationUrl) {
        await openPopupAndWait(verificationUrl);
      }
      await user.reload();
    } catch (e) {
      console.error('Reconnect failed', e);
      alert('Unable to reconnect. Please try again.');
    } finally {
      setIsConnecting(null);
    }
  };

  // API data state for stages and business sectors
  const [originalStages, setOriginalStages] = useState<FilterOption[]>([]);
  const [originalBusinessSectors, setOriginalBusinessSectors] = useState<FilterOption[]>([]);
  const [stages, setStages] = useState<FilterOption[]>([]);
  const [businessSectors, setBusinessSectors] = useState<FilterOption[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
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
        const mergedOptions = mergeSelectedWithOptions(filteredOptions, formData.stages ? [formData.stages] : [], originalStages);
        setStages(mergedOptions);
      } else if (type === 'investmentFocuses') {
        const filteredOptions = originalBusinessSectors.filter(option =>
          option.label.toLowerCase().includes(searchLower)
        );
        const mergedOptions = mergeSelectedWithOptions(filteredOptions, formData.businessSectors, originalBusinessSectors);
        setBusinessSectors(mergedOptions);
      }
    }, 300);

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
      return;
    }
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
      
      if (!user?.id) {
        throw new Error('User not found');
      }
      
      // Save to backend API - this will preserve all existing data
      const result = await updateUserData(user.id, data, true) as { success?: boolean; error?: string; message?: string };

      console.log('Backend response:', result);

              // Check if the backend save was successful
        if (result && result.success !== false) {
          console.log('Auto-save result:', result);
          // Trigger refresh of user data in sidebar and header
          triggerRefresh();
        } else {
        // Backend save failed
        const errorMessage = result?.error || result?.message || 'Backend save failed';
        throw new Error(errorMessage);
      }



    } catch (error) {
      console.error('Auto-save error:', error);
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
  const countryRegionOptions = buildRegionCountryOptions(countries);
  const countryOptionsOnly = buildCountryOptions(countries);

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

  // Load user data from backend and Clerk profile
  useEffect(() => {
    if (isLoaded && user?.id) {
      const loadUserData = async () => {
        try {
                  // Load data from backend
        const userData = await fetchUserData(user.id) as { 
          user?: { 
            publicMetaData?: { 
              companyName?: string; 
              siteUrl?: string; 
              userCountry?: string; 
              incorporationCountry?: string; 
              operationalRegions?: string[]; 
              revenue?: string; 
              stages?: string[]; 
              businessSectors?: string[]; 
              fundingAmount?: number; 
              fundingCurrency?: string; 
              currency?: string; 
            }; 
            onboardingComplete?: boolean;
            companyWebsite?: string;
            companyLogo?: string;
          }; 
          publicMetaData?: { 
            companyName?: string; 
            siteUrl?: string; 
            userCountry?: string; 
            incorporationCountry?: string; 
            operationalRegions?: string[]; 
            revenue?: string; 
            stages?: string[]; 
            businessSectors?: string[]; 
            fundingAmount?: number; 
            fundingCurrency?: string; 
            currency?: string; 
          }; 
          onboardingComplete?: boolean;
          companyWebsite?: string;
          companyLogo?: string;
        } | null;
        console.log('Loaded user data from backend:', userData);
        
        if (userData === null) {
          // User doesn't exist in backend yet, use empty form data
          console.log('User not found in backend, using empty form data');
          const emptyFormData = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            companyName: '',
            siteUrl: '',
            companyWebsite: '',
            companyLogo: '',
            userCountry: '',
            incorporationCountry: '',
            operationalRegions: [],
            revenue: '',
            stages: '',
            businessSectors: [],
            fundingAmount: 0,
            fundingCurrency: '',
            currency: ''
          };
          setFormData(emptyFormData);
          setIsUserDataLoaded(true);
          return;
        }
        
        // Handle nested user object structure from backend
        const actualUserData = userData.user || userData;
          
          const newFormData = {
            // User profile from Clerk
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            // All other data from backend
            companyName: actualUserData.publicMetaData?.companyName || '',
            siteUrl: actualUserData.publicMetaData?.siteUrl || '',
            companyWebsite: actualUserData.companyWebsite || '',
            companyLogo: actualUserData.companyLogo || '',
            userCountry: actualUserData.publicMetaData?.userCountry || '',
            incorporationCountry: actualUserData.publicMetaData?.incorporationCountry || '',
            operationalRegions: actualUserData.publicMetaData?.operationalRegions || [],
            revenue: actualUserData.publicMetaData?.revenue || '',
            stages: Array.isArray(actualUserData.publicMetaData?.stages) ? actualUserData.publicMetaData.stages[0] || '' : (actualUserData.publicMetaData?.stages || ''),
            businessSectors: actualUserData.publicMetaData?.businessSectors || [],
            fundingAmount: actualUserData.publicMetaData?.fundingAmount || 0,
            fundingCurrency: actualUserData.publicMetaData?.fundingCurrency || '',
            currency: actualUserData.publicMetaData?.currency || ''
          };
          console.log('Setting form data:', newFormData);
          setFormData(newFormData);
          setIsUserDataLoaded(true);
        } catch (error) {
          console.error('Failed to load user data from backend:', error);
          // Fallback to Clerk metadata if backend fails
          const metadata = user.publicMetadata;
          const fallbackFormData = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            companyName: (metadata.companyName as string) || '',
            siteUrl: (metadata.siteUrl as string) || '',
            companyWebsite: (metadata.companyWebsite as string) || '',
            companyLogo: (metadata.companyLogo as string) || '',
            userCountry: (metadata.userCountry as string) || '',
            incorporationCountry: (metadata.incorporationCountry as string) || '',
            operationalRegions: (metadata.operationalRegions as string[]) || [],
            revenue: (metadata.revenue as string) || '',
            stages: Array.isArray(metadata.stages) ? (metadata.stages as string[])[0] || '' : (metadata.stages as string) || '',
            businessSectors: (metadata.businessSectors as string[]) || [],
            fundingAmount: (metadata.fundingCurrency as number) || 0,
            fundingCurrency: (metadata.fundingCurrency as string) || '',
            currency: (metadata.currency as string) || ''
          };
          setFormData(fallbackFormData);
          setIsUserDataLoaded(true);
        }
      };
      
      loadUserData();
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setLogoUploadStatus('uploading');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('userId', user?.id || '');

      // Upload to backend
      const response = await fetch(getApiUrl('/api/user/upload-logo'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Update form data with new logo URL
      setFormData(prev => ({
        ...prev,
        companyLogo: result.logoUrl
      }));

      setLogoUploadStatus('success');
      
      // Trigger refresh to update sidebar
      triggerRefresh();
      
    } catch (error) {
      console.error('Logo upload error:', error);
      setLogoUploadStatus('error');
      alert('Failed to upload logo. Please try again.');
    }
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
      const mergedOptions = mergeSelectedWithOptions(originalStages, formData.stages ? [formData.stages] : [], originalStages);
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
  if (!isLoaded || !user || !isUserDataLoaded) {
    return <PageLoader message="Loading your settings..." />;
  }

  return (
    <main className="min-h-screen">
      <div className="flex items-center bg-[rgba(255, 255, 255, 0.8)] h-[60px] px-5 py-4 border-b border-[#EDEEEF]">
        <h2 className="not-italic font-bold text-[18px] leading-[24px] tracking-[-0.02em] text-[#0C2143]">Setting</h2>
      </div>
      <div className="px-4 py-5 bg-[#F4F6FB]">
        {/* Profile Section */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 mb-8 border border-[#EDEEEF]">
          <div className="flex items-center mb-3 gap-10">
            <h2 className="not-italic font-bold text-[18px] leading-[24px] tracking-[-0.02em] text-[#0C2143]">Profile</h2>
          </div>

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
              <label className="not-italic font-medium text-sm leading-6 text-[#525A68] mb-2">Company Website</label>
              <input
                type="text"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleInputChange}
                className="h-[46px] w-full px-3 py-2 bg-[#F6F6F7] border border-[#EDEEEF] rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 not-italic font-medium text-sm leading-6 text-[#0C2143]"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="not-italic font-medium text-sm leading-6 text-[#525A68] mb-2">Company Logo</label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className={`w-12 h-12 rounded border border-gray-300 flex items-center justify-center overflow-hidden ${
                    logoUploadStatus === 'uploading' ? 'opacity-50' : ''
                  }`}>
                    {formData.companyLogo ? (
                      <img 
                        src={formData.companyLogo} 
                        alt="Company Logo" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm font-medium">
                        {formData.companyName ? formData.companyName.charAt(0).toUpperCase() : '?'}
                      </span>
                    )}
                  </div>
                  
                  {/* Upload Status Indicators */}
                  {logoUploadStatus === 'uploading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </div>
                  )}
                  
                  {logoUploadStatus === 'success' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  
                  {logoUploadStatus === 'error' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={logoUploadStatus === 'uploading'}
                    className={`h-[46px] w-full px-3 py-2 bg-[#F6F6F7] border border-[#EDEEEF] rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 not-italic font-medium text-sm leading-6 text-[#0C2143] ${
                      logoUploadStatus === 'uploading' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a logo image file (PNG, JPG, GIF)
                  </p>
                  
                  {/* Upload Status Messages */}
                  {logoUploadStatus === 'uploading' && (
                    <p className="text-xs text-blue-600 mt-1">
                      Uploading logo...
                    </p>
                  )}
                  
                  {logoUploadStatus === 'error' && (
                    <p className="text-xs text-red-600 mt-1">
                      Failed to upload logo. Please try again.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="not-italic font-medium text-sm leading-6 text-[#525A68] mb-2">Country</label>
              <SearchableDropdown
                isMulti={false}
                options={countryOptionsOnly}
                value={formData.userCountry}
                onChange={(value) => handleDropdownChange('userCountry', Array.isArray(value) ? '' : value)}
                placeholder="Select your country"
                enableSearch={true}
                showApplyButton={false}
                buttonClassName="bg-[#F6F6F7] border-[#EDEEEF] rounded-[10px] text-[#0C2143] hover:bg-[#EDEEEF] rounded-[10px]"
              />
            </div>
          </div>
        </div>

        {/* Email Integration */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 mb-8 border border-[#EDEEEF]">
          <h2 className="text-[20px] font-semibold text-[#0C2143]">Integration Settings</h2>
          <p className="text-sm text-[#525A68] mt-1">
            Configure Google or Microsoft connections for email delivery and webhook support.
          </p>

          {hasGoogleAccount || hasMicrosoftAccount ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {hasGoogleAccount ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#F25022" d="M1 1h10v10H1z"/>
                      <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                      <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                      <path fill="#FFB900" d="M13 13h10v10H13z"/>
                    </svg>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="text-[#0C2143] text-sm font-medium">
                      {hasGoogleAccount ? 'Google connected' : 'Microsoft connected'}
                    </div>
                    <span className="text-[10px] px-2 py-[2px] rounded-full bg-green-50 text-green-700 border border-green-200">Connected</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(needsGoogleReconnect || needsMicrosoftReconnect) && (
                    <button
                      onClick={() => handleReconnect(hasGoogleAccount ? 'google' : 'microsoft')}
                      disabled={isConnecting !== null}
                      className="px-3 py-2 text-sm rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
                      title="Grant email send and read permissions"
                    >
                      {isConnecting ? 'Fixing…' : 'Fix permissions'}
                    </button>
                  )}
                  <button
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    className="px-3 py-2 text-sm rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                  >
                    {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                </div>
              </div>
              {(needsGoogleReconnect || needsMicrosoftReconnect) && (
                <div className="mt-3 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  We’re missing permissions to send and read email. Click “Fix permissions” to reauthorize.
                </div>
              )}
              {/* Show disabled button for the other provider with guidance */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#525A68]">
                  You can only connect one account (Google or Microsoft). Disconnect the current account to connect the other.
                </div>
                <div>
                  {hasGoogleAccount ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center px-4 py-3 rounded-lg opacity-60 cursor-not-allowed border border-gray-200 text-gray-500 bg-gray-50"
                      title="Disconnect Google to connect Microsoft"
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                          <path fill="#F25022" d="M1 1h10v10H1z"/>
                          <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                          <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                          <path fill="#FFB900" d="M13 13h10v10H13z"/>
                        </svg>
                        Connect with Microsoft
                      </div>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center px-4 py-3 rounded-lg opacity-60 cursor-not-allowed border border-gray-200 text-gray-500 bg-gray-50"
                      title="Disconnect Microsoft to connect Google"
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Connect with Google
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => handleConnect('google')}
                disabled={isConnecting !== null}
                className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${
                  isConnecting === 'google' ? 'opacity-50 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {isConnecting === 'google' ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Connect with Google
                  </div>
                )}
              </button>

              <button
                onClick={() => handleConnect('microsoft')}
                disabled={isConnecting !== null}
                className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${
                  isConnecting === 'microsoft' ? 'opacity-50 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {isConnecting === 'microsoft' ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#F25022" d="M1 1h10v10H1z"/>
                      <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                      <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                      <path fill="#FFB900" d="M13 13h10v10H13z"/>
                    </svg>
                    Connect with Microsoft
                  </div>
                )}
              </button>
            </div>
          )}
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
                    <div className="flex items-center justify-between pl-5 py-5">
                      <h2 className="not-italic text-[#0C2143] font-bold text-lg leading-6">Fundraising</h2>
                    </div>
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
                        placeholder="Select business sector"
                        enableSearch={true}
                        showApplyButton={true}
                        onSearch={handleSearch}
                        searchType="investmentFocuses"
                        onOpen={() => handleDropdownOpen('investmentFocuses')}
                        buttonClassName="border border-[#EDEEEF] rounded-[10px] h-[46px] text-[#787F89] not-italic font-medium text-sm leading-6 hover:bg-[#EDEEEF] h-[46px] w-full px-3 py-2 bg-[#F6F6F7]"
                        showSelectedValues={true}
                      />
                    </div>

                    {/* Question 1.5 - Investment Stages */}
                    <div>
                      <label className="not-italic font-semibold text-base leading-6 tracking-[-0.02em] text-[#0C2143] mb-2">
                        Which investment stage best defines your business?
                      </label>
                      <SearchableDropdown
                        isMulti={false}
                        options={stages}
                        value={formData.stages}
                        onChange={(value) => handleDropdownChange('stages', Array.isArray(value) ? value[0] || '' : value)}
                        placeholder="Select business stage"
                        enableSearch={true}
                        showApplyButton={false}
                        onSearch={handleSearch}
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
                              options={countryOptionsOnly}
                              value={formData.incorporationCountry}
                              onChange={(value) => handleDropdownChange('incorporationCountry', Array.isArray(value) ? '' : value)}
                              placeholder="Select country"
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
                              options={countryRegionOptions}
                              value={formData.operationalRegions}
                              onChange={(value) => handleDropdownChange('operationalRegions', Array.isArray(value) ? value : [])}
                              placeholder="Select operating countries"
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
                        placeholder="e.g. $140,000 in revenue and $3.6 CAC"
                        className="w-full px-3 py-2 border border-[#EDEEEF] rounded-[10px] h-[46px] text-[#787F89] not-italic font-medium text-sm leading-6 hover:bg-[#EDEEEF] bg-[#F6F6F7]"
                      />
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
