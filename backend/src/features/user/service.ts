// backend/src/features/user/service.ts
import { UserRepository } from './repository';
import prisma from '../../db/client';

export class UserService {
  /**
   * Sync a Clerk user into Prisma. Creates if new, updates if changed.
   * Also initializes CodingProgress for the user if not already present.
   */
  static async syncUser(clerkUserId: string, email: string, name?: string, image?: string) {
    const user = await UserRepository.upsertUser(clerkUserId, email, name, image);

    // Ensure CodingProgress record exists so dashboard never fails
    await prisma.codingProgress.upsert({
      where: { userId: clerkUserId },
      update: {},
      create: { userId: clerkUserId },
    });

    return user;
  }

  /**
   * Check if the user has completed onboarding.
   */
  static async isProfileCompleted(userId: string): Promise<boolean> {
    return UserRepository.isProfileCompleted(userId);
  }

  /**
   * Save onboarding profile and mark as completed.
   */
  static async saveOnboardingProfile(
    userId: string,
    data: Parameters<typeof UserRepository.saveProfile>[1]
  ) {
    return UserRepository.saveProfile(userId, data);
  }

  /**
   * Get the user's onboarding profile data.
   */
  static async getProfile(userId: string) {
    return UserRepository.getProfile(userId);
  }

  /**
   * Get user onboarding status, saved profile details, and edit window status.
   */
  static async getOnboardingDetails(userId: string) {
    return UserRepository.getOnboardingDetails(userId);
  }

  /**
   * Get user with dashboard statistics.
   */
  static async getUserProfile(userId: string) {
    const user = await UserRepository.findUniqueWithRelations(userId);
    if (!user) return null;

    const totalSolved = user.progress.filter((p) => p.status === 'completed').length;
    const inProgress = user.progress.filter((p) => p.status === 'in_progress').length;

    const latestResumeScore =
      user.resumes.length > 0 ? user.resumes[user.resumes.length - 1].atsScore : null;

    const averageInterviewScore =
      user.interviews.length > 0
        ? Math.round(
            user.interviews.reduce((acc, val) => acc + (val.score ?? 0), 0) /
              user.interviews.length
          )
        : null;

    return {
      ...user,
      stats: { totalSolved, inProgress, latestResumeScore, averageInterviewScore },
    };
  }
}
