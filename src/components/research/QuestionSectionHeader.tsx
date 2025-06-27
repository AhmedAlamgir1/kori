
import React from "react";

interface QuestionSectionHeaderProps {
  category: string;
}

const QuestionSectionHeader: React.FC<QuestionSectionHeaderProps> = ({ category }) => {
  return (
    <div className="text-xs font-semibold uppercase text-indigo-400 pt-2 pb-1">
      {category}
    </div>
  );
};

export default QuestionSectionHeader;
