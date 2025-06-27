import { toast } from "sonner";
import { callChatGPTProxy } from "../api/geminiApi";

interface GenerationOptions {
  desiredAgeRange?: "teen" | "young adult" | "middle-aged" | "older";
  preferredCulturalRegions?: string[];
  occupationInterests?: string[];
  occupationRoles?: string[];
}

// Generate respondent profiles for user research
export async function generateRespondentProfiles(
  opportunity: string, 
  researchApproach: "explorative" | "evaluative" = "explorative",
  options?: GenerationOptions
): Promise<any[]> {
  try {
    const randomSeed = Math.random().toString(36).substring(2, 10);
    const timestamp = Date.now();
    
    let randomAgeRange = Math.floor(Math.random() * 3);
    if (options?.desiredAgeRange) {
      switch (options.desiredAgeRange) {
        case "teen": randomAgeRange = 0; break;
        case "young adult": randomAgeRange = 1; break;
        case "middle-aged": randomAgeRange = 2; break;
        case "older": randomAgeRange = 3; break;
      }
    }

    const culturalRegions = options?.preferredCulturalRegions?.[0] || 
                          ['East Asian', 'South Asian', 'Middle Eastern', 'African', 'European', 'Latin American', 'Pacific Islander'][Math.floor(Math.random() * 7)];
    
    const defaultCareerFocus = [
      // Business & Professional
      'Business Owner', 'Project Manager', 'Marketing Director', 'Operations Manager', 'Financial Advisor',
      // Technology & Digital
      'Software Engineer', 'UX Designer', 'Product Manager', 'Digital Strategist', 'IT Consultant',
      // Healthcare & Wellness
      'Healthcare Administrator', 'Wellness Coach', 'Medical Professional', 'Mental Health Counselor', 'Fitness Trainer',
      // Creative & Media
      'Creative Director', 'Content Creator', 'Media Producer', 'Communications Manager', 'Design Lead',
      // Community & Social Impact
      'Community Director', 'Program Manager', 'Social Worker', 'Outreach Coordinator', 'NGO Director',
      // Research & Development
      'Research Director', 'Innovation Lead', 'Strategy Consultant', 'Development Manager', 'Analytics Lead',
      // Service & Support
      'Customer Success Manager', 'Service Director', 'Support Team Lead', 'Experience Manager', 'Operations Director',
      // Leadership & Management
      'Executive Director', 'Department Head', 'Team Leader', 'Regional Manager', 'Program Director'
    ];
    
    const getRelevantCareers = (opportunity: string) => {
      const opportunityLower = opportunity.toLowerCase();
      
      // If opportunity mentions school/education/students, prioritize those roles
      if (opportunityLower.includes('school') || 
          opportunityLower.includes('student') || 
          opportunityLower.includes('education') ||
          opportunityLower.includes('club') ||
          opportunityLower.includes('class')) {
        return defaultCareerFocus;
      }
      
      // For other opportunities, use the general career list
      return [
        // Business & Professional
        'Business Owner', 'Project Manager', 'Marketing Director', 'Operations Manager', 'Financial Advisor',
        // Technology & Digital
        'Software Engineer', 'UX Designer', 'Product Manager', 'Digital Strategist', 'IT Consultant',
        // Healthcare & Wellness
        'Healthcare Administrator', 'Wellness Coach', 'Medical Professional', 'Mental Health Counselor', 'Fitness Trainer',
        // Creative & Media
        'Creative Director', 'Content Creator', 'Media Producer', 'Communications Manager', 'Design Lead',
        // Community & Social Impact
        'Community Director', 'Program Manager', 'Social Worker', 'Outreach Coordinator', 'NGO Director',
        // Research & Development
        'Research Director', 'Innovation Lead', 'Strategy Consultant', 'Development Manager', 'Analytics Lead',
        // Service & Support
        'Customer Success Manager', 'Service Director', 'Support Team Lead', 'Experience Manager', 'Operations Director',
        // Leadership & Management
        'Executive Director', 'Department Head', 'Team Leader', 'Regional Manager', 'Program Director'
      ];
    };

    const careerFocus = options?.occupationRoles?.[0] ||
                       options?.occupationInterests?.[0] ||
                       defaultCareerFocus[Math.floor(Math.random() * defaultCareerFocus.length)];
    
    const prompt = `
      Act as a user research expert helping students with innovation projects.
      
      CONTEXT:
      - Students need to talk to different types of people about: "${opportunity}"
      - This is an ${researchApproach.toUpperCase()} study, which means we want to learn about people's experiences and thoughts
      - Each profile should be completely different from any we've made before
      - We're using these random factors to make sure we get different types of people:
        * Seed: ${randomSeed}
        * Cultural Focus: ${culturalRegions}
        * Career Domain: ${careerFocus}
      
      TASK:
      Create 4 different people who could share their thoughts about this topic.
      
      PROFILE REQUIREMENTS:
      1. Where They're From:
         - If we're talking about a specific place (like "Singapore" or "Korea"):
           * ALL profiles should be from that place, unless there's a very good reason not to
           * If we must include someone from elsewhere, only 1 person maximum
           * Use names that are common in that place
           * Talk about things that happen in that place
           * Focus on local experiences and local problems
         - If we're not talking about a specific place:
           * Include people from different backgrounds
           * Each person should have their own unique story
      
      2. Age and What They Do:
         - Ages (based on factor ${randomAgeRange}):
           * Factor 0: Mostly younger people [13-20]
           * Factor 1: Mostly young adults [20-35] and one person over 30
           * Factor 2: Mostly middle-aged [36-55] and one person under 30
           * Factor 3: Mostly older people [56-75] and one person under 45
         - Make sure their age matches what they do (like a 20-year-old wouldn't be a CEO)
         - Include one person who is a ${careerFocus}
         - Choose jobs that would help us understand: ${opportunity}
      
      HOW TO WRITE:
      - Tell a story about each person's life
      - Use simple words that a 13-year-old would understand
      - Talk about real things they do and experience
      - Don't use fancy business words
      - Make each person feel real and interesting
      
      WHAT TO INCLUDE:
      Each person should have:
      1. Their Story:
         - Tell us about their life and work
         - How do they connect with what we're studying?
         - What do they do every day?
         - Share real examples of things they've done
      
      2. Their Thoughts:
         - What do they think about our topic?
         - What would they like to change?
         - What are their hopes and ideas?
         - How do they think they can help make things better?
      
      ✅ Good Example:
      Background:
      Layla creates videos about Singaporean culture for her online channel, often highlighting hidden gems and everyday stories that matter. After work, she explores different hawker centers and local neighborhoods, where she sometimes comes across community efforts worth sharing. She loves trying new foods, editing videos, and planning content that sparks curiosity and connection.

      Unique Perspective:
      Layla thinks charities should be more transparent about how they use donations. She wishes more people would support local artists and creators. What matters most to her is seeing the positive impact of her work. She believes in the power of storytelling to inspire change.
      
      FORMAT:
      Return the response as a JSON array with this structure:
      [
        {
          "name": "Full Name",
          "age": "32",
          "occupation": "Relatable Job Title",
          "background": "Natural, flowing story about their life and connection to the topic",
          "perspective": "Their unique thoughts and hopes about the topic"
        },
        // 3 more profiles
      ]
      
      The response MUST be valid JSON (no explanation text)
    `;

    const responseText = await callChatGPTProxy(prompt);
    
    const jsonMatch = responseText.match(/(\[[\s\S]*\])/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from response");
    }
    
    const profiles = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(profiles) || profiles.length === 0) {
      throw new Error("Invalid response: Expected an array of profiles");
    }
    
    const validateDiversity = (profiles: any[]) => {
      const names = new Set();
      const ages = new Set();
      const occupations = new Set();
      
      for (const profile of profiles) {
        if (names.has(profile.name)) {
          throw new Error("Duplicate name detected");
        }
        if (ages.has(profile.age)) {
          throw new Error("Duplicate age detected");
        }
        if (occupations.has(profile.occupation)) {
          throw new Error("Duplicate occupation detected");
        }
        
        names.add(profile.name);
        ages.add(profile.age);
        occupations.add(profile.occupation);
      }
    };
    
    validateDiversity(profiles);
    return profiles;
  } catch (error) {
    console.error("Error generating respondent profiles:", error);
    toast.error("Failed to generate respondent profiles");
    throw error;
  }
}
