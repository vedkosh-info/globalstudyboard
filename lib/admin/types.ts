/** Shape of an account as the owner console sees it (shared by the API route and the client). */
export interface AdminUser {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmedAt: string | null;
  providers: string[];
  bannedUntil: string | null;
  profile: { displayName: string; preferredRegion: string | null; preferredAudience: string | null } | null;
  savedCount: number;
}
