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
      <main className="flex-1 min-w-0 w-full h-full min-h-0 overflow-hidden flex flex-col bg-[#030712]">
        {children}
      </main>
    );
  }

  return (
    <main className="flex-1 min-w-0 w-full h-full min-h-0 overflow-y-auto bg-[#030712]">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 w-full pb-12">
        {children}
      </div>
    </main>
  );
}
