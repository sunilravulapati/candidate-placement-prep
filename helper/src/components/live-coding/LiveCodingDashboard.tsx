'use client';

import React, { useState, useEffect } from 'react';
import { getDashboardStatsAction } from '@backend/features/liveCoding/actions';
import { motion } from 'framer-motion';
import { 
  Play, 
  Code2, 
  Target, 
  BookOpen, 
  History,
  TrendingUp,
  ChevronRight,
  Flame,
  CheckCircle2,
  Calendar,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Learning paths can still be mocked for now as per instructions (backend connection is coming later for these if not in stats)
const learningPaths = [
  { name: 'Blind 75', progress: 45, color: 'from-purple-500/20 to-purple-600/20 text-purple-400' },
  { name: 'Neet 150', progress: 12, color: 'from-blue-500/20 to-blue-600/20 text-blue-400' },
  { name: 'Graphs Mastery', progress: 80, color: 'from-emerald-500/20 to-emerald-600/20 text-emerald-400' },
];


export default function DSAStudioDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  const [stats, setStats] = useState<any>(null);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);

  useEffect(() => {
    setIsClient(true);
    // Generate deterministic mock heatmap for now
    const data = Array.from({length: 5}).map(() => 
      Array.from({length: 30}).map(() => Math.random())
    );
    setHeatmapData(data);
    
    getDashboardStatsAction().then(res => {
      setStats(res.stats);
      setRecentAttempts(res.recentAttempts);
    }).catch(err => {
      console.error(err);
    });
  }, []);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-slate-200 flex items-center justify-center">
        <div className="animate-pulse text-indigo-400 font-semibold">Loading Dashboard...</div>
      </div>
    );
  }

  const totalSolved = stats.easy.solved + stats.medium.solved + stats.hard.solved;
  const totalQuestions = stats.easy.total + stats.medium.total + stats.hard.total;
  const percentComplete = Math.round((totalSolved / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
              <Code2 className="w-4 h-4" />
              <span>DSA Studio</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome back, Developer!</h1>
            <p className="text-slate-400 max-w-xl text-lg">
              Continue your interview preparation with curated paths and real-world company questions.
            </p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/dsa/library" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors">
              <BookOpen className="w-5 h-5" /> Problem Library
            </Link>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
          {/* Left Column - Main Action & Paths (Col Span 3) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Top Action Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Daily Challenge */}
              <motion.div variants={itemVariants} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-3xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50" />
                <div className="relative h-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/50 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <Target className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-xs font-medium text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      Today&apos;s Challenge
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Valid Palindrome</h3>
                  <p className="text-slate-400 text-sm mb-6 flex-grow">
                    <span className="text-emerald-400 font-medium">Easy</span> • Array & Strings • Meta
                  </p>
                  <button className="w-full py-3 rounded-xl bg-emerald-600/20 text-emerald-400 font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all">
                    Start Challenge <Play className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

              {/* Continue Coding */}
              <motion.div variants={itemVariants} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-3xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50" />
                <div className="relative h-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/50 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                      <History className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
                      In Progress
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Container With Most Water</h3>
                  <p className="text-slate-400 text-sm mb-6 flex-grow">
                    You were 15 minutes in. Jump back and finish your solution!
                  </p>
                  <Link 
                    href="/dsa/workspace/demo-session" 
                    className="w-full py-3 rounded-xl bg-white text-black font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                  >
                    Resume Session <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Learning Paths */}
            <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" /> Curated Learning Paths
                </h2>
                <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All</button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {learningPaths.map((path, idx) => (
                  <div key={idx} className={cn("p-4 rounded-2xl border bg-gradient-to-br transition-all hover:scale-[1.02] cursor-pointer", path.color, "border-white/10")}>
                    <div className="font-bold text-lg text-white mb-4">{path.name}</div>
                    <div className="flex justify-between text-xs text-white/70 mb-2">
                      <span>Progress</span>
                      <span>{path.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${path.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Heatmap & Weekly Progress Placeholder */}
            <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-indigo-400" /> Activity Heatmap
              </h2>
              <div className="flex flex-col gap-2 opacity-80">
                {isClient && heatmapData.map((row, r) => (
                  <div key={r} className="flex gap-2">
                    {row.map((activityLevel, c) => {
                      let bgClass = "bg-slate-800";
                      if (activityLevel > 0.8) bgClass = "bg-indigo-500";
                      else if (activityLevel > 0.5) bgClass = "bg-indigo-700";
                      else if (activityLevel > 0.3) bgClass = "bg-indigo-900";
                      return <div key={c} className={cn("w-3 h-3 rounded-[2px]", bgClass)} />
                    })}
                  </div>
                ))}
                {!isClient && (
                  <div className="h-24 flex items-center justify-center text-slate-500 text-sm animate-pulse">Loading activity...</div>
                )}
              </div>
            </motion.div>

          </div>

          {/* Right Column - Stats & History (Col Span 1) */}
          <div className="space-y-8">
            
            {/* Quick Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500 mb-2" />
                <div className="text-2xl font-bold text-white">{stats.currentStreak}</div>
                <div className="text-xs text-slate-400">Day Streak</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" />
                <div className="text-2xl font-bold text-white">{stats.solvedToday}</div>
                <div className="text-xs text-slate-400">Solved Today</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-400 mb-2" />
                <div className="text-xl font-bold text-white">{stats.acceptanceRate}%</div>
                <div className="text-xs text-slate-400">Acceptance</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center">
                <Award className="w-6 h-6 text-yellow-500 mb-2" />
                <div className="text-2xl font-bold text-white">{stats.longestStreak}</div>
                <div className="text-xs text-slate-400">Max Streak</div>
              </div>
            </motion.div>

            {/* Detailed Progress */}
            <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Difficulty Progress</h2>
              
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * percentComplete) / 100} className="text-indigo-500 transition-all duration-1000" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold text-white">{percentComplete}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries({ easy: stats.easy, medium: stats.medium, hard: stats.hard }).map(([diff, data]) => (
                  <div key={diff} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize text-slate-300 font-medium">{diff}</span>
                      <span className="text-slate-400"><span className="text-white font-medium">{data.solved}</span> / {data.total}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-1000", diff === 'easy' ? 'bg-emerald-400' : diff === 'medium' ? 'bg-amber-400' : 'bg-rose-400')}
                        style={{ width: `${(data.solved / data.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Submissions */}
            <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Recent Submissions</h2>
              </div>
              <div className="space-y-3">
                {recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-sm text-slate-200 truncate">{attempt.title}</h4>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className={cn("font-medium", attempt.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400')}>
                        {attempt.status}
                      </span>
                      <span className="text-slate-500">{attempt.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
