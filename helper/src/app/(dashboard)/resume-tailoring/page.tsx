'use client';

import React, { useMemo, useState } from 'react';
import { RefreshCw, LayoutDashboard, Wand2, Loader2 } from 'lucide-react';
import { ResumeSelector } from '../../../components/tailoring/ResumeSelector';
import { JdSelector } from '../../../components/tailoring/JdSelector';
import { MatchVisualization } from '../../../components/tailoring/MatchVisualization';
import { RecommendationList } from '../../../components/tailoring/RecommendationList';
import { SideBySideComparison } from '../../../components/tailoring/SideBySideComparison';
import { TailoringHistory } from '../../../components/tailoring/TailoringHistory';
import { LoadingOverlay, LoadingPhase } from '../../../components/core/LoadingOverlay';
import { GeneratedResumePreview } from '../../../components/tailoring/GeneratedResumePreview';
import { createTailoringSessionAction, getTailoringSessionByIdAction } from '@backend/features/resume/actions';
import { generateTailoredResumeAction, getResumeJsonAction } from '@backend/features/resume/generatorActions';
import { SectionHeader, Button, ErrorCard } from '@/components/ui';

// Client-safe serializer: converts CanonicalResume JSON to plain text for side-by-side comparison.
// (Mirrors the backend canonicalJsonToText — kept inline to avoid server-only transitive imports)
function resumeJsonToText(resume: any): string {
  if (!resume || typeof resume !== 'object') return '';
  const lines: string[] = [];
  const push = (v?: string | null) => { if (v?.trim()) lines.push(v.trim()); };
  const section = (t: string) => { lines.push(''); lines.push(`=== ${t.toUpperCase()} ===`); };

  const p = resume.personalInfo || {};
  push(p.fullName);
  if (p.email || p.phone || p.location) push([p.email, p.phone, p.location].filter(Boolean).join(' | '));
  if (resume.summary) { section('Summary'); push(resume.summary); }
  const skills = resume.skills;
  if (skills && typeof skills === 'object') {
    section('Skills');
    for (const [key, val] of Object.entries(skills)) {
      if (Array.isArray(val) && val.length) push(`${key}: ${val.join(', ')}`);
    }
  }
  const exp = Array.isArray(resume.experience) ? resume.experience : [];
  if (exp.length) {
    section('Experience');
    for (const e of exp) {
      push(`${e.title || ''} at ${e.company || ''}`);
      (e.bullets || []).forEach((b: string) => push(`• ${b}`));
    }
  }
  const proj = Array.isArray(resume.projects) ? resume.projects : [];
  if (proj.length) {
    section('Projects');
    for (const p of proj) {
      push(p.name);
      if (p.description) push(p.description);
      if (p.technologies?.length) push(`Tech: ${p.technologies.join(', ')}`);
      (p.bullets || []).forEach((b: string) => push(`• ${b}`));
    }
  }
  const edu = Array.isArray(resume.education) ? resume.education : [];
  if (edu.length) {
    section('Education');
    for (const e of edu) push(`${e.institution || ''} — ${e.degree || ''} ${e.fieldOfStudy || ''}`);
  }
  const certs = Array.isArray(resume.certifications) ? resume.certifications : [];
  if (certs.length) {
    section('Certifications');
    certs.forEach((c: any) => push(typeof c === 'string' ? c : `${c.name || ''} — ${c.issuer || ''}`));
  }
  return lines.join('\n').trim();
}

type RecommendationStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export default function ResumeTailoringDashboard() {
  const [activeResume, setActiveResume] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [recommendationStatuses, setRecommendationStatuses] = useState<Record<number, RecommendationStatus>>({});
  const [generatedResume, setGeneratedResume] = useState<{
    id: string;
    json: any;
    version?: number;
    metadata?: any;
  } | null>(null);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);

  const [phase, setPhase] = useState<LoadingPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'selector' | 'dashboard' | 'history'>('selector');

  const handleResumeSelect = (resume: any) => {
    setActiveResume(resume);
    setGeneratedResume(null);
    setRecommendationStatuses({});
  };

  const handleJdAnalyzed = async (jdId: string) => {
    if (activeResume) {
      await runOrchestration(activeResume.id, jdId);
    }
  };

  const runOrchestration = async (resumeId: string, jdId: string) => {
    try {
      setError(null);
      setPhase('extracting_resume');

      const phases: LoadingPhase[] = [
        'extracting_resume', 'extracting_jd', 'analyzing_resume', 'analyzing_jd',
        'comparing', 'generating_recommendations', 'saving',
      ];
      let pIdx = 0;
      const interval = setInterval(() => {
        if (pIdx < phases.length - 2) {
          pIdx++;
          setPhase(phases[pIdx]);
        }
      }, 3000);

      const res = await createTailoringSessionAction(resumeId, jdId);
      clearInterval(interval);
      setPhase('saving');

      if (!res.success || !res.session) throw new Error('Tailoring session failed');

      setSessionData(res.session);
      setGeneratedResume(null);
      setRecommendationStatuses({});
      setPhase('done');
      setView('dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during tailoring.');
      setPhase('idle');
    }
  };

  const handleLoadSession = async (sessionId: string) => {
    try {
      setPhase('extracting_resume');
      const session = await getTailoringSessionByIdAction(sessionId);
      setActiveResume(session.resume);
      setSessionData(session);
      if (session.generatedResumeId) {
        const generated = await getResumeJsonAction(session.generatedResumeId);
        setGeneratedResume({
          id: session.generatedResumeId,
          json: generated.json,
          version: generated.version,
          metadata: generated.metadata,
        });
      } else {
        setGeneratedResume(null);
      }
      setRecommendationStatuses({});
      setPhase('done');
      setView('dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to load session');
      setPhase('idle');
    }
  };

  const handleRecommendationStatus = (index: number, status: RecommendationStatus) => {
    setRecommendationStatuses(current => ({ ...current, [index]: status }));
  };

  const acceptedRecommendations = useMemo(() => {
    const recommendations = sessionData?.recommendations || [];
    // Use explicitly accepted/completed ones; fall back to all non-rejected if none accepted
    const explicit = recommendations.filter((_: any, index: number) => {
      const status = recommendationStatuses[index];
      return status === 'accepted' || status === 'completed';
    });
    if (explicit.length > 0) return explicit;
    // Fallback: all non-rejected
    return recommendations.filter((_: any, index: number) => recommendationStatuses[index] !== 'rejected');
  }, [recommendationStatuses, sessionData?.recommendations]);

  const handleGenerateResume = async () => {
    if (!sessionData?.id || !sessionData?.resumeId) return;
    try {
      setError(null);
      setIsGeneratingResume(true);
      setPhase('generating_resume');
      const result = await generateTailoredResumeAction(
        sessionData.resumeId,
        sessionData.id,
        acceptedRecommendations
      );
      setGeneratedResume({
        id: result.newResumeId,
        json: result.json,
        version: result.version,
        metadata: (result as any).metadata,
      });
      setSessionData((current: any) =>
        current
          ? {
              ...current,
              generatedResumeId: result.newResumeId,
              resume: { ...current.resume, canonicalJson: result.originalJson },
            }
          : current
      );
      setPhase('done');
    } catch (err: any) {
      setError(err.message || 'Failed to generate tailored resume.');
      setPhase('done');
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const originalResumeText = useMemo(() => {
    const json = sessionData?.resume?.canonicalJson;
    if (json) return resumeJsonToText(json);
    return sessionData?.resume?.jdText || 'Original resume text will appear here once parsed.';
  }, [sessionData?.resume?.canonicalJson, sessionData?.resume?.jdText]);

  const generatedResumeText = useMemo(
    () => (generatedResume?.json ? resumeJsonToText(generatedResume.json) : ''),
    [generatedResume?.json]
  );

  // Button is disabled only if there are genuinely no recommendations to apply
  const canGenerate = acceptedRecommendations.length > 0 && !isGeneratingResume;

  return (
    <div className="page-container relative min-h-[60vh] animate-fade-in">
      <LoadingOverlay phase={phase} />

      <SectionHeader
        badge="AI Resume Intelligence"
        badgeVariant="info"
        title="Tailoring Dashboard"
        description="Compare your resume against job descriptions, identify critical gaps, and generate highly targeted recommendations to beat the ATS."
        actions={
          <>
            <Button
              variant={view === 'history' ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setView('history')}
            >
              <RefreshCw className="h-4 w-4" />
              History
            </Button>
            <Button
              variant={view === 'selector' ? 'primary' : 'secondary'}
              size="md"
              onClick={() => {
                setView('selector');
                setActiveResume(null);
                setSessionData(null);
                setGeneratedResume(null);
                setRecommendationStatuses({});
              }}
            >
              <LayoutDashboard className="h-4 w-4" />
              New Session
            </Button>
          </>
        }
      />

      {error && <ErrorCard type="ai-timeout" message={error} onRetry={() => setError(null)} />}

      {/* View Router */}
      {view === 'history' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-200">Session History</h2>
          <TailoringHistory resumeId={activeResume?.id} onSelectSession={handleLoadSession} />
        </div>
      )}

      {view === 'selector' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">1</div>
              <h2 className="text-xl font-bold text-slate-200">Select Resume</h2>
            </div>
            <ResumeSelector onSelect={handleResumeSelect} selectedId={activeResume?.id || null} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${activeResume ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>2</div>
              <h2 className={`text-xl font-bold ${activeResume ? 'text-slate-200' : 'text-slate-500'}`}>Provide Job Description</h2>
            </div>
            {activeResume ? (
              <JdSelector onAnalyzed={handleJdAnalyzed} />
            ) : (
              <div className="p-8 border border-slate-800 border-dashed rounded-xl flex items-center justify-center bg-slate-900/30">
                <p className="text-slate-500 text-sm">Please select a resume first.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'dashboard' && sessionData && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <MatchVisualization matchData={sessionData.matchDetails} />
            </div>

            <div className="lg:col-span-2">
              <RecommendationList
                recommendations={sessionData.recommendations}
                statuses={recommendationStatuses}
                onStatusChange={handleRecommendationStatus}
              />
              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-200">Generate tailored resume</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {acceptedRecommendations.length > 0
                      ? `${acceptedRecommendations.length} recommendations will be applied.`
                      : 'Accept recommendations above to generate a targeted resume version.'}
                  </p>
                </div>
                <Button
                  onClick={handleGenerateResume}
                  disabled={!canGenerate}
                  variant="success"
                >
                  {isGeneratingResume ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  {isGeneratingResume ? 'Generating...' : 'Generate Resume'}
                </Button>
              </div>
            </div>
          </div>

          <GeneratedResumePreview
            resumeJson={generatedResume?.json}
            version={generatedResume?.version}
            resumeId={generatedResume?.id || sessionData.generatedResumeId}
            generationMetadata={generatedResume?.metadata}
          />

          <SideBySideComparison
            originalText={originalResumeText}
            generatedText={generatedResumeText}
            jdText={sessionData.jobDescription?.originalText || 'Job description content...'}
            matchingSkills={sessionData.matchingSkills || []}
            missingSkills={sessionData.missingSkills || []}
          />
        </div>
      )}
    </div>
  );
}
