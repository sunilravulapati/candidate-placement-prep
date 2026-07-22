import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { Sparkles, Code2, Brain, FileText, BarChart3, CheckCircle2 } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-violet-500/30">
      {/* Background ambient glow shapes */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header / Brand Nav */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            PrepGenie
          </span>
        </Link>

        <div className="text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        {/* Left Side: Brand Showcase & Features */}
        <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5">
            <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-semibold text-violet-300 tracking-wide uppercase">Join PrepGenie Today</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Start your placement <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-400">
                preparation journey
              </span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Create your account to unlock AI-powered interview practice, multi-engine DSA coding studio, and placement analytics.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-xl mx-auto lg:mx-0">
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl flex items-start space-x-3.5 hover:border-violet-500/30 transition-colors">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 shrink-0 mt-0.5">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">DSA Studio</h3>
                <p className="text-xs text-slate-400 mt-0.5">Multi-engine code execution with instant verdicts</p>
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl flex items-start space-x-3.5 hover:border-indigo-500/30 transition-colors">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">AI Mock Interviews</h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time voice & technical evaluation</p>
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl flex items-start space-x-3.5 hover:border-emerald-500/30 transition-colors">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Resume Studio</h3>
                <p className="text-xs text-slate-400 mt-0.5">ATS optimization and role tailoring</p>
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl flex items-start space-x-3.5 hover:border-amber-500/30 transition-colors">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Placement Analytics</h3>
                <p className="text-xs text-slate-400 mt-0.5">Readiness score & weak topic diagnostics</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-start space-x-6 text-xs text-slate-400 pt-2">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Free Candidate Access</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-violet-400" />
              <span>Instant Onboarding</span>
            </span>
          </div>
        </div>

        {/* Right Side: Clerk Authentication Component */}
        <div className="w-full lg:w-auto flex justify-center">
          <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 p-2 sm:p-4 rounded-2xl shadow-2xl shadow-violet-950/20">
            <SignUp
              fallbackRedirectUrl="/dashboard"
              signInUrl="/sign-in"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 border-t border-white/5">
        &copy; {new Date().getFullYear()} PrepGenie. All rights reserved.
      </footer>
    </div>
  );
}
