'use client';

import { useState, useMemo } from 'react';
import { RefreshCw, PlayCircle, Loader2 } from 'lucide-react';
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
  const [phase, setPhase] = useState<LoadingPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recommendationStatuses, setRecommendationStatuses] = useState<Record<number, RecommendationStatus>>({});
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<any>(null);
  

  const handleCreateSession = async (jdId: string) => {
    try {
      setError(null);
      setPhase('analyzing_jd');
      setTimeout(() => setPhase('comparing'), 1000);
      setTimeout(() => setPhase('generating_recommendations'), 2500);

      const data = await createTailoringSessionAction(resume.id, jdId);
      setSessionData(data);
      
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

  return (
    <div className="space-y-6 animate-fade-in">
      <LoadingOverlay phase={phase} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center justify-between">
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 px-2 py-1 bg-red-500/20 rounded-lg text-xs">Dismiss</button>
        </div>
      )}

      {/* Step 1: Provide JD (if no session active) */}
      {!sessionData && (
        <JdSelector
          onAnalyzed={handleCreateSession}
        />
      )}

      {/* Step 2: Tailoring Dashboard (if session active but no generated resume yet) */}
      {sessionData && !generatedResume && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Active Tailoring Session</span>
              <span className="text-sm text-slate-200">Targeting: {sessionData.jobTitle || 'Custom Job'} at {sessionData.company || 'Unknown Company'}</span>
            </div>
            <button onClick={() => setSessionData(null)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg">
              <RefreshCw className="w-3.5 h-3.5" /> Start Over
            </button>
          </div>

          <MatchVisualization 
            matchData={{
              overallMatch: sessionData.matchScore || 0,
              matchReasoning: sessionData.matchReasoning,
              missingSkills: sessionData.missingKeywords || sessionData.missingSkills || [],
              matchingSkills: sessionData.matchingKeywords || sessionData.matchingSkills || [],
            }}
          />

          <RecommendationList 
            recommendations={sessionData.recommendations}
            statuses={recommendationStatuses}
            onStatusChange={handleRecommendationStatus}
          />

          <div className="flex justify-end p-6 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800">
            <button
              disabled={!canGenerate}
              onClick={handleGenerateResume}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-3 shadow-lg transition-all text-lg w-full md:w-auto justify-center"
            >
              {isGeneratingResume ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
              Generate Tailored Resume JSON
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
              matchingSkills={sessionData.matchingKeywords || sessionData.matchingSkills || []}
              missingSkills={sessionData.missingKeywords || sessionData.missingSkills || []}
            />
          </div>
        </div>
      )}
    </div>
  );
}
