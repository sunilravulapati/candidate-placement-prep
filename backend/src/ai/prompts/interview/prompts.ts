// backend/src/ai/prompts/interview/prompts.ts

export const INTERVIEW_PROMPTS = {
  START_INTERVIEW: "Generate the first interview question for a {role} position. Candidate profile: {profile}",
  GENERATE_FEEDBACK: "Provide feedback on the candidate's transcript: {transcript}",
} as const;
