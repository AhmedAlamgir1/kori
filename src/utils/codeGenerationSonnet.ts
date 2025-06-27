
import { callSonnetAPI } from "./api/sonnetApi";

/**
 * Extracts features from a product description
 */
export function extractFeaturesFromDescription(description: string): string[] {
  const features: string[] = [];
  
  // Look for sentences with "should", "could", "would", "will", "can"
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  for (const sentence of sentences) {
    if (/should|could|would|will|can|able to|features?|includes?|supports?|enables?/i.test(sentence)) {
      features.push(sentence.trim());
    }
  }
  
  // Look for bullet points or numbered lists
  const bulletPoints = description.match(/[-•*]\s+([^\n]+)/g);
  if (bulletPoints) {
    features.push(...bulletPoints.map(point => point.replace(/[-•*]\s+/, '').trim()));
  }
  
  // Look for numbered points
  const numberedPoints = description.match(/\d+\.\s+([^\n]+)/g);
  if (numberedPoints) {
    features.push(...numberedPoints.map(point => point.replace(/\d+\.\s+/, '').trim()));
  }
  
  // If we couldn't extract anything specific, create some general features
  if (features.length === 0) {
    const words = description.split(/\s+/);
    if (words.length > 5) {
      // Create a feature from the first 5-10 words
      features.push(words.slice(0, Math.min(10, words.length)).join(' '));
    } else {
      features.push(description);
    }
  }
  
  // Remove duplicates and return
  return [...new Set(features)].slice(0, 6); // Allow for 6 features
}

/**
 * Generates a more realistic, scoped prompt for Sonnet API
 */
export function generateSonnetPrompt(productIdea: string, extractedFeatures: string[]): string {
  return `
As a senior web developer and designer, create a high-fidelity HTML prototype for the following product idea:

${productIdea}

KEY FEATURES TO IMPLEMENT (focus on a subset if needed for a quality prototype):
${extractedFeatures.map((feature, index) => `${index + 1}. ${feature}`).join('\n')}

IMPORTANT GUIDANCE:
- Create a STATIC PROTOTYPE focused on frontend only (no need for real backend)
- Focus on a SMALL SUBSET of core features - quality over quantity
- Design for JUST THE PRIMARY USER FLOW - no need to implement everything
- Use placeholder data that looks realistic
- Focus on a polished, beautiful UI rather than functionality
- Write clean, semantic HTML with inline CSS and minimal JavaScript
- Implement responsive design for mobile and desktop views
- Include realistic form fields (they don't need to actually work)
- Add hover states and visual feedback for interactive elements

TECHNICAL DETAILS:
- Use vanilla HTML, CSS, and JavaScript only
- Create a high-quality, polished visual design that's aesthetically pleasing
- Include beautiful UI components (navigation, cards, buttons, etc.) with modern styling
- Focus on the visual design - don't worry about complex functionality
- Include realistic but static data (no need for database)

DESIGN REQUIREMENTS:
- Create a visually polished, professional, modern design
- Use a cohesive color scheme appropriate to the app
- Add appropriate white space, typography hierarchy, and visual balance
- Prioritize aesthetics and visual appeal

Return ONLY the complete HTML code with inline CSS and JavaScript. No explanations needed.
`;
}

/**
 * Analyzes the implemented features in the generated code
 */
export function analyzeImplementedFeatures(code: string, requestedFeatures: string[]): {
  feature: string;
  implemented: boolean;
  details?: string;
}[] {
  // More sophisticated feature detection
  return requestedFeatures.map(feature => {
    // Create a simplified version of the feature for better matching
    const simplifiedFeature = feature.toLowerCase()
      .replace(/should|could|would|will|can|able to|features?|includes?|supports?|enables?/gi, '')
      .trim();
    
    // Check if the feature keywords appear in the code
    const featureWords = simplifiedFeature.split(/\s+/).filter(word => word.length > 3);
    
    let matchCount = 0;
    let matchDetails = [];
    
    // Check for exact phrases first (more reliable)
    if (code.toLowerCase().includes(simplifiedFeature.toLowerCase())) {
      matchCount += featureWords.length;
      matchDetails.push("Exact phrase match");
    } else {
      // Check for individual keywords
      for (const word of featureWords) {
        if (word.length > 3 && code.toLowerCase().includes(word.toLowerCase())) {
          matchCount++;
          matchDetails.push(`Found term: "${word}"`);
        }
      }
    }
    
    // Look for feature implementations in HTML elements, form fields, buttons, etc.
    const implemented = matchCount > 0 && matchCount >= Math.ceil(featureWords.length * 0.4);
    
    return {
      feature,
      implemented,
      details: implemented 
        ? `${matchDetails.slice(0, 2).join(", ")}` 
        : "Not detected in generated code"
    };
  });
}

/**
 * Extracts the HTML code from Sonnet's response
 */
export function extractCodeFromSonnetResponse(response: string): string {
  // Try to extract code between HTML tags first
  const htmlMatch = response.match(/<html[^>]*>([\s\S]*?)<\/html>/i);
  if (htmlMatch) {
    return `<html${htmlMatch[0].substring(5, htmlMatch[0].length)}`;
  }
  
  // Try to find code blocks
  const codeBlockMatch = response.match(/```(?:html)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  
  // If no clear HTML or code blocks, return the whole response
  // but check if it looks like HTML
  if (response.includes("<body") && response.includes("<head")) {
    return response;
  }
  
  // Wrap plain text in a basic HTML structure
  if (!response.includes("<html")) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated App</title>
</head>
<body>
  ${response}
</body>
</html>`;
  }
  
  return response;
}
