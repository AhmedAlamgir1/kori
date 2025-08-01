import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "@/stores/useChatStore";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft
} from "lucide-react";
import ProfileGrid from "@/components/research/profiles/ProfileGrid";
import useProfileStore from "@/stores/useProfileStore";

interface Question {
  category: string;
  question: string;
  _id: string;
  id: string;
}

interface Prompt {
  profile: {
    name: string;
    occupation: string;
    age: number;
  };
  imageUrl: string;
  background: string;
  uniquePerspective: string;
  isActive: boolean;
  _id: string;
  createdAt: string;
  questions: Question[];
}

interface Chat {
  _id: string;
  initialPrompt: string;
  category: string;
  status: string;
  prompts: Prompt[];
  createdAt: string;
  updatedAt: string;
}

const convertPromptToProfile = (prompt: Prompt) => ({
  name: prompt.profile.name,
  age: prompt.profile.age.toString(),
  occupation: prompt.profile.occupation,
  background: prompt.background,
  perspective: prompt.uniquePerspective,
  image: prompt.imageUrl,
  imageLoading: false,
  isCustom: false,
  _id: prompt._id
});

const SavedPrompts = () => {
  const navigate = useNavigate();
  const { chats, selectedChatId, setSelectedChatId } = useChatStore();
  const { setProfiles } = useProfileStore();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (selectedChatId) {
      const chat = chats.find(c => c._id === selectedChatId);
      setSelectedChat(chat || null);
      
      if (chat && chat.prompts) {
        const profiles = chat.prompts.map(convertPromptToProfile);
        setProfiles(profiles);
      }
    } else if (chats.length > 0) {
      setSelectedChat(chats[0]);
      setSelectedChatId(chats[0]._id);
      if (chats[0].prompts) {
        const profiles = chats[0].prompts.map(convertPromptToProfile);
        setProfiles(profiles);
      }
    }
  }, [selectedChatId, chats, setSelectedChatId, setProfiles]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleSelectProfile = (index: number) => {
    setSelectedProfileIndex(index);
    setShowQuestions(false); // Hide questions when selecting a new profile
    setCurrentQuestions([]);
  };

  const handleGenerateQuestions = () => {
    navigate('/generated-questions');
  };

  const handleMockInterview = () => {
    navigate('/saved-mock-interview');
  };

  if (chats.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="text-blue-200 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h1 className="text-2xl font-bold text-white mb-2">No Saved Prompts</h1>
            <p className="text-blue-200/80 mb-6">
              You haven't created any research prompts yet.
            </p>
            <Button onClick={handleBackToDashboard}>
              Start Your First Research
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDashboard}
            className="text-blue-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Saved Prompts</h1>
          </div>
        </div>

        {selectedChat ? (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-indigo-500/30 p-6">
              <h3 className="text-2xl font-semibold text-white mb-4">Respondent Profiles</h3>
              <p className="text-blue-200/80">
                These profiles represent diverse fictional respondents who might provide unique insights about your opportunity: <span className="text-indigo-300 font-medium">{selectedChat.initialPrompt}</span>
              </p>
            </div>
            {selectedChat.prompts.length > 0 ? (
              <>
                <ProfileGrid
                  profiles={selectedChat.prompts.map(convertPromptToProfile)}
                  selectedProfileIndex={selectedProfileIndex}
                  onSelectProfile={handleSelectProfile}
                  onGenerateQuestions={handleGenerateQuestions}
                  onMockInterview={handleMockInterview}
                />
                {showQuestions && currentQuestions.length > 0 && (
                  <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-indigo-500/30 p-6">
                    <h3 className="text-2xl font-semibold text-white mb-4">Generated Questions</h3>
                    <div className="space-y-6">
                      {Array.from(new Set(currentQuestions.map(q => q.category))).map(category => (
                        <div key={category} className="space-y-3">
                          <h4 className="text-lg font-medium text-indigo-300">{category}</h4>
                          <div className="space-y-2">
                            {currentQuestions
                              .filter(q => q.category === category)
                              .map(question => (
                                <div 
                                  key={question._id} 
                                  className="bg-slate-700/50 rounded-lg p-4 text-blue-100/90"
                                >
                                  {question.question}
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-xl font-bold text-white mb-2">Profiles don't exists on this prompt</h2>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-white mb-2">Profiles don't exists on this prompt</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPrompts;