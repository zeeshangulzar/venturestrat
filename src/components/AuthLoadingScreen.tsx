import React from 'react';
import Loader from './Loader';
import LogoIcon from './icons/LogoWithText';

interface AuthLoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({ 
  message = "Processing authentication...",
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen bg-[#0c2143] flex flex-col items-center justify-center p-6">
      {showLogo && (
        <div className="mb-8">
          <LogoIcon />
        </div>
      )}
      <div className="bg-[#1b2130] rounded-[14px] border border-[rgba(37,99,235,0.1)] p-8 shadow-2xl max-w-sm w-full">
        <Loader 
          size="lg" 
          text={message} 
          textColor="text-[#FFFFFF]"
          spinnerColor="border-[#2563EB]"
        />
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
