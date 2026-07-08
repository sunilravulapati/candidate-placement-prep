// backend/src/features/resume/tailoringRepository.ts
import prisma from '../../db/client';

export class TailoringRepository {
  static async createSession(data: {
    resumeId: string;
    jobDescriptionId: string;
    matchScore: number;
    atsScore: number;
    keywordCoverage: number;
    matchDetails: any;
    missingSkills: any;
    matchingSkills: any;
    recommendations: any;
  }) {
    return prisma.tailoringSession.create({
      data,
    });
  }

  static async findByResumeAndJd(resumeId: string, jobDescriptionId: string) {
    return prisma.tailoringSession.findFirst({
      where: { resumeId, jobDescriptionId },
      orderBy: { createdAt: 'desc' },
      include: {
        resume: { include: { group: true } },
        jobDescription: { include: { analysis: true } },
      },
    });
  }

  static async findByResumeId(resumeId: string) {
    return prisma.tailoringSession.findMany({
      where: { resumeId },
      orderBy: { createdAt: 'desc' },
      include: {
        jobDescription: { include: { analysis: true } },
      },
    });
  }

  static async findById(id: string) {
    return prisma.tailoringSession.findUnique({
      where: { id },
      include: {
        resume: {
          include: { group: true }
        },
        jobDescription: { include: { analysis: true } },
      },
    });
  }
}
