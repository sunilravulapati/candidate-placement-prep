// backend/src/ai/prompts/interview/prompts.ts
//
// All interview AI prompt templates.
// Each export is a function that takes structured context data
// and returns a ChatMessage[] array ready for getAICompletion().
//
// RULES:
//  - Never combine multiple concerns into one prompt
//  - Always ask for JSON output explicitly in the user message
//  - System message sets persona + constraints
//  - User message provides structured context + schema

import type { ChatMessage } from '../../core/provider';
import type {
  InterviewConfig,
  InterviewPlan,
  GeneratedQuestion,
  ConversationContext,
  InterviewPersonaData,
  EvaluationResult,
} from '../../../features/mockInterview/types';

// ─────────────────────────────────────────────────────────────────────────────
// 1. INTERVIEW PLANNER
// ─────────────────────────────────────────────────────────────────────────────

export function buildPlannerPrompt(
  config: InterviewConfig,
  persona?: InterviewPersonaData
): ChatMessage[] {
  const personaHint = persona?.systemPromptHint
    ? `\n\nPersona style: ${persona.systemPromptHint}`
    : '';

  const contextSection =
    config.resumeText || config.jobDescriptionText
      ? `
CANDIDATE CONTEXT:
${config.resumeText ? `Resume Summary:\n${config.resumeText.slice(0, 1500)}` : ''}
${config.jobDescriptionText ? `\nJob Description:\n${config.jobDescriptionText.slice(0, 1000)}` : ''}
`.trim()
      : 'No resume or job description provided. Generate a generic plan for the given role and level.';

  return [
    {
      role: 'system',
      content: `You are an expert technical interview architect at a top-tier technology company.
Your role is to design comprehensive, structured interview plans tailored to the candidate's background and target role.
You design plans that progress logically in difficulty, cover the right topics, and set clear evaluation criteria.${personaHint}
Always respond with valid JSON only. No markdown, no prose.`,
    },
    {
      role: 'user',
      content: `Design a complete interview plan for the following configuration:

INTERVIEW CONFIG:
- Type: ${config.type}
- Difficulty: ${config.difficulty}
- Experience Level: ${config.experienceLevel}
- Target Role: ${config.targetRole || 'Software Engineer'}
- Target Company: ${config.targetCompany || 'Generic Tech Company'}
- Duration: ${config.durationMinutes} minutes
- Topics to Cover: ${config.topics.join(', ')}
- Language: ${config.language}
${persona ? `- Interviewer Persona: ${persona.name} (${persona.questioningStyle} style, tone: ${persona.communicationTone})` : ''}

${contextSection}

Return a JSON object matching EXACTLY this schema:
{
  "title": "string — e.g. 'Amazon SDE II Technical Interview'",
  "persona": "string — persona name or 'Standard Interviewer'",
  "stages": [
    {
      "name": "string — stage name e.g. 'Warm Up'",
      "description": "string — what this stage focuses on",
      "questionCount": "number",
      "topics": ["string"],
      "estimatedMinutes": "number"
    }
  ],
  "totalQuestions": "number — total across all stages",
  "estimatedDurationMinutes": "number",
  "topics": ["string — all topics covered"],
  "difficulty": "EASY | MEDIUM | HARD",
  "companyStyle": "string or null",
  "targetSkills": ["string — concrete skills to evaluate"],
  "evaluationRubric": [
    {
      "dimension": "string — e.g. 'Technical Accuracy'",
      "weight": "number 0-1 — must sum to 1.0 across all dimensions",
      "description": "string"
    }
  ],
  "difficultyProgression": "ascending | flat | descending"
}

The rubric must have exactly these 8 dimensions with weights summing to 1.0:
technicalAccuracy, communication, problemSolving, confidence, depth, structure, examples, completeness.`,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. QUESTION GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

export function buildQuestionGeneratorPrompt(
  context: ConversationContext,
  questionIndex: number
): ChatMessage[] {
  const personaInstruction = context.persona
    ? `You are interviewing in the style of: ${context.persona.name}. 
Questioning style: ${context.persona.questioningStyle}.
Communication tone: ${context.persona.communicationTone}.
Strictness level: ${context.persona.strictness}/10.`
    : 'You are a professional technical interviewer.';

  const coveredTopics =
    context.answeredTopics.length > 0
      ? `Already covered: ${context.answeredTopics.join(', ')}`
      : 'No topics covered yet.';

  const recentExchange =
    context.conversationHistory.slice(-4).map(m =>
      `${m.role.toUpperCase()}: ${m.content.slice(0, 200)}`
    ).join('\n') || 'No prior conversation.';

  return [
    {
      role: 'system',
      content: `${personaInstruction}
Generate exactly ONE interview question. Never generate multiple questions.
Questions must be specific, challenging, and test real understanding — not just definitions.
Always respond with valid JSON only.`,
    },
    {
      role: 'user',
      content: `Generate the next interview question.

INTERVIEW PLAN:
- Title: ${context.plan.title}
- Type: ${context.plan.difficulty} difficulty
- Target Skills: ${context.plan.targetSkills.join(', ')}
- Current Question Index: ${questionIndex + 1} of ${context.plan.totalQuestions}

COVERAGE:
${coveredTopics}
Remaining topics: ${context.remainingTopics.join(', ')}

RECENT EXCHANGE:
${recentExchange}

CANDIDATE CONFIDENCE ESTIMATE: ${context.confidenceEstimate}/100
${context.confidenceEstimate < 40 ? '(Candidate seems to be struggling — consider a slightly easier angle)' : ''}
${context.confidenceEstimate > 80 ? '(Candidate is doing well — increase difficulty)' : ''}

Return JSON matching EXACTLY:
{
  "questionText": "string — the full interview question",
  "category": "string — specific topic area e.g. 'Binary Trees', 'System Scalability'",
  "difficulty": "EASY | MEDIUM | HARD",
  "expectedSkills": ["string — concrete skills this question tests"],
  "estimatedTimeSec": "number — how many seconds to answer",
  "followUpAllowed": "boolean",
  "isFollowUp": false
}`,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FOLLOW-UP GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

export function buildFollowUpPrompt(
  question: GeneratedQuestion,
  candidateAnswer: string,
  context: ConversationContext
): ChatMessage[] {
  const personaInstruction = context.persona
    ? `You are ${context.persona.name} with ${context.persona.questioningStyle} questioning style.
Strictness: ${context.persona.strictness}/10. Follow-up depth allowed: ${context.persona.followUpDepth}.`
    : 'You are a senior technical interviewer.';

  return [
    {
      role: 'system',
      content: `${personaInstruction}
Your job is to evaluate whether the candidate's answer requires a follow-up question.
You are the smartest AI component in this pipeline.
Inspect for: missing concepts, vague explanations, contradictions, shallow answers, incomplete examples.
If the answer is strong and complete: return shouldFollowUp=false.
If a follow-up is needed: generate a targeted, intelligent follow-up that drills into the specific weakness.
Never ask a generic follow-up. Every follow-up must be laser-focused on the identified weakness.
Always respond with valid JSON only.`,
    },
    {
      role: 'user',
      content: `Evaluate this interview exchange and decide if a follow-up is needed.

ORIGINAL QUESTION:
${question.questionText}

EXPECTED SKILLS: ${question.expectedSkills.join(', ')}

CANDIDATE'S ANSWER:
${candidateAnswer}

CURRENT FOLLOW-UP CHAIN DEPTH: ${context.followUpChainDepth} (max: ${context.persona?.followUpDepth ?? 2})

Return JSON matching EXACTLY:
{
  "shouldFollowUp": "boolean",
  "trigger": "missing_concepts | vague_explanation | contradiction | shallow_answer | incomplete_example | none",
  "reasoning": "string — brief explanation of your decision",
  "generatedQuestion": {
    "questionText": "string — the follow-up question (only if shouldFollowUp=true, else null)",
    "category": "string",
    "difficulty": "EASY | MEDIUM | HARD",
    "expectedSkills": ["string"],
    "estimatedTimeSec": 90,
    "followUpAllowed": false,
    "isFollowUp": true,
    "parentQuestionId": null
  } | null
}

If shouldFollowUp is false, set generatedQuestion to null.
If follow-up chain depth is already at max, you MUST set shouldFollowUp=false.`,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. EVALUATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function buildEvaluationPrompt(
  question: GeneratedQuestion,
  candidateAnswer: string,
  context: ConversationContext
): ChatMessage[] {
  const personaStyle = context.persona
    ? `Evaluation style: ${context.persona.evaluationStyle}. Strictness: ${context.persona.strictness}/10.`
    : 'Use standard evaluation style.';

  return [
    {
      role: 'system',
      content: `You are an expert technical interview evaluator.
${personaStyle}
Score each dimension honestly based on the candidate's answer quality.
Scores are 0–100 integers. Be specific and calibrated.
lenient = shift scores up by ~5–10 pts, rigorous = shift down by ~5–10 pts.
Always respond with valid JSON only.`,
    },
    {
      role: 'user',
      content: `Evaluate the candidate's answer to this interview question.

QUESTION: ${question.questionText}
CATEGORY: ${question.category}
DIFFICULTY: ${question.difficulty}
EXPECTED SKILLS: ${question.expectedSkills.join(', ')}

CANDIDATE'S ANSWER:
${candidateAnswer}

Score each dimension 0–100:
- technicalAccuracy: Does the answer demonstrate correct technical knowledge?
- communication: Is the explanation clear, structured, and professional?
- problemSolving: Does the candidate show analytical thinking?
- confidence: Does the candidate sound confident and self-assured?
- depth: Does the answer go beyond surface-level?
- structure: Is the answer well-organized (e.g., situation/task/action/result for behavioral)?
- examples: Does the candidate use concrete, specific examples?
- completeness: Does the answer address all aspects of the question?

Return JSON matching EXACTLY:
{
  "technicalAccuracy": "number 0-100",
  "communication": "number 0-100",
  "problemSolving": "number 0-100",
  "confidence": "number 0-100",
  "depth": "number 0-100",
  "structure": "number 0-100",
  "examples": "number 0-100",
  "completeness": "number 0-100",
  "overallScore": "number 0-100 (weighted average)",
  "aiFeedback": {
    "codeQuality": "number 0-100",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "missingConcepts": ["string"],
    "idealAnswer": "string",
    "suggestedResponse": "string",
    "finalRating": "string"
  }
}

Every feedback item in aiFeedback must reference the candidate's actual answer. Never fabricate knowledge. Never praise incorrect answers.`,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. FEEDBACK GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

export function buildFeedbackPrompt(
  config: InterviewConfig,
  plan: InterviewPlan,
  evaluations: EvaluationResult[],
  overallScore: number
): ChatMessage[] {
  const evalSummary = evaluations
    .map(
      (e, i) =>
        `Q${i + 1} (${e.scores.technicalAccuracy}/100 tech, ${e.scores.communication}/100 comm): ${e.aiFeedback}`
    )
    .join('\n');

  return [
    {
      role: 'system',
      content: `You are a senior recruiter writing structured post-interview feedback.
Be actionable, honest, and constructive. Write as if addressing the candidate directly.
Every recommendation must be specific and implementable.
Do not use markdown formatting. Return plain JSON only.`,
    },
    {
      role: 'user',
      content: `Generate comprehensive post-interview feedback.

INTERVIEW DETAILS:
- Type: ${config.type}
- Role: ${config.targetRole || 'Software Engineer'}
- Company: ${config.targetCompany || 'Tech Company'}
- Difficulty: ${config.difficulty}
- Overall Score: ${overallScore}/100

PLAN TOPICS: ${plan.topics.join(', ')}
TARGET SKILLS: ${plan.targetSkills.join(', ')}

PER-QUESTION EVALUATION SUMMARY:
${evalSummary}

Return JSON matching EXACTLY:
{
  "strengths": ["string — specific strength observed (3-5 items)"],
  "weaknesses": ["string — specific weakness with context (3-5 items)"],
  "missedConcepts": ["string — technical concepts the candidate clearly missed"],
  "suggestedImprovements": ["string — actionable improvement for each weakness"],
  "topicsToRevise": ["string — specific topics to study before next interview"],
  "recommendedDSAProblems": ["string — specific LeetCode/problem names if applicable"],
  "resumeChanges": ["string — specific resume improvement suggestions if applicable"],
  "overallSummary": "string — 3-4 sentence overall recruiter assessment, written like a real recruiter note"
}`,
    },
  ];
}

export const INTERVIEW_PROMPTS = {
  buildPlannerPrompt,
  buildQuestionGeneratorPrompt,
  buildFollowUpPrompt,
  buildEvaluationPrompt,
  buildFeedbackPrompt,
} as const;
