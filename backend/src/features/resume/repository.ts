// backend/src/features/resume/repository.ts
//
// Resume feature data repository.
// Wrapper around Prisma Client for database queries.

import prisma from '../../db/client';

export class ResumeRepository {
  static async findManyByUser(userId: string) {
    // We fetch ACTIVE resumes grouped by their ResumeGroup
    return prisma.resume.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: {
        document: true,
        group: true,
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  static async findById(id: string) {
    return prisma.resume.findUnique({
      where: { id },
      include: {
        document: true,
        group: true,
        analyses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  static async findByIdWithLatestAnalysis(id: string) {
    return prisma.resume.findUnique({
      where: { id },
      include: {
        document: true,
        group: true,
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  static async findByHash(userId: string, fileHash: string) {
    // Find active resume by the document hash
    return prisma.resume.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        document: {
          fileHash,
        }
      },
      include: {
        document: true,
        group: true,
        analyses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  // Creates the initial Resume Group, Document, and Resume Version 1
  static async createInitialResume(
    userId: string,
    name: string,
    documentId: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Create the group
      const group = await tx.resumeGroup.create({
        data: {
          userId,
          name,
        },
      });

      // Create the resume v1
      const resume = await tx.resume.create({
        data: {
          userId,
          groupId: group.id,
          documentId,
          version: 1,
        },
        include: {
          document: true,
          group: true,
        }
      });

      return resume;
    });
  }

  // Creates a new version in an existing ResumeGroup
  static async createResumeVersion(
    userId: string,
    groupId: string,
    documentId: string,
    newVersionNumber: number
  ) {
    return prisma.resume.create({
      data: {
        userId,
        groupId,
        documentId,
        version: newVersionNumber,
      },
      include: {
        document: true,
        group: true,
      }
    });
  }

  static async updateStatus(id: string, status: string) {
    return prisma.resume.update({
      where: { id },
      data: { status },
    });
  }

  static async updateGroupName(groupId: string, name: string) {
    return prisma.resumeGroup.update({
      where: { id: groupId },
      data: { name },
    });
  }

  // ---------------------------------------------------------------------------
  // ResumeAnalysis Queries
  // ---------------------------------------------------------------------------

  static async createAnalysis(data: {
    resumeId: string;
    overallScore: number;
    atsScore: number;
    semanticScore: number;
    analysis: any;
    processingTime: number;
    promptVersion: string;
    modelUsed: string;
    warnings: string[];
    preservationScore: number;
  }) {
    return prisma.resumeAnalysis.create({
      data,
    });
  }

  static async findLatestAnalysis(resumeId: string) {
    return prisma.resumeAnalysis.findFirst({
      where: { resumeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findAnalysisHistory(resumeId: string) {
    return prisma.resumeAnalysis.findMany({
      where: { resumeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------------------------------------------------------------------
  // AnalysisRun Queries (Analytics & Monitoring)
  // ---------------------------------------------------------------------------

  static async createRun(data: {
    analysisId?: string | null;
    resumeId: string;
    status: string;
    latency: number;
    error?: string | null;
    retryCount?: number;
    tokensUsed?: number | null;
    modelUsed: string;
  }) {
    return prisma.analysisRun.create({
      data,
    });
  }

  static async findRunsByResume(resumeId: string) {
    return prisma.analysisRun.findMany({
      where: { resumeId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
