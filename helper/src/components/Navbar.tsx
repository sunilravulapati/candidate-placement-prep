'use client';

import { usePathname } from 'next/navigation';
import { UserButton, SignInButton, Show } from '@clerk/nextjs';
import { Bell, Search, User, Command } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/dashboard' || pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/dsa/workspace')) return 'DSA Studio';
    if (pathname.startsWith('/questions') || pathname.startsWith('/dsa'))
      return 'DSA Practice';
    if (pathname.startsWith('/resume-ai')) return 'Resume AI';
    if (pathname.startsWith('/resume-tailoring')) return 'Resume Tailoring';
    if (pathname.startsWith('/resume-editor')) return 'Resume Editor';
    if (pathname.startsWith('/resume-studio')) return 'Resume Studio';
    if (pathname.startsWith('/aptitude')) return 'Aptitude';
    if (pathname.startsWith('/mock-interviews')) return 'Mock Interviews';
    if (pathname.startsWith('/knowledge-hub')) return 'Knowledge Hub';
    if (pathname.startsWith('/company-prep')) return 'Company Prep';
    if (pathname.startsWith('/analytics')) return 'Analytics';
    return 'PrepGenie';
  };

  return (
    <header className="sticky top-0 z-30 flex w-full shrink-0 items-center justify-between border-b border-slate-800/70 bg-slate-950/65 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-9">
      <div className="pl-12 md:pl-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
          Workspace
        </p>
        <h2 className="mt-0.5 text-lg font-extrabold tracking-tight text-white">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden h-10 w-64 items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/55 px-3 text-slate-500 transition focus-within:border-violet-400/40 focus-within:ring-2 focus-within:ring-violet-400/10 sm:flex">
          <Search className="h-4 w-4 shrink-0" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-600"
            disabled
          />
          <span className="hidden items-center gap-1 rounded-md border border-slate-700/80 bg-slate-800/70 px-1.5 py-1 text-[9px] font-bold text-slate-500 lg:flex">
            <Command className="h-2.5 w-2.5" />K
          </span>
        </div>

        <button
          className="relative rounded-xl border border-slate-800/80 bg-slate-900/55 p-2.5 text-slate-500 transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-400 ring-2 ring-slate-950" />
        </button>

        <div className="ml-1 flex h-9 items-center border-l border-slate-800/80 pl-3 sm:ml-2 sm:pl-4">
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox:
                    'h-8 w-8 rounded-xl border border-violet-500/30 shadow-md shadow-violet-950/20 transition-all hover:border-violet-400/60',
                  userButtonPopoverCard:
                    '!bg-slate-950/95 !backdrop-blur-xl !border !border-slate-800/80 !text-slate-100 !shadow-2xl !rounded-2xl p-1',
                  userPreview: '!border-b !border-slate-800/60 !py-3 !px-3.5',
                  userPreviewMainIdentifier: '!text-slate-100 !font-bold !text-sm',
                  userPreviewSecondaryIdentifier: '!text-slate-400 !text-xs !font-medium',
                  userButtonPopoverActionButton:
                    '!text-slate-200 hover:!bg-slate-900/90 hover:!text-white !rounded-xl !py-2.5 !px-3 transition-colors',
                  userButtonPopoverActionButtonText: '!text-slate-200 !font-semibold !text-xs',
                  userButtonPopoverActionButtonIcon: '!text-violet-400',
                  userButtonPopoverCustomMenuItem: '!text-slate-200 hover:!bg-slate-900/90 hover:!text-white !rounded-xl !py-2.5 !px-3 transition-colors',
                  userButtonPopoverFooter: '!hidden',
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Onboarding & Profile"
                  href="/onboarding"
                  labelIcon={<User className="h-4 w-4 text-violet-400" />}
                />
              </UserButton.MenuItems>
            </UserButton>
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:from-violet-400 hover:to-indigo-400">
                Sign in
              </button>
            </SignInButton>
          </Show>
        </div>
      </div>
    </header>
  );
}