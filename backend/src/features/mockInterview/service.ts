// backend/src/features/mockInterview/service.ts
//
// Interview Service — business logic layer.
// Coordinates DB operations (via Repository) and type transformations.
// No AI calls here — that belongs in the Orchestrator.

import { InterviewRepository } from './repository';
import { logger } from '../../core/logger';
import type {
  InterviewConfig,
  InterviewPlan,
  GeneratedQuestion,
  EvaluationResult,
  FeedbackResult,
  ScoreResult,
  SessionSummary,
} from './types';

export class InterviewService {

  /**
   * Creates a new interview session with the generated plan persisted.
   */
  static async createSession(
    userId: string,
    config: InterviewConfig,
    plan: InterviewPlan
  ) {
    logger.info('[interviewService] Creating session', {
      category: 'interview',
      userId,
      type: config.type,
    });

    return InterviewRepository.createSession({
      userId,
      templateId: config.templateId,
      personaId: config.personaId,
      resumeId: config.resumeId,
      jobDescriptionId: config.jobDescriptionId,
      type: config.type,
      difficulty: config.difficulty,
      experienceLevel: config.experienceLevel,
      targetCompany: config.targetCompany,
      targetRole: config.targetRole,
      durationMinutes: config.durationMinutes,
      topics: config.topics,
      language: config.language,
      planJson: plan,
    });
  }

  /**
   * Persists a generated question and its question message to the DB.
   * Returns the created question record.
   */
  static async persistQuestion(
    sessionId: string,
    question: GeneratedQuestion,
    orderIndex: number
  ) {
    const created = await InterviewRepository.createQuestion({
      sessionId,
      questionText: question.questionText,
      category: question.category,
      difficulty: question.difficulty,
      expectedSkills: question.expectedSkills,
      estimatedTimeSec: question.estimatedTimeSec,
      followUpAllowed: question.followUpAllowed,
      orderIndex,
      isFollowUp: question.isFollowUp,
      parentQuestionId: question.parentQuestionId,
    });

    // Persist the question message in the conversation log
    await InterviewRepository.createMessage({
      sessionId,
      questionId: created.id,
      role: 'question',
      content: question.questionText,
    });

    return created;
  }

  /**
   * Persists a candidate's answer and marks the question as answered.
   */
  static async recordAnswer(
    sessionId: string,
    questionId: string,
    answerText: string
  ) {
    await InterviewRepository.createMessage({
      sessionId,
      questionId,
      role: 'answer',
      content: answerText,
    });

    await InterviewRepository.updateQuestionStatus(questionId, 'ANSWERED');
  }

  /**
   * Persists evaluation results for all answered questions.
   */
  static async persistEvaluations(
    sessionId: string,
    evaluations: EvaluationResult[]
  ) {
    for (const ev of evaluations) {
      await InterviewRepository.upsertEvaluation({
        sessionId,
        questionId: ev.questionId,
        technicalAccuracy: ev.scores.technicalAccuracy,
        communication: ev.scores.communication,
        problemSolving: ev.scores.problemSolving,
        confidence: ev.scores.confidence,
        depth: ev.scores.depth,
        structure: ev.scores.structure,
        examples: ev.scores.examples,
        completeness: ev.scores.completeness,
        overallScore: ev.overallScore,
        aiFeedback: ev.aiFeedback,
      });
    }
  }

  /**
   * Persists the aggregate session score.
   */
  static async persistScore(sessionId: string, score: ScoreResult) {
    await InterviewRepository.upsertScore({
      sessionId,
      technicalAccuracy: score.dimensions.technicalAccuracy,
      communication: score.dimensions.communication,
      problemSolving: score.dimensions.problemSolving,
      confidence: score.dimensions.confidence,
      depth: score.dimensions.depth,
      structure: score.dimensions.structure,
      examples: score.dimensions.examples,
      completeness: score.dimensions.completeness,
      overallScore: score.overallScore,
      percentile: score.percentile,
      improvementTrend: JSON.stringify(score.improvementTrend),
      confidenceTrend: JSON.stringify(score.confidenceTrend),
    });
  }

  /**
   * Persists the structured feedback.
   */
  static async persistFeedback(sessionId: string, feedback: FeedbackResult) {
    await InterviewRepository.upsertFeedback({ sessionId, ...feedback });
  }

  /**
   * Marks a session as completed.
   */
  static async finalizeSession(sessionId: string) {
    const session = await InterviewRepository.findSessionById(sessionId);
    if (session?.status === 'COMPLETED') return session;

    return InterviewRepository.updateSessionStatus(
      sessionId,
      'COMPLETED',
      new Date()
    );
  }

  /**
   * Marks a session as abandoned.
   */
  static async abandonSession(sessionId: string) {
    const session = await InterviewRepository.findSessionById(sessionId);
    if (session?.status === 'COMPLETED') {
      logger.info('[interviewService] Attempted to abandon a COMPLETED session, ignoring.', { category: 'interview', sessionId });
      return session;
    }
    return InterviewRepository.updateSessionStatus(sessionId, 'ABANDONED');
  }

  /**
   * Builds a SessionSummary from a fully-loaded session.
   */
  static buildSessionSummary(session: any): SessionSummary {
    const answeredQuestions = session.questions.filter(
      (q: any) => q.status === 'ANSWERED'
    );

    const elapsed = session.completedAt
      ? Math.floor(
          (session.completedAt.getTime() - session.startedAt.getTime()) / 1000
        )
      : Math.floor((Date.now() - session.startedAt.getTime()) / 1000);

    let score: ScoreResult | undefined;
    if (session.score) {
      score = {
        dimensions: {
          technicalAccuracy: session.score.technicalAccuracy,
          communication: session.score.communication,
          problemSolving: session.score.problemSolving,
          confidence: session.score.confidence,
          depth: session.score.depth,
          structure: session.score.structure,
          examples: session.score.examples,
          completeness: session.score.completeness,
        },
        overallScore: session.score.overallScore,
        percentile: session.score.percentile ?? undefined,
        improvementTrend: session.score.improvementTrend
          ? JSON.parse(session.score.improvementTrend)
          : { earlyAvg: 0, lateAvg: 0, delta: 0, label: 'stable' },
        confidenceTrend: session.score.confidenceTrend
          ? JSON.parse(session.score.confidenceTrend)
          : { scores: [], trend: 'stable', peak: 0, low: 0 },
      };
    }

    return {
      sessionId: session.id,
      status: session.status,
      questionsAnswered: answeredQuestions.length,
      questionsTotal: session.questions.length,
      durationSeconds: elapsed,
      score,
      feedback: session.feedback || undefined,
      evaluations: session.evaluations || undefined,
    };
  }
}
