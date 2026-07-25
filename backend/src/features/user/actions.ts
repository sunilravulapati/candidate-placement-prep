// backend/src/features/user/actions.ts
'use server';

import { requireSessionUser } from '../../auth/session';
import { UserService } from './service';

/**
 * Called on every app load to sync Clerk user into Prisma.
 * Safe to call multiple times — upsert ensures idempotency.
 */
export async function syncUserAction() {
  const user = await requireSessionUser();
  return UserService.syncUser(user.id, user.email, user.name, user.image);
}

/**
 * Check whether the current user has completed onboarding.
 */
export async function checkOnboardingStatusAction(): Promise<boolean> {
  const user = await requireSessionUser();
  return UserService.isProfileCompleted(user.id);
}

/**
 * Save onboarding profile data and mark profile as completed.
 */
export async function saveOnboardingProfileAction(data: {
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  cgpa?: number;
  interestedRoles?: string[];
  languagesKnown?: string[];
  github?: string;
  linkedin?: string;
  leetcode?: string;
  codeforces?: string;
  interests?: string[];
  preferredLang?: string;
  resumeUrl?: string;
}) {
  const user = await requireSessionUser();
  return UserService.saveOnboardingProfile(user.id, data);
}

/**
 * Get the current user's onboarding profile data.
 */
export async function getProfileAction() {
  const user = await requireSessionUser();
  return UserService.getProfile(user.id);
}

/**
 * Get the current user's full profile with dashboard statistics.
 */
export async function getUserProfileAction() {
  const user = await requireSessionUser();
  return UserService.getUserProfile(user.id);
}
