'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  GraduationCap,
  Code2,
  Briefcase,
  LinkIcon,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from 'lucide-react';
import { saveOnboardingProfileAction } from '@backend/features/user/actions';
import { cn } from '@/lib/cn';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProfileData {
  college: string;
  degree: string;
  branch: string;
  graduationYear: string;
  cgpa: string;
  interestedRoles: string[];
  languagesKnown: string[];
  preferredLang: string;
  github: string;
  linkedin: string;
  leetcode: string;
  codeforces: string;
  interests: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEGREES = ['B.Tech', 'B.E.', 'B.Sc', 'M.Tech', 'M.E.', 'M.Sc', 'MCA', 'BCA', 'Other'];
const GRAD_YEARS = ['2024', '2025', '2026', '2027', '2028'];
const ROLES = ['SDE', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data Science', 'ML Engineer', 'AI Engineer', 'Cloud Engineer', 'Product Manager'];
const LANGUAGES = ['C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'C', 'Kotlin', 'Swift'];
const INTEREST_OPTIONS = ['AI/ML', 'Backend', 'Frontend', 'Cloud', 'DevOps', 'Competitive Programming', 'Cybersecurity', 'Data Engineering', 'Mobile Dev', 'Open Source'];

// ── Sub-Components ─────────────────────────────────────────────────────────────

function InputField({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-900/60 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900/60 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all appearance-none"
      >
        <option value="">Select...</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function ToggleChip({
  label, selected, onToggle,
}: {
  label: string; selected: boolean; onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
        selected
          ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
      )}
    >
      {selected && <Check className="w-3 h-3 inline mr-1" />}
      {label}
    </button>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'basic', label: 'Basic Info', icon: GraduationCap },
  { id: 'career', label: 'Career', icon: Briefcase },
  { id: 'programming', label: 'Programming', icon: Code2 },
  { id: 'profiles', label: 'Profiles', icon: LinkIcon },
];

// ── Main Component ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState<ProfileData>({
    college: '', degree: '', branch: '', graduationYear: '', cgpa: '',
    interestedRoles: [], languagesKnown: [], preferredLang: '',
    github: '', linkedin: '', leetcode: '', codeforces: '',
    interests: [],
  });

  const update = useCallback(<K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleArray = useCallback((key: 'interestedRoles' | 'languagesKnown' | 'interests', val: string) => {
    setData((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
      };
    });
  }, []);

  const canProceed = () => {
    if (step === 0) return data.college.trim().length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await saveOnboardingProfileAction({
        college: data.college || undefined,
        degree: data.degree || undefined,
        branch: data.branch || undefined,
        graduationYear: data.graduationYear ? parseInt(data.graduationYear) : undefined,
        cgpa: data.cgpa ? parseFloat(data.cgpa) : undefined,
        interestedRoles: data.interestedRoles,
        languagesKnown: data.languagesKnown,
        preferredLang: data.preferredLang || undefined,
        github: data.github || undefined,
        linkedin: data.linkedin || undefined,
        leetcode: data.leetcode || undefined,
        codeforces: data.codeforces || undefined,
        interests: data.interests,
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      setSaving(false);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
          <User className="w-3 h-3" /> Welcome to PrepGenie
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Complete Your Profile</h2>
        <p className="text-slate-400 text-sm">Help us personalize your preparation journey</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <React.Fragment key={s.id}>
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                i === step ? 'bg-indigo-600 text-white' : i < step ? 'bg-emerald-600/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
              )}>
                {i < step ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={cn('flex-1 h-px max-w-8', i < step ? 'bg-emerald-600/40' : 'bg-slate-800')} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Step 0 — Basic Info */}
            {step === 0 && (
              <>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" /> Academic Information
                </h3>
                <InputField label="College / University *" value={data.college} onChange={(v) => update('college', v)} placeholder="e.g. IIT Delhi, VIT Vellore" />
                <div className="grid grid-cols-2 gap-4">
                  <SelectField label="Degree" value={data.degree} onChange={(v) => update('degree', v)} options={DEGREES} />
                  <SelectField label="Graduation Year" value={data.graduationYear} onChange={(v) => update('graduationYear', v)} options={GRAD_YEARS} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Branch / Major" value={data.branch} onChange={(v) => update('branch', v)} placeholder="e.g. CSE, ECE, IT" />
                  <InputField label="CGPA" value={data.cgpa} onChange={(v) => update('cgpa', v)} placeholder="e.g. 8.5" type="number" />
                </div>
              </>
            )}

            {/* Step 1 — Career */}
            {step === 1 && (
              <>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" /> Career Interests
                </h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Interested Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((r) => (
                      <ToggleChip key={r} label={r} selected={data.interestedRoles.includes(r)} onToggle={() => toggleArray('interestedRoles', r)} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((i) => (
                      <ToggleChip key={i} label={i} selected={data.interests.includes(i)} onToggle={() => toggleArray('interests', i)} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 2 — Programming */}
            {step === 2 && (
              <>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" /> Programming Skills
                </h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Languages Known</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((l) => (
                      <ToggleChip key={l} label={l} selected={data.languagesKnown.includes(l)} onToggle={() => toggleArray('languagesKnown', l)} />
                    ))}
                  </div>
                </div>
                <SelectField label="Preferred Coding Language" value={data.preferredLang} onChange={(v) => update('preferredLang', v)} options={LANGUAGES} />
              </>
            )}

            {/* Step 3 — Profiles */}
            {step === 3 && (
              <>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-indigo-400" /> Online Profiles
                </h3>
                <p className="text-slate-500 text-sm -mt-2">All fields optional — add what you have.</p>
                <InputField label="GitHub Username" value={data.github} onChange={(v) => update('github', v)} placeholder="github.com/username" />
                <InputField label="LinkedIn URL" value={data.linkedin} onChange={(v) => update('linkedin', v)} placeholder="linkedin.com/in/username" />
                <InputField label="LeetCode Username" value={data.leetcode} onChange={(v) => update('leetcode', v)} placeholder="leetcode.com/username" />
                <InputField label="Codeforces Handle" value={data.codeforces} onChange={(v) => update('codeforces', v)} placeholder="codeforces.com/profile/handle" />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <p className="mt-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:pointer-events-none transition-all text-sm font-semibold shadow-lg shadow-indigo-600/20"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-70 transition-all text-sm font-semibold shadow-lg shadow-emerald-600/20"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Check className="w-4 h-4" /> Complete Setup</>
              )}
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-slate-600 text-xs">
        You can update your profile anytime from settings
      </p>
    </div>
  );
}
