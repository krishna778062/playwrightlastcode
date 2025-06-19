export const FEED_POST_TEST_DATA = {
  CONFIG: {
    DEFAULT_TIMEOUT: 120_000,
  },
  POST_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    LINK: 'link',
    POLL: 'poll',
  },
  SEARCH_TERMS: {
    ANNOUNCEMENT: 'announcement',
    UPDATE: 'update',
    NEWS: 'news',
    EVENT: 'event',
  },
  AUTHORS: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    EMPLOYEE: 'employee',
  },
  VISIBILITY: {
    PUBLIC: 'public',
    PRIVATE: 'private',
    RESTRICTED: 'restricted',
  },
  MESSAGES: {
    POST_CREATED: 'Post created successfully',
    POST_DELETED: 'Post deleted',
    LIKE_ADDED: 'Like added',
    COMMENT_ADDED: 'Comment added',
  },
} as const;

export type FeedPostTestData = typeof FEED_POST_TEST_DATA;
