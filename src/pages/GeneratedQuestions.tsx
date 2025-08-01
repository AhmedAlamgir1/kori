import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileText, Copy, ArrowLeft, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { useChatStore } from "@/stores/useChatStore";
import useProfileStore from "@/stores/useProfileStore";
import profilepic from '../assets/profile-pic.jpeg';

interface Question {
  category: string;
  question: string;
  _id: string;
  id: string;
}

const GeneratedQuestions = () => {
  const navigate = useNavigate();
  const { chats } = useChatStore();
  const { selectedProfile } = useProfileStore();
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (chats && selectedProfile) {
      // Find the chat and prompt that matches the selected profile
      for (const chat of chats) {
        const matchingPrompt = chat.prompts?.find(prompt => {
          const promptAge = Number(prompt.profile?.age);
          const profileAge = Number(selectedProfile.age);
          
          return prompt.profile?.name === selectedProfile.name &&
                 promptAge === profileAge &&
                 prompt.profile?.occupation === selectedProfile.occupation;
        });

        if (matchingPrompt?.questions) {
          setQuestions(matchingPrompt.questions);
          break;
        }
      }
    }
  }, [chats, selectedProfile]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const copyToClipboard = () => {
    const text = questions
      .map((q, i) => `${i + 1}. [${q.category}] ${q.question}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success("All questions copied to clipboard!");
  };

  const handleBack = () => {
    navigate('/prompts');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-blue-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Prompts
          </Button>
        </div>

        <Card className="bg-slate-800/60 border-indigo-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5" />
              Generated Questions
              {selectedProfile && (
                <span className="text-sm bg-indigo-500/30 border border-indigo-500/30 text-white px-2 py-1 ml-2 rounded-md">
                  for {selectedProfile.name}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedProfile && (
              <div className="flex justify-between">
                <div className="profile-pic" style={{width: '20%'}}>
                  {selectedProfile.imageLoading ? (
                    <div className="rounded-sm bg-slate-700 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                    </div>
                  ) : selectedProfile.image ? (
                    <img 
                      src={selectedProfile.image} 
                      alt="persona pic" 
                      className="rounded-sm object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = profilepic;
                      }}
                    />
                  ) : (
                    <div className="rounded-sm bg-slate-700 flex items-center justify-center">
                      <UserRound className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="text-blue-200/80 space-y-4 text-base border-b border-slate-700 pb-4" style={{width: '79%'}}>
                  <p className="text-white text-base">
                    Respondent: {selectedProfile.name}
                    <span className="mx-2">•</span>
                    {selectedProfile.age} years old
                    <span className="mx-2">•</span>
                    {selectedProfile.occupation}
                  </p>
                  <div>
                    <span className="text-white font-medium">Background: </span>
                    <span>{selectedProfile.background}</span>
                  </div>
                  <div>
                    <span className="text-white font-medium">Unique Perspective: </span>
                    <span>{selectedProfile.perspective}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Questions grouped by category */}
            {questions.length > 0 ? (
              Array.from(new Set(questions.map(q => q.category))).map(category => (
                <div key={category} className="space-y-3">
                  <h4 className="text-lg font-medium text-indigo-300">{category}</h4>
                  <div className="space-y-2">
                    {questions
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
              ))
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-xl font-bold text-white mb-2">No questions saved for this profile</h2>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2 pt-4 border-t border-slate-700">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-white hover:text-white border-blue-500/30 hover:bg-blue-600/30"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All Questions
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default GeneratedQuestions; 