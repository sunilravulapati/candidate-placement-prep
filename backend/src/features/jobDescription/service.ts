// backend/src/features/jobDescription/service.ts
import { JobDescriptionRepository } from './repository';
import { DocumentRepository } from '../../core/documentRepository';
import { storageProvider } from '../../utils/storage';

export class JobDescriptionService {
  static async listJobDescriptions(userId: string) {
    return JobDescriptionRepository.findManyByUser(userId);
  }

  static async uploadPDF(
    userId: string,
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
    fileHash: string
  ) {
    // 1. Upload to Cloudinary
    const metadata = await storageProvider.upload(fileName, fileBuffer, mimeType);

    // 2. Create generic Document record
    const document = await DocumentRepository.createDocument({
      ownerId: userId,
      provider: metadata.provider,
      publicId: metadata.publicId,
      secureUrl: metadata.secureUrl,
      resourceType: metadata.resourceType,
      mimeType: metadata.mimeType,
      fileSize: metadata.fileSize,
      fileHash: fileHash,
    });

    // 3. Create Job Description linking to the Document
    return JobDescriptionRepository.createWithDocument(userId, document.id);
  }

  static async pasteText(userId: string, text: string) {
    return JobDescriptionRepository.createWithText(userId, text);
  }

  static async softDelete(userId: string, id: string) {
    const jd = await JobDescriptionRepository.findById(id);
    if (!jd || jd.userId !== userId) {
      throw new Error('Job description not found or unauthorized');
    }
    return JobDescriptionRepository.updateStatus(id, 'DELETED');
  }

  static async archive(userId: string, id: string) {
    const jd = await JobDescriptionRepository.findById(id);
    if (!jd || jd.userId !== userId) {
      throw new Error('Job description not found or unauthorized');
    }
    return JobDescriptionRepository.updateStatus(id, 'ARCHIVED');
  }

  static async restore(userId: string, id: string) {
    const jd = await JobDescriptionRepository.findById(id);
    if (!jd || jd.userId !== userId) {
      throw new Error('Job description not found or unauthorized');
    }
    return JobDescriptionRepository.updateStatus(id, 'ACTIVE');
  }
}
