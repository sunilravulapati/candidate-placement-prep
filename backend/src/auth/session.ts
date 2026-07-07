// backend/src/auth/session.ts
import { currentUser } from '@clerk/nextjs/server';

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
}

/**
 * Gets the current active session user. If Clerk authentication keys are
 * not configured or user is not logged in, returns a mock user for seamless local testing.
 */
export async function getSessionUser(): Promise<SessionUser> {
  try {
    const user = await currentUser();
    if (user) {
      const email = user.emailAddresses[0]?.emailAddress || '';
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined;
      return {
        id: user.id,
        email,
        name,
      };
    }
  } catch (error) {
    console.warn(
      'Clerk keys not configured or auth not initialized. Falling back to local test session. Reason:',
      (error as Error).message
    );
  }

  // Fallback to default local developer test session
  return {
    id: 'user_test_123',
    email: 'candidate@prepgenie.dev',
    name: 'Test Candidate',
  };
}
