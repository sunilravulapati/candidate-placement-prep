// backend/src/ai/services/interview/conversationManager.ts
//
// Conversation Manager Service — source of truth for interview state.
//
// Stateless: rebuilds ConversationContext entirely from database on every call.
// No in-memory state. Survivable across reconnects and server restarts.
// The frontend never manages interview logic.

import { logger } from '../../../core/logger';
import type {
  ConversationContext,
  InterviewPlan,
  InterviewPersonaData,
  MessageRole,
} from '../../../features/mockInterview/types';

// Shape of the DB session data passed in (avoids importing Prisma types here)
export interface SessionSnapshot {
  id: string;
  planJson: any;
  startedAt: Date;
  persona?: {
    id: string;
    name: string;
    company?: string | null;
    role?: string | null;
    avatarUrl?: string | null;
    questioningStyle: string;
    strictness: number;
    followUpDepth: number;
    communicationTone: string;
    evaluationStyle: string;
    systemPromptHint?: string | null;
  } | null;
  questions: Array<{
    id: string;
    questionText: string;
    category: string;
    difficulty: string;
    expectedSkills: string[];
    estimatedTimeSec: number;
    followUpAllowed: boolean;
    orderIndex: number;
    isFollowUp: boolean;
    parentQuestionId?: string | null;
    status: string;
    messages: Array<{
      role: string;
      content: string;
      createdAt: Date;
    }>;
  }>;
}

/**
 * Builds the complete ConversationContext from a session snapshot.
 *
 * This is the only source of truth for interview state.
 * Called at the start of every submitAnswer operation.
 */
export function buildConversationContext(
  snapshot: SessionSnapshot
): ConversationContext {
  const plan = snapshot.planJson as InterviewPlan;

  if (!plan || !plan.stages) {
    throw new Error(`Session ${snapshot.id} has no valid plan. Cannot build context.`);
  }

  // Build persona if available
  let persona: InterviewPersonaData | undefined;
  if (snapshot.persona) {
    persona = {
      id: snapshot.persona.id,
      name: snapshot.persona.name,
      company: snapshot.persona.company ?? undefined,
      role: snapshot.persona.role ?? undefined,
      avatarUrl: snapshot.persona.avatarUrl ?? undefined,
      questioningStyle: snapshot.persona.questioningStyle as any,
      strictness: snapshot.persona.strictness,
      followUpDepth: snapshot.persona.followUpDepth,
      communicationTone: snapshot.persona.communicationTone as any,
      evaluationStyle: snapshot.persona.evaluationStyle as any,
      systemPromptHint: snapshot.persona.systemPromptHint ?? undefined,
    };
  }

  // Sorted questions by orderIndex
  const sortedQuestions = [...snapshot.questions].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  // Build chronological conversation history
  const conversationHistory: Array<{ role: MessageRole; content: string }> = [];
  for (const q of sortedQuestions) {
    const sortedMessages = [...q.messages].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    for (const m of sortedMessages) {
      conversationHistory.push({
        role: m.role as MessageRole,
        content: m.content,
      });
    }
  }

  // Determine answered topics (from answered questions)
  const answeredTopics = sortedQuestions
    .filter(q => q.status === 'ANSWERED')
    .map(q => q.category)
    .filter((v, i, arr) => arr.indexOf(v) === i); // unique

  // Remaining topics from plan
  const allPlanTopics = plan.topics || [];
  const remainingTopics = allPlanTopics.filter(t => !answeredTopics.includes(t));

  // Current question index (next unanswered)
  const currentQuestionIndex = sortedQuestions.filter(
    q => q.status === 'ANSWERED' || q.status === 'SKIPPED'
  ).length;

  // Follow-up chain depth (consecutive follow-ups on last answered question)
  const lastAnsweredIdx = currentQuestionIndex - 1;
  let followUpChainDepth = 0;
  if (lastAnsweredIdx >= 0) {
    for (let i = lastAnsweredIdx; i >= 0; i--) {
      if (sortedQuestions[i]?.isFollowUp) {
        followUpChainDepth++;
      } else {
        break;
      }
    }
  }

  // Elapsed time
  const elapsedSeconds = Math.floor(
    (Date.now() - snapshot.startedAt.getTime()) / 1000
  );

  // Confidence estimate from recent answers
  // Simple heuristic: longer answers + more questions answered → higher confidence
  const answeredCount = sortedQuestions.filter(q => q.status === 'ANSWERED').length;
  const avgAnswerLength =
    answeredCount > 0
      ? conversationHistory
          .filter(m => m.role === 'answer')
          .reduce((sum, m) => sum + m.content.length, 0) / Math.max(answeredCount, 1)
      : 0;
  const confidenceEstimate = Math.min(
    100,
    Math.max(0, Math.round((avgAnswerLength / 500) * 60 + answeredCount * 5))
  );

  logger.debug('[conversationManager] Context built', {
    category: 'interview',
    sessionId: snapshot.id,
    answeredTopics: answeredTopics.length,
    remainingTopics: remainingTopics.length,
    currentQuestionIndex,
    followUpChainDepth,
    elapsedSeconds,
    confidenceEstimate,
  });

  return {
    sessionId: snapshot.id,
    plan,
    persona,
    answeredTopics,
    remainingTopics,
    conversationHistory,
    currentQuestionIndex,
    elapsedSeconds,
    followUpChainDepth,
    confidenceEstimate,
  };
}

/**
 * Checks if the interview should end based on time or question count.
 */
export function shouldEndInterview(
  context: ConversationContext,
  durationMinutes: number
): { shouldEnd: boolean; reason: string } {
  const timeExceeded = context.elapsedSeconds >= durationMinutes * 60;
  const allQuestionsAnswered =
    context.currentQuestionIndex >= context.plan.totalQuestions;

  if (timeExceeded) {
    return { shouldEnd: true, reason: 'time_limit' };
  }
  if (allQuestionsAnswered) {
    return { shouldEnd: true, reason: 'completed' };
  }
  return { shouldEnd: false, reason: '' };
}
