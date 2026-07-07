// src/components/FilterBar.tsx
'use client';

import { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    status: 'all',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-900/50 shadow-xl space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
        <Filter className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-bold text-slate-200">Filter Questions</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Category Select */}
        <div className="relative">
          <select 
            className="w-full bg-slate-950/60 hover:bg-slate-950/90 text-slate-200 text-xs border border-slate-900 rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-1 focus:ring-violet-500/50 cursor-pointer transition-all"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="JavaScript">JavaScript</option>
            <option value="React">React</option>
            <option value="Node.js">Node.js</option>
            <option value="CSS">CSS</option>
            <option value="Algorithms">Algorithms</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-3 w-3 h-3 text-slate-500 pointer-events-none" />
        </div>
        
        {/* Difficulty Select */}
        <div className="relative">
          <select 
            className="w-full bg-slate-950/60 hover:bg-slate-950/90 text-slate-200 text-xs border border-slate-900 rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-1 focus:ring-violet-500/50 cursor-pointer transition-all"
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          >
            <option value="all">All Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-3 w-3 h-3 text-slate-500 pointer-events-none" />
        </div>
        
        {/* Status Select */}
        <div className="relative">
          <select 
            className="w-full bg-slate-950/60 hover:bg-slate-950/90 text-slate-200 text-xs border border-slate-900 rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-1 focus:ring-violet-500/50 cursor-pointer transition-all"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-3 w-3 h-3 text-slate-500 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}