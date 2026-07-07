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

  static async findByResumeId(resumeId: string) {
    return prisma.tailoringSession.findMany({
      where: { resumeId },
      orderBy: { createdAt: 'desc' },
      include: {
        jobDescription: true,
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
        jobDescription: true,
      },
    });
  }
}
