// backend/src/core/documentRepository.ts
import prisma from '../db/client';

export class DocumentRepository {
  static async createDocument(data: {
    ownerId: string;
    provider: string;
    publicId: string;
    secureUrl: string;
    resourceType: string;
    mimeType: string;
    fileSize: number;
    fileHash?: string;
  }) {
    return prisma.document.create({
      data,
    });
  }

  static async findById(id: string) {
    return prisma.document.findUnique({ where: { id } });
  }

  static async findByHash(ownerId: string, fileHash: string) {
    return prisma.document.findFirst({
      where: { ownerId, fileHash, status: 'ACTIVE' },
    });
  }
  
  static async updateStatus(id: string, status: string) {
    return prisma.document.update({
      where: { id },
      data: { status },
    });
  }

  static async deleteDocument(id: string) {
    return prisma.document.delete({
      where: { id },
    });
  }
}
