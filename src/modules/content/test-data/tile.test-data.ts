import { faker } from '@faker-js/faker';

export const TILE_TEST_DATA = {
  /**
   * Generates a content latest & popular tile payload
   */
  CONTENT_LATEST_POPULAR_TILE: (overrides?: {
    title?: string;
    type?: 'all' | 'page' | 'event' | 'album';
    siteFilter?: 'following' | 'all' | 'site';
    siteId?: string | null;
    layout?: 'standard' | 'grid' | 'list';
    pushToAllHomeDashboards?: boolean;
  }) => ({
    siteId: null,
    dashboardId: 'home',
    tile: {
      title: overrides?.title || 'Latest & popular',
      options: {
        type: overrides?.type || 'all',
        siteFilter: overrides?.siteFilter || 'following',
        siteId: overrides?.siteId ?? null,
        layout: overrides?.layout || 'standard',
      },
      pushToAllHomeDashboards: overrides?.pushToAllHomeDashboards ?? true,
      items: [],
      type: 'content',
      variant: 'latest_popular',
    },
    isNewTiptap: false,
  }),

  /**
   * Generates a people new hires tile payload
   */
  PEOPLE_NEW_HIRES_TILE: (overrides?: {
    title?: string | null;
    hireDaysThreshold?: string;
    pushToAllHomeDashboards?: boolean;
  }) => ({
    siteId: null,
    dashboardId: 'home',
    tile: {
      title: overrides?.title ?? null,
      options: {
        hireDaysThreshold: overrides?.hireDaysThreshold || '30',
      },
      pushToAllHomeDashboards: overrides?.pushToAllHomeDashboards ?? false,
      items: [],
      type: 'people',
      variant: 'new_hires',
    },
  }),

  /**
   * Generates a files tile payload
   */
  FILES_TILE: (overrides?: { title?: string; items?: string[]; pushToAllHomeDashboards?: boolean }) => ({
    siteId: null,
    dashboardId: 'home',
    tile: {
      title: overrides?.title || faker.company.buzzNoun() + ' Files Tile',
      options: {},
      pushToAllHomeDashboards: overrides?.pushToAllHomeDashboards ?? false,
      items: overrides?.items || [],
      type: 'files',
      variant: 'intranet',
    },
    isNewTiptap: false,
  }),

  /**
   * Generates a sites tile payload
   */
  SITES_TILE: (overrides?: {
    title?: string;
    items?: string[];
    layout?: 'list' | 'grid';
    pushToAllHomeDashboards?: boolean;
  }) => ({
    siteId: null,
    dashboardId: 'home',
    tile: {
      title: overrides?.title || faker.company.buzzNoun() + ' Sites Tile',
      options: {
        layout: overrides?.layout || 'list',
      },
      pushToAllHomeDashboards: overrides?.pushToAllHomeDashboards ?? false,
      items: overrides?.items || [],
      type: 'sites',
      variant: 'custom',
    },
    isNewTiptap: false,
  }),

  /**
   * Generates a site categories tile payload
   */
  SITE_CATEGORIES_TILE: (overrides?: { title?: string; size?: number; pushToAllHomeDashboards?: boolean }) => ({
    siteId: null,
    dashboardId: 'home',
    tile: {
      title: overrides?.title || faker.company.buzzNoun() + ' Site Categories Tile',
      options: {
        size: overrides?.size || 5,
      },
      pushToAllHomeDashboards: overrides?.pushToAllHomeDashboards ?? false,
      items: [],
      type: 'site_categories',
      variant: 'default',
    },
    isNewTiptap: false,
  }),

  /**
   * Generates a people custom tile payload
   */
  PEOPLE_CUSTOM_TILE: (overrides?: {
    title?: string;
    items?: string[];
    layout?: 'list' | 'grid';
    pushToAllHomeDashboards?: boolean;
  }) => ({
    siteId: null,
    dashboardId: 'home',
    tile: {
      title: overrides?.title || faker.company.buzzNoun() + ' Custom People Tile',
      options: {
        layout: overrides?.layout || 'list',
      },
      pushToAllHomeDashboards: overrides?.pushToAllHomeDashboards ?? false,
      items: overrides?.items || [],
      type: 'people',
      variant: 'custom',
    },
  }),

  /**
   * Generates an HTML tile payload
   */
  HTML_TILE: (overrides?: { title?: string; code?: string; height?: number; pushToAllHomeDashboards?: boolean }) => ({
    siteId: null,
    dashboardId: 'home',
    tile: {
      title: overrides?.title || faker.company.buzzNoun() + ' HTML Tile',
      options: {
        code: overrides?.code || '<body><h1>Test HTML Tile</h1><p>This is a test HTML tile content.</p></body>',
        height: overrides?.height || 200,
      },
      pushToAllHomeDashboards: overrides?.pushToAllHomeDashboards ?? false,
      items: [],
      type: 'html',
      variant: 'iframe',
    },
    isNewTiptap: false,
  }),

  /**
   * Generates a content custom tile payload
   */
  CONTENT_CUSTOM_TILE: (overrides?: {
    title?: string;
    items?: string[];
    layout?: 'standard' | 'grid' | 'list';
    pushToAllHomeDashboards?: boolean;
  }) => ({
    siteId: null,
    dashboardId: 'home',
    tile: {
      title: overrides?.title || faker.company.buzzNoun() + ' Custom Content Tile',
      options: {
        layout: overrides?.layout || 'standard',
      },
      pushToAllHomeDashboards: overrides?.pushToAllHomeDashboards ?? false,
      items: overrides?.items || [],
      type: 'content',
      variant: 'custom',
    },
    isNewTiptap: false,
  }),

  /**
   * Generates a links tile payload
   */
  LINKS_TILE: (overrides?: {
    title?: string;
    links?: Array<{ text: string; url: string }>;
    layout?: 'standard' | 'grid';
    pushToAllHomeDashboards?: boolean;
  }) => ({
    siteId: null,
    dashboardId: 'home',
    tile: {
      title: overrides?.title || faker.company.buzzNoun() + ' Links Tile',
      options: {
        layout: overrides?.layout || 'standard',
        links: overrides?.links || [
          {
            text: 'Test Link 1',
            url: 'https://www.example.com',
          },
          {
            text: 'Test Link 2',
            url: 'https://www.simpplr.com',
          },
        ],
      },
      pushToAllHomeDashboards: overrides?.pushToAllHomeDashboards ?? false,
      items: [],
      type: 'links',
      variant: 'custom',
    },
    isNewTiptap: false,
  }),

  /**
   * Generates an RSS tile payload
   */
  RSS_TILE: (overrides?: { title?: string; url?: string; size?: number; pushToAllHomeDashboards?: boolean }) => ({
    siteId: null,
    dashboardId: 'home',
    tile: {
      title: overrides?.title || faker.company.buzzNoun() + ' RSS Tile',
      options: {
        url: overrides?.url || 'http://rss.cnn.com/rss/cnn_topstories.rss',
        size: overrides?.size || 8,
      },
      pushToAllHomeDashboards: overrides?.pushToAllHomeDashboards ?? false,
      items: [],
      type: 'rss',
      variant: 'standard',
    },
    isNewTiptap: false,
  }),

  /**
   * Generates a Twitter tile payload
   */
  TWITTER_TILE: (overrides?: { title?: string; code?: string; pushToAllHomeDashboards?: boolean }) => ({
    siteId: null,
    dashboardId: 'home',
    tile: {
      title: overrides?.title || faker.company.buzzNoun() + ' Twitter Tile',
      options: {
        code:
          overrides?.code ||
          '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Test tweet content</p>&mdash; Test (@test) <a href="https://twitter.com/test/status/1234567890">January 1, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>',
      },
      pushToAllHomeDashboards: overrides?.pushToAllHomeDashboards ?? false,
      items: [],
      type: 'twitter',
      variant: 'standard',
    },
    isNewTiptap: false,
  }),

  /**
   * Generates a Facebook tile payload
   */
  FACEBOOK_TILE: (overrides?: {
    title?: string;
    url?: string;
    height?: number;
    showPosts?: boolean;
    showCover?: boolean;
    pushToAllHomeDashboards?: boolean;
  }) => ({
    siteId: null,
    dashboardId: 'home',
    tile: {
      title: overrides?.title || faker.company.buzzNoun() + ' Facebook Tile',
      options: {
        height: overrides?.height || 1010,
        showPosts: overrides?.showPosts ?? true,
        showCover: overrides?.showCover ?? true,
        url: overrides?.url || 'https://www.facebook.com/simpplr',
      },
      pushToAllHomeDashboards: overrides?.pushToAllHomeDashboards ?? false,
      items: [],
      type: 'facebook',
      variant: 'standard',
    },
    isNewTiptap: false,
  }),

  /**
   * Generates a countdown tile payload
   */
  COUNTDOWN_TILE: (overrides?: {
    title?: string;
    stopAt?: string;
    endMessage?: string;
    pushToAllHomeDashboards?: boolean;
  }) => {
    // Default stop date is 30 days from now if not provided
    const defaultStopDate = overrides?.stopAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    return {
      siteId: null,
      dashboardId: 'home',
      tile: {
        title: overrides?.title || faker.company.buzzNoun() + ' Countdown Tile',
        options: {
          stopAt: defaultStopDate,
          endMessage: overrides?.endMessage || 'Countdown completed!',
        },
        pushToAllHomeDashboards: overrides?.pushToAllHomeDashboards ?? false,
        items: [],
        type: 'countdown',
        variant: 'standard',
      },
      isNewTiptap: false,
    };
  },
} as const;
