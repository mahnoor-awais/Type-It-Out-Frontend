export interface UserProfile {
  id: number;
  username: string;
  bio: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  articlesCount: number;
  followersCount: number;
  followingCount: number;
}
