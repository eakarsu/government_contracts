import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = ({ size = 'default', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader 
        className={`animate-spin text-blue-600 ${sizeClasses[size]}`} 
      />
      {message && (
        <p className="mt-4 text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;