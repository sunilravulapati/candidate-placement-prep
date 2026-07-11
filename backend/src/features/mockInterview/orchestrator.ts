// backend/src/features/mockInterview/orchestrator.ts
//
// Interview Orchestrator — coordinates the full pipeline.
//
// This is the ONLY file that calls AI services.
// Actions call the orchestrator. The orchestrator calls AI + Service.
//
// Pipeline:
//   startInterview:   Planner → QuestionGenerator → Service.create + persist
//   submitAnswer:     ConversationManager → FollowupGenerator → QuestionGenerator? → Service.persist
//   endInterview:     EvaluationEngine → ScoreCalculator → FeedbackGenerator → Service.persist

import { generateInterviewPlan } from '../../ai/services/interview/interviewPlanner';
import { generateNextQuestion } from '../../ai/services/interview/questionGenerator';
import { evaluateForFollowUp } from '../../ai/services/interview/followupGenerator';
import { buildConversationContext, shouldEndInterview } from '../../ai/services/interview/conversationManager';
import { evaluateAllAnswers } from '../../ai/services/interview/evaluationEngine';
import { calculateSessionScore } from '../../ai/services/interview/scoreCalculator';
import { generateFeedback } from '../../ai/services/interview/feedbackGenerator';
import { InterviewService } from './service';
import { InterviewRepository } from './repository';
import { logger } from '../../core/logger';
import type {
  InterviewConfig,
  GeneratedQuestion,
  SessionSummary,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Start Interview
// ─────────────────────────────────────────────────────────────────────────────

export interface StartInterviewResult {
  sessionId: string;
  firstQuestion: {
    id: string;
    questionText: string;
    category: string;
    difficulty: string;
    estimatedTimeSec: number;
    orderIndex: number;
  };
  plan: {
    title: string;
    totalQuestions: number;
    stages: Array<{ name: string; questionCount: number }>;
    persona: string;
  };
  durationMinutes: number;
}

/**
 * Starts a new interview: generates plan → generates first question → persists both.
 */
export async function orchestrateStartInterview(
  userId: string,
  config: InterviewConfig
): Promise<StartInterviewResult> {
  logger.info('[orchestrator] Starting interview', {
    category: 'interview',
    userId,
    type: config.type,
  });

  // Resolve persona if personaId provided
  let persona;
  if (config.personaId) {
    const personaRecord = await InterviewRepository.findPersonaById(config.personaId);
    if (personaRecord) {
      persona = {
        id: personaRecord.id,
        name: personaRecord.name,
        company: personaRecord.company ?? undefined,
        role: personaRecord.role ?? undefined,
        avatarUrl: personaRecord.avatarUrl ?? undefined,
        questioningStyle: personaRecord.questioningStyle as any,
        strictness: personaRecord.strictness,
        followUpDepth: personaRecord.followUpDepth,
        communicationTone: personaRecord.communicationTone as any,
        evaluationStyle: personaRecord.evaluationStyle as any,
        systemPromptHint: personaRecord.systemPromptHint ?? undefined,
      };
    }
  }

  // Step 1: Generate interview plan
  const plan = await generateInterviewPlan(config, persona);

  // Step 2: Create session with plan
  const session = await InterviewService.createSession(userId, config, plan);

  // Step 3: Build initial (empty) context for first question generation
  const initialContext = {
    sessionId: session.id,
    plan,
    persona,
    answeredTopics: [],
    remainingTopics: plan.topics,
    conversationHistory: [],
    currentQuestionIndex: 0,
    elapsedSeconds: 0,
    followUpChainDepth: 0,
    confidenceEstimate: 50,
  };

  // Step 4: Generate first question
  const firstQuestion = await generateNextQuestion(initialContext, 0);

  // Step 5: Persist first question + message
  const persistedQuestion = await InterviewService.persistQuestion(
    session.id,
    firstQuestion,
    0
  );

  logger.info('[orchestrator] Interview started', {
    category: 'interview',
    sessionId: session.id,
    firstQuestionCategory: firstQuestion.category,
  });

  return {
    sessionId: session.id,
    durationMinutes: session.durationMinutes,
    firstQuestion: {
      id: persistedQuestion.id,
      questionText: firstQuestion.questionText,
      category: firstQuestion.category,
      difficulty: firstQuestion.difficulty,
      estimatedTimeSec: firstQuestion.estimatedTimeSec,
      orderIndex: 0,
    },
    plan: {
      title: plan.title,
      totalQuestions: plan.totalQuestions,
      stages: plan.stages.map(s => ({
        name: s.name,
        questionCount: s.questionCount,
      })),
      persona: plan.persona,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Submit Answer
// ─────────────────────────────────────────────────────────────────────────────

export interface SubmitAnswerResult {
  answerRecorded: boolean;
  nextQuestion?: {
    id: string;
    questionText: string;
    category: string;
    difficulty: string;
    estimatedTimeSec: number;
    orderIndex: number;
    isFollowUp: boolean;
    followUpTrigger?: string;
  };
  shouldEnd: boolean;
  endReason?: string;
}

/**
 * Handles answer submission:
 *   1. Records the answer
 *   2. Rebuilds conversation context from DB
 *   3. Checks if interview should end
 *   4. Evaluates for follow-up
 *   5. Generates follow-up OR next planned question
 *   6. Persists next question
 */
export async function orchestrateSubmitAnswer(
  sessionId: string,
  questionId: string,
  answerText: string
): Promise<SubmitAnswerResult> {
  logger.info('[orchestrator] Processing answer', {
    category: 'interview',
    sessionId,
    questionId,
    answerLength: answerText.length,
  });

  // Step 1: Load full session snapshot
  const session = await InterviewRepository.findSessionById(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }
  if (session.status !== 'ACTIVE') {
    throw new Error(`Session ${sessionId} is not active`);
  }

  // Step 2: Record the answer
  await InterviewService.recordAnswer(sessionId, questionId, answerText);

  // Step 3: Build fresh context from DB
  const context = buildConversationContext({
    id: session.id,
    planJson: session.planJson,
    startedAt: session.startedAt,
    persona: session.persona,
    questions: session.questions as any,
  });

  // Step 4: Check termination conditions
  const { shouldEnd, reason } = shouldEndInterview(context, session.durationMinutes);
  if (shouldEnd) {
    return { answerRecorded: true, shouldEnd: true, endReason: reason };
  }

  // Step 5: Find the current question data for follow-up evaluation
  const currentQuestion = session.questions.find(q => q.id === questionId);
  if (!currentQuestion) {
    throw new Error(`Question ${questionId} not found in session`);
  }

  const generatedQuestionShape: GeneratedQuestion = {
    questionText: currentQuestion.questionText,
    category: currentQuestion.category,
    difficulty: currentQuestion.difficulty as any,
    expectedSkills: currentQuestion.expectedSkills,
    estimatedTimeSec: currentQuestion.estimatedTimeSec,
    followUpAllowed: currentQuestion.followUpAllowed,
    isFollowUp: currentQuestion.isFollowUp,
  };

  // Step 6: Evaluate for follow-up (only if follow-ups are allowed)
  const followUpDecision = await evaluateForFollowUp(
    generatedQuestionShape,
    answerText,
    context
  );

  // Step 7: Determine next question
  let nextQuestion: GeneratedQuestion;
  let isFollowUp = false;
  let followUpTrigger: string | undefined;

  if (followUpDecision.shouldFollowUp && followUpDecision.generatedQuestion) {
    nextQuestion = {
      ...followUpDecision.generatedQuestion,
      parentQuestionId: questionId,
    };
    isFollowUp = true;
    followUpTrigger = followUpDecision.trigger;
    logger.info('[orchestrator] Follow-up question generated', {
      category: 'interview',
      trigger: followUpTrigger,
    });
  } else {
    // Advance to next planned question
    const nextIndex = context.currentQuestionIndex;
    nextQuestion = await generateNextQuestion(context, nextIndex);
  }

  // Step 8: Persist next question
  const nextOrderIndex = session.questions.length; // append to end
  const persistedNext = await InterviewService.persistQuestion(
    sessionId,
    nextQuestion,
    nextOrderIndex
  );

  return {
    answerRecorded: true,
    nextQuestion: {
      id: persistedNext.id,
      questionText: nextQuestion.questionText,
      category: nextQuestion.category,
      difficulty: nextQuestion.difficulty,
      estimatedTimeSec: nextQuestion.estimatedTimeSec,
      orderIndex: nextOrderIndex,
      isFollowUp,
      followUpTrigger,
    },
    shouldEnd: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// End Interview
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Finalizes an interview:
 *   1. Evaluates all answered questions
 *   2. Calculates aggregate score
 *   3. Generates recruiter feedback
 *   4. Persists everything
 *   5. Marks session COMPLETED
 *   Returns the full SessionSummary.
 */
export async function orchestrateEndInterview(
  sessionId: string
): Promise<SessionSummary> {
  logger.info('[orchestrator] Ending interview', {
    category: 'interview',
    sessionId,
  });

  const session = await InterviewRepository.findSessionById(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  // Build context for evaluation
  const context = buildConversationContext({
    id: session.id,
    planJson: session.planJson,
    startedAt: session.startedAt,
    persona: session.persona,
    questions: session.questions as any,
  });

  // Prepare answered pairs
  const answeredPairs = session.questions
    .filter(q => q.status === 'ANSWERED')
    .map(q => {
      const answerMessage = q.messages.find((m: any) => m.role === 'answer');
      return {
        questionId: q.id,
        question: {
          questionText: q.questionText,
          category: q.category,
          difficulty: q.difficulty as any,
          expectedSkills: q.expectedSkills,
          estimatedTimeSec: q.estimatedTimeSec,
          followUpAllowed: q.followUpAllowed,
          isFollowUp: q.isFollowUp,
        } as GeneratedQuestion,
        answer: answerMessage?.content ?? '',
      };
    })
    .filter(p => p.answer.length > 0);

  // Step 1: Evaluate all answers
  const evaluations = await evaluateAllAnswers(answeredPairs, context);

  // Step 2: Calculate score (deterministic)
  const score = calculateSessionScore(evaluations);

  // Step 3: Generate feedback
  const config = {
    type: session.type as any,
    difficulty: session.difficulty as any,
    experienceLevel: session.experienceLevel as any,
    targetCompany: session.targetCompany ?? undefined,
    targetRole: session.targetRole ?? undefined,
    durationMinutes: session.durationMinutes,
    topics: session.topics,
    language: session.language,
  };

  const feedback = await generateFeedback(
    config,
    session.planJson as any,
    evaluations,
    score.overallScore
  );

  // Step 4: Persist results
  await InterviewService.persistEvaluations(sessionId, evaluations);
  await InterviewService.persistScore(sessionId, score);
  await InterviewService.persistFeedback(sessionId, feedback);
  await InterviewService.finalizeSession(sessionId);

  // Step 5: Reload and return summary
  const finalSession = await InterviewRepository.findSessionById(sessionId);
  if (!finalSession) {
    throw new Error('Session vanished after finalization');
  }

  return InterviewService.buildSessionSummary(finalSession);
}
