
import React from "react";
import QuestionItem from "./QuestionItem";
import QuestionSectionHeader from "./QuestionSectionHeader";

interface DraggableQuestionItemProps {
  question: string;
  explanation: string;
  index: number;
  onRemove: (index: number) => void;
  feedback?: string;
  category: string;
  previousCategory?: string;
  draggedItem: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: () => void;
}

const DraggableQuestionItem: React.FC<DraggableQuestionItemProps> = ({
  question,
  explanation,
  index,
  onRemove,
  feedback,
  category,
  previousCategory,
  draggedItem,
  onDragStart,
  onDragOver,
  onDragEnd
}) => {
  return (
    <div 
      className="space-y-1"
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
    >
      {(!previousCategory || category !== previousCategory) && (
        <QuestionSectionHeader category={category} />
      )}
      <QuestionItem
        question={question}
        explanation={explanation}
        index={index}
        onRemove={onRemove}
        isDragging={draggedItem === index}
        dragHandleProps={{
          onMouseDown: (e) => {
            e.currentTarget.parentElement?.setAttribute('draggable', 'true');
          },
          onMouseUp: (e) => {
            e.currentTarget.parentElement?.setAttribute('draggable', 'false');
          }
        }}
        feedback={feedback}
        category={category}
      />
    </div>
  );
};

export default DraggableQuestionItem;
