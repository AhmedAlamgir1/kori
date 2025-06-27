
import { callChatGPTProxy } from "./geminiApi";
import { InnovationSpace, SpaceDetails } from "@/types/briefs";
import { toast } from "sonner";

// Pre-defined innovation spaces to avoid API calls for basic data
const INNOVATION_SPACES: InnovationSpace[] = [
  {
    id: "healthcare",
    name: "Healthcare",
    shortDescription: "Innovate to improve health outcomes, access, and experiences for patients and providers.",
    tags: ["Health Tech", "Patient Care", "Medical Solutions"],
    category: "featured"
  },
  {
    id: "education",
    name: "Education",
    shortDescription: "Transform learning experiences and educational outcomes for learners of all ages.",
    tags: ["EdTech", "Learning", "Skill Development"],
    category: "featured"
  },
  {
    id: "sustainability",
    name: "Sustainability",
    shortDescription: "Create solutions that promote environmental sustainability and address climate challenges.",
    tags: ["Climate Tech", "Green Solutions", "Conservation"],
    category: "featured"
  },
  {
    id: "mentalhealth",
    name: "Mental Health",
    shortDescription: "Develop tools and services to support mental wellbeing and emotional resilience.",
    tags: ["Wellbeing", "Psychology", "Support Systems"],
    category: "featured"
  },
  {
    id: "inclusivesociety",
    name: "Inclusive Society",
    shortDescription: "Build solutions that address social inequalities and promote inclusivity.",
    tags: ["Accessibility", "Diversity", "Social Impact"],
    category: "featured"
  },
  {
    id: "personalwellbeing",
    name: "Personal Wellbeing",
    shortDescription: "Create products and services that enhance overall quality of life and wellness.",
    tags: ["Fitness", "Nutrition", "Self-care"],
    category: "featured"
  },
  {
    id: "ageingsociety",
    name: "Ageing Society",
    shortDescription: "Design solutions that address the challenges and opportunities of an ageing population.",
    tags: ["Elder Care", "Longevity", "Active Ageing"],
    category: "featured"
  },
  {
    id: "climateaction",
    name: "Climate Action",
    shortDescription: "Innovate to combat climate change and build resilience to its impacts.",
    tags: ["SDG 13", "Carbon Reduction", "Climate Resilience"],
    category: "sdgs"
  },
  {
    id: "qualityeducation",
    name: "Quality Education",
    shortDescription: "Ensure inclusive and equitable quality education for all learners.",
    tags: ["SDG 4", "Learning Access", "Educational Equality"],
    category: "sdgs"
  },
  {
    id: "goodhealth",
    name: "Good Health",
    shortDescription: "Ensure healthy lives and promote well-being for all at all ages.",
    tags: ["SDG 3", "Healthcare Access", "Wellness"],
    category: "sdgs"
  },
  {
    id: "reducedinequalities",
    name: "Reduced Inequalities",
    shortDescription: "Reduce inequality within and among countries and communities.",
    tags: ["SDG 10", "Social Equity", "Inclusion"],
    category: "sdgs"
  },
  {
    id: "aiethics",
    name: "AI Ethics",
    shortDescription: "Develop responsible AI systems that align with human values and societal benefit.",
    tags: ["AI Safety", "Governance", "Ethical Tech"],
    category: "emerging"
  },
  {
    id: "smartcities",
    name: "Smart Cities",
    shortDescription: "Create technologies that make urban environments more efficient, sustainable, and livable.",
    tags: ["Urban Tech", "IoT", "Civic Innovation"],
    category: "emerging"
  }
];

/**
 * Retrieves innovation spaces filtered by category
 */
export async function getInnovationSpaces(category: "featured" | "sdgs" | "emerging"): Promise<InnovationSpace[]> {
  try {
    // Filter the pre-defined spaces by category
    return INNOVATION_SPACES.filter(space => space.category === category);
  } catch (error) {
    console.error("Error getting innovation spaces:", error);
    throw new Error("Failed to load innovation spaces");
  }
}

/**
 * Retrieves detailed information about a specific innovation space using Gemini API
 */
