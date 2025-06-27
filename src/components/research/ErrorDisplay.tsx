
import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div className="text-center p-4">
      <p className="text-red-400 mb-2">{error}</p>
      <Button onClick={onRetry} className="text-blue-400 underline">Try Again</Button>
    </div>
  );
};

export default ErrorDisplay;
