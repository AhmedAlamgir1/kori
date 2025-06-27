import { useState, useEffect } from "react";
import { simulateSyntheticUserChat, UserProfile } from "@/utils/researchService";
import { analyzeChatConversation } from "@/utils/api/geminiApi";
import { RespondentProfile } from "../profile/types";
import { Message } from "../ChatInterface";
import { toast } from "sonner";
import useProfileStore from "@/stores/useProfileStore";

export function useSyntheticChat(opportunity: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [respondentProfile, setRespondentProfile] = useState<RespondentProfile | null>(null);
  const [currentOpportunity, setCurrentOpportunity] = useState<string>(opportunity);
  const [questionCount, setQuestionCount] = useState(0);
  const [isChatEnded, setIsChatEnded] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, any> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Update when opportunity changes
  useEffect(() => {
    if (opportunity !== currentOpportunity) {
      setCurrentOpportunity(opportunity);
      // Reset chat when opportunity changes
      loadRespondentProfile();
    }
  }, [opportunity, currentOpportunity]);
  
  // Get the selected profile from Zustand store
  const { selectedProfile } = useProfileStore();
  
  // Load the profile from store on component mount or when it changes
  useEffect(() => {
    loadRespondentProfile();
  }, [opportunity, selectedProfile]);
  
  const loadRespondentProfile = () => {
    if (selectedProfile) {
      // Validate that we have a complete profile with required fields
      if (selectedProfile.name && selectedProfile.age && selectedProfile.occupation) {
        setRespondentProfile(selectedProfile);
        
        // Set initial welcome message from the respondent
        setPersonalizedWelcomeMessage(selectedProfile);
      } else {
        console.warn("Incomplete profile found in store, using generic");
        setRespondentProfile(null);
        setGenericWelcomeMessage(opportunity);
      }
    } else {
      // If no profile is selected, set a generic welcome message
      setRespondentProfile(null);
      setGenericWelcomeMessage(opportunity);
    }
  };
  
  const setPersonalizedWelcomeMessage = (profile: RespondentProfile) => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `Hi, I am ${profile.name}`,
      sender: "bot",
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  };
  
  const setGenericWelcomeMessage = (topic: string) => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `Hi`,
      sender: "bot",
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  };
  
  const isQuestion = (text: string): boolean => {
    return text.trim().endsWith("?") || 
           text.toLowerCase().startsWith("what") ||
           text.toLowerCase().startsWith("how") ||
           text.toLowerCase().startsWith("why") ||
           text.toLowerCase().startsWith("when") ||
           text.toLowerCase().startsWith("where") ||
           text.toLowerCase().startsWith("which") ||
           text.toLowerCase().startsWith("who") ||
           text.toLowerCase().startsWith("can you") ||
           text.toLowerCase().startsWith("could you");
  };

  const analyzeChatHistory = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const chatHistory = messages.map(msg => ({
        content: msg.content,
        sender: msg.sender
      }));
      
      const results = await analyzeChatConversation(chatHistory);
      setAnalysis(results);
      setIsChatEnded(true);
    } catch (error) {
      console.error("Error analyzing chat:", error);
      setAnalysisError("Failed to analyze the conversation. Please try again.");
      toast.error("Failed to analyze the conversation");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isChatEnded) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };
    
    if (isQuestion(inputMessage)) {
      setQuestionCount(prev => prev + 1);
    }
    
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      let response;
      
      if (respondentProfile && respondentProfile.name && respondentProfile.age && respondentProfile.occupation) {
        const userProfile: UserProfile = {
          age: respondentProfile.age,
          gender: "Unspecified",
          occupation: respondentProfile.occupation,
          interests: respondentProfile.perspective || ""
        };
        
        response = await simulateSyntheticUserChat(
          currentOpportunity, 
          userProfile, 
          inputMessage,
          respondentProfile.name
        );
      } else {
        const genericProfile: UserProfile = {
          age: "Unspecified",
          gender: "Unspecified",
          occupation: "Unspecified",
          interests: ""
        };
        
        response = await simulateSyntheticUserChat(
          currentOpportunity, 
          genericProfile, 
          inputMessage,
          "Generic Respondent"
        );
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting response:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setQuestionCount(0);
    setIsChatEnded(false);
    setAnalysis(null);
    setAnalysisError(null);
    
    if (respondentProfile && respondentProfile.name && respondentProfile.age && respondentProfile.occupation) {
      setPersonalizedWelcomeMessage(respondentProfile);
    } else {
      setGenericWelcomeMessage(currentOpportunity);
    }
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    respondentProfile,
    currentOpportunity,
    handleSendMessage,
    resetChat,
    questionCount,
    isChatEnded,
    analysis,
    isAnalyzing,
    analysisError,
    analyzeChatHistory,
    loadRespondentProfile
  };
}
