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
    const [profile] = await prisma.$transaction([
      prisma.userProfile.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { profileCompleted: true },
      }),
    ]);
    return profile;
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
