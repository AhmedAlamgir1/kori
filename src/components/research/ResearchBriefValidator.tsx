import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertCircle, Search, Microscope } from "lucide-react";
import { toast } from "sonner";
import { validateTopicLegitimacy } from "@/utils/research/topicValidator";

interface ResearchBriefValidatorProps {
  opportunity: string;
  setOpportunity: (value: string) => void;
  onValidationSuccess: (approach: "explorative" | "evaluative") => void;
}

const ResearchBriefValidator: React.FC<ResearchBriefValidatorProps> = ({
  opportunity,
  setOpportunity,
  onValidationSuccess
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [researchApproach, setResearchApproach] = useState<"explorative" | "evaluative">("explorative");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setValidationError(null);
    try {
      // Basic validation checks
      // Count words by splitting on whitespace and filtering out empty strings
      const words = opportunity.trim().split(/\s+/).filter(word => word.length > 0);
      const wordCount = words.length;

      // Check for minimum word count
      if (wordCount < 3) {
        setValidationError("Please provide a more detailed description (at least 3 words)");
        toast.error("Your brief is too vague. Please provide more details.");
        setIsValidating(false);
        return;
      }

      // Check for low-quality inputs that are clearly not research topics
      const lowQualityKeywords = ["test123", "hello", "asdf", "qwerty", "xyz123"];
      const lowQualityPattern = new RegExp(`\\b(${lowQualityKeywords.join('|')})\\b`, 'i');

      // Check if the input matches any of the low-quality patterns
      if (lowQualityPattern.test(opportunity)) {
        setValidationError("Please provide a meaningful research opportunity area");
        toast.error("Your brief contains generic text. Please describe a real opportunity area.");
        setIsValidating(false);
        return;
      }

      // Check for extremely incomplete phrases
      const incompletePatterns = [/^(help|please|just|trying)(\s+\w+){0,1}$/i, /^(test|testing|example|sample|dummy)$/i];

      // Check if the input is an extremely incomplete phrase
      const isIncomplete = incompletePatterns.some(pattern => pattern.test(opportunity.trim()));
      if (isIncomplete) {
        setValidationError("Please describe a complete research opportunity or problem area");
        toast.error("Your brief appears to be incomplete. Please provide a full description.");
        setIsValidating(false);
        return;
      }

      // Validate topic legitimacy, passing the selected approach
      const validationResult = await validateTopicLegitimacy(opportunity, researchApproach);
      if (!validationResult.isValid) {
        setValidationError(validationResult.message);
        toast.error(validationResult.message);
        setIsValidating(false);
        return;
      }

      // Store research approach in local storage for use by other components
      localStorage.setItem('researchApproach', researchApproach);
      
      setValidationError(null);
      onValidationSuccess(researchApproach);
    } catch (error) {
      console.error("Error validating opportunity:", error);
      setValidationError("An error occurred during validation. Please try again.");
      toast.error("Validation failed. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-lg mb-3 block">What do you want to understand more about today?</Label>
          
          <RadioGroup 
            value={researchApproach} 
            onValueChange={(value) => setResearchApproach(value as "explorative" | "evaluative")}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
          >
            <div className={`border rounded-lg p-4 ${researchApproach === "explorative" ? "border-blue-500 bg-blue-500/10" : "border-slate-600"}`}>
              <RadioGroupItem value="explorative" id="explorative" className="sr-only" />
              <Label 
                htmlFor="explorative" 
                className="flex items-start cursor-pointer gap-3"
              >
                <Search className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium block">I want to explore</span>
                </div>
              </Label>
            </div>
            
            <div className={`border rounded-lg p-4 ${researchApproach === "evaluative" ? "border-purple-500 bg-purple-500/10" : "border-slate-600"}`}>
              <RadioGroupItem value="evaluative" id="evaluative" className="sr-only" />
              <Label 
                htmlFor="evaluative" 
                className="flex items-start cursor-pointer gap-3"
              >
                <Microscope className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium block">I want to test / validate</span>
                </div>
              </Label>
            </div>
          </RadioGroup>
          
          <Textarea 
            id="opportunity" 
            value={opportunity} 
            onChange={e => setOpportunity(e.target.value)} 
            placeholder={researchApproach === "evaluative" 
              ? "Enter the product, service, or concept you want to test..." 
              : "Enter your research topic, problem statement, or opportunity area here..."
            } 
            className="h-32 text-white mt-2" 
            required 
          />
          
          {validationError && (
            <div className="flex items-center gap-2 text-red-400 text-sm mt-1">
              <AlertCircle className="h-4 w-4" />
              <span>{validationError}</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-blue-300/70">
          Being more detailed (e.g., with target audience) can help us generate more relevant information for your project.
        </p>
      </div>
      
      <Button type="submit" className="w-full" disabled={isValidating}>
        {isValidating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validating...
          </>
        ) : (
          "Let's Understand"
        )}
      </Button>

    </form>
  );
};

export default ResearchBriefValidator;
