'use client';

import {
  Trophy,
  ChevronRight,
  FileText,
  Video,
  Brain,
  Code2,
  Sparkles,
  Target,
  ArrowUpRight,
  CheckCircle2,
  Flame,
  Activity,
  CircleDot,
} from 'lucide-react';
import Link from 'next/link';

const metrics = [
  {
    label: 'Placement readiness',
    value: '78',
    suffix: '%',
    detail: '+2.5% this week',
    icon: Trophy,
    accent: 'emerald',
    progress: 78,
  },
  {
    label: 'Resume score',
    value: '8.5',
    suffix: '/10',
    detail: 'Scanned 2 days ago',
    icon: FileText,
    accent: 'violet',
    progress: 85,
  },
  {
    label: 'DSA mastery',
    value: '62',
    suffix: '%',
    detail: '45 problems solved',
    icon: Code2,
    accent: 'sky',
    progress: 62,
  },
  {
    label: 'Aptitude readiness',
    value: '45',
    suffix: '%',
    detail: 'In active progress',
    icon: Brain,
    accent: 'fuchsia',
    progress: 45,
  },
];

const modules = [
  {
    href: '/aptitude',
    title: 'Placement Aptitude',
    description: 'Quant, verbal, and logical reasoning practice tests.',
    icon: Brain,
    accent: 'fuchsia',
    stat: '45% completed',
    meta: 'QA · VA · LR',
  },
  {
    href: '/resume-ai',
    title: 'Resume Intelligence',
    description: 'AI scoring and ATS optimization tailored to your roles.',
    icon: FileText,
    accent: 'violet',
    stat: 'Score: 8.5/10',
    meta: 'Last scanned 2d ago',
  },
  {
    href: '/dsa',
    title: 'DSA Practice',
    description: 'Curated coding problems for technical interview rounds.',
    icon: Code2,
    accent: 'sky',
    stat: '62% mastery',
    meta: 'Recently: Graphs',
  },
  {
    href: '/mock-interviews',
    title: 'Mock Interviews',
    description: 'AI voice interviews for technical and HR rounds.',
    icon: Video,
    accent: 'emerald',
    stat: 'Good standing',
    meta: '2 interviews done',
  },
];

const accentStyles: Record<
  string,
  {
    icon: string;
    iconBg: string;
    progress: string;
    hover: string;
    badge: string;
  }
> = {
  emerald: {
    icon: 'text-emerald-300',
    iconBg: 'border-emerald-400/20 bg-emerald-400/10',
    progress: 'bg-emerald-400',
    hover: 'group-hover:border-emerald-400/30',
    badge: 'text-emerald-300 bg-emerald-400/10',
  },
  violet: {
    icon: 'text-violet-300',
    iconBg: 'border-violet-400/20 bg-violet-400/10',
    progress: 'bg-violet-400',
    hover: 'group-hover:border-violet-400/30',
    badge: 'text-violet-300 bg-violet-400/10',
  },
  sky: {
    icon: 'text-sky-300',
    iconBg: 'border-sky-400/20 bg-sky-400/10',
    progress: 'bg-sky-400',
    hover: 'group-hover:border-sky-400/30',
    badge: 'text-sky-300 bg-sky-400/10',
  },
  fuchsia: {
    icon: 'text-fuchsia-300',
    iconBg: 'border-fuchsia-400/20 bg-fuchsia-400/10',
    progress: 'bg-fuchsia-400',
    hover: 'group-hover:border-fuchsia-400/30',
    badge: 'text-fuchsia-300 bg-fuchsia-400/10',
  },
};

