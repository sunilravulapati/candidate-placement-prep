// backend/src/features/resume/service.ts
import { ResumeRepository } from './repository';
import { DocumentRepository } from '../../core/documentRepository';
import { storageProvider } from '../../utils/storage';

export class ResumeService {
  static async listResumes(userId: string) {
    return ResumeRepository.findManyByUser(userId);
  }

  static async uploadResume(
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

    // 3. Create initial ResumeGroup and Resume version 1
    return ResumeRepository.createInitialResume(userId, fileName, document.id);
  }

  static async createVersion(
    userId: string,
    groupId: string,
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
    fileHash: string
  ) {
    // Get current group/resume to find the latest version number
    const groupResumes = await ResumeRepository.findManyByUser(userId);
    const existingGroup = groupResumes.find(r => r.groupId === groupId);
    if (!existingGroup) {
      throw new Error('Resume group not found');
    }

    // Upload to Cloudinary
    const metadata = await storageProvider.upload(fileName, fileBuffer, mimeType);

    // Create Document record
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

    // We assume the caller or the DB will keep track of version number. 
    // Let's just fetch the max version for this group.
    // For simplicity, we can just fetch all resumes for the group, or pass it in.
    // Let's assume we increment the highest version.
    const allVersions = groupResumes.filter(r => r.groupId === groupId);
    const highestVersion = allVersions.reduce((max, r) => Math.max(max, r.version), 0);

    return ResumeRepository.createResumeVersion(
      userId,
      groupId,
      document.id,
      highestVersion + 1
    );
  }

  static async renameResumeGroup(userId: string, groupId: string, name: string) {
    // Verify ownership
    const resumes = await ResumeRepository.findManyByUser(userId);
    const targetResume = resumes.find(r => r.groupId === groupId);
    if (!targetResume) {
      throw new Error('Unauthorized or Resume Group not found');
    }

    let updatedName = name;
    if (targetResume.group.name.toLowerCase().endsWith('.pdf') && !name.toLowerCase().endsWith('.pdf')) {
      updatedName = `${name}.pdf`;
    }

    return ResumeRepository.updateGroupName(groupId, updatedName);
  }

  static async softDeleteResume(userId: string, id: string) {
    const resume = await ResumeRepository.findById(id);
    if (!resume || resume.userId !== userId) {
      throw new Error('Resume not found or unauthorized');
    }
    return ResumeRepository.updateStatus(id, 'DELETED');
  }

  static async archiveResume(userId: string, id: string) {
    const resume = await ResumeRepository.findById(id);
    if (!resume || resume.userId !== userId) {
      throw new Error('Resume not found or unauthorized');
    }
    return ResumeRepository.updateStatus(id, 'ARCHIVED');
  }

  static async restoreResume(userId: string, id: string) {
    const resume = await ResumeRepository.findById(id);
    if (!resume || resume.userId !== userId) {
      throw new Error('Resume not found or unauthorized');
    }
    return ResumeRepository.updateStatus(id, 'ACTIVE');
  }
}
