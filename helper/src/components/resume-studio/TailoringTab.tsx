'use client';

import { useState, useMemo } from 'react';
import { RefreshCw, PlayCircle, Loader2, Sparkles, Building2, Briefcase } from 'lucide-react';
import { createTailoringSessionAction } from '@backend/features/resume/actions';
import { generateTailoredResumeAction } from '@backend/features/resume/generatorActions';
import { resumeJsonToText } from '@backend/features/resume/resumeSerializer';
import { LoadingOverlay, LoadingPhase } from '../core/LoadingOverlay';
import { JdSelector } from '../tailoring/JdSelector';
import { MatchVisualization } from '../tailoring/MatchVisualization';
import { RecommendationList, RecommendationStatus } from '../tailoring/RecommendationList';
import { SideBySideComparison } from '../tailoring/SideBySideComparison';
import { GeneratedResumePreview } from '../tailoring/GeneratedResumePreview';

interface TailoringTabProps {
  resume: any;
  onVersions: () => void;
}

export default function TailoringTab({ resume, onVersions }: TailoringTabProps) {
  const [sessionData, setSessionData] = useState<any>(null);
  const [activeJdId, setActiveJdId] = useState<string | null>(null);
  const [phase, setPhase] = useState<LoadingPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recommendationStatuses, setRecommendationStatuses] = useState<Record<number, RecommendationStatus>>({});
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<any>(null);

  const handleCreateSession = async (jdId: string, forceRecreate = false) => {
    try {
      setActiveJdId(jdId);
      setError(null);
      setPhase('analyzing_jd');
      setTimeout(() => setPhase('comparing'), 1000);
      setTimeout(() => setPhase('generating_recommendations'), 2500);

      const data = await createTailoringSessionAction(resume.id, jdId, forceRecreate);
      const session = data?.session || data;
      setSessionData(session);

      setTimeout(() => setPhase('saving'), 500);
      setTimeout(() => setPhase('done'), 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze JD and generate recommendations.');
      setPhase('done');
    }
  };

  const handleRecommendationStatus = (index: number, status: RecommendationStatus) => {
    setRecommendationStatuses(current => ({ ...current, [index]: status }));
  };

  const acceptedRecommendations = useMemo(() => {
    const recommendations = sessionData?.recommendations || [];
    const explicit = recommendations.filter((_: any, index: number) => {
      const status = recommendationStatuses[index];
      return status === 'accepted' || status === 'completed';
    });
    if (explicit.length > 0) return explicit;
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
      setPhase('done');
    } catch (err: any) {
      setError(err.message || 'Failed to generate tailored resume.');
      setPhase('done');
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const originalResumeText = useMemo(() => {
    const json = resume?.canonicalJson;
    if (json) return resumeJsonToText(json);
    return resume?.jdText || 'Original resume text not found.';
  }, [resume]);

  const generatedResumeText = useMemo(
    () => (generatedResume?.json ? resumeJsonToText(generatedResume.json) : ''),
    [generatedResume?.json]
  );

  const canGenerate = acceptedRecommendations.length > 0 && !isGeneratingResume;

  const matchDetails = sessionData?.matchDetails || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <LoadingOverlay phase={phase} />

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="text-rose-300 hover:text-white px-3 py-1 bg-rose-500/20 rounded-xl text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Step 1: Provide JD (if no session active) */}
      {!sessionData && (
        <JdSelector
          onAnalyzed={(jdId) => handleCreateSession(jdId, false)}
        />
      )}

      {/* Step 2: Tailoring Dashboard (if session active but no generated resume yet) */}
      {sessionData && !generatedResume && (
        <div className="space-y-8 animate-fade-in">
          {/* Active Tailoring Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Active Tailoring Target</span>
                <h3 className="text-sm font-bold text-white">
                  {sessionData.jobDescription?.analysis?.role || sessionData.jobTitle || 'Target Role'}{' '}
                  <span className="text-slate-400 font-normal">
                    · {sessionData.jobDescription?.analysis?.company || sessionData.company || 'Job Description'}
                  </span>
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => activeJdId && handleCreateSession(activeJdId, true)}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl transition-colors"
                title="Force re-run AI match engine"
              >
                <RefreshCw className="w-3.5 h-3.5 text-violet-400" /> Re-analyze Match
              </button>
              <button
                onClick={() => {
                  setSessionData(null);
                  setActiveJdId(null);
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3.5 py-2 rounded-xl transition-colors"
              >
                Change JD
              </button>
            </div>
          </div>

          <MatchVisualization 
            matchData={{
              overallMatch: sessionData.matchScore ?? matchDetails.overallMatch ?? 0,
              atsMatch: sessionData.atsScore ?? matchDetails.atsMatch ?? 0,
              keywordMatch: sessionData.keywordCoverage ?? matchDetails.keywordMatch ?? 0,
              technicalSkillsMatch: matchDetails.technicalSkillsMatch ?? 0,
              projectsMatch: matchDetails.projectsMatch ?? 0,
              experienceMatch: matchDetails.experienceMatch ?? 0,
              educationMatch: matchDetails.educationMatch ?? 0,
              responsibilitiesMatch: matchDetails.responsibilitiesMatch ?? 0,
              softSkillsMatch: matchDetails.softSkillsMatch ?? 0,
              missingSkills: sessionData.missingSkills || matchDetails.missingSkills || [],
              matchingSkills: sessionData.matchingSkills || matchDetails.matchingSkills || [],
            }}
          />

          <RecommendationList 
            recommendations={sessionData.recommendations || matchDetails.recommendations || []}
            statuses={recommendationStatuses}
            onStatusChange={handleRecommendationStatus}
          />

          <div className="flex justify-end p-6 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 shadow-2xl">
            <button
              disabled={!canGenerate}
              onClick={handleGenerateResume}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-emerald-950/40 transition-all text-base w-full md:w-auto justify-center"
            >
              {isGeneratingResume ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
              Generate Tailored Resume JSON ({acceptedRecommendations.length} applied)
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Generated Preview */}
      {generatedResume && sessionData && (
        <div className="space-y-8 animate-fade-in">
          <GeneratedResumePreview 
            resumeJson={generatedResume.json}
            version={generatedResume.version}
            resumeId={generatedResume.id}
            generationMetadata={generatedResume.metadata}
          />

          <div className="flex justify-end gap-3">
            <button 
              onClick={onVersions}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all"
            >
              View in Versions Tab
            </button>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <h3 className="text-lg font-bold text-white mb-4">Text Comparison (Debugging)</h3>
            <SideBySideComparison 
              originalText={originalResumeText} 
              generatedText={generatedResumeText} 
              jdText={sessionData.jobDescription?.originalText || sessionData.jdText || ""}
              matchingSkills={sessionData.matchingSkills || matchDetails.matchingSkills || []}
              missingSkills={sessionData.missingSkills || matchDetails.missingSkills || []}
            />
          </div>
        </div>
      )}
    </div>
  );
}
