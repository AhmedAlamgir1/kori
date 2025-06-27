// Re-export all research service functionality from individual modules
// to maintain the same API for existing components

export { generateRespondentProfiles } from './research/respondentProfiles';
export { generateInterviewQuestions } from './research/interviewQuestions';
export { validateInterviewQuestion } from './research/questionValidator';
export type { UserProfile } from './research/types';
export { simulateSyntheticUserChat } from './research/mockInterviewNew';
