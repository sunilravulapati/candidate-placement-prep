import React from 'react';
import { Metadata } from 'next';
import { getSessionUser } from '@backend/auth/session';
import { getUserProblemStatuses } from '@backend/features/liveCoding/repository';
import {
  OAEssentialsRegistry,
} from '@backend/features/dsa/oaEssentialsData';
import OAEssentialsExplorer from '@/components/dsa/OAEssentialsExplorer';

export const metadata: Metadata = {
  title: 'OA Essentials — Curated Online Assessment DSA Patterns | PrepGenie',
  description:
    'Master the 70 highest-yield Online Assessment (OA) coding interview patterns with 15-second diagnostic signals, false-friend traps, and real-time execution.',
};

export const dynamic = 'force-dynamic';

export default async function OAEssentialsPage() {
  const user = await getSessionUser();
  const effectiveUserId = user?.id || 'user_demo';

  let solvedSlugs: string[] = [];
  try {
    const { solved } = await getUserProblemStatuses(effectiveUserId);
    solvedSlugs = Array.from(solved);
  } catch (error) {
    console.error('Failed to load user problem statuses for OA Essentials:', error);
  }

  const problems = OAEssentialsRegistry.getAllProblems();
  const playbooks = OAEssentialsRegistry.getPlaybooks();

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <OAEssentialsExplorer
        problems={problems}
        playbooks={playbooks}
        solvedSlugs={solvedSlugs}
      />
    </div>
  );
}
