// src/utils/research/topicValidator.ts (or wherever this file is located)

// Adjust this import path based on where you placed the callChatGPTProxy function.
// For example, if it's in src/api/apiCalls.ts
import { callChatGPTProxy } from "../api/geminiApi"; // <--- ADJUSTED IMPORT PATH

interface ValidationResult {
  isValid: boolean;
  message: string;
  // The 'approach' field is not part of the return from the AI,
  // but if you want to pass it through for some reason, it's okay.
  // However, it's not strictly necessary for the AI's response.
  // It's usually a parameter to the function, not a return value.
  approach?: "explorative" | "evaluative";
}

export async function validateTopicLegitimacy(topic: string, selectedApproach: "explorative" | "evaluative"): Promise<ValidationResult> {
  try {
    // --- Existing pre-processing logic (remains unchanged) ---
    let processedTopic = topic.trim();

    const prefixesToRemove = [
      /^i want to (test|evaluate|understand|get feedback on|research)/i,
      /^i need to (test|evaluate|understand|get feedback on|research)/i,
      /^i would like to (test|evaluate|understand|get feedback on|research)/i,
      /^i am (testing|evaluating|researching|looking for feedback on)/i,
      /^we want to (test|evaluate|understand|get feedback on|research)/i,
      /^we need to (test|evaluate|understand|get feedback on|research)/i,
      /^we would like to (test|evaluate|understand|get feedback on|research)/i,
      /^we are (testing|evaluating|researching|looking for feedback on)/i,
    ];

    let hasPrefixRemoved = false;
    for (const prefix of prefixesToRemove) {
      if (prefix.test(processedTopic)) {
        processedTopic = processedTopic.replace(prefix, '').trim();
        hasPrefixRemoved = true;
        break;
      }
    }

    let extractedConcept = "";
    const extractPrefixRegexes = [
      /(test|evaluate|understand|get feedback on|research) (my|our|the) ([^.]+)/i,
    ];

    for (const regex of extractPrefixRegexes) {
      const match = topic.match(regex);
      if (match && match[3]) {
        extractedConcept = match[3].trim();
        break;
      }
    }

    if (processedTopic.split(/\s+/).length < 3 && hasPrefixRemoved) {
      if (extractedConcept && extractedConcept.split(/\s+/).length >= 2) {
        processedTopic = extractedConcept;
      } else {
        processedTopic = topic.trim();
      }
    }
    // --- End of pre-processing logic ---

    // Build different prompts based on the selected approach
    let prompt = '';

    if (selectedApproach === "evaluative") {
      prompt = `
        I need to verify if the following text contains a concept, idea, product, service, or solution that someone might want to test or evaluate:
        
        "${topic}"
        
        Please analyze this input with a VERY LENIENT approach and determine:
        1. If it identifies ANY kind of testable idea, concept, product, service, or solution
        2. If this is something someone could reasonably want to get feedback on
        
        BE EXTREMELY LENIENT - even very general or vague ideas should be considered valid as long as they represent something that could conceptually be tested. For example, "food truck idea" is perfectly valid even without specifics about the food or business model.
        
        Valid topics include:
        - ANY product or service ideas, even if very general (e.g., "food truck idea", "delivery app")
        - ANY design concepts, no matter how vague
        - ANY business ideas or solutions, even without a business model
        - ANY features or improvements to anything
        - Abstract concepts that could potentially be developed into a product/service
        
        Only reject if:
        - The text is completely nonsensical or random characters
        - The text clearly has nothing to do with a testable concept (e.g., "my vacation photos")
        - The text is purely a factual question with no evaluative component
        
        Respond ONLY with a JSON object in this exact format:
        {
          "isValid": true/false,
          "topic": "the identified concept (if any)",
          "explanation": "brief explanation of why it is or isn't valid - keep to 1-2 short sentences maximum"
        }
        
        Be extremely concise with your explanation - no more than 1-2 short sentences.
        Do not provide examples or suggest alternative topics.
      `;
    } else {
      // For explorative approach, use the existing validation logic
      prompt = `
        I need to verify if the following text contains a legitimate research topic or subject matter:
        
        "${topic}"
        
        Please analyze this input and determine:
        1. If it contains a clearly identifiable topic or subject matter for research
        2. Whether this topic is a legitimate field of study, industry, or area that could be researched (exists in academic literature, news, or industry discussions)
        3. If the topic makes logical sense as a research opportunity or problem statement
        
        Be VERY LENIENT with briefs that:
        - Mention getting feedback on a specific product/concept
        - Refer to testing or evaluating something
        - Mention specific products, tools, or interfaces
        - Relate to legitimate fields of study (like sociology, psychology, education, technology, etc.)
        - Contain enough specific words to identify a domain, even if phrased conversationally
        - Are expressed in first person (e.g., "I want to test my keyboard")
        
        Respond ONLY with a JSON object in this exact format:
        {
          "isValid": true/false,
          "topic": "the main topic identified (if any)",
          "explanation": "brief explanation of why it is or isn't valid - keep to 1-2 short sentences maximum"
        }
        
        If you can identify a legitimate topic even if the phrasing is awkward, try to extract it and validate it.
        Only mark as invalid if no legitimate topic can be identified or if the input is nonsensical.
        
        Be extremely concise with your explanation - no more than 1-2 short sentences.
        Do not provide examples or suggest alternative topics.
      `;
    }

    // Use the now correctly imported callChatGPTProxy
    // You might also want to set a specific model and temperature here for validation.
    const responseText = await callChatGPTProxy(prompt, { model: "gpt-4o-mini", temperature: 0.1 }); // <--- Using the helper

    // Extract JSON from response
    // The regex is robust for extracting JSON that might be wrapped in other text
    const jsonMatch = responseText.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response:", responseText); // Log the raw response for debugging
      return {
        isValid: false,
        message: "AI response format error. Unable to validate topic. Please try again with a clearer description."
      };
    }

    const validationResponse = JSON.parse(jsonMatch[0]);

    // Add type safety check for the parsed response structure
    if (typeof validationResponse.isValid !== 'boolean' || typeof validationResponse.topic !== 'string' || typeof validationResponse.explanation !== 'string') {
        console.error("Parsed AI response has unexpected structure:", validationResponse);
        return {
            isValid: false,
            message: "AI provided an unexpected validation format. Please try again."
        };
    }
    
    if (validationResponse.isValid) {
      return {
        isValid: true,
        message: `Validated topic: ${validationResponse.topic}`,
        // You might consider if 'approach' should be returned, it's a parameter of the function
        // and doesn't come from the AI. If not needed, remove it.
        approach: selectedApproach // Optionally pass the original approach back
      };
    } else {
      // For evaluative approach, provide more specific guidance
      if (selectedApproach === "evaluative") {
        return {
          isValid: false,
          message: `Invalid for testing: ${validationResponse.explanation}. Please provide a specific product or concept to test.`
        };
      } else {
        return {
          isValid: false,
          message: `Invalid topic: ${validationResponse.explanation}`
        };
      }
    }
  } catch (error) {
    console.error("Error validating topic:", error);
    // Be more specific with the error message if the error object contains details
    return {
      isValid: false,
      message: `Failed to validate topic: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`
    };
  }
}