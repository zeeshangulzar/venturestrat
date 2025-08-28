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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      {showLogo && (
        <div className="mb-8">
          <LogoIcon />
        </div>
      )}
      <div className="text-center">
        <Loader 
          size="lg" 
          text={message} 
          textColor="text-gray-600"
          spinnerColor="border-blue-600"
        />
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
