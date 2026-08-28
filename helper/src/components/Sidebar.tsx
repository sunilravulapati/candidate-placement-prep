'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mic2,
  Code2,
  BookOpen,
  BarChart3,
  Menu,
  X,
  Sparkles,
  Brain,
  ChevronLeft,
  ChevronRight,
  Building2,
  FileText,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sidebar_collapsed');
    if (stored === 'true') setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebar_collapsed', String(nextState));
  };

  const navGroups = [
    {
      label: 'Overview',
      items: [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'Prepare',
      items: [
        {
          name: 'Company Prep',
          href: '/company-prep',
          icon: Building2,
          badge: 'NEW',
        },
        { name: 'DSA Studio', href: '/dsa', icon: Code2 },
        { name: 'Aptitude', href: '/aptitude', icon: Brain },
        {
          name: 'Resume Studio',
          href: '/resume-studio',
          icon: Sparkles,
          badge: 'v1',
        },
        {
          name: 'Mock Interviews',
          href: '/mock-interviews',
          icon: Mic2,
          badge: 'v1',
        },
      ],
    },
    {
      label: 'Explore',
      items: [
        {
          name: 'Knowledge Hub',
          href: '/knowledge-hub',
          icon: BookOpen,
          badge: 'Soon',
        },
        {
          name: 'Analytics',
          href: '/analytics',
          icon: BarChart3,
          badge: 'Soon',
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/') return true;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 rounded-2xl border border-slate-700/70 bg-slate-950/90 p-3 text-slate-100 shadow-2xl shadow-black/30 backdrop-blur-xl"
        aria-label="Toggle navigation"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm"
        />
      )}

      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 bottom-0 z-40 flex h-screen shrink-0 flex-col border-r border-slate-800/70 bg-slate-950/75 backdrop-blur-2xl transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-[88px]' : 'w-[280px]',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <button
          onClick={toggleCollapse}
          className="hidden md:flex absolute -right-3 top-7 z-50 h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow-lg transition-colors hover:border-violet-500/50 hover:bg-slate-800 hover:text-white"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <div
          className={cn(
            'flex min-h-[88px] shrink-0 items-center border-b border-slate-800/70',
            isCollapsed ? 'justify-center px-0' : 'gap-3 px-6',
          )}
        >
          <div className="relative shrink-0 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 p-[1px] shadow-lg shadow-indigo-950/50">
            <div className="rounded-[15px] bg-slate-950 p-2.5">
              <Sparkles className="h-5 w-5 text-violet-200" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="min-w-0 overflow-hidden">
              <h1 className="truncate text-[19px] font-extrabold tracking-tight text-white">
                PrepGenie
              </h1>
              <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/80">
                Placement OS
              </p>
            </div>
          )}
        </div>

        <nav
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden',
            isCollapsed ? 'px-3 py-5' : 'px-4 py-6',
          )}
        >
          {navGroups.map((group) => (
            <div key={group.label} className="mb-7 last:mb-0">
              {!isCollapsed && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                  {group.label}
                </p>
              )}
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'group relative flex items-center rounded-2xl text-sm font-semibold transition-all duration-200',
                        isCollapsed
                          ? 'mx-auto h-12 w-12 justify-center'
                          : 'w-full gap-3 px-3.5 py-3',
                        active
                          ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/10 text-violet-100 shadow-inner shadow-violet-400/5 ring-1 ring-inset ring-violet-400/25'
                          : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-200',
                      )}
                    >
                      {active && (
                        <span className="absolute -left-4 h-7 w-1 rounded-r-full bg-gradient-to-b from-violet-300 to-indigo-500" />
                      )}
                      <Icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110',
                          active
                            ? 'text-violet-300'
                            : 'text-slate-500 group-hover:text-slate-300',
                        )}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="min-w-0 flex-1 truncate">
                            {item.name}
                          </span>
                          {item.badge && (
                            <span
                              className={cn(
                                'rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider',
                                item.badge === 'Soon'
                                  ? 'bg-slate-800/80 text-slate-500'
                                  : item.badge === 'NEW'
                                    ? 'bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-inset ring-fuchsia-400/20'
                                    : 'bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-400/20',
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {isCollapsed && (
                        <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 opacity-0 shadow-2xl transition-all group-hover:pointer-events-auto group-hover:opacity-100">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-800/70 p-4">
          <div
            className={cn(
              'rounded-2xl border border-slate-800/80 bg-slate-900/55',
              isCollapsed ? 'flex justify-center p-3' : 'p-3.5',
            )}
          >
            {!isCollapsed ? (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-200">
                    Workspace Sandbox
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">
                    v1.0.0 · Beta
                  </p>
                </div>
                <Settings2 className="h-4 w-4 text-slate-600" />
              </div>
            ) : (
              <div
                className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50"
                title="System online"
              />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
