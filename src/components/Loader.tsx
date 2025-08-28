// components/Loader.tsx
import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  textColor?: string;
  spinnerColor?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '',
  textColor = 'text-gray-600',
  spinnerColor = 'border-blue-600'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 ${spinnerColor} ${sizeClasses[size]}`}></div>
      {text && (
        <p className={`mt-4 ${textColor} text-sm font-medium`}>{text}</p>
      )}
    </div>
  );
};

export default Loader;
