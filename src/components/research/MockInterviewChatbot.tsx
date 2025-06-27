import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, RefreshCw, Bot, User, BarChart2, LightbulbIcon, UserPlus, UserRound, LineChart } from "lucide-react";
import { RespondentProfile } from "./profile/types";
import { simulateSyntheticUserChat } from "@/utils/researchService";
import { analyzeChatConversation } from "@/utils/api/geminiApi";
import { toast } from "sonner";
import LoadingDots from '@/components/LoadingDots';
import ChatAnalysis from './ChatAnalysis';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useProfileStore from "@/stores/useProfileStore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface MockInterviewChatbotProps {
  opportunity: string;
  profile: RespondentProfile;
  onChangeProfile?: (newProfile?: RespondentProfile) => void;
}

const MockInterviewChatbot: React.FC<MockInterviewChatbotProps> = ({ opportunity, profile, onChangeProfile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [isChatEnded, setIsChatEnded] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, any> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [profiles, setProfiles] = useState<RespondentProfile[]>([]);
  const [pendingProfile, setPendingProfile] = useState<RespondentProfile | null>(null);

  // Get profiles from Zustand store
  const { profiles: storeProfiles } = useProfileStore();
  
  // Update local profiles state when store profiles change
  useEffect(() => {
    setProfiles(storeProfiles);
  }, [storeProfiles]);

  const handleProfileSelect = (selectedProfile: RespondentProfile) => {
    setPendingProfile(selectedProfile);
    setShowProfileDialog(false);
    setShowConfirmDialog(true);
  };

  const { selectProfile } = useProfileStore();
  
  const confirmProfileChange = () => {
    if (pendingProfile && onChangeProfile) {
      // Find the profile in the store
      const profileIndex = storeProfiles.findIndex(p => 
        p.name === pendingProfile.name && 
        p.age === pendingProfile.age && 
        p.occupation === pendingProfile.occupation
      );
      
      if (profileIndex !== -1) {
        // Select the profile in the store
        selectProfile(profileIndex);
        
        // Notify parent component
        onChangeProfile(pendingProfile);
        
        // Reset chat with new profile
        const welcomeMessage: Message = {
          id: 'welcome',
          role: 'assistant' as const,
          content: `Hello! I am ${pendingProfile.name}`
        };
        setMessages([welcomeMessage]);
        setInteractionCount(0);
        setIsChatEnded(false);
        setAnalysis(null);
        setAnalysisError(null);
      }
    }
    setShowConfirmDialog(false);
    setPendingProfile(null);
  };

  const cancelProfileChange = () => {
    setShowConfirmDialog(false);
    setPendingProfile(null);
    setShowProfileDialog(true);
  };

  // Reset chat when profile changes
  useEffect(() => {
    if (profile && opportunity) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant' as const,
        content: `Hello! I am ${profile.name}`
      };
      setMessages([welcomeMessage]);
      setInteractionCount(0);
      setIsChatEnded(false);
    }
  }, [profile, opportunity]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Only scroll on new messages during conversation, not on initial load
  useEffect(() => {
    if (messages.length > 1) { // Only scroll if there's more than the initial message
      scrollToBottom();
    }
  }, [messages]);

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

  const isGenericGreeting = (text: string): boolean => {
    const lowerText = text.toLowerCase().trim();
    const greetings = [
      'hey',
      'hi',
      'hello',
      'how are you',
      'how\'s it going',
      'how are things',
      'what\'s up',
      'whats up',
      'sup',
      'good morning',
      'good afternoon',
      'good evening'
    ];

    return greetings.some(greeting => 
      lowerText === greeting || // Exact match
      lowerText.startsWith(greeting + ' ') || // Starts with greeting
      lowerText.endsWith(' ' + greeting) // Ends with greeting
    );
  };

  const hasVagueReference = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    const vagueTerms = [
      'this',
      'that',
      'it',
      'these',
      'those',
      'they',
      'them',
      'there',
      'here'
    ];

    // Check if any vague term is used in isolation (not part of another word)
    return vagueTerms.some(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      return regex.test(lowerText);
    });
  };

  const getVagueReferencePrompt = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('this') || lowerText.includes('that')) {
      return "Could you be more specific about what you're referring to? This will help me provide a more relevant response.";
    }
    if (lowerText.includes('it')) {
      return "Could you clarify what 'it' refers to? This will help me understand your question better.";
    }
    if (lowerText.includes('they') || lowerText.includes('them')) {
      return "Could you specify who you're referring to? This will help me give you a more accurate response.";
    }
    if (lowerText.includes('there') || lowerText.includes('here')) {
      return "Could you be more specific about which location or context you're referring to?";
    }
    return "Could you rephrase your question to be more specific? This will help me provide a better response.";
  };

  const isVagueExpression = (text: string): boolean => {
    const lowerText = text.toLowerCase().trim();
    const vagueExpressions = [
      'that\'s cool',
      'thats cool',
      'that is cool',
      'that\'s nice',
      'thats nice',
      'that is nice',
      'tell me more',
      'interesting',
      'that\'s interesting',
      'thats interesting',
      'that is interesting',
      'yes thats',
      'yes that\'s',
      'yes that is',
      'yeah thats',
      'yeah that\'s',
      'yeah that is'
    ];

    return vagueExpressions.some(expr => 
      lowerText === expr || // Exact match
      lowerText.startsWith(expr + ' ') || // Starts with expression
      lowerText.includes(' ' + expr + ' ') || // Contains expression
      lowerText.endsWith(' ' + expr) // Ends with expression
    );
  };

  const getVagueExpressionPrompt = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('tell me more')) {
      return `I'd be happy to share more details. Could you specify which aspect of my experience with ${opportunity} you'd like to know more about?`;
    }
    if (lowerText.includes('cool') || lowerText.includes('nice') || lowerText.includes('interesting')) {
      return `I appreciate your interest! To have a more meaningful discussion about ${opportunity}, could you tell me what specifically caught your attention?`;
    }
    if (lowerText.startsWith('yes') || lowerText.startsWith('yeah')) {
      return "Could you elaborate on your thoughts? What specific aspects would you like to discuss?";
    }
    return `To help me provide more relevant information about ${opportunity}, could you be more specific about what you'd like to know?`;
  };

  const analyzeChatHistory = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const chatHistory = messages.map(msg => ({
        content: msg.content,
        sender: msg.role === "user" ? "user" : "bot"
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

  const isValidInput = (text: string): boolean => {
    const words = text.trim().split(/\s+/);
    
    // Only check for extremely vague or nonsensical input
    const extremelyVagueWords = [
      'idk', 'dunno', 'whatever', 'stuff', 'thing',
      'lol', 'haha', 'hmm', 'meh'
    ];
    
    // If the message consists ONLY of these words, reject it
    const meaningfulWords = words.filter(word => 
      !extremelyVagueWords.includes(word.toLowerCase())
    );
    
    // If ALL words are vague, reject
    if (meaningfulWords.length === 0) {
      return false;
    }

    // Check for repetitive characters (e.g., "aaaaaa" or "...")
    const repetitivePattern = /(.)\1{4,}/;
    if (repetitivePattern.test(text)) {
      return false;
    }

    return true;
  };

  const getValidationResponse = (text: string): string => {
    const words = text.trim().split(/\s+/);
    
    // Only check for extremely vague or nonsensical input
    const extremelyVagueWords = [
      'idk', 'dunno', 'whatever', 'stuff', 'thing',
      'lol', 'haha', 'hmm', 'meh'
    ];
    
    const meaningfulWords = words.filter(word => 
      !extremelyVagueWords.includes(word.toLowerCase())
    );
    
    if (meaningfulWords.length === 0) {
      return "Could you be more specific? I want to make sure I understand what you're asking.";
    }

    const repetitivePattern = /(.)\1{4,}/;
    if (repetitivePattern.test(text)) {
      return "I didn't quite catch that. Could you rephrase your question?";
    }

    return "";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isChatEnded) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    
    // Add the user message to the chat
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: "user", content: userMessage }]);
    
    // Check if input needs validation
    const validationResponse = getValidationResponse(userMessage);
    if (validationResponse) {
      setMessages(prev => [...prev, { id: `assistant-${Date.now()}`, role: "assistant", content: validationResponse }]);
      return; // Don't increment interaction count for invalid responses
    }
    
    // Only increment interaction count for valid user messages
    if (isValidInput(userMessage)) {
      setInteractionCount(prev => prev + 1);
    }
    
    setIsLoading(true);

    try {
      const userProfile = {
        age: profile.age,
        gender: "Unspecified",
        occupation: profile.occupation,
        interests: `${profile.background} ${profile.perspective}`.trim()
      };

      const response = await simulateSyntheticUserChat(
        opportunity,
        userProfile,
        userMessage,
        profile.name
      );

      if (response) {
        setMessages(prev => [...prev, { id: `assistant-${Date.now()}`, role: "assistant", content: response }]);
      }
    } catch (error) {
      console.error("Error in mock interview:", error);
      toast.error("Failed to get a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshClick = () => {
    setMessages([{ 
      id: `welcome-${Date.now()}`,
      role: "assistant", 
      content: `Hi, I am ${profile.name}` 
    }]);
    setInteractionCount(0);
    setIsChatEnded(false);
    setAnalysis(null);
    setAnalysisError(null);
  };

  const remainingInteractions = Math.max(7 - interactionCount, 0);
  const showAnalyzeButton = interactionCount >= 7 && !isChatEnded;

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-indigo-500/30 flex flex-col h-[600px]">
        <ScrollArea className="flex-grow p-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-indigo-600/30 ml-12"
                      : "bg-slate-700/50 mr-12"
                  } rounded-lg p-4`}
                >
                  <div
                    className={`rounded-full p-2 ${
                      message.role === "user"
                        ? "bg-indigo-600/30"
                        : "bg-slate-700/50"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-indigo-300" />
                    ) : (
                      <Bot className="h-4 w-4 text-blue-300" />
                    )}
                  </div>
                  <div className="text-blue-100/90 text-sm">{message.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700/50 rounded-lg p-4 max-w-[80%] mr-12">
                  <LoadingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-indigo-500/30">
          <TooltipProvider delayDuration={200}>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="bg-slate-700/50 border-slate-600"
                disabled={isChatEnded}
              />
              <div className="flex gap-2 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="submit" 
                      size="icon"
                      className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-white" 
                      disabled={isChatEnded}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Send message</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Button
                        type="button"
                        onClick={analyzeChatHistory}
                        disabled={!showAnalyzeButton}
                        className={`flex items-center gap-2 px-3 bg-slate-700/50 border border-slate-600 text-white min-w-[80px] transition-colors
                          ${!showAnalyzeButton 
                            ? 'opacity-50 hover:bg-slate-600/30 cursor-not-allowed' 
                            : 'hover:bg-slate-600/50 hover:border-indigo-500'
                          }
                        `}
                      >
                        {interactionCount >= 7 ? (
                          <>
                            <LineChart className="h-4 w-4" />
                            <span className="text-sm font-medium text-white">
                              Analyze Chat
                            </span>
                          </>
                        ) : (
                          <>
                            <BarChart2 className="h-4 w-4" />
                            <span className="text-sm font-medium text-white">
                              {interactionCount}/7
                            </span>
                          </>
                        )}
                      </Button>
                      {!showAnalyzeButton && (
                        <div className="absolute inset-0 bg-transparent" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p>{interactionCount >= 7 ? "Analyze conversation" : "Meaningful Response Counter"}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleRefreshClick}
                      className="shrink-0 bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 text-white"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Restart conversation</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-white"
                      onClick={() => setShowProfileDialog(true)}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Change profile</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </form>
          </TooltipProvider>
        </div>
      </div>

      {/* Profile Selection Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-sm border border-indigo-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Select Profile</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-2">
              {profiles.map((p, index) => {
                const isCurrentProfile = profile && 
                  p.name === profile.name && 
                  p.age === profile.age && 
                  p.occupation === profile.occupation;
                
                return (
                  <button
                    key={index}
                    onClick={() => !isCurrentProfile && handleProfileSelect(p)}
                    disabled={isCurrentProfile}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isCurrentProfile
                        ? "bg-slate-700/50 border-indigo-500 cursor-not-allowed opacity-70"
                        : "bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50"
                    } border`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${
                        isCurrentProfile
                          ? "bg-indigo-500/50"
                          : "bg-slate-700/50"
                      }`}>
                        <UserRound className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white flex items-center gap-2">
                          {p.name}
                          {isCurrentProfile && (
                            <span className="text-blue-200/80">(current profile)</span>
                          )}
                          {p.isCustom && (
                            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full">Custom</span>
                          )}
                        </div>
                        <div className="text-sm text-blue-200/80">
                          {p.age} • {p.occupation}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-sm border border-indigo-500/30">
          <DialogHeader>
            <DialogTitle className="text-blue-100">Change Profile?</DialogTitle>
            <DialogDescription className="text-blue-200/80">
              Changing profiles will reset your current chat session. Please make sure you have saved or copied any important information before proceeding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={cancelProfileChange}
              className="border-slate-600 text-blue-100 hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmProfileChange}
              className="bg-indigo-600/80 hover:bg-indigo-600 text-white border-0"
            >
              Change Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Protip Box */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-4 relative overflow-hidden">
        <div className="flex items-start gap-3 relative z-10">
          <div className="rounded-full p-2 bg-yellow-500/20">
            <LightbulbIcon className="h-4 w-4 text-yellow-300" />
          </div>
          <div>
            <h4 className="text-yellow-300 text-sm font-medium mb-1">Keep the conversation meaningful!</h4>
            <p className="text-yellow-100/80 text-sm leading-relaxed">
              As you progress, you will have the option to analyze your conversation — use it to reflect and refine your learning.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent pointer-events-none" />
      </div>

      {(isAnalyzing || analysis || analysisError) && (
        <ChatAnalysis 
          analysis={analysis}
          isLoading={isAnalyzing}
          error={analysisError}
        />
      )}
    </div>
  );
};

export default MockInterviewChatbot;
