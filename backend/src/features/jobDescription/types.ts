// backend/src/features/jobDescription/types.ts

export interface JobDescriptionData {
  id: string;
  userId: string;
  documentId: string | null;
  originalText: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  documentUrl?: string;
}
