'use client';

import { useState } from 'react';
import { 
  Brain, 
  Calculator, 
  BookA, 
  Target, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Play, 
  Lock,
  BarChart,
  History
} from 'lucide-react';
import Link from 'next/link';

// Mock Data
const stats = {
  overallProgress: 35,
  quantMastery: 42,
  verbalMastery: 28,
  testsTaken: 12,
  avgScore: 76,
  streak: 4
};

const quantTopics = [
  { id: 1, name: 'Arithmetic', count: 45, progress: 80, difficulty: 'Medium', color: 'from-blue-500/20 to-cyan-500/5', icon: Calculator },
  { id: 2, name: 'Algebra', count: 30, progress: 40, difficulty: 'Hard', color: 'from-violet-500/20 to-fuchsia-500/5', icon: Calculator },
  { id: 3, name: 'Probability', count: 25, progress: 10, difficulty: 'Hard', color: 'from-emerald-500/20 to-teal-500/5', icon: Target },
  { id: 4, name: 'Data Interpretation', count: 50, progress: 60, difficulty: 'Medium', color: 'from-amber-500/20 to-orange-500/5', icon: BarChart },
  { id: 5, name: 'Logical Reasoning', count: 60, progress: 25, difficulty: 'Easy', color: 'from-rose-500/20 to-pink-500/5', icon: Brain },
  { id: 6, name: 'Puzzles', count: 20, progress: 0, difficulty: 'Hard', color: 'from-indigo-500/20 to-blue-500/5', icon: Brain },
];

const verbalTopics = [
  { id: 1, name: 'Grammar', count: 40, progress: 55, difficulty: 'Medium', color: 'from-emerald-500/20 to-teal-500/5', icon: BookA },
  { id: 2, name: 'Vocabulary', count: 100, progress: 30, difficulty: 'Easy', color: 'from-blue-500/20 to-cyan-500/5', icon: BookA },
  { id: 3, name: 'Reading Comprehension', count: 25, progress: 15, difficulty: 'Hard', color: 'from-violet-500/20 to-fuchsia-500/5', icon: BookA },
  { id: 4, name: 'Sentence Correction', count: 35, progress: 45, difficulty: 'Medium', color: 'from-amber-500/20 to-orange-500/5', icon: Target },
  { id: 5, name: 'Communication Skills', count: 15, progress: 0, difficulty: 'Medium', color: 'from-rose-500/20 to-pink-500/5', icon: Brain },
  { id: 6, name: 'HR English', count: 20, progress: 0, difficulty: 'Easy', color: 'from-indigo-500/20 to-blue-500/5', icon: Target },
];

const mixedTests = [
  { id: 1, name: 'TCS NQT Mock 1', duration: '90 mins', questions: 65, difficulty: 'Medium', locked: false, type: 'Company Specific' },
  { id: 2, name: 'Infosys Pseudo Code + Quant', duration: '60 mins', questions: 40, difficulty: 'Hard', locked: true, type: 'Company Specific' },
  { id: 3, name: 'General Aptitude Mini-Test', duration: '30 mins', questions: 20, difficulty: 'Easy', locked: false, type: 'General' },
  { id: 4, name: 'Full Placement Simulator', duration: '120 mins', questions: 100, difficulty: 'Hard', locked: true, type: 'Full Assessment' },
];

