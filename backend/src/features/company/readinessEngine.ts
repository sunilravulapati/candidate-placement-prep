// backend/src/features/company/readinessEngine.ts

import { CompanyProfile, CompanyReadinessBreakdown } from './companyTypes';

export interface UserPerformanceInput {
  dsaSolvedRatio: number;          // 0.0 to 1.0
  aptitudeSolvedRatio: number;     // 0.0 to 1.0
  sqlSolvedRatio: number;          // 0.0 to 1.0
  pythonSolvedRatio: number;       // 0.0 to 1.0
  csFundamentalsRatio: number;     // 0.0 to 1.0
}

export class CompanyReadinessEngine {
  /**
   * Calculates weighted readiness score (0 - 100%) for a target company profile.
   */
  public static calculateReadiness(
    company: CompanyProfile,
    userPerf: UserPerformanceInput
  ): CompanyReadinessBreakdown {
    const dsaPct = Math.round(userPerf.dsaSolvedRatio * 100);
    const aptitudePct = Math.round(userPerf.aptitudeSolvedRatio * 100);
    const sqlPct = Math.round(userPerf.sqlSolvedRatio * 100);
    const pythonPct = Math.round(userPerf.pythonSolvedRatio * 100);
    const csPct = Math.round(userPerf.csFundamentalsRatio * 100);

    // Weighted Formula
    const rawScore =
      0.40 * dsaPct +
      0.25 * aptitudePct +
      0.15 * sqlPct +
      0.10 * pythonPct +
      0.10 * csPct;

    const overallScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    let statusLabel: CompanyReadinessBreakdown['statusLabel'] = 'Starting Out';
    if (overallScore >= 75) statusLabel = 'High Readiness';
    else if (overallScore >= 50) statusLabel = 'Moderate Readiness';
    else if (overallScore >= 25) statusLabel = 'Needs Preparation';

    return {
      companySlug: company.slug,
      companyName: company.name,
      overallScore,
      dsaScore: dsaPct,
      aptitudeScore: aptitudePct,
      sqlScore: sqlPct,
      pythonScore: pythonPct,
      csFundamentalsScore: csPct,
      statusLabel,
    };
  }

  /**
   * Calculates readiness scores across all supported target companies.
   */
  public static calculateAllReadiness(
    companies: CompanyProfile[],
    userPerf: UserPerformanceInput
  ): CompanyReadinessBreakdown[] {
    return companies.map((comp) => this.calculateReadiness(comp, userPerf));
  }
}
