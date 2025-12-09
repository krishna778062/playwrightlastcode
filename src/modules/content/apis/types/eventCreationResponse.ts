import { AuthorInfo } from './autherInfo';

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
