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
  FileCode,
  HelpCircle,
  Layers,
  Sparkles,
  Trophy,
  Zap,
  BookOpen,
  MessageSquare,
  FileText,
  UserCheck,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* Back Button */}
      <Link
        href="/company-prep"
        className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Company Prep Hub</span>
      </Link>

      {/* Main Header Banner */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-white">{company.name}</h1>
              <span className="text-xs bg-violet-500/10 border border-violet-500/30 text-violet-300 px-3 py-1 rounded-full font-bold">
                {company.overallDifficulty} DIFFICULTY
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl">{company.overview}</p>
          </div>

          {/* Readiness Card */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl text-center space-y-1 min-w-[200px]">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Company Readiness
            </span>
            <div className="text-3xl font-black text-violet-400">
              {readiness.overallScore}%
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">
              {readiness.statusLabel}
            </span>
          </div>
        </div>

        {/* Domain Score Progress Bars */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-slate-800/80">
          <div>
            <span className="text-xs text-slate-400">DSA ({readiness.dsaScore}%)</span>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
              <div className="bg-violet-500 h-full" style={{ width: `${readiness.dsaScore}%` }} />
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Aptitude ({readiness.aptitudeScore}%)</span>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
              <div className="bg-indigo-500 h-full" style={{ width: `${readiness.aptitudeScore}%` }} />
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400">SQL ({readiness.sqlScore}%)</span>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
              <div className="bg-cyan-500 h-full" style={{ width: `${readiness.sqlScore}%` }} />
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Python ({readiness.pythonScore}%)</span>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
              <div className="bg-emerald-500 h-full" style={{ width: `${readiness.pythonScore}%` }} />
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400">CS Fundamentals ({readiness.csFundamentalsScore}%)</span>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
              <div className="bg-amber-500 h-full" style={{ width: `${readiness.csFundamentalsScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content: Hiring Rounds & OA Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Hiring Rounds */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-violet-400" />
              <span>Hiring Process & Round Breakdown</span>
            </h2>

            <div className="space-y-4">
              {company.hiringProcess.map((round) => (
                <div
                  key={round.roundNumber}
                  className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-violet-400">
                      ROUND {round.roundNumber} • {round.name}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{round.durationMinutes} mins</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{round.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {round.focusAreas.map((area) => (
                      <span
                        key={area}
                        className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded"
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
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <span>Frequently Asked Behavioral Questions</span>
            </h2>
            <ul className="space-y-2 text-xs text-slate-300">
              {company.behavioralQuestions.map((q, idx) => (
                <li key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-start space-x-2">
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
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Online Assessment (OA) Pattern</span>
            </h2>

            <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Platform</span>
                <span className="font-semibold text-white">{company.oaPattern.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration</span>
                <span className="font-semibold text-white">{company.oaPattern.durationMinutes} Mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DSA Questions</span>
                <span className="font-semibold text-violet-400">{company.oaPattern.dsaQuestionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Aptitude Questions</span>
                <span className="font-semibold text-indigo-400">{company.oaPattern.aptitudeQuestionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Cutoff</span>
                <span className="font-semibold text-emerald-400">{company.oaPattern.cutoffEstimatePercent}%</span>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Preparation Checklist</span>
            </h2>

            <ul className="space-y-2 text-xs text-slate-300">
              {company.checklist.map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-violet-400 rounded-full" />
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
