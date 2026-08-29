'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Clock,
  Lock,
  Edit3,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import {
  saveOnboardingProfileAction,
  getOnboardingDetailsAction,
} from '@backend/features/user/actions';
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

interface OnboardingDetailsState {
  profileCompleted: boolean;
  profileCompletedAt: string | null;
  canEdit: boolean;
  remainingTimeMs: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEGREES = ['B.Tech', 'B.E.', 'B.Sc', 'M.Tech', 'M.E.', 'M.Sc', 'MCA', 'BCA', 'Other'];
const GRAD_YEARS = ['2024', '2025', '2026', '2027', '2028'];
const ROLES = ['SDE', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data Science', 'ML Engineer', 'AI Engineer', 'Cloud Engineer', 'Product Manager'];
const LANGUAGES = ['C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'C', 'Kotlin', 'Swift'];
const INTEREST_OPTIONS = ['AI/ML', 'Backend', 'Frontend', 'Cloud', 'DevOps', 'Competitive Programming', 'Cybersecurity', 'Data Engineering', 'Mobile Dev', 'Open Source'];

// ── Helper functions ──────────────────────────────────────────────────────────

function formatRemainingTime(ms: number): string {
  if (ms <= 0) return 'Expired';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

function formatDate(isoStr: string | null): string {
  if (!isoStr) return '';
  try {
    return new Date(isoStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

// ── Sub-Components ─────────────────────────────────────────────────────────────

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
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
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
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
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleChip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
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
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [statusDetails, setStatusDetails] = useState<OnboardingDetailsState>({
    profileCompleted: false,
    profileCompletedAt: null,
    canEdit: true,
    remainingTimeMs: 3 * 24 * 60 * 60 * 1000,
  });

  const [isEditing, setIsEditing] = useState(false);

  const [data, setData] = useState<ProfileData>({
    college: '',
    degree: '',
    branch: '',
    graduationYear: '',
    cgpa: '',
    interestedRoles: [],
    languagesKnown: [],
    preferredLang: '',
    github: '',
    linkedin: '',
    leetcode: '',
    codeforces: '',
    interests: [],
  });

  const fetchOnboardingData = useCallback(async () => {
    setLoading(true);
    try {
      const details = await getOnboardingDetailsAction();
      setStatusDetails({
        profileCompleted: details.profileCompleted,
        profileCompletedAt: details.profileCompletedAt,
        canEdit: details.canEdit,
        remainingTimeMs: details.remainingTimeMs,
      });

      if (details.profile) {
        const p = details.profile;
        setData({
          college: p.college || '',
          degree: p.degree || '',
          branch: p.branch || '',
          graduationYear: p.graduationYear ? String(p.graduationYear) : '',
          cgpa: p.cgpa ? String(p.cgpa) : '',
          interestedRoles: p.interestedRoles || [],
          languagesKnown: p.languagesKnown || [],
          preferredLang: p.preferredLang || '',
          github: p.github || '',
          linkedin: p.linkedin || '',
          leetcode: p.leetcode || '',
          codeforces: p.codeforces || '',
          interests: p.interests || [],
        });
      }
    } catch {
      setError('Unable to load onboarding status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOnboardingData();
  }, [fetchOnboardingData]);

  // Live countdown timer for active edit window
  useEffect(() => {
    if (!statusDetails.canEdit || statusDetails.remainingTimeMs <= 0) return;
    const interval = setInterval(() => {
      setStatusDetails((prev) => {
        const nextMs = prev.remainingTimeMs - 1000;
        if (nextMs <= 0) {
          return { ...prev, canEdit: false, remainingTimeMs: 0 };
        }
        return { ...prev, remainingTimeMs: nextMs };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [statusDetails.canEdit, statusDetails.remainingTimeMs]);

  const update = useCallback(<K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleArray = useCallback(
    (key: 'interestedRoles' | 'languagesKnown' | 'interests', val: string) => {
      setData((prev) => {
        const arr = prev[key] as string[];
        return {
          ...prev,
          [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
        };
      });
    },
    []
  );

  const canProceed = () => {
    if (step === 0) return data.college.trim().length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
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

      if (statusDetails.profileCompleted) {
        setSuccessMsg('Profile updated successfully!');
        setIsEditing(false);
        await fetchOnboardingData();
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-slate-400 text-sm font-medium">Loading profile information...</p>
      </div>
    );
  }

  // ── MODE 1: Profile Summary (View Mode) ──────────────────────────────────────
  if (statusDetails.profileCompleted && !isEditing) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Onboarding Completed
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Your Profile Details</h2>
            <p className="text-slate-400 text-sm">
              Review what you entered during onboarding
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>

        {/* Success alert message if saved */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-sm"
          >
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" /> {successMsg}
            </span>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 text-xs underline">
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Edit Window Banner */}
        <div
          className={cn(
            'p-5 rounded-3xl border backdrop-blur-xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4',
            statusDetails.canEdit
              ? 'bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/30 border-indigo-500/30 shadow-lg shadow-indigo-950/20'
              : 'bg-slate-900/60 border-slate-800'
          )}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                'p-2.5 rounded-2xl shrink-0 mt-0.5',
                statusDetails.canEdit
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              )}
            >
              {statusDetails.canEdit ? <Clock className="w-5 h-5 animate-pulse" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-white font-semibold text-base">
                  {statusDetails.canEdit ? '3-Day Profile Edit Window Active' : 'Profile Edit Window Expired'}
                </h4>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider',
                    statusDetails.canEdit
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  )}
                >
                  {statusDetails.canEdit ? 'Editable' : 'Locked'}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                {statusDetails.canEdit ? (
                  <>
                    You can edit your profile details within 3 days of onboarding.{' '}
                    <span className="text-indigo-300 font-bold font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">
                      {formatRemainingTime(statusDetails.remainingTimeMs)}
                    </span>
                  </>
                ) : (
                  <>
                    The 3-day post-onboarding edit period ended on{' '}
                    <span className="text-amber-300 font-medium">
                      {formatDate(statusDetails.profileCompletedAt)}
                    </span>
                    . Profile information is now read-only.
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (statusDetails.canEdit) {
                setIsEditing(true);
                setStep(0);
              }
            }}
            disabled={!statusDetails.canEdit}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0',
              statusDetails.canEdit
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            )}
          >
            {statusDetails.canEdit ? (
              <>
                <Edit3 className="w-4 h-4" /> Edit Profile
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" /> Editing Locked
              </>
            )}
          </button>
        </div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Academic Info */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              Academic Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500 text-xs block">College / University</span>
                <span className="text-slate-200 font-medium">
                  {data.college || <em className="text-slate-600">Not specified</em>}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 text-xs block">Degree</span>
                  <span className="text-slate-200 font-medium">{data.degree || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Branch / Major</span>
                  <span className="text-slate-200 font-medium">{data.branch || '—'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 text-xs block">Graduation Year</span>
                  <span className="text-slate-200 font-medium">{data.graduationYear || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">CGPA</span>
                  <span className="text-slate-200 font-medium">{data.cgpa || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Career Interests */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Briefcase className="w-4 h-4" />
              </div>
              Career Interests
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500 text-xs block mb-1.5">Interested Roles</span>
                {data.interestedRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {data.interestedRoles.map((r) => (
                      <span
                        key={r}
                        className="px-2.5 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-600 italic">None selected</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 text-xs block mb-1.5">Focus Areas</span>
                {data.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {data.interests.map((i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium"
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-600 italic">None selected</span>
                )}
              </div>
            </div>
          </div>

          {/* Programming Skills */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Code2 className="w-4 h-4" />
              </div>
              Programming & Tech Stack
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500 text-xs block mb-1.5">Languages Known</span>
                {data.languagesKnown.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {data.languagesKnown.map((l) => (
                      <span
                        key={l}
                        className="px-2.5 py-1 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-600 italic">None selected</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Preferred Coding Language</span>
                <span className="text-slate-200 font-medium">{data.preferredLang || '—'}</span>
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              Online Handles & Links
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'GitHub', value: data.github, prefix: 'https://github.com/' },
                { label: 'LinkedIn', value: data.linkedin, prefix: 'https://linkedin.com/in/' },
                { label: 'LeetCode', value: data.leetcode, prefix: 'https://leetcode.com/' },
                { label: 'Codeforces', value: data.codeforces, prefix: 'https://codeforces.com/profile/' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60"
                >
                  <span className="text-slate-400 font-medium">{item.label}</span>
                  {item.value ? (
                    <a
                      href={item.value.startsWith('http') ? item.value : `${item.prefix}${item.value}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono font-medium truncate max-w-[200px]"
                    >
                      {item.value} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-600 italic">Not added</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MODE 2 & 3: Wizard Form (Initial Setup or Edit Mode) ────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
          {isEditing ? <Edit3 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          {isEditing ? 'Updating Profile' : 'Welcome to PrepGenie'}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          {isEditing ? 'Edit Profile Details' : 'Complete Your Profile'}
        </h2>
        <p className="text-slate-400 text-sm">
          {isEditing
            ? 'Modify your academic, career, and coding preferences'
            : 'Help us personalize your preparation journey'}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <React.Fragment key={s.id}>
              <div
                onClick={() => setStep(i)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
                  i === step
                    ? 'bg-indigo-600 text-white'
                    : i < step
                    ? 'bg-emerald-600/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                )}
              >
                {i < step ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px max-w-8',
                    i < step ? 'bg-emerald-600/40' : 'bg-slate-800'
                  )}
                />
              )}
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
                <InputField
                  label="College / University *"
                  value={data.college}
                  onChange={(v) => update('college', v)}
                  placeholder="e.g. IIT Delhi, VIT Vellore"
                />
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Degree"
                    value={data.degree}
                    onChange={(v) => update('degree', v)}
                    options={DEGREES}
                  />
                  <SelectField
                    label="Graduation Year"
                    value={data.graduationYear}
                    onChange={(v) => update('graduationYear', v)}
                    options={GRAD_YEARS}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Branch / Major"
                    value={data.branch}
                    onChange={(v) => update('branch', v)}
                    placeholder="e.g. CSE, ECE, IT"
                  />
                  <InputField
                    label="CGPA"
                    value={data.cgpa}
                    onChange={(v) => update('cgpa', v)}
                    placeholder="e.g. 8.5"
                    type="number"
                  />
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
                      <ToggleChip
                        key={r}
                        label={r}
                        selected={data.interestedRoles.includes(r)}
                        onToggle={() => toggleArray('interestedRoles', r)}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((i) => (
                      <ToggleChip
                        key={i}
                        label={i}
                        selected={data.interests.includes(i)}
                        onToggle={() => toggleArray('interests', i)}
                      />
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
                      <ToggleChip
                        key={l}
                        label={l}
                        selected={data.languagesKnown.includes(l)}
                        onToggle={() => toggleArray('languagesKnown', l)}
                      />
                    ))}
                  </div>
                </div>
                <SelectField
                  label="Preferred Coding Language"
                  value={data.preferredLang}
                  onChange={(v) => update('preferredLang', v)}
                  options={LANGUAGES}
                />
              </>
            )}

            {/* Step 3 — Profiles */}
            {step === 3 && (
              <>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-indigo-400" /> Online Profiles
                </h3>
                <p className="text-slate-500 text-sm -mt-2">All fields optional — add what you have.</p>
                <InputField
                  label="GitHub Username"
                  value={data.github}
                  onChange={(v) => update('github', v)}
                  placeholder="github.com/username"
                />
                <InputField
                  label="LinkedIn URL"
                  value={data.linkedin}
                  onChange={(v) => update('linkedin', v)}
                  placeholder="linkedin.com/in/username"
                />
                <InputField
                  label="LeetCode Username"
                  value={data.leetcode}
                  onChange={(v) => update('leetcode', v)}
                  placeholder="leetcode.com/username"
                />
                <InputField
                  label="Codeforces Handle"
                  value={data.codeforces}
                  onChange={(v) => update('codeforces', v)}
                  placeholder="codeforces.com/profile/handle"
                />
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
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
              >
                Cancel Editing
              </button>
            )}
          </div>

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
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> {isEditing ? 'Save Changes' : 'Complete Setup'}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-slate-600 text-xs">
        {statusDetails.canEdit
          ? 'Profile details can be modified within 3 days of completing onboarding.'
          : '3-day post-onboarding edit window is active.'}
      </p>
    </div>
  );
}
