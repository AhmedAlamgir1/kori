
import React from "react";
import DraggableQuestionItem from "./DraggableQuestionItem";
import { useInterviewQuestionContext } from "@/contexts/InterviewQuestionContext";
import { QuestionWithExplanation } from "@/utils/research/interviewQuestionTypes";

interface QuestionsListProps {
  questions: QuestionWithExplanation[];
  customCategoryGetter?: (index: number) => string;
}

const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  customCategoryGetter
}) => {
  const {
    removeQuestion,
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getQuestionCategory
  } = useInterviewQuestionContext();

  // Use provided category getter function or fall back to the context version
  const categoryGetter = customCategoryGetter || getQuestionCategory;

  return (
    <div className="space-y-4">
      {questions.map((item, index) => {
        const currentCategory = categoryGetter(index);
        const previousCategory = index > 0 ? categoryGetter(index - 1) : undefined;
        
        return (
          <DraggableQuestionItem
            key={index}
            question={item.question}
            explanation={item.explanation}
            index={index}
            onRemove={removeQuestion}
            feedback={item.feedback}
            category={currentCategory}
            previousCategory={previousCategory}
            draggedItem={draggedItem}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          />
        );
      })}
    </div>
  );
};

export default QuestionsList;
