// backend/src/features/user/repository.ts
import prisma from '../../db/client';

export class UserRepository {
  /**
   * Upsert a user from Clerk session data.
   * Creates if not exists, updates email/name/image if changed.
   * Includes defensive fallback for stale in-memory PrismaClient instances.
   */
  static async upsertUser(id: string, email: string, name?: string, image?: string) {
    try {
      return await prisma.user.upsert({
        where: { id },
        update: {
          email,
          name: name ?? null,
          image: image ?? null,
        },
        create: {
          id,
          email,
          name: name ?? null,
          image: image ?? null,
          role: 'candidate',
          profileCompleted: false,
        },
      });
    } catch (err: unknown) {
      const error = err as Error;
      if (error?.message?.includes('image') || error?.message?.includes('Unknown argument')) {
        // Fallback for stale cached Prisma Client instance in dev server memory
        return await prisma.user.upsert({
          where: { id },
          update: {
            email,
            name: name ?? null,
          },
          create: {
            id,
            email,
            name: name ?? null,
            role: 'candidate',
            profileCompleted: false,
          },
        });
      }
      throw err;
    }
  }

  /**
   * Check if a user has completed onboarding.
   */
  static async isProfileCompleted(id: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { profileCompleted: true },
    });
    return user?.profileCompleted ?? false;
  }

  /**
   * Save onboarding profile data and mark profile as completed.
   * If already completed, enforces the 3-day edit window limit.
   */
  static async saveProfile(
    userId: string,
    data: {
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
    }
  ) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (existingUser?.profileCompleted) {
      const completionDate =
        existingUser.profileCompletedAt || existingUser.profile?.createdAt || existingUser.createdAt;
      const EDIT_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
      const elapsedMs = Date.now() - new Date(completionDate).getTime();
      if (elapsedMs > EDIT_WINDOW_MS) {
        throw new Error('Profile editing window (3 days post-onboarding) has expired.');
      }
    }

    const completionTimestamp =
      existingUser?.profileCompletedAt ||
      existingUser?.profile?.createdAt ||
      new Date();

    const [profile] = await prisma.$transaction([
      prisma.userProfile.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          profileCompleted: true,
          profileCompletedAt: completionTimestamp,
        },
      }),
    ]);
    return profile;
  }

  /**
   * Get user onboarding status, saved profile details, and edit window status.
   */
  static async getOnboardingDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const EDIT_WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

    if (!user) {
      return {
        profileCompleted: false,
        profileCompletedAt: null,
        canEdit: true,
        remainingTimeMs: EDIT_WINDOW_MS,
        profile: null,
      };
    }

    if (!user.profileCompleted) {
      return {
        profileCompleted: false,
        profileCompletedAt: null,
        canEdit: true,
        remainingTimeMs: EDIT_WINDOW_MS,
        profile: user.profile
          ? {
              college: user.profile.college ?? undefined,
              degree: user.profile.degree ?? undefined,
              branch: user.profile.branch ?? undefined,
              graduationYear: user.profile.graduationYear ?? undefined,
              cgpa: user.profile.cgpa ?? undefined,
              interestedRoles: user.profile.interestedRoles ?? [],
              languagesKnown: user.profile.languagesKnown ?? [],
              preferredLang: user.profile.preferredLang ?? undefined,
              github: user.profile.github ?? undefined,
              linkedin: user.profile.linkedin ?? undefined,
              leetcode: user.profile.leetcode ?? undefined,
              codeforces: user.profile.codeforces ?? undefined,
              interests: user.profile.interests ?? [],
              resumeUrl: user.profile.resumeUrl ?? undefined,
            }
          : null,
      };
    }

    const completionDate =
      user.profileCompletedAt || user.profile?.createdAt || user.createdAt;
    const elapsedMs = Date.now() - new Date(completionDate).getTime();
    const canEdit = elapsedMs <= EDIT_WINDOW_MS;
    const remainingTimeMs = Math.max(0, EDIT_WINDOW_MS - elapsedMs);

    return {
      profileCompleted: true,
      profileCompletedAt: new Date(completionDate).toISOString(),
      canEdit,
      remainingTimeMs,
      profile: user.profile
        ? {
            college: user.profile.college ?? undefined,
            degree: user.profile.degree ?? undefined,
            branch: user.profile.branch ?? undefined,
            graduationYear: user.profile.graduationYear ?? undefined,
            cgpa: user.profile.cgpa ?? undefined,
            interestedRoles: user.profile.interestedRoles ?? [],
            languagesKnown: user.profile.languagesKnown ?? [],
            preferredLang: user.profile.preferredLang ?? undefined,
            github: user.profile.github ?? undefined,
            linkedin: user.profile.linkedin ?? undefined,
            leetcode: user.profile.leetcode ?? undefined,
            codeforces: user.profile.codeforces ?? undefined,
            interests: user.profile.interests ?? [],
            resumeUrl: user.profile.resumeUrl ?? undefined,
          }
        : null,
    };
  }

  /**
   * Get user profile data.
   */
  static async getProfile(userId: string) {
    return prisma.userProfile.findUnique({ where: { userId } });
  }

  /**
   * Find user with all platform relations for dashboard stats.
   */
  static async findUniqueWithRelations(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        progress: true,
        resumes: true,
        interviews: true,
      },
    });
  }
}
