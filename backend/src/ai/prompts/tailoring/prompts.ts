// backend/src/ai/prompts/tailoring/prompts.ts

export const TAILORING_PROMPTS = {
  COMPARE_RESUME_JD: (args: { resumeText: string; jdText: string }) => `
You are an expert technical recruiter and AI assistant. Compare the provided Resume against the Job Description.
Produce a structured JSON response evaluating their match.

Return a valid JSON object matching this schema:
{
  "overallMatch": 85,
  "atsMatch": 80,
  "keywordMatch": 75,
  "technicalSkillsMatch": 90,
  "projectsMatch": 85,
  "experienceMatch": 80,
  "educationMatch": 100,
  "responsibilitiesMatch": 70,
  "softSkillsMatch": 85,
  "missingSkills": ["string"],
  "matchingSkills": ["string"]
}

Job Description:
${args.jdText}

Resume:
${args.resumeText}
  `.trim(),

  GENERATE_RECOMMENDATIONS: (args: { resumeText: string; jdText: string; gaps: string }) => `
You are an expert career coach and technical recruiter. Based on the Resume, the Job Description, and the identified gaps, provide highly actionable tailoring recommendations.
DO NOT provide generic advice. Each recommendation MUST reference specific evidence from the resume or JD.
Examples of good recommendations: "Add Docker to Skills because it is required in the JD.", "Project Orbit should emphasize scalability.", "Quantify the impact of the REST API in Project Y."

Return a valid JSON array of objects matching this schema:
{
  "recommendations": [
    {
      "title": "string (short actionable title)",
      "priority": "High" | "Medium" | "Low",
      "estimatedAtsImpact": "High" | "Medium" | "Low",
      "whyItMatters": "string (brief explanation)",
      "evidenceFromResume": "string (what is currently there)",
      "evidenceFromJd": "string (what is required)",
      "suggestedChange": "string (exact change to make)",
      "affectedSection": "string (e.g. Skills, Experience)",
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ]
}

Job Description:
${args.jdText}

Resume:
${args.resumeText}

Identified Gaps (Missing Skills / Coverage):
${args.gaps}
  `.trim()
};
