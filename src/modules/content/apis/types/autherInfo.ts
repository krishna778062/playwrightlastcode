export interface AuthorInfo {
  peopleId: string;
  name: string;
  mediumPhotoUrl: string | null;
  location: string | null;
  lastName: string;
  isProtectedAuthor: boolean;
  isFollowing: boolean;
  isActive: boolean;
  img: string | null;
  id: string;
  firstName: string;
  email: string;
  country: string | null;
  canFollow: boolean;
}
