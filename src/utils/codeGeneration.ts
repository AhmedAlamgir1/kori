
/**
 * Extracts features from a product description using basic NLP techniques
 */
export function extractFeaturesFromDescription(description: string): string[] {
  // Simple extraction based on common patterns
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
  return [...new Set(features)].slice(0, 5); // Limit to 5 features
}

/**
 * Generates a prompt for the code generation API
 */
export function generateCodePrompt(productIdea: string, extractedFeatures: string[]): string {
  return `
Generate high-quality, responsive, and modern HTML/CSS/JavaScript code for the following product idea:
${productIdea}

Specifically implement these features:
${extractedFeatures.map((feature, index) => `${index + 1}. ${feature}`).join('\n')}

Requirements:
- Create a fully responsive design that works well on mobile, tablet, and desktop
- Use modern CSS (Flexbox/Grid) for layout
- Include realistic placeholder content and images
- Implement interactivity using vanilla JavaScript
- Add smooth animations and transitions
- Use a clean, professional UI with consistent styling
- Comments explaining key sections of the code

Respond with ONLY the complete HTML code that includes inline CSS and JavaScript.
Do not include any explanation outside the code. The code should be ready to run in a browser.
`;
}

/**
 * Analyzes the generated code to check which features were implemented
 */
export function analyzeImplementedFeatures(code: string, requestedFeatures: string[]): {
  feature: string;
  implemented: boolean;
  details?: string;
}[] {
  return requestedFeatures.map(feature => {
    // Create a simplified version of the feature for better matching
    const simplifiedFeature = feature.toLowerCase()
      .replace(/should|could|would|will|can|able to|features?|includes?|supports?|enables?/gi, '')
      .trim();
    
    // Check if the feature keywords appear in the code
    const featureWords = simplifiedFeature.split(/\s+/).filter(word => word.length > 3);
    const matchCount = featureWords.filter(word => 
      code.toLowerCase().includes(word.toLowerCase())
    ).length;
    
    const implemented = matchCount > 0 && matchCount >= Math.ceil(featureWords.length * 0.4);
    
    return {
      feature,
      implemented,
      details: implemented 
        ? `Found ${matchCount}/${featureWords.length} key terms` 
        : "Not detected in code"
    };
  });
}
