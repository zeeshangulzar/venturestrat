// components/Loader.tsx
import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
