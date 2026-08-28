'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isWorkspace = pathname.startsWith('/dsa/workspace');

  if (isWorkspace) {
    return (
      <main className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[#070b14]">
        {children}
      </main>
    );
  }

  return (
    <main className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto bg-transparent">
      <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 sm:py-7 lg:px-9 lg:py-9">
        {children}
      </div>
    </main>
  );
}
