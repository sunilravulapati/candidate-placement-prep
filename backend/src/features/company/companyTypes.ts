// backend/src/features/company/companyTypes.ts

export interface HiringRoundSpec {
  roundNumber: number;
  name: string;
  type: 'OA' | 'TECHNICAL_DSA' | 'CS_FUNDAMENTALS' | 'SYSTEM_DESIGN' | 'BEHAVIORAL_HR';
  description: string;
  durationMinutes: number;
  focusAreas: string[];
}

export interface OAPatternSpec {
  platform: string; // e.g. "HackerRank", "Metl", "Amcat", "Custom CodeSignal"
  durationMinutes: number;
  dsaQuestionCount: number;
  aptitudeQuestionCount: number;
  sqlQuestionCount: number;
  cutoffEstimatePercent: number;
}

export interface CompanyProfile {
  slug: string;
  name: string;
  tier: 'TIER_1_PRODUCT' | 'TIER_2_PRODUCT' | 'SERVICE_LEADER' | 'FINTECH_GLOBAL';
  overallDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
  tagline: string;
  overview: string;
  logoUrl?: string;
  hiringProcess: HiringRoundSpec[];
  oaPattern: OAPatternSpec;
  difficultyDistribution: {
    easyPercent: number;
    mediumPercent: number;
    hardPercent: number;
  };
  topTopics: {
    dsa: string[];
    aptitude: string[];
    csFundamentals: string[];
  };
  behavioralQuestions: string[];
  resumeTips: string[];
  recentExperiences: Array<{
    candidateRole: string;
    verdict: 'SELECTED' | 'REJECTED' | 'WAITLISTED';
    summary: string;
    keyTakeaway: string;
    year: number;
  }>;
  checklist: string[];
}

export interface CompanyReadinessBreakdown {
  companySlug: string;
  companyName: string;
  overallScore: number; // 0 to 100
  dsaScore: number;
  aptitudeScore: number;
  sqlScore: number;
  pythonScore: number;
  csFundamentalsScore: number;
  statusLabel: 'High Readiness' | 'Moderate Readiness' | 'Needs Preparation' | 'Starting Out';
}
