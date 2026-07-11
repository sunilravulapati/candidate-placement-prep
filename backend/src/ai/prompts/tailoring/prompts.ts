// backend/src/ai/prompts/tailoring/prompts.ts
//
// AI prompts for the Resume Tailoring pipeline.
// Both prompts require evidence-based reasoning — no generic advice.

export const TAILORING_PROMPTS = {
  /**
   * Resume vs. Job Description match engine.
   * Returns granular percentage scores and skill gap analysis.
   */
  COMPARE_RESUME_JD: (args: { resumeText: string; jdText: string }) => `
You are an expert technical recruiter and ATS system evaluator.
Compare the provided Resume against the Job Description and produce a structured JSON evaluation.

RULES:
1. Base every score strictly on content present in the resume and JD — do NOT guess or assume.
2. missingSkills must be skills explicitly mentioned in the JD that are absent from the resume.
3. matchingSkills must be skills that appear in BOTH the resume and the JD.
4. All scores are integers 0–100.

Return ONLY this valid JSON object (no markdown, no explanation):
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
  "missingSkills": ["Docker", "Redis"],
  "matchingSkills": ["React", "Node.js", "PostgreSQL"]
}

=== JOB DESCRIPTION ===
${args.jdText}

=== RESUME ===
${args.resumeText}
  `.trim(),

  /**
   * Evidence-based tailoring recommendations.
   * Every recommendation MUST cite specific evidence from both the resume and the JD.
   * Generic advice is not acceptable.
   */
  GENERATE_RECOMMENDATIONS: (args: { resumeText: string; jdText: string; gaps: string }) => `
You are an expert career coach and ATS optimization specialist for PrepGenie.

Generate highly specific, evidence-based tailoring recommendations.

CRITICAL RULES — violations result in rejection:
1. NEVER fabricate metrics, companies, projects, or experience that are not in the resume.
2. NEVER invent achievements or certifications.
3. Every recommendation MUST quote or directly paraphrase specific text from the resume.
4. Every recommendation MUST quote or directly paraphrase specific text from the JD.
5. "suggestedChange" must be an exact, copy-pasteable rewrite — not a vague suggestion.
6. "estimatedAtsImpact" must be justified by keyword presence in the JD.
7. Do NOT produce generic advice like "improve your summary" without specific evidence.

GOOD example:
{
  "title": "Add Docker to Skills section",
  "evidenceFromResume": "Skills section currently lists: React, Node.js, MongoDB",
  "evidenceFromJd": "JD states: 'Experience with containerization (Docker, Kubernetes) required'",
  "suggestedChange": "Add 'Docker' to the Tools skills group.",
  "whyItMatters": "Docker appears 3 times in the JD as a required skill and is completely absent from the resume.",
  "estimatedAtsImpact": "High"
}

BAD example (do NOT do this):
{
  "title": "Improve your professional summary",
  "evidenceFromResume": "The summary is generic",
  "evidenceFromJd": "The JD wants a good candidate",
  "suggestedChange": "Make the summary more targeted"
}

Return ONLY a valid JSON object with this schema (no markdown wrappers):
{
  "recommendations": [
    {
      "title": "string — short, specific action title",
      "priority": "High" | "Medium" | "Low",
      "estimatedAtsImpact": "High" | "Medium" | "Low",
      "whyItMatters": "string — explain why this change improves ATS score",
      "evidenceFromResume": "string — direct quote or paraphrase from the resume",
      "evidenceFromJd": "string — direct quote or paraphrase from the job description",
      "suggestedChange": "string — exact text to add, modify, or remove",
      "affectedSection": "string — e.g. Skills, Experience, Summary, Projects",
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ]
}

=== JOB DESCRIPTION ===
${args.jdText}

=== RESUME ===
${args.resumeText}

=== IDENTIFIED SKILL GAPS ===
${args.gaps}
  `.trim(),
};