export async function getSpaceDetails(spaceName: string): Promise<SpaceDetails> {
  try {
    const prompt = generateSpaceDetailsPrompt(spaceName);
    
    // First check if we have cached data to avoid unnecessary API calls
    const cachedDetails = sessionStorage.getItem(`space_details_${spaceName.toLowerCase().replace(/\s+/g, '_')}`);
    if (cachedDetails) {
      return JSON.parse(cachedDetails);
    }
    
    // If no cached data, call the Gemini API
    const response = await callChatGPTProxy(prompt);
    
    // Parse the JSON response
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/({[\s\S]*})/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      const details: SpaceDetails = JSON.parse(jsonStr);
      
      // Cache the result for future use
      sessionStorage.setItem(
        `space_details_${spaceName.toLowerCase().replace(/\s+/g, '_')}`, 
        JSON.stringify(details)
      );
      
      return details;
    } catch (parseError) {
      console.error("Error parsing API response:", parseError);
      throw new Error("Failed to parse innovation space details");
    }
  } catch (error) {
    console.error(`Error getting details for ${spaceName}:`, error);
    toast.error(`Failed to load details for ${spaceName}`);
    
    // Return placeholder data if API call fails
    return generatePlaceholderDetails(spaceName);
  }
}

/**
 * Generates a prompt for the Gemini API to get detailed information about an innovation space
 */
function generateSpaceDetailsPrompt(spaceName: string): string {
  return `
    You are an innovation expert providing structured information about "${spaceName}" as an innovation space.

    Please provide a comprehensive overview of this innovation space, focusing on:
    1. A general overview of the space
    2. The societal impact of innovations in this space
    3. Why now is a strategic time to innovate in this space (technology trends, market conditions, societal needs)
    4. Key statistics that highlight the importance and market potential
    5. Potential angles or focus areas for innovation within this space

    Format your response as valid JSON matching EXACTLY this structure:
    {
      "name": "${spaceName}",
      "overview": "A 2-3 paragraph overview of the innovation space",
      "societalImpact": "A detailed explanation of how innovations in this space impact society",
      "whyNow": "Explanation of why now is a strategic time to innovate in this space",
      "keyStatistics": [
        {
          "value": "Statistic value (e.g., '$4.5 trillion', '35%')",
          "description": "Short explanation of what this statistic represents"
        },
        {
          "value": "Another statistic value",
          "description": "Explanation of this statistic"
        },
        {
          "value": "Another statistic value",
          "description": "Explanation of this statistic"
        }
      ],
      "innovationAngles": [
        {
          "title": "First innovation angle or focus area",
          "description": "Description of this potential area for innovation"
        },
        {
          "title": "Second innovation angle",
          "description": "Description of this potential area for innovation"
        },
        {
          "title": "Third innovation angle",
          "description": "Description of this potential area for innovation"
        },
        {
          "title": "Fourth innovation angle",
          "description": "Description of this potential area for innovation"
        }
      ]
    }

    Ensure the response contains realistic, factual information with actual statistics where possible. Only provide the JSON - no other explanation.
  `;
}

/**
 * Generates placeholder details for an innovation space in case the API call fails
 */
function generatePlaceholderDetails(spaceName: string): SpaceDetails {
  return {
    name: spaceName,
    overview: `${spaceName} is an important area for innovation that addresses critical challenges in our society. Innovations in this space can lead to improved outcomes and experiences for many stakeholders.`,
    societalImpact: `Innovations in ${spaceName} can have wide-ranging societal benefits, from improving quality of life to addressing systemic challenges that affect many communities.`,
    whyNow: `Now is a strategic time to innovate in ${spaceName} due to technological advancements, changing societal needs, and evolving market conditions that create unique opportunities for impactful solutions.`,
    keyStatistics: [
      {
        value: "$XXB+",
        description: `Estimated market size for ${spaceName} solutions globally`
      },
      {
        value: "XX%",
        description: "Projected annual growth rate over the next five years"
      },
      {
        value: "X.X billion",
        description: "Number of people potentially impacted worldwide"
      }
    ],
    innovationAngles: [
      {
        title: "Digital Transformation",
        description: `Leveraging technology to enhance ${spaceName} experiences and outcomes through digital platforms and tools.`
      },
      {
        title: "Accessibility & Inclusion",
        description: `Creating solutions that make ${spaceName} more accessible and inclusive for diverse populations and underserved communities.`
      },
      {
        title: "Data-Driven Approaches",
        description: `Using data analytics and insights to develop more effective and personalized solutions in ${spaceName}.`
      },
      {
        title: "Sustainability",
        description: `Developing environmentally sustainable approaches to ${spaceName} that reduce resource use and environmental impact.`
      }
    ]
  };
}
