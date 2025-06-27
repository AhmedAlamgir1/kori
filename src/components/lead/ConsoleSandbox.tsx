
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { toast } from "sonner";
import CodeConsole from "./CodeConsole";
import CodePreview from "./CodePreview";
import HeaderControls from "./HeaderControls";
import FeatureAnalysis from "./FeatureAnalysis";
import { 
  extractFeaturesFromDescription, 
  generateSonnetPrompt, 
  analyzeImplementedFeatures,
  extractCodeFromSonnetResponse
} from "@/utils/codeGenerationSonnet";
import { callSonnetAPI } from "@/utils/api/sonnetApi";

interface ConsoleSandboxProps {
  productIdea: string;
}

const ConsoleSandbox: React.FC<ConsoleSandboxProps> = ({ productIdea }) => {
  // State
  const [consoleContent, setConsoleContent] = useState<string>("");
  const [sandboxContent, setSandboxContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [extractedFeatures, setExtractedFeatures] = useState<string[]>([]);
  const [featureAnalysis, setFeatureAnalysis] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"code" | "features">("code");
  const [prompt, setPrompt] = useState<string>("");
  const [generationError, setGenerationError] = useState<string | null>(null);

  const generateCode = async () => {
    try {
      setIsGenerating(true);
      setGenerationError(null);
      
      // Extract features from the product idea
      const features = extractFeaturesFromDescription(productIdea);
      setExtractedFeatures(features);
      
      // Generate a detailed Sonnet prompt
      const sonnetPrompt = generateSonnetPrompt(productIdea, features);
      setPrompt(sonnetPrompt);
      
      // Call the Sonnet API
      const response = await callSonnetAPI(sonnetPrompt);
      
      if (!response || response.trim() === "") {
        throw new Error("Received empty response from API");
      }
      
      // Extract clean HTML code from the response
      const code = extractCodeFromSonnetResponse(response);
      setConsoleContent(code);
      
      // Analyze which features were implemented
      const analysis = analyzeImplementedFeatures(code, features);
      setFeatureAnalysis(analysis);
      
      // Automatically run the code for immediate preview
      setSandboxContent(code);
      
      toast.success("High-fidelity prototype generated!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error generating code:", errorMessage);
      setGenerationError(errorMessage);
      toast.error("Failed to generate code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const runCode = () => {
    setIsRunning(true);
    try {
      setSandboxContent(consoleContent);
      toast.success("Code is running in sandbox!");
    } catch (error) {
      toast.error("Failed to run code. Please check for errors.");
      console.error("Error running code:", error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    generateCode();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <HeaderControls 
        onBack={() => window.history.back()} 
        onRegenerate={generateCode} 
        isGenerating={isGenerating}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-gray-700 flex flex-col">
          <div className="flex border-b border-gray-700">
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'code' ? 'bg-gray-800 text-white' : 'bg-gray-900 text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('code')}
            >
              Code
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'features' ? 'bg-gray-800 text-white' : 'bg-gray-900 text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('features')}
            >
              Features
            </button>
          </div>
          
          {activeTab === 'code' ? (
            <>
              {generationError && (
                <div className="bg-red-900/30 border border-red-500/50 p-4 m-4 rounded-md">
                  <h3 className="font-medium text-red-300 mb-2">Error generating prototype:</h3>
                  <p className="text-red-200 text-sm">{generationError}</p>
                  <p className="text-red-200/70 text-sm mt-2">
                    Try simplifying your product idea or reducing the number of requested features.
                  </p>
                </div>
              )}
              <CodeConsole content={consoleContent} isGenerating={isGenerating} />
            </>
          ) : (
            <FeatureAnalysis featureAnalysis={featureAnalysis} />
          )}
          
          <div className="bg-gray-800 border-t border-gray-700 p-2">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
              onClick={runCode}
              disabled={isGenerating || !consoleContent || isRunning}
            >
              <Play className="mr-2 h-4 w-4" />
              Run Code
            </Button>
          </div>
        </div>
        
        <CodePreview content={sandboxContent} />
      </div>
    </div>
  );
};

export default ConsoleSandbox;
