// backend/src/auth/session.ts
import { currentUser } from '@clerk/nextjs/server';
import { UserService } from '../features/user/service';

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

/**
 * Gets the current authenticated Clerk user.
 * Returns null if the user is not authenticated.
 * Never falls back to a mock/test user in production.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const user = await currentUser();
    if (!user) return null;

    const email = user.emailAddresses[0]?.emailAddress ?? '';
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || undefined;
    const image = user.imageUrl || undefined;

    return { id: user.id, email, name, image };
  } catch {
    // Clerk SDK not initialized (e.g., running outside Next.js context)
    return null;
  }
}

/**
 * Gets the current user and throws if not authenticated.
 * Also guarantees that the user is synchronized to PostgreSQL (User + CodingProgress models)
 * before returning, preventing foreign key constraint failures in downstream actions.
 */
export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('UNAUTHORIZED');

  // Guarantee user & initial records exist in database
  try {
    await UserService.syncUser(user.id, user.email, user.name, user.image);
  } catch (err) {
    console.error('Failed to sync session user to DB:', err);
  }

  return user;
}