export default function AptitudeModule() {
  const [activeTab, setActiveTab] = useState<'quant' | 'verbal' | 'mixed'>('quant');

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-fuchsia-900/40 via-violet-900/30 to-slate-900/20 border border-fuchsia-500/10 p-6 md:p-8 rounded-3xl backdrop-blur-md">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full px-3 py-1 mb-3">
              <Brain className="w-3.5 h-3.5 text-fuchsia-400" />
              <span className="text-xs font-semibold text-fuchsia-300 uppercase tracking-wider">Placement Aptitude</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Master the First Round.
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">
              Companies filter 70% of candidates in the aptitude and verbal rounds. Build your speed, accuracy, and confidence with our curated topic-wise practice.
            </p>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 min-w-[200px]">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-fuchsia-500" strokeDasharray="125" strokeDashoffset={125 - (125 * stats.overallProgress) / 100} />
              </svg>
              <span className="absolute text-xs font-bold text-white">{stats.overallProgress}%</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Overall Progress</p>
              <p className="text-sm font-bold text-slate-200">Keep it up!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20 text-blue-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Quant Mastery</p>
            <p className="text-lg font-bold text-slate-200">{stats.quantMastery}%</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
            <BookA className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Verbal Mastery</p>
            <p className="text-lg font-bold text-slate-200">{stats.verbalMastery}%</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Avg Mock Score</p>
            <p className="text-lg font-bold text-slate-200">{stats.avgScore}</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="bg-violet-500/10 p-2.5 rounded-xl border border-violet-500/20 text-violet-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Tests Taken</p>
            <p className="text-lg font-bold text-slate-200">{stats.testsTaken}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-px overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('quant')}
          className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'quant' 
              ? 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/5 rounded-t-lg' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-t-lg'
          }`}
        >
          Quantitative Aptitude
        </button>
        <button
          onClick={() => setActiveTab('verbal')}
          className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'verbal' 
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 rounded-t-lg' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-t-lg'
          }`}
        >
          Verbal Ability & English
        </button>
        <button
          onClick={() => setActiveTab('mixed')}
          className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'mixed' 
              ? 'border-violet-500 text-violet-400 bg-violet-500/5 rounded-t-lg' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-t-lg'
          }`}
        >
          Mixed Placement Tests
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* Left Area: Topic Grid / Test List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quantitative Tab Content */}
          {activeTab === 'quant' && (
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Quant Topics</h2>
                  <p className="text-xs text-slate-400 mt-1">Master foundational math to crack top tier technical interviews.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quantTopics.map((topic) => (
                  <div key={topic.id} className="glass-card p-5 rounded-2xl group hover:bg-slate-900/80 transition-all border border-slate-800 hover:border-slate-700 cursor-pointer relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl shadow-inner">
                          <topic.icon className="w-4 h-4 text-slate-300" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                          ${topic.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' : 
                            topic.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 
                            'bg-rose-500/10 text-rose-400'}`}
                        >
                          {topic.difficulty}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-200 mb-1">{topic.name}</h3>
                      <p className="text-xs text-slate-500 mb-4">{topic.count} Questions</p>
                      
                      <div className="mt-auto">
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1.5">
                          <span>Progress</span>
                          <span>{topic.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div className={`h-full rounded-full transition-all duration-1000 ${topic.progress > 0 ? 'bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'bg-transparent'}`} style={{ width: `${topic.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verbal Tab Content */}
          {activeTab === 'verbal' && (
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Verbal & English</h2>
                  <p className="text-xs text-slate-400 mt-1">Enhance communication skills to clear HR rounds and written assessments.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {verbalTopics.map((topic) => (
                  <div key={topic.id} className="glass-card p-5 rounded-2xl group hover:bg-slate-900/80 transition-all border border-slate-800 hover:border-slate-700 cursor-pointer relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl shadow-inner">
                          <topic.icon className="w-4 h-4 text-slate-300" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                          ${topic.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' : 
                            topic.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 
                            'bg-rose-500/10 text-rose-400'}`}
                        >
                          {topic.difficulty}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-200 mb-1">{topic.name}</h3>
                      <p className="text-xs text-slate-500 mb-4">{topic.count} Questions</p>
                      
                      <div className="mt-auto">
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1.5">
                          <span>Progress</span>
                          <span>{topic.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div className={`h-full rounded-full transition-all duration-1000 ${topic.progress > 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-transparent'}`} style={{ width: `${topic.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mixed Tests Tab Content */}
          {activeTab === 'mixed' && (
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Mock Assessments</h2>
                  <p className="text-xs text-slate-400 mt-1">Timed company-specific and general aptitude mock exams.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {mixedTests.map((test) => (
                  <div key={test.id} className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:bg-slate-900/80 transition-colors border border-slate-800">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl border flex-shrink-0 ${test.locked ? 'bg-slate-900/50 border-slate-800 text-slate-600' : 'bg-violet-500/10 border-violet-500/20 text-violet-400'}`}>
                        {test.locked ? <Lock className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className={`text-base font-bold mb-1 ${test.locked ? 'text-slate-400' : 'text-slate-200'}`}>{test.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {test.duration}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                          <span>{test.questions} Questions</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                          <span className="text-violet-400">{test.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      disabled={test.locked}
                      className={`shrink-0 px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2
                        ${test.locked 
                          ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800' 
                          : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20'
                        }`}
                    >
                      {test.locked ? 'Locked' : 'Start Test'}
                      {!test.locked && <Play className="w-3.5 h-3.5 fill-current" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar: Recommended & Activity */}
        <div className="space-y-6">
          
          {/* Recommended Practice */}
          <div className="glass-card p-6 rounded-2xl space-y-4 border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-900/10 to-transparent">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-fuchsia-400" />
              Recommended Practice
            </h3>
            <p className="text-xs text-slate-400">Based on your recent mock test, focus on improving your speed in Arithmetic.</p>
            
            <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-fuchsia-500/30 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-sm text-slate-200">Arithmetic Speed Drill</h4>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-fuchsia-400 transition-colors" />
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>15 mins</span>
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <span>20 Questions</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              Recent Practice
            </h3>
            
            <div className="relative pl-4 space-y-5 before:absolute before:inset-y-0 before:left-[7px] before:w-[2px] before:bg-slate-800">
              
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-fuchsia-500 rounded-full border-2 border-[#030712] ring-2 ring-fuchsia-500/20"></div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Sentence Correction Practice</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Score: 12/15 • Accuracy: 80%</p>
                  <p className="text-[10px] text-slate-500 mt-1">Today, 2:30 PM</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-slate-600 rounded-full border-2 border-[#030712] ring-2 ring-slate-500/20"></div>
                <div>
                  <p className="text-xs font-bold text-slate-200">TCS Mock Test 1</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Score: 68/100 • Percentile: 72</p>
                  <p className="text-[10px] text-slate-500 mt-1">Yesterday, 10:15 AM</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-slate-600 rounded-full border-2 border-[#030712] ring-2 ring-slate-500/20"></div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Data Interpretation Basics</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Completed 10 questions</p>
                  <p className="text-[10px] text-slate-500 mt-1">Oct 12, 2026</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
