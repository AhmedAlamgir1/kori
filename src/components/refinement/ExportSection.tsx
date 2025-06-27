import React from 'react';

interface ExportSectionProps {
  onExportRefinedIdeas: () => void;
  isExportDisabled: boolean;
}

const ExportSection: React.FC<ExportSectionProps> = () => {
  return (
    <div className="mt-6 border-t border-slate-700 pt-4">
    </div>
  );
};

export default ExportSection;
