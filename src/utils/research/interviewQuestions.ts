
import { toast } from "sonner";
import { callChatGPTProxy } from "../api/geminiApi";
import { InterviewQuestionsResponse } from "./interviewQuestionTypes";

// Generate interview questions based on the opportunity
export async function generateInterviewQuestions(
  opportunity: string,
  researchApproach: "explorative" | "evaluative" = "explorative",
  profileContext: string = "" // New parameter for profile context
): Promise<InterviewQuestionsResponse> {
  try {
    // Extract the actual concept/product from opportunity statements with prefixes
    let concept = opportunity.trim();
    const extractPrefixRegexes = [
      /^i want to (test|evaluate|understand|get feedback on|research) (my|our|the) ([^.]+)/i,
      /^i need to (test|evaluate|understand|get feedback on|research) (my|our|the) ([^.]+)/i,
      /^i would like to (test|evaluate|understand|get feedback on|research) (my|our|the) ([^.]+)/i,
      /^i am (testing|evaluating|researching|looking for feedback on) (my|our|the) ([^.]+)/i,
      /^we want to (test|evaluate|understand|get feedback on|research) (my|our|the) ([^.]+)/i,
      /^we need to (test|evaluate|understand|get feedback on|research) (my|our|the) ([^.]+)/i,
      /^we would like to (test|evaluate|understand|get feedback on|research) (my|our|the) ([^.]+)/i,
      /^we are (testing|evaluating|researching|looking for feedback on) (my|our|the) ([^.]+)/i,
      /^(test|evaluate|understand|get feedback on|research) (my|our|the) ([^.]+)/i,
    ];
    
    // Try to extract the actual product/concept from the opportunity
    let extractedConcept = "";
    for (const regex of extractPrefixRegexes) {
      const match = concept.match(regex);
      if (match && match[3]) {
        extractedConcept = match[3].trim();
        break;
      }
    }
    
    // Use the extracted concept if it's meaningful, otherwise use the original
    if (extractedConcept && extractedConcept.split(/\s+/).length >= 2) {
      concept = extractedConcept;
    }

    const prompt = `
      Act as a user research expert helping students with innovation projects.
      
      CONTEXT:
      - Students are conducting user interviews for this opportunity area: "${opportunity}"
      - The research approach is: ${researchApproach.toUpperCase()}
      - They need effective interview questions to gain deep insights
      - They also need to understand WHY each question is important (the technique or purpose)
      ${profileContext ? `\n${profileContext}` : ""}
      
      RESEARCH APPROACH CONTEXT:
      ${researchApproach === "explorative" 
        ? "- This is EXPLORATIVE research, so focus on questions that help discover unknown variables, understand user needs/behaviors, and identify patterns or pain points.\n- Questions should be open-ended and encourage storytelling.\n- Include questions that explore context, behaviors, motivations, pain points, and existing solutions. Also, include co-creation questions that help users brainstorm potential solutions based on their unique perspectives."
        : "- This is EVALUATIVE research, so focus on questions that validate assumptions or gather feedback on existing solutions or concepts.\n- Questions should help assess effectiveness, usability, or value of potential solutions.\n- Include questions that explore preferences, comparisons, specific improvement areas, and existing solutions.\n- Also include some concept testing questions to evaluate the opportunity/idea and co-creation questions that engage users in improving the concept.\n- For concept testing, focus on the CORE CONCEPT from the opportunity, which appears to be: \"" + concept + "\"\n- Ask questions to evaluate this core concept's comprehension, appeal, relevance, or distinctiveness - but DO NOT try to cover all aspects.\n- DO NOT invent new features, assume benefits, or add details that weren't mentioned in the brief.\n- DO NOT make assumptions about WHY someone would want this concept or what problems it solves.\n- DO NOT suggest that the concept improves something, solves problems, or has specific benefits unless explicitly mentioned in the brief.\n- DO frame questions neutrally about the core concept without assuming outcomes or benefits."}
      
      TASK:
      Generate 15 interview questions that follow a structured format, specifically:
      
      EXACT NUMBER OF QUESTIONS PER CATEGORY - YOU MUST FOLLOW THIS DISTRIBUTION:
      ${researchApproach === "explorative" 
        ? "- 2 Introduction/warm-up questions\n- 3 General Experience questions\n- 4 Pain Points questions\n- 3 Existing Solutions questions\n- 3 Co-creation questions"
        : "- 2 Introduction/warm-up questions\n- 3 General Experience questions\n- 2-3 Pain Points questions\n- 2-3 Existing Solutions questions\n- 3 Concept Testing questions (including: one about initial impression/appeal/relevance, one about distinctiveness compared to existing solutions)\n- 2 Co-creation questions"}
      
      IMPORTANT: 
      - You MUST generate the EXACT number of questions for each category as specified above, no more and no less.
      - You MUST generate EXACTLY 15 questions in total.
      - Each question MUST seek a UNIQUE insight that does not overlap with other questions in the SAME section.
      - Questions should progressively build understanding without redundancy.
      - Within each category, ensure questions explore DIFFERENT dimensions or aspects of the topic.
      ${researchApproach === "evaluative" 
        ? "- For concept testing questions, refer to the extracted core concept \"" + concept + "\" rather than copying the entire opportunity statement verbatim.\n- DO NOT blindly repeat the opportunity statement in your questions.\n- CRITICAL: NEVER attribute benefits, improvements, or problem-solving capabilities to the concept unless they were explicitly stated in the brief.\n- REPHRASE questions neutrally, e.g.: instead of \"How appealing is the idea of 'I want to test my keyboard which has a different layout than normal keyboards'?\", ask \"How appealing do you find the concept of a keyboard with a different layout?\"\n- Instead of \"How believable is this idea that a different keyboard layout could significantly improve typing efficiency and reduce errors?\" ask \"What are your thoughts on a keyboard with a different layout?\""
        : ""}
      - The categories are strictly separated - a question MUST only belong to ONE category. Never mix categories (e.g., don't put concept testing questions in pain points section).
      - CO-CREATION QUESTIONS should encourage users to imagine, design, or suggest potential solutions based on their unique experiences and perspectives. These should invite creative thinking and collaborative problem-solving.
      
      For each question, provide an explanation of its purpose or the research technique it represents.
      
      QUESTION GUIDELINES:
      - Introduction questions: Build rapport and ease into the conversation with different approaches
      - General Experience questions: Cover different aspects of context, behaviors, and routines
      - Pain Points questions: Explore various types of challenges, frustrations, and unmet needs
      - Existing Solutions questions: Discover different current approaches and workarounds
      - Co-creation questions: Engage users in generating ideas, suggesting improvements, or designing potential solutions based on their unique perspectives
      ${researchApproach === "evaluative" 
        ? "- Concept Testing questions: Frame questions neutrally about the core concept (\"" + concept + "\") without attributing benefits/features. Include these question types:\n  * A neutral question about initial impression, relevance or appeal: \"What are your initial thoughts on this " + concept + "?\" or \"How relevant would " + concept + " be to you personally?\"\n  * A neutral question about distinctiveness: \"What, if anything, makes this " + concept + " different from what you've used before?\""
        : ""}
      
      FORMAT:
      Return ONLY valid JSON in this exact format:
      {
        "questions": [
          "Question 1?",
          "Question 2?",
          // more questions...
        ],
        "explanations": [
          "Explanation of purpose for Question 1 (e.g., ice-breaker, projective technique, etc)",
          "Explanation of purpose for Question 2",
          // more explanations...
        ],
        "categories": [
          "Introduction",
          "Introduction",
          "General Experience",
          "General Experience",
          ${researchApproach === "explorative" 
            ? `"General Experience",\n          "Pain Points",\n          "Pain Points",\n          "Pain Points",\n          "Pain Points",\n          "Existing Solutions",\n          "Existing Solutions",\n          "Existing Solutions",\n          "Co-creation",\n          "Co-creation",\n          "Co-creation"`
            : `"General Experience",\n          "Pain Points",\n          "Pain Points",\n          ${researchApproach === "evaluative" ? `"Pain Points",\n          ` : ``}"Existing Solutions",\n          "Existing Solutions",\n          ${researchApproach === "evaluative" ? `"Existing Solutions",\n          ` : ``}"Concept Testing",\n          "Concept Testing",\n          "Concept Testing",\n          "Co-creation",\n          "Co-creation"`}
        ]
      }
      
      IMPORTANT:
      - Questions should flow naturally from one to the next in a logical interview progression
      - Avoid leading questions or questions with built-in assumptions
      - Make questions conversational and easy to understand
      - Focus on understanding the user's perspective, not validating ideas
      - Explanations should help students understand WHY each question is important or what technique it employs
      - Each explanation should be 1-2 sentences (20-40 words)
      - The response MUST be valid JSON (no explanation text)
      - Each category MUST have exactly the number of questions specified above
      - Questions should ONLY appear in their designated category sections
      ${profileContext ? "\n- Tailor the questions to be appropriate for the specific respondent profile provided" : ""}
    `;

    const responseText = await callChatGPTProxy(prompt);
    
    // Extract and parse JSON
    const jsonMatch = responseText.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from response");
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    // Validate response format
    if (!Array.isArray(parsedResponse.questions) || parsedResponse.questions.length === 0) {
      throw new Error("Invalid response: Expected an array of questions");
    }
    
    if (!Array.isArray(parsedResponse.explanations) || 
        parsedResponse.explanations.length !== parsedResponse.questions.length) {
      throw new Error("Invalid response: Explanations array missing or incorrect length");
    }

    // Check if categories exist, if not, we'll use the default categorization
    if (!Array.isArray(parsedResponse.categories) || 
        parsedResponse.categories.length !== parsedResponse.questions.length) {
      console.warn("Categories not provided or incorrect length, using default categorization");
      // We'll continue without categories, the question categories will use the default mapping
    }
    
    return {
      questions: parsedResponse.questions,
      explanations: parsedResponse.explanations,
      categories: parsedResponse.categories || []
    };
  } catch (error) {
    console.error("Error generating interview questions:", error);
    toast.error("Failed to generate interview questions");
    throw error;
  }
}
