// helper/src/app/(dashboard)/company-prep/page.tsx

import React from 'react';
import Link from 'next/link';
import { COMPANY_PROFILES } from '@backend/features/company/companyRepository';
import { CompanyReadinessEngine } from '@backend/features/company/readinessEngine';
import {
  Building2,
  Trophy,
  Target,
  Search,
  CheckCircle,
  Briefcase,
  ChevronRight,
  Sparkles,
  Zap,
  BookOpen,
} from 'lucide-react';

export default function CompanyPrepHubPage() {
  // Simulated user performance state across core domains
  const mockUserPerf = {
    dsaSolvedRatio: 0.65,
    aptitudeSolvedRatio: 0.72,
    sqlSolvedRatio: 0.80,
    pythonSolvedRatio: 0.60,
    csFundamentalsRatio: 0.70,
  };

  const readinessBreakdowns = CompanyReadinessEngine.calculateAllReadiness(
    COMPANY_PROFILES,
    mockUserPerf
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-slate-900 p-8 border border-violet-500/20 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-violet-500/10 border border-violet-500/30 px-3 py-1 rounded-full text-xs font-semibold text-violet-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Placement Operating System • Company Preparation</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Company Preparation Hub
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Target company-specific OA patterns, hiring rounds, high-frequency DSA problems, Aptitude sets, SQL benchmarks, and real-time Company Readiness Scores. Zero duplicated questions.
          </p>
        </div>
      </div>

      {/* Target Companies Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Top Recruitment Targets ({COMPANY_PROFILES.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMPANY_PROFILES.map((company) => {
            const readiness = readinessBreakdowns.find(
              (r) => r.companySlug === company.slug
            );
            const score = readiness?.overallScore ?? 0;

            const scoreColor =
              score >= 70
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                : score >= 50
                ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                : 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';

            return (
              <Link
                key={company.slug}
                href={`/company-prep/${company.slug}`}
                className="group relative bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/40 rounded-xl p-6 transition-all duration-300 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                        {company.name}
                      </h3>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        {company.tier.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className={`px-3 py-1 rounded-full border text-xs font-bold ${scoreColor}`}>
                      {score}% Readiness
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {company.tagline}
                  </p>

                  {/* Top Topics Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {company.topTopics.dsa.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-indigo-400 group-hover:text-indigo-300">
                  <span>View Hiring Roadmap</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
