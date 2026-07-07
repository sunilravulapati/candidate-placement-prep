// backend/src/features/user/types.ts

export interface UserProfileStats {
  totalSolved: number;
  inProgress: number;
  latestResumeScore: number | null;
  averageInterviewScore: number | null;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  progress: any[];
  resumes: any[];
  interviews: any[];
  stats: UserProfileStats;
}
