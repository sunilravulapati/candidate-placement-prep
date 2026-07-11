'use client';

// components/mock-interview/FeedbackDashboard.tsx
// Post-interview feedback view with overall score, dimension charts,
// question breakdown, strengths/weaknesses, and AI recruiter summary.

import { useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, ChevronDown, Star, BookOpen, Target, FileText, Brain, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { RadarChart, DimensionBars } from './ScoreChart';

interface FeedbackDashboardProps {
  overallScore: number;
  dimensions: {
    technicalAccuracy: number;
    communication: number;
    problemSolving: number;
    confidence: number;
    depth: number;
    structure: number;
    examples: number;
    completeness: number;
  };
  improvementTrend?: { label: string; delta: number; earlyAvg: number; lateAvg: number };
  feedback?: {
    strengths: string[];
    weaknesses: string[];
    missedConcepts: string[];
    suggestedImprovements: string[];
    topicsToRevise: string[];
    recommendedDSAProblems: string[];
    resumeChanges: string[];
    overallSummary: string;
  };
  questions?: Array<{
    questionText: string;
    category: string;
    isFollowUp: boolean;
    answer?: string | null;
    evaluation?: {
      overallScore: number;
      aiFeedback: string;
    } | null;
  }>;
  sessionInfo?: {
    type: string;
    difficulty: string;
    targetRole?: string;
    targetCompany?: string;
    durationMinutes: number;
    questionsAnswered: number;
  };
}

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#8b5cf6' : score >= 40 ? '#f59e0b' : '#f43f5e';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';

  return (
    <div className="relative w-36 h-36">
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx="64" cy="64" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{score}</span>
        <span className="text-xs text-slate-500 font-semibold">{label}</span>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
        <Icon className="w-4 h-4 text-violet-400" />
        {title}
      </div>
      {children}
    </div>
  );
}

