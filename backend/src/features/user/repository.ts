// backend/src/features/user/repository.ts
import prisma from '../../db/client';

export class UserRepository {
  static async upsertUser(id: string, email: string, name?: string) {
    return prisma.user.upsert({
      where: { id },
      update: {
        email,
        name: name || null,
      },
      create: {
        id,
        email,
        name: name || null,
        role: 'candidate',
      },
    });
  }

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
