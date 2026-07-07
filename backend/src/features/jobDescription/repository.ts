// backend/src/features/jobDescription/repository.ts
import prisma from '../../db/client';

export class JobDescriptionRepository {
  static async findManyByUser(userId: string) {
    return prisma.jobDescription.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { document: true, analysis: true },
    });
  }

  static async findById(id: string) {
    return prisma.jobDescription.findUnique({
      where: { id },
      include: { document: true, analysis: true },
    });
  }

  static async createWithDocument(userId: string, documentId: string) {
    return prisma.jobDescription.create({
      data: {
        userId,
        documentId,
      },
      include: { document: true },
    });
  }

  static async createWithText(userId: string, originalText: string) {
    return prisma.jobDescription.create({
      data: {
        userId,
        originalText,
      },
    });
  }

  static async updateStatus(id: string, status: string) {
    return prisma.jobDescription.update({
      where: { id },
      data: { status },
    });
  }

  static async saveAnalysis(jobDescriptionId: string, analysisData: any) {
    return prisma.jobDescriptionAnalysis.upsert({
      where: { jobDescriptionId },
      create: {
        jobDescriptionId,
        ...analysisData
      },
      update: {
        ...analysisData
      }
    });
  }
}
