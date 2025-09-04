export interface EventCreationResponse {
  status: string;
  result: {
    id: string;
    title: string;
    body: string;
    type: string;
    status: string;
    site: {
      siteId: string;
      name: string;
      isPublic: boolean;
      isPrivate: boolean;
      access: string;
    };
    startsAt: string;
    endsAt: string;
    location: string;
    isAllDay: boolean;
    isMultiDay: boolean;
    timezoneName: string;
    timezoneIso: string;
    timezoneOffset: number;
    createdAt: string;
    modifiedAt: string;
    publishAt: string;
    firstPublishedAt: string;
    authoredBy: AuthorInfo;
  };
}

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
