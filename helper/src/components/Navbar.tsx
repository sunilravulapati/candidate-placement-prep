// src/components/Navbar.tsx
'use client';

import { usePathname } from 'next/navigation';
import { UserButton, SignInButton, Show } from '@clerk/nextjs';
import { Bell, Search, User } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/dashboard' || pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/dsa/workspace')) return 'DSA Studio';
    if (pathname.startsWith('/questions') || pathname.startsWith('/dsa')) return 'DSA Practice';
    if (pathname.startsWith('/resume-ai')) return 'Resume AI';
    if (pathname.startsWith('/resume-tailoring')) return 'Resume Tailoring';
    if (pathname.startsWith('/resume-editor')) return 'Resume Editor';
    if (pathname.startsWith('/aptitude')) return 'Aptitude';
    if (pathname.startsWith('/mock-interviews')) return 'Mock Interviews';
    if (pathname.startsWith('/knowledge-hub')) return 'Knowledge Hub';
    if (pathname.startsWith('/analytics')) return 'Analytics';
    return 'PrepGenie';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/40 backdrop-blur-md border-b border-slate-900/60 px-6 py-3.5 flex justify-between items-center shrink-0">
      {/* Page Title Context */}
      <div className="pl-12 md:pl-0">
        <h2 className="text-lg font-bold text-slate-100 font-sans tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      {/* Actions and Profile */}
      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 w-60">
          <Search className="w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search questions or topics..." 
            className="bg-transparent text-xs text-slate-300 placeholder-slate-500 focus:outline-none w-full"
            disabled
          />
        </div>

        {/* Notifications Mock */}
        <button
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Clerk Auth Integration */}
        <div className="border-l border-slate-800 pl-4 h-6 flex items-center">
          <Show when="signed-in">
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 rounded-xl border border-indigo-500/30",
                  userButtonPopoverCard: "bg-slate-900 border border-slate-800 shadow-2xl text-slate-100",
                  userButtonPopoverActionButton: "hover:bg-slate-800 text-slate-200",
                  userButtonPopoverActionButtonText: "text-slate-200",
                  userButtonPopoverFooter: "hidden"
                }
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Onboarding & Profile"
                  href="/onboarding"
                  labelIcon={<User className="w-4 h-4 text-violet-400" />}
                />
              </UserButton.MenuItems>
            </UserButton>
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all duration-200 shadow-md shadow-indigo-500/10">
                Sign In
              </button>
            </SignInButton>
          </Show>
        </div>
      </div>
    </header>
  );
}