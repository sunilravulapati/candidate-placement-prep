// backend/src/features/resume/types.ts

export interface ResumeData {
  id: string;
  groupId: string;
  userId: string;
  name: string;
  url: string;
  version: number;
  atsScore: number | null;
  feedback: string | null;
  jdText: string | null;
  createdAt: Date;
  latestAnalysis?: any;
}

export interface UploadResumeInput {
  name: string;
  fileBuffer: Buffer;
  mimeType: string;
}

export interface RenameResumeInput {
  id: string;
  name: string;
}

export interface UploadCheckResult {
  success: boolean;
  cacheHit: boolean;
  resumeId?: string;
  fileName?: string;
  url?: string;
  latestAnalysis?: any;
}
