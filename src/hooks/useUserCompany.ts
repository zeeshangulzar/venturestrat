import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { fetchUserData } from '@lib/api';
import { useUserDataRefresh } from '../contexts/UserDataContext';

interface UserCompanyData {
  companyName: string;
  position?: string;
  companyLogo?: string;
  companyWebsite?: string;
  userProfileImage?: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  refreshLogoUrl: () => Promise<void>;
}

export const useUserCompany = (): UserCompanyData => {
  const { user, isLoaded } = useUser();
  const { refreshTrigger } = useUserDataRefresh();
  const [companyData, setCompanyData] = useState<UserCompanyData>({
    companyName: '',
    position: 'Founder',
    companyLogo: undefined,
    companyWebsite: '',
    userProfileImage: undefined,
    isLoading: true,
    error: null,
    refetch: () => {},
    refreshLogoUrl: async () => {}
  });

  const loadUserCompanyData = async () => {
    if (!isLoaded || !user?.id) return;
        try {
          setCompanyData(prev => ({ ...prev, isLoading: true, error: null }));
          
          const userData = await fetchUserData(user.id) as { 
            user?: { 
              publicMetaData?: { 
                companyName?: string;
                position?: string;
              };
              companyLogo?: string;
            }; 
            publicMetaData?: { 
              companyName?: string;
              position?: string;
            };
            companyLogo?: string;
          } | null;

          if (userData === null) {
            // User doesn't exist in backend yet, use default values
            setCompanyData({
              companyName: 'RTYST',
              companyLogo: undefined,
              companyWebsite: '',
              isLoading: false,
              error: null,
              refetch: loadUserCompanyData,
              refreshLogoUrl: async () => {}
            });
            return;
          }

          const actualUserData = userData.user || userData;
          const publicMetaData = actualUserData.publicMetaData || {};
          const actualCompanyWebsite =
            typeof (actualUserData as Record<string, unknown>).companyWebsite === 'string'
              ? ((actualUserData as Record<string, unknown>).companyWebsite as string).trim()
              : '';

          setCompanyData({
            companyName: publicMetaData.companyName || 'RTYST',
            position: publicMetaData.position as string | undefined || 'Founder',
            companyLogo: actualUserData.companyLogo,
            companyWebsite: actualCompanyWebsite,
            userProfileImage: user.imageUrl,
            isLoading: false,
            error: null,
            refetch: loadUserCompanyData,
            refreshLogoUrl: async () => {}
          });
        } catch (error) {
          console.error('Failed to load user company data:', error);
          setCompanyData({
            companyName: 'RTYST',
            position: 'Founder',
            companyLogo: undefined,
            companyWebsite: '',
            userProfileImage: user?.imageUrl,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load company data',
            refetch: loadUserCompanyData,
            refreshLogoUrl: async () => {}
          });
        }
      };

  useEffect(() => {
    if (isLoaded && user?.id) {
      loadUserCompanyData();
      } else if (isLoaded && !user) {
        // User not logged in, use default values
        setTimeout(() => {
          setCompanyData({
            companyName: 'RTYST',
            companyLogo: undefined,
            companyWebsite: '',
            userProfileImage: undefined,
            isLoading: false,
            error: null,
            refetch: loadUserCompanyData,
            refreshLogoUrl: async () => {}
          });
        }, 0);
      }
  }, [isLoaded, user?.id, refreshTrigger]);

  return companyData;
};
