import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sparkles, FileText, Code2, Video, BookOpen, BarChart3, ChevronRight, CheckCircle2, Brain } from 'lucide-react';
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
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="#journey" className="hover:text-white transition-colors">Journey</Link>
              <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
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
                <span className="text-xs font-medium text-slate-300">PrepGenie Placement OS 1.0</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                The complete OS for your <br className="hidden md:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
                  tech career placement.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Elevate your interview prep with AI-powered resume intelligence, curated DSA practice, and hyper-realistic mock interviews in one unified platform.
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

          {/* Dashboard Preview Mockup */}
          <LandingAnimations type="scale-up" delay={0.2}>
            <div className="mt-20 max-w-6xl mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent z-10"></div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-2 backdrop-blur-sm shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="aspect-[16/9] md:aspect-[21/9] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-white/5 relative">
                  <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="text-center z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                      <LayoutDashboard className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Dashboard Interface Placeholder</p>
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
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Six Pillars of Placement</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to secure your dream role, engineered into a single seamless experience.</p>
              </div>
            </LandingAnimations>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: FileText,
                  title: "Resume Intelligence",
                  desc: "Recruiter-grade AI analysis with a 10-point scoring breakdown, semantic insights, and precise actionable feedback."
                },
                {
                  icon: Code2,
                  title: "DSA Practice",
                  desc: "Curated problem sets linked to specific company drives. Track your mastery and completion velocity over time."
                },
                {
                  icon: Brain,
                  title: "Placement Aptitude",
                  desc: "Master Quantitative Aptitude, Logical Reasoning, and Verbal Ability with company-specific timed mock tests."
                },
                {
                  icon: Video,
                  title: "Mock Interviews",
                  desc: "Voice-activated AI interviewers simulate high-pressure technical and behavioral rounds."
                },
                {
                  icon: BookOpen,
                  title: "Knowledge Hub",
                  desc: "Centralized repository of system design concepts, core CS fundamentals, and company-specific guides."
                },
                {
                  icon: BarChart3,
                  title: "Analytics",
                  desc: "Deep insights into your preparation journey, highlighting weak points before the real interview."
                }
              ].map((feature, i) => (
                <LandingAnimations key={i} type="fade-up" delay={i * 0.1}>
                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors h-full">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6 border border-violet-500/20">
                      <feature.icon className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
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
            <p className="text-slate-500 text-sm">© 2026 PrepGenie Placement OS. Built for excellence.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Temporary icon for placeholder
function LayoutDashboard(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}