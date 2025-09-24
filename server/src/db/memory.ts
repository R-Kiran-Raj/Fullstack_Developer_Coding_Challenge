import type { UserProfile } from '../types.js';

const users = new Map<string, UserProfile>();

export const db = {
  getUser(email: string) {
    return users.get(email) || null;
  },
  upsertUser(profile: UserProfile) {
    users.set(profile.email, profile);
    return profile;
  }
};
