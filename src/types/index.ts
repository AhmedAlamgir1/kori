
export interface ProblemStatement {
  opportunity: string;
  problem: string;
}

export interface ProductFeature {
  name: string;
  description: string;
}

export interface ProductIdea {
  id: number;
  title: string;
  description: string;
  rationale: string;
  features: ProductFeature[];
}

export interface GeminiResponse {
  ideas: ProductIdea[];
}
