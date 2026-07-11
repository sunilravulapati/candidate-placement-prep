'use client';

// components/mock-interview/StartInterviewForm.tsx
// Configuration form for starting a new interview session.

import { useState, useEffect } from 'react';
import {
  Cpu, User2, Building2, Briefcase, Clock, BarChart3,
  BookOpen, Globe, FileText, ChevronDown, Play, Loader2, X
} from 'lucide-react';
import { startInterviewAction, listPersonasAction } from '@backend/features/mockInterview/actions';
import { listResumesAction } from '@backend/features/resume/actions';

type Persona = Awaited<ReturnType<typeof listPersonasAction>>[number];
type Resume = Awaited<ReturnType<typeof listResumesAction>>[number];

const INTERVIEW_TYPES = [
  { id: 'TECHNICAL', label: 'Technical', emoji: '⚡' },
  { id: 'BEHAVIORAL', label: 'Behavioral', emoji: '🧠' },
  { id: 'HR', label: 'HR', emoji: '🤝' },
  { id: 'SYSTEM_DESIGN', label: 'System Design', emoji: '🏗️' },
  { id: 'CUSTOM', label: 'Custom', emoji: '✨' },
];

const EXPERIENCE_LEVELS = [
  { id: 'JUNIOR', label: 'Junior (0–2 yrs)' },
  { id: 'MID', label: 'Mid-Level (2–5 yrs)' },
  { id: 'SENIOR', label: 'Senior (5–8 yrs)' },
  { id: 'STAFF', label: 'Staff+ (8+ yrs)' },
];

const DIFFICULTIES = [
  { id: 'EASY', label: 'Easy', color: 'text-emerald-400' },
  { id: 'MEDIUM', label: 'Medium', color: 'text-amber-400' },
  { id: 'HARD', label: 'Hard', color: 'text-rose-400' },
];

const DURATIONS = [15, 20, 30, 45, 60, 90];

const COMMON_TOPICS: Record<string, string[]> = {
  TECHNICAL: ['Arrays', 'Linked Lists', 'Trees', 'Dynamic Programming', 'System Design Basics', 'SQL', 'OOP', 'Recursion', 'Graphs', 'Sorting'],
  BEHAVIORAL: ['Leadership', 'Conflict Resolution', 'Teamwork', 'Time Management', 'Failure Recovery', 'Communication', 'Decision Making', 'Ownership'],
  HR: ['Salary Negotiation', 'Career Goals', 'Strengths & Weaknesses', 'Company Culture', 'Work-Life Balance', 'Remote Work', 'Role Expectations'],
  SYSTEM_DESIGN: ['Scalability', 'Databases', 'Caching', 'Load Balancing', 'Microservices', 'Message Queues', 'CDN', 'CAP Theorem'],
  CUSTOM: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'REST APIs', 'Authentication'],
};

interface StartInterviewFormProps {
  prefillTemplateId?: string;
  onInterviewStarted: (result: any) => void;
}

