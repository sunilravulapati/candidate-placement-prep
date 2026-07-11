// backend/src/features/mockInterview/repository.ts
//
// Interview feature data repository.
// Pure Prisma wrappers — one method per operation.
// No business logic, no AI calls.

import prisma from '../../db/client';

export class InterviewRepository {

  // ─────────────────────────────────────────────────────────────────────────
  // Templates & Personas
  // ─────────────────────────────────────────────────────────────────────────

  static async findAllPublicTemplates() {
    return prisma.interviewTemplate.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: { persona: true },
    });
  }

  static async findTemplateById(id: string) {
    return prisma.interviewTemplate.findUnique({
      where: { id },
      include: { persona: true },
    });
  }

  static async findAllPublicPersonas() {
    return prisma.interviewPersona.findMany({
      where: { isPublic: true },
      orderBy: { name: 'asc' },
    });
  }

  static async findPersonaById(id: string) {
    return prisma.interviewPersona.findUnique({ where: { id } });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Session CRUD
  // ─────────────────────────────────────────────────────────────────────────

  static async createSession(data: {
    userId: string;
    templateId?: string;
    personaId?: string;
    resumeId?: string;
    jobDescriptionId?: string;
    type: string;
    difficulty: string;
    experienceLevel: string;
    targetCompany?: string;
    targetRole?: string;
    durationMinutes: number;
    topics: string[];
    language: string;
    planJson: any;
  }) {
    return prisma.interviewSession.create({
      data,
      include: {
        persona: true,
        template: true,
      },
    });
  }

  static async findSessionById(id: string) {
    return prisma.interviewSession.findUnique({
      where: { id },
      include: {
        persona: true,
        template: true,
        resume: { include: { group: true } },
        jobDescription: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            messages: { orderBy: { createdAt: 'asc' } },
            evaluation: true,
          },
        },
        feedback: true,
        score: true,
      },
    });
  }

  static async findSessionsByUser(userId: string) {
    return prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        persona: { select: { name: true, company: true } },
        template: { select: { title: true, type: true } },
        score: { select: { overallScore: true } },
        _count: { select: { questions: true } },
      },
    });
  }

  static async updateSessionStatus(
    id: string,
    status: string,
    completedAt?: Date
  ) {
    return prisma.interviewSession.update({
      where: { id },
      data: {
        status,
        ...(completedAt ? { completedAt } : {}),
      },
    });
  }

  static async updateSessionPlan(id: string, planJson: any) {
    return prisma.interviewSession.update({
      where: { id },
      data: { planJson },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Questions
  // ─────────────────────────────────────────────────────────────────────────

  static async createQuestion(data: {
    sessionId: string;
    questionText: string;
    category: string;
    difficulty: string;
    expectedSkills: string[];
    estimatedTimeSec: number;
    followUpAllowed: boolean;
    orderIndex: number;
    isFollowUp: boolean;
    parentQuestionId?: string;
  }) {
    return prisma.interviewQuestion.create({ data });
  }

  static async updateQuestionStatus(id: string, status: string) {
    return prisma.interviewQuestion.update({
      where: { id },
      data: { status },
    });
  }

  static async countQuestions(sessionId: string) {
    return prisma.interviewQuestion.count({ where: { sessionId } });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Messages
  // ─────────────────────────────────────────────────────────────────────────

  static async createMessage(data: {
    sessionId: string;
    questionId: string;
    role: string;
    content: string;
  }) {
    return prisma.interviewMessage.create({ data });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Evaluations
  // ─────────────────────────────────────────────────────────────────────────

  static async upsertEvaluation(data: {
    sessionId: string;
    questionId: string;
    technicalAccuracy: number;
    communication: number;
    problemSolving: number;
    confidence: number;
    depth: number;
    structure: number;
    examples: number;
    completeness: number;
    overallScore: number;
    aiFeedback: string;
  }) {
    return prisma.interviewEvaluation.upsert({
      where: { questionId: data.questionId },
      create: data,
      update: {
        technicalAccuracy: data.technicalAccuracy,
        communication: data.communication,
        problemSolving: data.problemSolving,
        confidence: data.confidence,
        depth: data.depth,
        structure: data.structure,
        examples: data.examples,
        completeness: data.completeness,
        overallScore: data.overallScore,
        aiFeedback: data.aiFeedback,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Feedback
  // ─────────────────────────────────────────────────────────────────────────

  static async upsertFeedback(data: {
    sessionId: string;
    strengths: string[];
    weaknesses: string[];
    missedConcepts: string[];
    suggestedImprovements: string[];
    topicsToRevise: string[];
    recommendedDSAProblems: string[];
    resumeChanges: string[];
    overallSummary: string;
  }) {
    return prisma.interviewFeedback.upsert({
      where: { sessionId: data.sessionId },
      create: data,
      update: {
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        missedConcepts: data.missedConcepts,
        suggestedImprovements: data.suggestedImprovements,
        topicsToRevise: data.topicsToRevise,
        recommendedDSAProblems: data.recommendedDSAProblems,
        resumeChanges: data.resumeChanges,
        overallSummary: data.overallSummary,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Score
  // ─────────────────────────────────────────────────────────────────────────

  static async upsertScore(data: {
    sessionId: string;
    technicalAccuracy: number;
    communication: number;
    problemSolving: number;
    confidence: number;
    depth: number;
    structure: number;
    examples: number;
    completeness: number;
    overallScore: number;
    percentile?: number;
    improvementTrend?: string;
    confidenceTrend?: string;
  }) {
    return prisma.interviewScore.upsert({
      where: { sessionId: data.sessionId },
      create: data,
      update: {
        technicalAccuracy: data.technicalAccuracy,
        communication: data.communication,
        problemSolving: data.problemSolving,
        confidence: data.confidence,
        depth: data.depth,
        structure: data.structure,
        examples: data.examples,
        completeness: data.completeness,
        overallScore: data.overallScore,
        percentile: data.percentile,
        improvementTrend: data.improvementTrend,
        confidenceTrend: data.confidenceTrend,
      },
    });
  }
}
