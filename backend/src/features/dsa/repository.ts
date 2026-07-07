// backend/src/features/dsa/repository.ts
import prisma from '../../db/client';
import { QuestionFilter, QuestionProgressUpdateInput } from './types';

export class DSARepository {
  static async findMany(filters?: QuestionFilter) {
    const whereClause: any = {};

    if (filters?.category && filters.category !== 'all') {
      whereClause.category = filters.category;
    }

    if (filters?.difficulty && filters.difficulty !== 'all') {
      whereClause.difficulty = filters.difficulty;
    }

    if (filters?.userId && filters.status && filters.status !== 'all') {
      whereClause.progress = {
        some: {
          userId: filters.userId,
          status: filters.status,
        },
      };
    } else if (!filters?.userId && filters?.status && filters.status !== 'all') {
      return [];
    }

    return prisma.question.findMany({
      where: whereClause,
      include: filters?.userId
        ? {
            progress: {
              where: {
                userId: filters.userId,
              },
            },
          }
        : undefined,
      orderBy: {
        id: 'asc',
      },
    });
  }

  static async findUnique(id: number, userId?: string) {
    return prisma.question.findUnique({
      where: { id },
      include: userId
        ? {
            progress: {
              where: {
                userId,
              },
            },
          }
        : undefined,
    });
  }

  static async upsertProgress(
    userId: string,
    questionId: number,
    data: QuestionProgressUpdateInput
  ) {
    return prisma.userQuestionProgress.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
      update: {
        ...data,
      },
      create: {
        userId,
        questionId,
        status: data.status || 'not_started',
        code: data.code || '',
        notes: data.notes || '',
        isRevision: data.isRevision || false,
      },
    });
  }
}
