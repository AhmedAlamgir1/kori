
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Info, Lightbulb, Code, Sparkles } from "lucide-react";
import ConsoleSandbox from "@/components/lead/ConsoleSandbox";

const Lead = () => {
  const [productIdea, setProductIdea] = useState("");
  const [isPrompting, setIsPrompting] = useState(true);

  const handleLaunch = () => {
    if (productIdea.trim().length < 20) {
      return;
    }
    setIsPrompting(false);
  };

  // Examples to inspire users - more detailed and specific
  const examplePrompts = [
    "A personal finance app that helps users track their expenses, set budget goals, and get insights on their spending habits with colorful charts and weekly reports.",
    "A recipe finder app where users can search by ingredients they have at home, filter by dietary restrictions, and save favorite recipes to personalized cookbooks.",
    "A productivity tool that combines a Pomodoro timer with a task manager, allowing users to organize projects, set time blocks, and track their focus time with detailed statistics."
  ];

  // Enhanced tips for writing effective prompts
  const promptTips = [
    "Be specific about features (e.g., \"users can filter recipes by cuisine type\")",
    "Describe the visual style (e.g., \"minimalist design with pastels\")",
    "Mention your target audience (e.g., \"for busy professionals\")",
    "Specify user interactions (e.g., \"swipe left to delete, tap to edit\")",
    "Include content structure (e.g., \"profile page with stats dashboard\")"
  ];

  const handleExampleClick = (example: string) => {
    setProductIdea(example);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {isPrompting ? (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
          <div className="w-full max-w-3xl space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                What do you want to create today?
              </h1>
              
              <p className="text-lg text-blue-200/80 max-w-2xl mx-auto">
                Describe your product idea in detail, and our AI will generate a high-fidelity interactive prototype with professional design.
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-amber-400">
              <Sparkles className="h-5 w-5" />
              <p className="text-sm font-medium">Now using Sonnet for more polished, detailed prototypes!</p>
            </div>
            
            <div className="mt-8 space-y-6">
              <Textarea
                value={productIdea}
                onChange={(e) => setProductIdea(e.target.value)}
                placeholder="Describe your product idea in detail... (e.g., A mobile app that helps users track their fitness goals, log workouts, and receive personalized recommendations based on their progress)"
                className="min-h-[150px] text-gray-900 text-base p-4 focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-5 w-5 text-blue-400" />
                  <h3 className="font-medium text-blue-400">Tips for better results</h3>
                </div>
                <ul className="list-disc pl-5 text-sm text-blue-200/90 space-y-2">
                  {promptTips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-indigo-500/30">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-blue-400" />
                    <p className="text-xs text-blue-200/90">The more detailed your description, the better the prototype!</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-amber-400" />
                  <h3 className="font-medium text-amber-400">Need inspiration? Try these examples:</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="text-left p-3 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-md border border-indigo-500/30 transition-colors text-sm"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={handleLaunch}
                disabled={productIdea.trim().length < 20}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 text-lg rounded-md w-full md:w-auto"
              >
                Generate Prototype
              </Button>
              
              {productIdea.trim().length < 20 && productIdea.trim().length > 0 && (
                <p className="text-red-400 text-sm">Please provide a more detailed description (at least 20 characters)</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <ConsoleSandbox productIdea={productIdea} />
      )}
    </div>
  );
};

export default Lead;
