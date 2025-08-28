import React from 'react';
import Loader from './Loader';

interface AuthLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const AuthLoadingOverlay: React.FC<AuthLoadingOverlayProps> = ({ 
  isVisible, 
  message = "Processing authentication..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <Loader size="lg" text={message} />
      </div>
    </div>
  );
};

export default AuthLoadingOverlay;
