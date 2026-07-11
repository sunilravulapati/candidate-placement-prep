// backend/src/features/mockInterview/types.ts
//
// Complete domain types for Mock Interview Studio v1.
// JSON-first, AI-first, extensible design.
// Future adapters (voice, video, avatar) are defined as abstract interfaces only.

// ─────────────────────────────────────────────────────────────────────────────
// Enumerations
// ─────────────────────────────────────────────────────────────────────────────

export type InterviewType =
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'HR'
  | 'SYSTEM_DESIGN'
  | 'CUSTOM';

export type InterviewDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type ExperienceLevel = 'JUNIOR' | 'MID' | 'SENIOR' | 'STAFF';

export type InterviewStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';

export type QuestionStatus = 'PENDING' | 'ANSWERED' | 'SKIPPED';

export type MessageRole = 'question' | 'answer';

export type QuestioningStyle =
  | 'structured'
  | 'conversational'
  | 'socratic'
  | 'stress';

export type CommunicationTone =
  | 'formal'
  | 'friendly'
  | 'neutral'
  | 'challenging';

export type EvaluationStyle = 'lenient' | 'standard' | 'rigorous';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration — what the user fills in before starting
// ─────────────────────────────────────────────────────────────────────────────

export interface InterviewConfig {
  type: InterviewType;
  difficulty: InterviewDifficulty;
  experienceLevel: ExperienceLevel;
  targetCompany?: string;
  targetRole?: string;
  durationMinutes: number;
  topics: string[];
  language: string;
  personaId?: string;
  templateId?: string;
  resumeId?: string;
  jobDescriptionId?: string;
  // Text content resolved from the above IDs (populated by orchestrator)
  resumeText?: string;
  jobDescriptionText?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Persona — interviewer identity
// ─────────────────────────────────────────────────────────────────────────────

export interface InterviewPersonaData {
  id: string;
  name: string;
  company?: string;
  role?: string;
  avatarUrl?: string;
  questioningStyle: QuestioningStyle;
  strictness: number; // 1–10
  followUpDepth: number;
  communicationTone: CommunicationTone;
  evaluationStyle: EvaluationStyle;
  systemPromptHint?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Interview Plan — generated before the first question
// ─────────────────────────────────────────────────────────────────────────────

export interface InterviewStage {
  name: string;
  description: string;
  questionCount: number;
  topics: string[];
  estimatedMinutes: number;
}

export interface EvaluationRubric {
  dimension: string;
  weight: number; // 0–1
  description: string;
}

export interface InterviewPlan {
  title: string;
  persona: string;
  stages: InterviewStage[];
  totalQuestions: number;
  estimatedDurationMinutes: number;
  topics: string[];
  difficulty: InterviewDifficulty;
  companyStyle?: string;
  targetSkills: string[];
  evaluationRubric: EvaluationRubric[];
  difficultyProgression: 'ascending' | 'flat' | 'descending';
}

// ─────────────────────────────────────────────────────────────────────────────
// Question — single AI-generated question
// ─────────────────────────────────────────────────────────────────────────────

export interface GeneratedQuestion {
  questionText: string;
  category: string;
  difficulty: InterviewDifficulty;
  expectedSkills: string[];
  estimatedTimeSec: number;
  followUpAllowed: boolean;
  isFollowUp: boolean;
  parentQuestionId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversation State — built by ConversationManager from DB
// ─────────────────────────────────────────────────────────────────────────────

export interface StartInterviewResult {
  sessionId: string;
  plan: InterviewPlan;
  firstQuestion: GeneratedQuestion & { id: string };
  durationMinutes: number;
}

export interface ConversationContext {
  sessionId: string;
  plan: InterviewPlan;
  persona?: InterviewPersonaData;
  answeredTopics: string[];
  remainingTopics: string[];
  conversationHistory: Array<{ role: MessageRole; content: string }>;
  currentQuestionIndex: number;
  elapsedSeconds: number;
  followUpChainDepth: number; // current depth in follow-up chain
  confidenceEstimate: number; // 0–100 running estimate
}

// ─────────────────────────────────────────────────────────────────────────────
// Follow-up Trigger — why the follow-up was generated
// ─────────────────────────────────────────────────────────────────────────────

export type FollowUpTrigger =
  | 'missing_concepts'
  | 'vague_explanation'
  | 'contradiction'
  | 'shallow_answer'
  | 'incomplete_example'
  | 'none'; // means answer was strong, no follow-up

export interface FollowUpDecision {
  shouldFollowUp: boolean;
  trigger: FollowUpTrigger;
  generatedQuestion?: GeneratedQuestion;
  reasoning: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Evaluation — per-question scores
// ─────────────────────────────────────────────────────────────────────────────

export interface DimensionScores {
  technicalAccuracy: number; // 0–100
  communication: number;
  problemSolving: number;
  confidence: number;
  depth: number;
  structure: number;
  examples: number;
  completeness: number;
}

export interface EvaluationResult {
  questionId: string;
  scores: DimensionScores;
  overallScore: number;
  aiFeedback: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Feedback — full session structured recruiter feedback
// ─────────────────────────────────────────────────────────────────────────────

export interface FeedbackResult {
  strengths: string[];
  weaknesses: string[];
  missedConcepts: string[];
  suggestedImprovements: string[];
  topicsToRevise: string[];
  recommendedDSAProblems: string[];
  resumeChanges: string[];
  overallSummary: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Score — aggregate session score
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoreResult {
  dimensions: DimensionScores;
  overallScore: number;
  percentile?: number;
  improvementTrend: ImprovementTrend;
  confidenceTrend: ConfidenceTrend;
}

export interface ImprovementTrend {
  earlyAvg: number;
  lateAvg: number;
  delta: number; // positive = improving, negative = declining
  label: 'improving' | 'stable' | 'declining';
}

export interface ConfidenceTrend {
  scores: number[]; // per-question confidence scores
  trend: 'rising' | 'stable' | 'falling';
  peak: number;
  low: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Summary — returned to frontend after endInterview
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionSummary {
  sessionId: string;
  status: InterviewStatus;
  questionsAnswered: number;
  questionsTotal: number;
  durationSeconds: number;
  score?: ScoreResult;
  feedback?: FeedbackResult;
  evaluations?: EvaluationResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Future Extension Interfaces (v2+) — Architecture stubs only, NOT implemented
// ─────────────────────────────────────────────────────────────────────────────

/** Voice Interview adapter — plug in real-time STT/TTS without changing the engine. */
export interface VoiceInterviewAdapter {
  startStream(sessionId: string): Promise<void>;
  stopStream(sessionId: string): Promise<string>; // returns transcript text
  synthesizeSpeech(text: string, personaId?: string): Promise<ArrayBuffer>;
}

/** Video capture and emotion/eye-contact detection adapter. */
export interface VideoInterviewAdapter {
  startCapture(sessionId: string): Promise<void>;
  stopCapture(sessionId: string): Promise<void>;
  detectEmotion(frameBlob: Blob): Promise<{ emotion: string; confidence: number }>;
  detectEyeContact(frameBlob: Blob): Promise<{ isLooking: boolean; duration: number }>;
}

/** AI Recruiter Avatar adapter — animated face/voice persona. */
export interface AvatarAdapter {
  loadPersona(personaId: string): Promise<void>;
  speak(text: string, emotion?: string): Promise<void>;
  setExpression(expression: 'neutral' | 'thinking' | 'approving' | 'questioning'): void;
}

/** Live coding session adapter. */
export interface LiveCodingAdapter {
  executeCode(language: string, code: string, stdin?: string): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
    timeMs: number;
  }>;
  analyzeComplexity(language: string, code: string): Promise<{
    time: string;
    space: string;
    analysis: string;
  }>;
}

/** Collaborative whiteboard adapter. */
export interface WhiteboardAdapter {
  createBoard(sessionId: string): Promise<string>; // returns boardUrl
  getSnapshot(boardId: string): Promise<string>; // returns base64 image
}

/** Emotion detection (stand-alone, could be used without video adapter). */
export interface EmotionDetectionAdapter {
  analyze(audioBlob: Blob): Promise<{
    stress: number; // 0–100
    engagement: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
}

/** Eye-tracking adapter for detecting engagement and focus. */
export interface EyeTrackingAdapter {
  track(sessionId: string): Promise<void>;
  getEngagementScore(sessionId: string): Promise<number>; // 0–100
}
