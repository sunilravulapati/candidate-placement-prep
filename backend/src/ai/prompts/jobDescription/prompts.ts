// backend/src/ai/prompts/jobDescription/prompts.ts

export const JD_PROMPTS = {
  ANALYZE_JD: (args: { jdText: string }) => `
You are an expert technical recruiter and AI assistant. Extract structured information from the provided job description.
Return a valid JSON object matching this schema:
{
  "role": "string (job title)",
  "company": "string (company name, if available)",
  "responsibilities": ["string"],
  "requiredSkills": ["string"],
  "preferredSkills": ["string"],
  "experience": "string (e.g. '3-5 years', 'Entry level')",
  "education": "string (e.g. 'Bachelors in CS')",
  "technologies": ["string"],
  "softSkills": ["string"],
  "keywords": ["string (ATS keywords)"]
}

Job Description:
${args.jdText}
  `.trim()
};