export default function Dashboard() {
  return (
    <div className="page-container">
      <section className="relative isolate overflow-hidden rounded-[30px] border border-violet-400/20 bg-gradient-to-br from-violet-950/60 via-indigo-950/30 to-slate-950/40 p-6 shadow-2xl shadow-indigo-950/20 md:p-8">
        <div className="absolute -right-16 -top-28 -z-10 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute -bottom-36 left-1/3 -z-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,transparent_10%,rgba(255,255,255,0.04)_50%,transparent_75%)]" />
        <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-300/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-lg shadow-emerald-300/50" />
              Your placement command center
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Welcome back, Candidate.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300/75 md:text-[15px]">
              You are building steady momentum. Focus on the next recommended
              action to keep your readiness score moving forward.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <Target className="h-3.5 w-3.5 text-emerald-300" /> Daily goal
              </div>
              <p className="mt-1 text-lg font-bold text-white">
                2{' '}
                <span className="text-sm font-medium text-slate-500">
                  / 5 tasks
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-violet-200/70">
                <Flame className="h-3.5 w-3.5 text-orange-300" /> Learning
                streak
              </div>
              <p className="mt-1 text-lg font-bold text-white">
                4{' '}
                <span className="text-sm font-medium text-violet-200/60">
                  days
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Preparation metrics"
      >
        {metrics.map((metric) => {
          const styles = accentStyles[metric.accent];
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="glass-card group overflow-hidden rounded-2xl p-5"
            >
              <div className="mb-6 flex items-start justify-between gap-3">
                <div className={`rounded-xl border p-3 ${styles.iconBg}`}>
                  <Icon className={`h-5 w-5 ${styles.icon}`} />
                </div>
                <span
                  className={`rounded-lg px-2 py-1 text-[10px] font-bold ${styles.badge}`}
                >
                  {metric.detail}
                </span>
              </div>
              <p className="eyebrow">{metric.label}</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight text-white">
                  {metric.value}
                </span>
                <span className="text-sm font-bold text-slate-500">
                  {metric.suffix}
                </span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800/80">
                <div
                  className={`h-full rounded-full ${styles.progress}`}
                  style={{ width: `${metric.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-950/55 to-slate-950/50 p-6 shadow-xl shadow-indigo-950/10 md:p-7">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-300/20 bg-indigo-400/10">
                  <Sparkles className="h-6 w-6 text-indigo-200" />
                </div>
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="eyebrow text-indigo-300/80">
                      Recommended next
                    </span>
                    <span className="rounded-md bg-indigo-400/10 px-2 py-1 text-[10px] font-bold text-indigo-200">
                      15 MIN
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Sharpen your system design thinking
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300/70">
                    Your recent mock interview shows an opportunity to improve
                    structure and trade-off explanations. A short focused
                    session can close the gap.
                  </p>
                </div>
              </div>
              <Link
                href="/mock-interviews"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
              >
                Start session <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="eyebrow">Your toolkit</p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Platform modules
                </h2>
              </div>
              <Link
                href="/dashboard"
                className="hidden items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-white sm:flex"
              >
                View overview <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {modules.map((module) => {
                const styles = accentStyles[module.accent];
                const Icon = module.icon;
                return (
                  <Link
                    key={module.title}
                    href={module.href}
                    className={`glass-card group rounded-2xl p-5 ${styles.hover}`}
                  >
                    <div className="mb-5 flex items-start justify-between">
                      <div className={`rounded-xl border p-3 ${styles.iconBg}`}>
                        <Icon className={`h-5 w-5 ${styles.icon}`} />
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-slate-300" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {module.title}
                    </h3>
                    <p className="mt-1.5 min-h-10 text-sm leading-5 text-slate-400">
                      {module.description}
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {module.meta}
                      </span>
                      <span
                        className={`text-[11px] font-bold capitalize ${styles.icon}`}
                      >
                        {module.stat}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="glass-card rounded-2xl p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="eyebrow">Stay prepared</p>
                <h2 className="mt-1 text-base font-bold text-white">
                  Upcoming drives
                </h2>
              </div>
              <span className="rounded-lg bg-indigo-400/10 px-2 py-1 text-[10px] font-bold text-indigo-300">
                3 ACTIVE
              </span>
            </div>
            <div className="space-y-2.5">
              {[
                ['Google India', 'Software Engineer', 'Jul 15, 2026'],
                ['Amazon SDE I', 'Systems Architect', 'Jul 22, 2026'],
                ['Microsoft India', 'Cloud Engineer intern', 'Aug 02, 2026'],
              ].map(([company, role, date]) => (
                <div
                  key={company}
                  className="group flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/35 p-3.5 transition hover:border-indigo-400/25 hover:bg-slate-900/70"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-xs font-bold text-slate-200">
                      {company}
                    </h3>
                    <p className="mt-1 truncate text-[10px] text-slate-500">
                      {role} · {date}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-700 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
                </div>
              ))}
            </div>
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 text-xs font-bold text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white">
              View all openings <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="eyebrow">Your momentum</p>
                <h2 className="mt-1 text-base font-bold text-white">
                  Recent activity
                </h2>
              </div>
              <Activity className="h-4 w-4 text-slate-600" />
            </div>
            <div className="space-y-5">
              {[
                {
                  title: 'Practiced quantitative aptitude',
                  detail: '15 Probability questions completed',
                  time: '2 hours ago',
                  color: 'text-fuchsia-300',
                  icon: CheckCircle2,
                },
                {
                  title: 'Solved Two Sum',
                  detail: 'Easy · Runtime 54ms',
                  time: '5 hours ago',
                  color: 'text-sky-300',
                  icon: Code2,
                },
                {
                  title: 'Resume scanned',
                  detail: 'Score improved from 7.5 to 8.5',
                  time: 'Yesterday',
                  color: 'text-violet-300',
                  icon: FileText,
                },
              ].map(({ title, detail, time, color, icon: Icon }) => (
                <div key={String(title)} className="flex gap-3">
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ${color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200">{title}</p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      {detail}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-600">
                      {time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                <CircleDot className="h-4 w-4 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-100">
                  System status: healthy
                </p>
                <p className="mt-0.5 text-[10px] text-emerald-200/50">
                  All preparation services are online.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}