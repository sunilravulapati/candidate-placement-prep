// helper/src/app/(dashboard)/company-prep/[slug]/page.tsx

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CompanyRepository } from '@backend/features/company/companyRepository';
import { CompanyReadinessEngine } from '@backend/features/company/readinessEngine';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Code2,
  Layers,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompanyDetailPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const company = CompanyRepository.getBySlug(slug);

  if (!company) {
    notFound();
  }

  // Simulated user performance metrics
  const mockUserPerf = {
    dsaSolvedRatio: 0.68,
    aptitudeSolvedRatio: 0.75,
    sqlSolvedRatio: 0.85,
    pythonSolvedRatio: 0.60,
    csFundamentalsRatio: 0.70,
  };

  const readiness = CompanyReadinessEngine.calculateReadiness(company, mockUserPerf);

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      {/* Back Button */}
      <Link
        href="/company-prep"
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 w-fit backdrop-blur-md"
      >
        <ArrowLeft className="w-4 h-4 text-violet-400" />
        <span>Back to Company Prep Hub</span>
      </Link>

      {/* Main Header Banner */}
      <div className="relative isolate overflow-hidden rounded-[28px] border border-violet-500/20 bg-gradient-to-br from-violet-950/70 via-indigo-950/45 to-slate-900/45 p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-md">
        <div className="absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-20 -z-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{company.name}</h1>
              <span className="text-xs bg-violet-500/10 border border-violet-500/30 text-violet-300 px-3 py-1 rounded-full font-bold">
                {company.overallDifficulty} DIFFICULTY
              </span>
            </div>
            <p className="text-sm text-slate-300/85 max-w-2xl leading-relaxed">{company.overview}</p>
          </div>

          {/* Readiness Card */}
          <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl text-center space-y-1 min-w-[200px] shadow-xl backdrop-blur-md shrink-0">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Company Readiness
            </span>
            <div className="text-3xl font-black text-violet-400">
              {readiness.overallScore}%
            </div>
            <span className="text-xs text-emerald-400 font-bold">
              {readiness.statusLabel}
            </span>
          </div>
        </div>

        {/* Domain Score Progress Bars */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-slate-800/80">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium">DSA ({readiness.dsaScore}%)</span>
            <div className="w-full bg-slate-950/60 h-2 rounded-full overflow-hidden border border-slate-850">
              <div className="bg-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${readiness.dsaScore}%` }} />
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium">Aptitude ({readiness.aptitudeScore}%)</span>
            <div className="w-full bg-slate-950/60 h-2 rounded-full overflow-hidden border border-slate-850">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${readiness.aptitudeScore}%` }} />
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium">SQL ({readiness.sqlScore}%)</span>
            <div className="w-full bg-slate-950/60 h-2 rounded-full overflow-hidden border border-slate-850">
              <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${readiness.sqlScore}%` }} />
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium">Python ({readiness.pythonScore}%)</span>
            <div className="w-full bg-slate-950/60 h-2 rounded-full overflow-hidden border border-slate-850">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${readiness.pythonScore}%` }} />
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium">CS Fundamentals ({readiness.csFundamentalsScore}%)</span>
            <div className="w-full bg-slate-950/60 h-2 rounded-full overflow-hidden border border-slate-850">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${readiness.csFundamentalsScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content: Hiring Rounds & OA Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Hiring Rounds */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-7 space-y-5 backdrop-blur-md shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2.5">
              <Layers className="w-5 h-5 text-violet-400" />
              <span>Hiring Process & Round Breakdown</span>
            </h2>

            <div className="space-y-4">
              {company.hiringProcess.map((round) => (
                <div
                  key={round.roundNumber}
                  className="bg-slate-950/60 border border-slate-850 rounded-xl p-4.5 space-y-2.5 shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-violet-400">
                      ROUND {round.roundNumber} • {round.name}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{round.durationMinutes} mins</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{round.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {round.focusAreas.map((area) => (
                      <span
                        key={area}
                        className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Behavioral & STAR Questions */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-7 space-y-5 backdrop-blur-md shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2.5">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <span>Frequently Asked Behavioral Questions</span>
            </h2>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {company.behavioralQuestions.map((q, idx) => (
                <li key={idx} className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl flex items-start space-x-2.5 shadow-inner leading-relaxed">
                  <span className="font-mono text-indigo-400 font-bold">{idx + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: OA Pattern & Checklist */}
        <div className="space-y-6">
          {/* OA Pattern Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Online Assessment (OA) Pattern</span>
            </h2>

            <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 space-y-3 text-xs shadow-inner">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Platform</span>
                <span className="font-semibold text-white">{company.oaPattern.platform}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Duration</span>
                <span className="font-semibold text-white">{company.oaPattern.durationMinutes} Mins</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">DSA Questions</span>
                <span className="font-semibold text-violet-400">{company.oaPattern.dsaQuestionCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Aptitude Questions</span>
                <span className="font-semibold text-indigo-400">{company.oaPattern.aptitudeQuestionCount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Estimated Cutoff</span>
                <span className="font-semibold text-emerald-400">{company.oaPattern.cutoffEstimatePercent}%</span>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Preparation Checklist</span>
            </h2>

            <ul className="space-y-2.5 text-xs text-slate-300">
              {company.checklist.map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2.5">
                  <div className="w-2 h-2 bg-violet-400 rounded-full shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
