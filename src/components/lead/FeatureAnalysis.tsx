
import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface FeatureAnalysisProps {
  featureAnalysis: {
    feature: string;
    implemented: boolean;
    details?: string;
  }[];
}

const FeatureAnalysis: React.FC<FeatureAnalysisProps> = ({ featureAnalysis }) => {
  if (!featureAnalysis || featureAnalysis.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gray-800 p-2 border-b border-gray-700">
        <h2 className="text-sm font-medium text-gray-300">Feature Implementation</h2>
      </div>
      <div className="overflow-auto bg-gray-900 p-4 text-gray-300 text-sm">
        {featureAnalysis.map((item, index) => (
          <div key={index} className="mb-3 last:mb-0">
            <div className="flex items-start gap-2">
              {item.implemented ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 mt-0.5" />
              )}
              <div>
                <p className={item.implemented ? "text-emerald-400" : "text-rose-400"}>
                  {item.feature}
                </p>
                <p className="text-xs text-gray-500 mt-1">{item.details}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureAnalysis;