export default function StartInterviewForm({
  prefillTemplateId,
  onInterviewStarted,
}: StartInterviewFormProps) {
  const [type, setType] = useState('TECHNICAL');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [experience, setExperience] = useState('MID');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [duration, setDuration] = useState(30);
  const [topics, setTopics] = useState<string[]>(['Arrays', 'Trees']);
  const [topicInput, setTopicInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [personaId, setPersonaId] = useState<string>('');
  const [resumeId, setResumeId] = useState<string>('');

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([listPersonasAction(), listResumesAction()])
      .then(([p, r]) => { setPersonas(p); setResumes(r); })
      .catch(console.error);
  }, []);

  const suggestedTopics = COMMON_TOPICS[type] || COMMON_TOPICS.CUSTOM;

  const addTopic = (t: string) => {
    const trimmed = t.trim();
    if (trimmed && !topics.includes(trimmed) && topics.length < 15) {
      setTopics(prev => [...prev, trimmed]);
    }
    setTopicInput('');
  };

  const removeTopic = (t: string) => setTopics(prev => prev.filter(x => x !== t));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topics.length === 0) { setError('Add at least one topic.'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await startInterviewAction({
        type,
        difficulty,
        experienceLevel: experience,
        targetCompany: company || undefined,
        targetRole: role || undefined,
        durationMinutes: duration,
        topics,
        language,
        personaId: personaId || undefined,
        templateId: prefillTemplateId || undefined,
        resumeId: resumeId || undefined,
      });
      onInterviewStarted(result);
    } catch (err) {
      setError((err as Error).message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-slate-100">Configure Your Interview</h2>
        <p className="text-sm text-slate-500">Set up the interview parameters to generate a personalized session.</p>
      </div>

      {/* Interview Type */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interview Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {INTERVIEW_TYPES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setType(t.id); setTopics(COMMON_TOPICS[t.id]?.slice(0, 2) || []); }}
              className={`flex flex-col items-center gap-2 py-3.5 px-3 rounded-2xl text-sm font-semibold border transition-all duration-200 ${
                type === t.id
                  ? 'bg-violet-600/20 border-violet-500/50 text-violet-300 shadow-lg shadow-violet-900/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className="text-xs">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Company */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Target Company
          </label>
          <input
            id="target-company"
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="e.g. Google, Amazon…"
            className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
        </div>

        {/* Role */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Target Role
          </label>
          <input
            id="target-role"
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="e.g. Software Engineer, SDE II…"
            className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> Experience Level
          </label>
          <div className="relative">
            <select
              id="experience-level"
              value={experience}
              onChange={e => setExperience(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 bg-slate-900/60 border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all pr-10"
            >
              {EXPERIENCE_LEVELS.map(l => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Duration
          </label>
          <div className="flex gap-2 flex-wrap">
            {DURATIONS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  duration === d
                    ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty</label>
          <div className="flex gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  difficulty === d.id
                    ? 'bg-slate-800 border-slate-600 ' + d.color
                    : 'bg-slate-900/60 border-slate-800 text-slate-600 hover:border-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> Language
          </label>
          <div className="relative">
            <select
              id="interview-language"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 bg-slate-900/60 border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 transition-all pr-10"
            >
              {['English', 'Hindi', 'French', 'Spanish', 'German'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Persona */}
      {personas.length > 0 && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User2 className="w-3.5 h-3.5" /> Interviewer Persona (Optional)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPersonaId('')}
              className={`py-3 px-4 rounded-xl text-xs font-semibold border text-left transition-all ${
                !personaId
                  ? 'bg-violet-600/10 border-violet-500/30 text-violet-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-slate-300">Standard</div>
              <div className="text-slate-600 text-[10px] mt-0.5">Default interviewer</div>
            </button>
            {personas.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersonaId(p.id)}
                className={`py-3 px-4 rounded-xl text-xs font-semibold border text-left transition-all ${
                  personaId === p.id
                    ? 'bg-violet-600/10 border-violet-500/30 text-violet-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-slate-300 truncate">{p.name}</div>
                <div className="text-slate-600 text-[10px] mt-0.5 truncate">{p.company || p.communicationTone}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resume */}
      {resumes.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Resume Context (Optional)
          </label>
          <div className="relative">
            <select
              id="resume-select"
              value={resumeId}
              onChange={e => setResumeId(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 bg-slate-900/60 border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 transition-all pr-10"
            >
              <option value="">No resume (generic interview)</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.name} (v{r.version})</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
          {resumeId && (
            <p className="text-xs text-violet-400/70">
              ✦ Questions will be tailored to your resume background
            </p>
          )}
        </div>
      )}

      {/* Topics */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> Topics ({topics.length}/15)
        </label>

        {/* Selected topics */}
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {topics.map(t => (
            <span key={t} className="flex items-center gap-1.5 text-xs font-medium text-violet-300 bg-violet-600/10 border border-violet-500/20 px-3 py-1 rounded-full">
              {t}
              <button type="button" onClick={() => removeTopic(t)}>
                <X className="w-3 h-3 hover:text-rose-400 transition-colors" />
              </button>
            </span>
          ))}
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-1.5">
          {suggestedTopics.filter(s => !topics.includes(s)).slice(0, 8).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => addTopic(s)}
              className="text-xs text-slate-500 hover:text-slate-200 bg-slate-900/60 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-full transition-all"
            >
              + {s}
            </button>
          ))}
        </div>

        {/* Custom topic input */}
        <div className="flex gap-2">
          <input
            id="topic-input"
            type="text"
            value={topicInput}
            onChange={e => setTopicInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTopic(topicInput); } }}
            placeholder="Add custom topic…"
            className="flex-1 px-4 py-2 bg-slate-900/60 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 transition-all"
          />
          <button
            type="button"
            onClick={() => addTopic(topicInput)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-sm transition-all"
          >
            Add
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        id="start-interview-btn"
        type="submit"
        disabled={loading || topics.length === 0}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-violet-900/30"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Interview Plan…
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Start Interview
            <Cpu className="w-4 h-4 opacity-60" />
          </>
        )}
      </button>
    </form>
  );
}
