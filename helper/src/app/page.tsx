import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import {
  Sparkles,
  FileText,
  Code2,
  Video,
  BookOpen,
  BarChart3,
  ChevronRight,
  Brain,
  LayoutDashboard,
  TrendingUp,
  Target,
} from 'lucide-react';
import { LandingAnimations } from '@/app/LandingAnimations';

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-violet-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              PrepGenie
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex space-x-6 text-sm font-medium text-slate-300">
              <Link
                href="#features"
                className="hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="#journey"
                className="hover:text-white transition-colors"
              >
                Journey
              </Link>
              <Link href="#faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
            </div>
            <Link
              href="/sign-in"
              className="bg-white/10 hover:bg-white/20 text-white font-medium text-sm px-5 py-2.5 rounded-full transition-all border border-white/10"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="hidden sm:inline-flex bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm px-6 py-2.5 rounded-full transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] -z-10"></div>
          <LandingAnimations type="fade-up">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-300">
                  PrepGenie Placement OS 1.0
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                The complete OS for your <br className="hidden md:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
                  tech career placement.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Elevate your interview prep with AI-powered resume intelligence,
                curated DSA practice, and hyper-realistic mock interviews in one
                unified platform.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/sign-up"
                  className="w-full sm:w-auto inline-flex justify-center items-center space-x-2 bg-white text-slate-950 font-bold text-sm px-8 py-4 rounded-full transition-transform hover:scale-105"
                >
                  <span>Start for free</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="https://github.com"
                  target="_blank"
                  className="w-full sm:w-auto inline-flex justify-center items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm px-8 py-4 rounded-full transition-colors"
                >
                  <span>View GitHub</span>
                </Link>
              </div>
            </div>
          </LandingAnimations>

          {/* Dashboard Preview */}
          <LandingAnimations type="scale-up" delay={0.2}>
            <div className="relative mx-auto mt-20 max-w-6xl">
              <div className="absolute inset-x-10 bottom-0 h-32 bg-violet-600/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70 p-2 shadow-2xl shadow-violet-950/30 backdrop-blur-xl">
                <div className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0b1120]">
                  <div className="flex h-11 items-center justify-between border-b border-white/[0.07] bg-slate-950/70 px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                    </div>
                    <span className="hidden text-[10px] font-bold uppercase tracking-[0.24em] text-slate-600 sm:block">
                      PrepGenie workspace
                    </span>
                    <div className="h-6 w-6 rounded-lg bg-violet-400/10" />
                  </div>
                  <div className="grid min-h-[330px] grid-cols-[76px_1fr] sm:grid-cols-[190px_1fr]">
                    <div className="border-r border-white/[0.07] bg-slate-950/35 p-3 sm:p-5">
                      <div className="mb-7 flex items-center gap-2">
                        <div className="rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 p-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="hidden text-sm font-bold text-white sm:block">
                          PrepGenie
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 rounded-xl bg-violet-400/10 px-2.5 py-2 text-violet-200">
                          <LayoutDashboard className="h-3.5 w-3.5" />
                          <span className="hidden text-[11px] font-semibold sm:block">
                            Dashboard
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-2 text-slate-600">
                          <Code2 className="h-3.5 w-3.5" />
                          <span className="hidden text-[11px] font-semibold sm:block">
                            DSA Studio
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-2 text-slate-600">
                          <FileText className="h-3.5 w-3.5" />
                          <span className="hidden text-[11px] font-semibold sm:block">
                            Resume Studio
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-7">
                      <div className="mb-5 flex items-end justify-between">
                        <div>
                          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300/70">
                            Your command center
                          </p>
                          <h3 className="text-lg font-bold text-white sm:text-2xl">
                            Welcome back, Candidate.
                          </h3>
                          <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                            Here is your placement readiness at a glance.
                          </p>
                        </div>
                        <div className="hidden items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2 sm:flex">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                          <span className="text-[10px] font-bold text-emerald-200">
                            +2.5% this week
                          </span>
                        </div>
                      </div>
                      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 sm:p-4">
                          <Target className="mb-3 h-4 w-4 text-emerald-300" />
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                            Readiness
                          </p>
                          <p className="mt-1 text-xl font-bold text-white">
                            78%
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 sm:p-4">
                          <FileText className="mb-3 h-4 w-4 text-violet-300" />
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                            Resume
                          </p>
                          <p className="mt-1 text-xl font-bold text-white">
                            8.5
                            <span className="text-xs text-slate-600">/10</span>
                          </p>
                        </div>
                        <div className="hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 sm:block">
                          <Code2 className="mb-3 h-4 w-4 text-sky-300" />
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                            DSA mastery
                          </p>
                          <p className="mt-1 text-xl font-bold text-white">
                            62%
                          </p>
                        </div>
                        <div className="hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 sm:block">
                          <Brain className="mb-3 h-4 w-4 text-fuchsia-300" />
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                            Aptitude
                          </p>
                          <p className="mt-1 text-xl font-bold text-white">
                            45%
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.3fr_1fr]">
                        <div className="rounded-2xl border border-indigo-400/15 bg-indigo-400/[0.06] p-4">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-300/70">
                            Recommended next
                          </p>
                          <p className="mt-2 text-sm font-bold text-white">
                            Sharpen your system design thinking
                          </p>
                          <div className="mt-4 h-1.5 rounded-full bg-slate-800">
                            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400" />
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                            Learning streak
                          </p>
                          <p className="mt-2 text-2xl font-bold text-white">
                            4{' '}
                            <span className="text-xs font-medium text-slate-500">
                              days
                            </span>
                          </p>
                          <div className="mt-3 flex gap-1.5">
                            <span className="h-1.5 flex-1 rounded-full bg-violet-400" />
                            <span className="h-1.5 flex-1 rounded-full bg-violet-400" />
                            <span className="h-1.5 flex-1 rounded-full bg-violet-400" />
                            <span className="h-1.5 flex-1 rounded-full bg-violet-400" />
                            <span className="h-1.5 flex-1 rounded-full bg-slate-800" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </LandingAnimations>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-6">
            <LandingAnimations type="fade-up">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                  Six Pillars of Placement
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Everything you need to secure your dream role, engineered into
                  a single seamless experience.
                </p>
              </div>
            </LandingAnimations>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: FileText,
                  title: 'Resume Intelligence',
                  desc: 'Recruiter-grade AI analysis with a 10-point scoring breakdown, semantic insights, and precise actionable feedback.',
                },
                {
                  icon: Code2,
                  title: 'DSA Practice',
                  desc: 'Curated problem sets linked to specific company drives. Track your mastery and completion velocity over time.',
                },
                {
                  icon: Brain,
                  title: 'Placement Aptitude',
                  desc: 'Master Quantitative Aptitude, Logical Reasoning, and Verbal Ability with company-specific timed mock tests.',
                },
                {
                  icon: Video,
                  title: 'Mock Interviews',
                  desc: 'Voice-activated AI interviewers simulate high-pressure technical and behavioral rounds.',
                },
                {
                  icon: BookOpen,
                  title: 'Knowledge Hub',
                  desc: 'Centralized repository of system design concepts, core CS fundamentals, and company-specific guides.',
                },
                {
                  icon: BarChart3,
                  title: 'Analytics',
                  desc: 'Deep insights into your preparation journey, highlighting weak points before the real interview.',
                },
              ].map((feature, i) => (
                <LandingAnimations key={i} type="fade-up" delay={i * 0.1}>
                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors h-full">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6 border border-violet-500/20">
                      <feature.icon className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </LandingAnimations>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span className="font-bold text-lg">PrepGenie</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2026 PrepGenie Placement OS. Built for excellence.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}