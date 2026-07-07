// backend/src/features/user/actions.ts
'use server';

import { getSessionUser } from '../../auth/session';
import { UserService } from './service';
import { userIdSchema } from './schema';

export async function syncUserAction() {
  const user = await getSessionUser();
  if (user) {
    // Validate session user id
    const parsedId = userIdSchema.safeParse(user.id);
    if (!parsedId.success) {
      throw new Error('Invalid Clerk User ID from session');
    }
    return UserService.syncUserWithClerk(parsedId.data, user.email, user.name);
  }
  return null;
}

export async function getUserProfileAction() {
  const user = await getSessionUser();
  if (!user) return null;
  
  // Validate session user id
  const parsedId = userIdSchema.safeParse(user.id);
  if (!parsedId.success) {
    throw new Error('Invalid Clerk User ID from session');
  }
  return UserService.getUserProfile(parsedId.data);
}
