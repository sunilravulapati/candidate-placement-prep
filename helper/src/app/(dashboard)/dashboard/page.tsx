'use client';

import { useState } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Calendar,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  FileText,
  Video,
  BarChart3,
  Brain,
  Code2,
  MessageSquare,
  Sparkles,
  Target
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-slate-900/20 border border-indigo-500/10 p-6 md:p-8 rounded-3xl backdrop-blur-md">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, Candidate! 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">
              You are on track for your upcoming drives. Keep pushing your daily goals to improve your Overall Placement Readiness.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-slate-900/50 border border-slate-800 text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Daily Goal: 2/5</span>
            </div>
            <div className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-colors">
              <span>Learning streak: 4 days</span>
              <TrendingUp className="w-4 h-4 text-violet-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Placement Readiness Score */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-600/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">+2.5% this week</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Placement Readiness</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-slate-100">78%</h3>
            </div>
          </div>
        </div>

        {/* Resume Score */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-violet-600/10 p-3 rounded-xl border border-violet-500/20 text-violet-400">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">Last updated 2d ago</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Resume Score</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-slate-100">8.5<span className="text-lg text-slate-500">/10</span></h3>
            </div>
          </div>
        </div>

        {/* DSA Progress */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-600/10 p-3 rounded-xl border border-blue-500/20 text-blue-400">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">45 solved</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">DSA Mastery</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-slate-100">62%</h3>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '62%' }}></div>
            </div>
          </div>
        </div>

        {/* Aptitude & English */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-fuchsia-600/10 p-3 rounded-xl border border-fuchsia-500/20 text-fuchsia-400">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">In Progress</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Aptitude Readiness</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-slate-100">45%</h3>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-fuchsia-500 h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Activity & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recommended Next Action */}
          <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 to-slate-900/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="bg-indigo-600/20 p-3 rounded-xl border border-indigo-500/30 flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-1">Recommended for you today</h3>
                  <p className="text-sm text-slate-400 mb-4 max-w-lg">
                    Your mock interview score for System Design is lagging. We recommend taking a 15-minute quick mock session to improve your structural thinking.
                  </p>
                  <div className="flex gap-3">
                    <Link href="/mock-interviews" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                      Start Mock Interview
                    </Link>
                    <button className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                      Skip for now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Module Grid */}
          <h2 className="text-lg font-bold text-slate-100 pt-2">Platform Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Aptitude Module Card */}
            <Link href="/aptitude" className="glass-card p-5 rounded-2xl group hover:bg-slate-900/80 transition-all border border-slate-800 hover:border-fuchsia-500/30 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-fuchsia-600/10 p-3 rounded-xl border border-fuchsia-500/20 text-fuchsia-400 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-fuchsia-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Placement Aptitude</h3>
              <p className="text-sm text-slate-400 mb-4">Quant, Verbal, and Logical Reasoning practice tests.</p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400">QA</div>
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400">VA</div>
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400">LR</div>
                </div>
                <span className="text-xs font-semibold text-fuchsia-400">45% Completed</span>
              </div>
            </Link>

            {/* Resume AI Card */}
            <Link href="/resume-ai" className="glass-card p-5 rounded-2xl group hover:bg-slate-900/80 transition-all border border-slate-800 hover:border-violet-500/30">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-violet-600/10 p-3 rounded-xl border border-violet-500/20 text-violet-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Resume Intelligence</h3>
              <p className="text-sm text-slate-400 mb-4">AI scoring and ATS optimization tailored to roles.</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Last scanned: 2d ago</span>
                <span className="text-xs font-semibold text-violet-400">Score: 8.5/10</span>
              </div>
            </Link>

            {/* DSA Card */}
            <Link href="/questions" className="glass-card p-5 rounded-2xl group hover:bg-slate-900/80 transition-all border border-slate-800 hover:border-blue-500/30">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-600/10 p-3 rounded-xl border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                  <Code2 className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">DSA Practice</h3>
              <p className="text-sm text-slate-400 mb-4">Curated coding problems for technical rounds.</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Recently: Graphs</span>
                <span className="text-xs font-semibold text-blue-400">62% Mastery</span>
              </div>
            </Link>

            {/* Mock Interviews Card */}
            <Link href="/mock-interviews" className="glass-card p-5 rounded-2xl group hover:bg-slate-900/80 transition-all border border-slate-800 hover:border-emerald-500/30">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-emerald-600/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Mock Interviews</h3>
              <p className="text-sm text-slate-400 mb-4">AI voice interviews for Tech and HR rounds.</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">2 Interviews Done</span>
                <span className="text-xs font-semibold text-emerald-400">Good Standing</span>
              </div>
            </Link>

          </div>
        </div>

        {/* Right Column: Drives & Recent Activity */}
        <div className="space-y-6">
          {/* Upcoming Interview Drives */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Upcoming Drives
              </h3>
              <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">3 ACTIVE</span>
            </div>

            <div className="space-y-3.5">
              <div className="group flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-900 hover:border-indigo-500/30 transition-all cursor-pointer">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Google India</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Software Engineer • July 15, 2026</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>

              <div className="group flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-900 hover:border-indigo-500/30 transition-all cursor-pointer">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Amazon SDE I</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Systems Architect • July 22, 2026</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>

              <div className="group flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-900 hover:border-indigo-500/30 transition-all cursor-pointer">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Microsoft India</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Cloud Engineer intern • Aug 02, 2026</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
            </div>
            
            <button className="w-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs py-2.5 rounded-xl transition-all">
              View All Openings
            </button>
          </div>

          {/* Recent Activity */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Recent Activity
            </h3>
            
            <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[7px] before:w-[2px] before:bg-slate-800">
              
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-fuchsia-500 rounded-full border-2 border-[#030712] ring-2 ring-fuchsia-500/20"></div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Practiced Quantitative Aptitude</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Completed 15 questions on Probability</p>
                  <p className="text-[10px] text-slate-500 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#030712] ring-2 ring-blue-500/20"></div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Solved Two Sum (DSA)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Difficulty: Easy • Runtime: 54ms</p>
                  <p className="text-[10px] text-slate-500 mt-1">5 hours ago</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-violet-500 rounded-full border-2 border-[#030712] ring-2 ring-violet-500/20"></div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Resume Scanned</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Score improved from 7.5 to 8.5</p>
                  <p className="text-[10px] text-slate-500 mt-1">Yesterday</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}