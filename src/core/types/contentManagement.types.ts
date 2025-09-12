export interface BaseContentPayload {
  listOfFiles: any[];
  publishAt: string;
  body: string;
  imgCaption: string;
  publishingStatus: string;
  bodyHtml: string;
  imgLayout: string;
  title: string;
  language: string;
  isFeedEnabled: boolean;
  listOfTopics: any[];
  contentType: string;
  isNewTiptap: boolean;
}

export interface PageCreationPayload extends BaseContentPayload {
  contentSubType: string;
  category: {
    id: string;
    name: string;
  };
}

export interface EventCreationPayload extends BaseContentPayload {
  startsAt: string;
  endsAt: string;
  isAllDay: boolean;
  timezoneIso: string;
  location: string;
  directions: any[];
}

export interface AlbumCreationPayload extends BaseContentPayload {
  coverImageMediaId: string;
  listOfAlbumMedia: { id: string; description: string }[];
}

export interface TopicAuthor {
  name: string;
  peopleId: string;
  id: string;
}

export interface Topic {
  name: string;
  topic_id: string;
  created_by: string;
  canEdit: boolean;
  canDelete: boolean;
  isFollowing: boolean;
  authoredBy: TopicAuthor;
}

export interface TopicListResponse {
  status: string;
  result: {
    listOfItems: Topic[];
    nextPageToken: number;
  };
  message: string;
}
