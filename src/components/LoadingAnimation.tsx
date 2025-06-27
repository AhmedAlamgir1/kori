import React from "react";

interface LoadingAnimationProps {
  message?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  message = "Generating ideas..."
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-6 animate-fade-in">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-innovation-accent animate-spin"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-70">
          <div className="w-8 h-8 rounded-full border-t-2 border-b-2 border-innovation-accent animate-spin animation-delay-150"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <div className="w-4 h-4 rounded-full border-t-2 border-b-2 border-innovation-accent animate-spin animation-delay-300"></div>
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-innovation-accent">{message}</p>
      </div>
      
      <div className="flex space-x-1 mt-4">
        <div className="w-2 h-2 rounded-full bg-innovation-accent animate-pulse-subtle"></div>
        <div className="w-2 h-2 rounded-full bg-innovation-accent animate-pulse-subtle delay-150"></div>
        <div className="w-2 h-2 rounded-full bg-innovation-accent animate-pulse-subtle delay-300"></div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
