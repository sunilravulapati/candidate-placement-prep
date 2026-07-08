'use client';

import React, { useMemo, useState } from 'react';
import { RefreshCw, LayoutDashboard, Wand2, Loader2 } from 'lucide-react';
import { ResumeSelector } from '../../../components/tailoring/ResumeSelector';
import { JdSelector } from '../../../components/tailoring/JdSelector';
import { MatchVisualization } from '../../../components/tailoring/MatchVisualization';
import { RecommendationList } from '../../../components/tailoring/RecommendationList';
import { SideBySideComparison } from '../../../components/tailoring/SideBySideComparison';
import { TailoringHistory } from '../../../components/tailoring/TailoringHistory';
import { LoadingOverlay, LoadingPhase } from '../../../components/tailoring/LoadingOverlay';
import { GeneratedResumePreview } from '../../../components/tailoring/GeneratedResumePreview';
import { createTailoringSessionAction, getTailoringSessionByIdAction } from '@backend/features/resume/actions';
import { generateTailoredResumeAction, getResumeJsonAction } from '@backend/features/resume/generatorActions';
import { SectionHeader, Button, ErrorCard } from '@/components/ui';

type RecommendationStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

function resumeJsonToText(resumeJson: any) {
  if (!resumeJson) return '';

  const lines: string[] = [];
  const push = (value?: string) => {
    if (value && String(value).trim()) lines.push(String(value).trim());
  };

  push(resumeJson.personalInfo?.fullName);
  push(resumeJson.summary);

  if (resumeJson.skills) {
    Object.entries(resumeJson.skills).forEach(([group, values]) => {
      if (Array.isArray(values) && values.length > 0) lines.push(`${group}: ${values.join(', ')}`);
    });
  }

  resumeJson.experience?.forEach((item: any) => {
    push(`${item.title || ''} ${item.company ? `at ${item.company}` : ''}`);
    item.bullets?.forEach(push);
  });

  resumeJson.projects?.forEach((project: any) => {
    push(project.name);
    push(project.description);
    if (project.technologies?.length) lines.push(project.technologies.join(', '));
    project.bullets?.forEach(push);
  });

  resumeJson.education?.forEach((item: any) => push(`${item.institution || ''} ${item.degree || ''} ${item.fieldOfStudy || ''}`));
  resumeJson.certifications?.forEach((item: any) => push(`${item.name || ''} ${item.issuer || ''}`));

  return lines.join('\n');
}

export default function ResumeTailoringDashboard() {
  const [activeResume, setActiveResume] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [recommendationStatuses, setRecommendationStatuses] = useState<Record<number, RecommendationStatus>>({});
  const [generatedResume, setGeneratedResume] = useState<{ id: string; json: any; version?: number } | null>(null);
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
      
      // Simulate progressive loading while the monolithic backend action runs
      const phases: LoadingPhase[] = [
        'extracting_resume', 'extracting_jd', 'analyzing_resume', 'analyzing_jd', 
        'comparing', 'generating_recommendations', 'saving'
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
      setPhase('extracting_resume'); // Just to show loader
      const session = await getTailoringSessionByIdAction(sessionId);
      setActiveResume(session.resume);
      setSessionData(session);
      if (session.generatedResumeId) {
        const generated = await getResumeJsonAction(session.generatedResumeId);
        setGeneratedResume({
          id: session.generatedResumeId,
          json: generated.json,
          version: generated.version,
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
    setRecommendationStatuses((current) => ({ ...current, [index]: status }));
  };

  const acceptedRecommendations = useMemo(() => {
    const recommendations = sessionData?.recommendations || [];
    const accepted = recommendations.filter((_: any, index: number) => {
      const status = recommendationStatuses[index];
      return status === 'accepted' || status === 'completed';
    });

    return accepted.length > 0
      ? accepted
      : recommendations.filter((_: any, index: number) => recommendationStatuses[index] !== 'rejected');
  }, [recommendationStatuses, sessionData?.recommendations]);

  const handleGenerateResume = async () => {
    if (!sessionData?.id || !sessionData?.resumeId) return;

    try {
      setError(null);
      setIsGeneratingResume(true);
      setPhase('generating_resume');
      const result = await generateTailoredResumeAction(sessionData.resumeId, sessionData.id, acceptedRecommendations);
      setGeneratedResume({ id: result.newResumeId, json: result.json, version: result.version });
      setSessionData((current: any) => current ? {
        ...current,
        generatedResumeId: result.newResumeId,
        resume: { ...current.resume, canonicalJson: result.originalJson },
      } : current);
      setPhase('done');
    } catch (err: any) {
      setError(err.message || 'Failed to generate tailored resume.');
      setPhase('done');
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const originalResumeText = useMemo(() => {
    const jsonText = resumeJsonToText(sessionData?.resume?.canonicalJson);
    return jsonText || sessionData?.resume?.jdText || 'Original resume text is not available yet. Generate once to parse the source resume JSON.';
  }, [sessionData?.resume?.canonicalJson, sessionData?.resume?.jdText]);

  const generatedResumeText = useMemo(() => resumeJsonToText(generatedResume?.json), [generatedResume?.json]);

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
                  <p className="text-sm font-semibold text-slate-200">Generate tailored resume JSON</p>
                  <p className="mt-1 text-xs text-slate-500">Uses accepted recommendations; if none are accepted, every non-rejected recommendation is applied.</p>
                </div>
                <Button
                  onClick={handleGenerateResume}
                  disabled={isGeneratingResume || acceptedRecommendations.length === 0}
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
