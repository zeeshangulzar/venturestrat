import React from 'react';
import Loader from './Loader';

interface PageLoaderProps {
  message?: string;
  className?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = "Loading...",
  className = ""
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-white ${className}`}>
      <div className="text-center">
        <Loader size="lg" text={message} />
      </div>
    </div>
  );
};

export default PageLoader;
