import React from 'react';

const LoadingDots: React.FC = () => {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 bg-blue-300/50 rounded-full animate-pulse" />
      <div className="w-2 h-2 bg-blue-300/50 rounded-full animate-pulse [animation-delay:0.2s]" />
      <div className="w-2 h-2 bg-blue-300/50 rounded-full animate-pulse [animation-delay:0.4s]" />
    </div>
  );
};

export default LoadingDots; 