export default function FeedbackDashboard({
  overallScore,
  dimensions,
  improvementTrend,
  feedback,
  questions = [],
  sessionInfo,
}: FeedbackDashboardProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const TrendIcon =
    improvementTrend?.label === 'improving' ? TrendingUp :
    improvementTrend?.label === 'declining' ? TrendingDown : Minus;
  const trendColor =
    improvementTrend?.label === 'improving' ? 'text-emerald-400' :
    improvementTrend?.label === 'declining' ? 'text-rose-400' : 'text-slate-400';

  return (
    <div className="space-y-6">
      {/* Top Section: Score + Radar + Meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Overall Score */}
        <div className="bg-gradient-to-br from-violet-950/60 via-slate-900/80 to-indigo-950/40 border border-violet-500/20 rounded-2xl p-6 flex flex-col items-center gap-4">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest">Overall Score</div>
          <ScoreRing score={overallScore} />
          {improvementTrend && (
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              Performance {improvementTrend.label}
              {Math.abs(improvementTrend.delta) > 0 && (
                <span className="opacity-60">({improvementTrend.delta > 0 ? '+' : ''}{improvementTrend.delta} pts)</span>
              )}
            </div>
          )}
          {sessionInfo && (
            <div className="text-xs text-slate-600 text-center space-y-0.5">
              <div>{sessionInfo.type.replace('_', ' ')} · {sessionInfo.difficulty}</div>
              {sessionInfo.targetRole && <div className="text-slate-500">{sessionInfo.targetRole}</div>}
              {sessionInfo.targetCompany && <div className="text-slate-500">{sessionInfo.targetCompany}</div>}
              <div>{sessionInfo.questionsAnswered} questions answered</div>
            </div>
          )}
        </div>

        {/* Radar Chart */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 flex flex-col items-center justify-center gap-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Performance Profile</div>
          <RadarChart scores={dimensions} size={220} />
        </div>

        {/* Dimension Bars */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dimension Scores</div>
          <DimensionBars scores={dimensions} />
        </div>
      </div>

      {/* AI Recruiter Summary */}
      {feedback?.overallSummary && (
        <div className="bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-slate-900/40 border border-violet-500/15 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 bg-violet-600/20 border border-violet-500/30 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">AI Recruiter Summary</div>
              <p className="text-sm text-slate-300 leading-relaxed">{feedback.overallSummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      {feedback && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Section title="Strengths" icon={Star}>
            <ul className="space-y-2">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Areas to Improve" icon={AlertCircle}>
            <ul className="space-y-2">
              {feedback.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <ArrowRight className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  {w}
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      {/* Recommendations grid */}
      {feedback && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {feedback.topicsToRevise.length > 0 && (
            <Section title="Topics to Revise" icon={BookOpen}>
              <ul className="space-y-1.5">
                {feedback.topicsToRevise.map((t, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {feedback.recommendedDSAProblems.length > 0 && (
            <Section title="Recommended Problems" icon={Target}>
              <ul className="space-y-1.5">
                {feedback.recommendedDSAProblems.map((p, i) => (
                  <li key={i} className="text-xs text-violet-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {feedback.resumeChanges.length > 0 && (
            <Section title="Resume Suggestions" icon={FileText}>
              <ul className="space-y-1.5">
                {feedback.resumeChanges.map((r, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}

      {/* Question Breakdown */}
      {questions.length > 0 && (
        <Section title="Question Breakdown" icon={Trophy}>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className="border border-slate-800/40 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedQuestion(expandedQuestion === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      q.evaluation
                        ? q.evaluation.overallScore >= 70
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : q.evaluation.overallScore >= 50
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-rose-500/15 text-rose-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {q.evaluation?.overallScore ?? '–'}
                    </div>
                    <div className="min-w-0">
                      {q.isFollowUp && <span className="text-[9px] text-amber-400 font-bold">F/UP · </span>}
                      <span className="text-sm text-slate-300 font-medium">{q.questionText.slice(0, 80)}{q.questionText.length > 80 ? '…' : ''}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform shrink-0 ml-2 ${expandedQuestion === i ? 'rotate-180' : ''}`} />
                </button>
                {expandedQuestion === i && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-800/40">
                    {q.answer && (
                      <div className="mt-3">
                        <div className="text-xs font-semibold text-slate-500 mb-1.5">Your Answer</div>
                        <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 px-3 py-2 rounded-lg">
                          {q.answer}
                        </p>
                      </div>
                    )}
                    {(() => {
                      if (!q.evaluation?.aiFeedback) return null;
                      try {
                        const fb = JSON.parse(q.evaluation.aiFeedback);
                        return (
                          <div className="space-y-4 pt-2">
                            {fb.finalRating && (
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="text-[10px] font-bold text-violet-400/70 uppercase tracking-wider">Final Rating</div>
                                  {fb.codeQuality !== undefined && (
                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                      Code Quality: {fb.codeQuality}/100
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-200 leading-relaxed">{fb.finalRating}</p>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {fb.strengths && fb.strengths.length > 0 && (
                                <div>
                                  <div className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-1">Strengths</div>
                                  <ul className="list-disc pl-4 text-sm text-emerald-300/90 leading-relaxed space-y-1">
                                    {fb.strengths.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                                  </ul>
                                </div>
                              )}
                              
                              {fb.weaknesses && fb.weaknesses.length > 0 && (
                                <div>
                                  <div className="text-[10px] font-bold text-rose-400/70 uppercase tracking-wider mb-1">Weaknesses</div>
                                  <ul className="list-disc pl-4 text-sm text-rose-300/90 leading-relaxed space-y-1">
                                    {fb.weaknesses.map((w: string, idx: number) => <li key={idx}>{w}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {fb.missingConcepts && fb.missingConcepts.length > 0 && (
                              <div>
                                <div className="text-[10px] font-bold text-amber-400/70 uppercase tracking-wider mb-1">Missing Concepts</div>
                                <ul className="list-disc pl-4 text-sm text-amber-300/90 leading-relaxed space-y-1">
                                  {fb.missingConcepts.map((m: string, idx: number) => <li key={idx}>{m}</li>)}
                                </ul>
                              </div>
                            )}

                            {fb.suggestedResponse && (
                              <div>
                                <div className="text-[10px] font-bold text-sky-400/70 uppercase tracking-wider mb-1">Suggested Better Response</div>
                                <p className="text-sm text-sky-300/90 leading-relaxed bg-sky-950/30 p-3 rounded-xl border border-sky-800/30">
                                  {fb.suggestedResponse}
                                </p>
                              </div>
                            )}

                            {fb.idealAnswer && (
                              <div>
                                <div className="text-[10px] font-bold text-violet-400/70 uppercase tracking-wider mb-1">Ideal Interviewer Answer</div>
                                <p className="text-sm text-violet-300/90 leading-relaxed bg-violet-950/30 p-3 rounded-xl border border-violet-800/30">
                                  {fb.idealAnswer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      } catch {
                        return (
                          <div>
                            <div className="text-[10px] font-bold text-violet-400/70 uppercase tracking-wider mb-1">Recruiter Feedback</div>
                            <p className="text-sm text-violet-300/80 leading-relaxed bg-violet-900/10 border border-violet-800/20 px-3 py-2 rounded-lg">
                              {q.evaluation.aiFeedback}
                            </p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
