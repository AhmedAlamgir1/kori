import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { generateInterviewQuestions } from "@/utils/researchService";
import { 
  QuestionWithExplanation, 
  InterviewQuestionContextType
} from "@/utils/research/interviewQuestionTypes";
import useProfileStore from "@/stores/useProfileStore";
import { saveQuestionsToDatabase } from "@/utils/api/chatApi";
import { useChatStore } from "@/stores/useChatStore";
import { fetchAllUserChats } from "@/utils/api/chatApi";

// Create context with default values
const InterviewQuestionContext = createContext<InterviewQuestionContextType | undefined>(undefined);

interface InterviewQuestionProviderProps {
  children: React.ReactNode;
  opportunity: string;
  researchApproach?: "explorative" | "evaluative";
}

export const InterviewQuestionProvider: React.FC<InterviewQuestionProviderProps> = ({ 
  children, 
  opportunity,
  researchApproach = "explorative"
}) => {
  const [questionsWithExplanations, setQuestionsWithExplanations] = useState<QuestionWithExplanation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentOpportunity, setCurrentOpportunity] = useState<string>(opportunity);
  
  // Use the Zustand store for profile and regenerations management
  const { 
    selectedProfile, 
    regenerationsLeft, 
    decrementRegenerations, 
    resetRegenerations 
  } = useProfileStore();

  // Update currentOpportunity when prop changes
  useEffect(() => {
    if (opportunity !== currentOpportunity) {
      setCurrentOpportunity(opportunity);
      // Clear questions when opportunity changes to prevent showing questions for previous briefs
      setQuestionsWithExplanations([]);
      // Reset regenerations when opportunity changes
      resetRegenerations();
    }
  }, [opportunity, currentOpportunity]);

  const fetchQuestions = async (isProfileChange: boolean = false) => {
    if (!isProfileChange && regenerationsLeft <= 0) {
      //toast.error("You've reached the maximum number of regenerations (3)");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { chatId } = useChatStore.getState();
      
      
      // if (chatId && selectedProfile) {
      //   const currentChat = chats.find(chat => chat._id === chatId);
        
      //   if (currentChat && currentChat.prompts) {
      //     const matchingPrompt = currentChat.prompts.find(prompt => {
      //       const promptAge = Number(prompt.profile?.age);
      //       const profileAge = Number(selectedProfile.age);
            
      //       return prompt.profile?.name === selectedProfile.name &&
      //              promptAge === profileAge &&
      //              prompt.profile?.occupation === selectedProfile.occupation;
      //     });

      //     // If we found a matching prompt and it has questions, use those
      //     if (matchingPrompt && matchingPrompt.questions && matchingPrompt.questions.length > 0) {
      //       const existingQuestions = matchingPrompt.questions.map(q => ({
      //         question: q.question,
      //         explanation: "", // No explanation stored in DB
      //         category: q.category
      //       }));
            
      //       setQuestionsWithExplanations(existingQuestions);
      //       const uniqueCategories: string[] = Array.from(new Set(existingQuestions.map(q => q.category || "General")));
      //       setCategories(uniqueCategories);
      //       toast.success("Loaded existing questions from database!");
      //       setLoading(false);
      //       return;
      //     }
      //   }
      // }

      // If no existing questions found, proceed with GPT generation
      let profileContext = "";
      
      if (selectedProfile) {
        profileContext = `The questions should be tailored for interviewing a respondent with the following profile:
        - Name: ${selectedProfile.name}
        - Age: ${selectedProfile.age}
        - Occupation: ${selectedProfile.occupation}
        - Background: ${selectedProfile.background}
        - Unique Perspective: ${selectedProfile.perspective}`;
      } else {
        profileContext = "Do NOT refer to any specific respondent profile. Generate general questions that would be suitable for any respondent. Do NOT make up or hallucinate any specific respondent details.";
      }
      
      const { questions, explanations, categories = [] } = await generateInterviewQuestions(
        currentOpportunity,
        researchApproach,
        profileContext
      );
      
      const questionsWithExplanations = questions.map((question, index) => ({
        question,
        explanation: explanations[index],
        category: categories[index] || null
      }));
      
      setQuestionsWithExplanations(questionsWithExplanations);
      setCategories(categories);
      
      // Save questions to database
      try {
        if (chatId && selectedProfile) {
          let currentChat = null;
          try {
            const response = await fetchAllUserChats();
            currentChat = response.data?.chats?.find(chat => chat._id === chatId);
          } catch (error) {
            console.error('Error fetching chats:', error);
            // Handle the error, maybe return a fallback value
          }
          if (currentChat && currentChat.prompts) {
            const matchingPrompt = currentChat.prompts.find(prompt => {
              const promptAge = Number(prompt.profile?.age);
              const profileAge = Number(selectedProfile.age);
              
              return prompt.profile?.name === selectedProfile.name &&
                     promptAge === profileAge &&
                     prompt.profile?.occupation === selectedProfile.occupation;
            });
            if (matchingPrompt) {
              for (const q of questionsWithExplanations) {
                const questionData = {
                  category: q.category || "General",
                  question: q.question
                };
                await saveQuestionsToDatabase(chatId, matchingPrompt._id, questionData);
              }
              toast.success("Questions generated and saved to database successfully!");
            } else {
              toast.info("Questions generated successfully! (Note: No matching prompt found)");
            }
          } else {
            toast.info("Questions generated successfully! (Note: No prompts found)");
          }
        } else {
          toast.info("Questions generated successfully! (Note: No chat context available)");
        }
      } catch (dbError) {
        toast.info("Questions generated successfully! (Note: Database save failed)");
      }
      
      if (!isProfileChange) {
        decrementRegenerations();
      }
    } catch (error) {
      setError("Failed to generate interview questions. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions when the component mounts or when opportunity/researchApproach changes
  useEffect(() => {
    fetchQuestions();
  }, [currentOpportunity, researchApproach]);

  // Fetch questions when the selected profile changes
  useEffect(() => {
    if (selectedProfile) {
      fetchQuestions(true);
    }
  }, [selectedProfile]);

  const addCustomQuestion = (newQuestion: QuestionWithExplanation) => {
    setQuestionsWithExplanations([...questionsWithExplanations, newQuestion]);
    toast.success("Custom question added");
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questionsWithExplanations];
    updatedQuestions.splice(index, 1);
    setQuestionsWithExplanations(updatedQuestions);
    toast.info("Question removed");
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, overIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === overIndex) {
      return;
    }
    
    const updatedQuestions = [...questionsWithExplanations];
    const draggedItemContent = updatedQuestions[draggedItem];
    
    updatedQuestions.splice(draggedItem, 1);
    updatedQuestions.splice(overIndex, 0, draggedItemContent);
    
    setDraggedItem(overIndex);
    setQuestionsWithExplanations(updatedQuestions);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    toast.info("Question order updated");
  };

  const getQuestionCategory = (index: number): string => {
    // First, check if the question has its own category from the API
    if (questionsWithExplanations[index]?.category) {
      return questionsWithExplanations[index].category!;
    }
    
    // Fall back to the default categorization if no explicit category
    if (researchApproach === "explorative") {
      if (index < 2) return "Introduction";
      if (index < 5) return "General Experience";
      if (index < 9) return "Pain Points";
      if (index < 12) return "Existing Solutions";
      if (index < 15) return "Co-creation";
    } else {
      // Evaluative research - updated distribution
      if (index < 2) return "Introduction";
      if (index < 5) return "General Experience";
      if (index < 8) return "Pain Points";
      if (index < 11) return "Existing Solutions";
      if (index < 14) return "Concept Testing";
      if (index < 16) return "Co-creation";
    }
    
    return "Your Questions";
  };

  const value = {
    questionsWithExplanations,
    loading,
    error,
    draggedItem,
    fetchQuestions,
    addCustomQuestion,
    removeQuestion,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getQuestionCategory,
    opportunity: currentOpportunity,
    selectedProfile,
    regenerationsLeft
  };

  return (
    <InterviewQuestionContext.Provider value={value}>
      {children}
    </InterviewQuestionContext.Provider>
  );
};

export const useInterviewQuestionContext = (): InterviewQuestionContextType => {
  const context = useContext(InterviewQuestionContext);
  
  if (context === undefined) {
    throw new Error("useInterviewQuestionContext must be used within an InterviewQuestionProvider");
  }
  
  return context;
};
