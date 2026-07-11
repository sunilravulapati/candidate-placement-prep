import { PrismaClient } from '@prisma/client';
import prisma from '../../db/client';

export class CodingProblemRepository {
  /**
   * Get all coding problems with their relations.
   */
  static async getAllProblems() {
    return prisma.codingProblem.findMany({
      include: {
        topics: true,
        companies: true,
        tags: true,
      },
      orderBy: {
        createdAt: 'asc' // or difficulty or a custom sort
      }
    });
  }

  /**
   * Get a single problem by its slug.
   */
  static async getProblemBySlug(slug: string) {
    return prisma.codingProblem.findUnique({
      where: { slug },
      include: {
        topics: true,
        companies: true,
        tags: true,
      }
    });
  }

  /**
   * Search problems by topic.
   */
  static async getProblemsByTopic(topicSlug: string) {
    return prisma.codingProblem.findMany({
      where: {
        topics: {
          some: { slug: topicSlug }
        }
      },
      include: {
        topics: true,
        companies: true,
        tags: true,
      }
    });
  }
  
  /**
   * Search and filter problems.
   */
  static async searchProblems(filters: { search?: string, difficulty?: string, topic?: string, company?: string, limit?: number, offset?: number }) {
    const where: any = {};
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.difficulty) {
      where.difficulty = filters.difficulty.toUpperCase();
    }
    if (filters.topic) {
      where.topics = { some: { slug: filters.topic } };
    }
    if (filters.company) {
      where.companies = { some: { slug: filters.company } };
    }

    return prisma.codingProblem.findMany({
      where,
      take: filters.limit || 20,
      skip: filters.offset || 0,
      include: {
        topics: true,
        companies: true,
        tags: true,
      },
      orderBy: {
        id: 'asc' // Deterministic order for pagination
      }
    });
  }

  /**
   * Count total problems matching filters.
   */
  static async countProblems(filters: { search?: string, difficulty?: string, topic?: string, company?: string }) {
    const where: any = {};
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.difficulty) {
      where.difficulty = filters.difficulty.toUpperCase();
    }
    if (filters.topic) {
      where.topics = { some: { slug: filters.topic } };
    }
    if (filters.company) {
      where.companies = { some: { slug: filters.company } };
    }

    return prisma.codingProblem.count({ where });
  }
}

export class CodingSubmissionRepository {
  /**
   * Create a new coding submission.
   */
  static async createSubmission(data: {
    sessionId: string,
    userId: string,
    codeSnapshot: string,
    language: string,
    status: string,
    executionTimeMs?: number,
    memoryBytes?: number,
    passedCount: number,
    totalCount: number,
    basicReview?: any,
    detailedReview?: any
  }) {
    return prisma.codingSubmission.create({
      data
    });
  }
  
  /**
   * Get all submissions for a user on a specific session or problem.
   */
  static async getSubmissionsByUser(userId: string) {
    return prisma.codingSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get the most recent accepted submission for a problem.
   */
  static async getLatestAccepted(userId: string, problemId: string) {
    // Note: We might need to join session to get problemId
    return prisma.codingSubmission.findFirst({
      where: { 
        userId, 
        status: 'ACCEPTED',
        session: {
          problemId: problemId
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
