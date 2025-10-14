import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { fetchUserData } from '@lib/api';

interface UserCompanyData {
  companyName: string;
  companyLogo?: string;
  userProfileImage?: string;
  isLoading: boolean;
  error: string | null;
}

export const useUserCompany = (): UserCompanyData => {
  const { user, isLoaded } = useUser();
  const [companyData, setCompanyData] = useState<UserCompanyData>({
    companyName: '',
    companyLogo: undefined,
    userProfileImage: undefined,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (isLoaded && user?.id) {
      const loadUserCompanyData = async () => {
        try {
          setCompanyData(prev => ({ ...prev, isLoading: true, error: null }));
          
          const userData = await fetchUserData(user.id) as { 
            user?: { 
              publicMetaData?: { 
                companyName?: string;
                companyLogo?: string;
              }; 
            }; 
            publicMetaData?: { 
              companyName?: string;
              companyLogo?: string;
            }; 
          } | null;

          if (userData === null) {
            // User doesn't exist in backend yet, use default values
            setCompanyData({
              companyName: 'RTYST',
              companyLogo: undefined,
              isLoading: false,
              error: null
            });
            return;
          }

          const actualUserData = userData.user || userData;
          const publicMetaData = actualUserData.publicMetaData || {};
          
          setCompanyData({
            companyName: publicMetaData.companyName || 'RTYST',
            companyLogo: publicMetaData.companyLogo,
            userProfileImage: user.imageUrl,
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error('Failed to load user company data:', error);
          setCompanyData({
            companyName: 'RTYST',
            companyLogo: undefined,
            userProfileImage: user?.imageUrl,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load company data'
          });
        }
      };

      loadUserCompanyData();
    } else if (isLoaded && !user) {
      // User not logged in, use default values
      setCompanyData({
        companyName: 'RTYST',
        companyLogo: undefined,
        userProfileImage: undefined,
        isLoading: false,
        error: null
      });
    }
  }, [isLoaded, user?.id]);

  return companyData;
};
