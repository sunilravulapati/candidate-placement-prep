// src/components/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  Code2, 
  BookOpen, 
  BarChart3, 
  CalendarDays, 
  Menu, 
  X,
  Sparkles,
  Brain
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume AI', href: '/resume-ai', icon: FileText, badge: 'AI' },
    { name: 'Resume Tailoring', href: '/resume-tailoring', icon: Sparkles, badge: 'NEW' },
    { name: 'DSA Practice', href: '/questions', icon: Code2 },
    { name: 'Aptitude', href: '/aptitude', icon: Brain, badge: 'NEW' },
    { name: 'Mock Interviews', href: '/mock-interviews', icon: Video, badge: 'AI' },
    { name: 'Knowledge Hub', href: '/knowledge-hub', icon: BookOpen, badge: 'Soon' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, badge: 'Soon' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/') return true;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-100 p-2.5 rounded-xl shadow-lg focus:outline-none"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed md:sticky top-0 left-0 bottom-0 z-45
        w-64 glass-panel border-r border-slate-900/50 flex flex-col h-screen
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-6 flex items-center space-x-3 border-b border-slate-900/50">
          <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 font-sans tracking-tight">
              PrepGenie
            </h1>
            <p className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Placement OS</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${active 
                    ? 'bg-violet-600/10 text-violet-400 border border-violet-500/20' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border border-transparent'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider scale-90 ${
                    item.badge === 'Soon' 
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : item.badge === 'NEW'
                      ? 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/20'
                      : 'bg-violet-600/20 text-violet-400 border border-violet-500/20'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-900/50">
          <div className="bg-slate-950/60 border border-slate-900/50 p-4 rounded-xl flex items-center space-x-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-300 truncate">Workspace Sandbox</p>
              <p className="text-[10px] text-slate-500 truncate">v1.0.0 (Beta)</p>
            </div>
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/40"></div>
          </div>
        </div>
      </aside>
    </>
  );
}
