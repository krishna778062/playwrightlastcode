import { faker } from '@faker-js/faker';
import { SocialCampaignNetwork, SocialCampaignRecipient } from '@core/types/social-campaign.types';

export const SOCIAL_CAMPAIGN_TEST_DATA = {
  // Default campaign messages
  MESSAGES: {
    DEFAULT: `Test Social Campaign ${faker.company.buzzPhrase()}`,
    YOUTUBE: `YouTube Campaign ${faker.company.buzzPhrase()}`,
    BLOG: `Blog Campaign ${faker.company.buzzPhrase()}`,
    NEWS: `News Campaign ${faker.company.buzzPhrase()}`,
    PRODUCT: `Product Campaign ${faker.company.buzzPhrase()}`,
  },

  // Common URLs for testing
  URLS: {
    YOUTUBE: 'https://www.youtube.com/watch?v=6_q_LHq85Cs',
    SIMPPLR_BLOG: 'https://www.simpplr.com/blog/2023/building-transparent-leadership-and-trust',
    SIMPPLR_ALL_EMPLOYEES: 'https://www.simpplr.com/blog/2023/g2-best-intranet-solution/',
    SIMPPLR_TRANSPARENT_LEADERSHIP: 'https://www.simpplr.com/blog/2023/building-transparent-leadership-and-trust',
    SIMPPLR_COMPANY_VALUES: 'https://www.simpplr.com/blog/2023/is-it-time-to-refresh-your-company-values/',
    GENERIC_URL: faker.internet.url(),
  },
  LINK_TEXT: {
    YOUTUBE: 'How Life Will Look Like In 2050',
    SIMPPLR_BLOG: 'Building Transparent Leadership and Trust',
    SIMPPLR_ALL_EMPLOYEES: 'Find the best intranet solution with the 2023 G2 report',
  },

  // Social networks
  NETWORKS: {
    ALL: [SocialCampaignNetwork.FACEBOOK, SocialCampaignNetwork.LINKEDIN, SocialCampaignNetwork.TWITTER],
    FACEBOOK_LINKEDIN: [SocialCampaignNetwork.FACEBOOK, SocialCampaignNetwork.LINKEDIN],
    LINKEDIN_TWITTER: [SocialCampaignNetwork.LINKEDIN, SocialCampaignNetwork.TWITTER],
    FACEBOOK_ONLY: [SocialCampaignNetwork.FACEBOOK],
    LINKEDIN_ONLY: [SocialCampaignNetwork.LINKEDIN],
    TWITTER_ONLY: [SocialCampaignNetwork.TWITTER],
  },

  // Recipient types
  RECIPIENTS: {
    EVERYONE: SocialCampaignRecipient.EVERYONE,
    AUDIENCE: SocialCampaignRecipient.AUDIENCE,
  },

  // Campaign statuses
  STATUSES: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DRAFT: 'draft',
    EXPIRED: 'expired',
  },

  // Test timeouts
  TIMEOUTS: {
    DEFAULT: 30_000,
    CREATION: 60_000,
    NAVIGATION: 15_000,
    API_RESPONSE: 10_000,
  },

  // Default campaign configurations
  DEFAULT_CAMPAIGNS: {
    EVERYONE_YOUTUBE: {
      recipient: SocialCampaignRecipient.EVERYONE,
      message: 'Test YouTube Campaign for Everyone',
      url: 'https://www.youtube.com/watch?v=6_q_LHq85Cs',
      networks: [SocialCampaignNetwork.FACEBOOK, SocialCampaignNetwork.LINKEDIN, SocialCampaignNetwork.TWITTER],
    },
    EVERYONE_BLOG: {
      recipient: SocialCampaignRecipient.EVERYONE,
      message: 'Test Blog Campaign for Everyone',
      url: 'https://www.simpplr.com/blog/2022/new-brand/',
      networks: [SocialCampaignNetwork.FACEBOOK, SocialCampaignNetwork.LINKEDIN],
    },
    AUDIENCE_NEWS: {
      recipient: SocialCampaignRecipient.AUDIENCE,
      message: 'Test News Campaign for Audience',
      url: 'https://www.simpplr.com/blog/2023/building-transparent-leadership-and-trust',
      networks: [SocialCampaignNetwork.LINKEDIN, SocialCampaignNetwork.TWITTER],
      audienceId: 'f6fe0c5c-9ed6-4d95-a6fd-4329173bafa0', // Example audience ID
    },
  },

  // Campaign validation data
  VALIDATION: {
    MIN_MESSAGE_LENGTH: 1,
    MAX_MESSAGE_LENGTH: 500,
    REQUIRED_FIELDS: ['recipient', 'message', 'url', 'networks'],
    VALID_NETWORKS: [SocialCampaignNetwork.FACEBOOK, SocialCampaignNetwork.LINKEDIN, SocialCampaignNetwork.TWITTER],
    VALID_RECIPIENTS: [SocialCampaignRecipient.EVERYONE, SocialCampaignRecipient.AUDIENCE],
  },

  // Error messages
  ERROR_MESSAGES: {
    INVALID_URL: 'Invalid URL format',
    EMPTY_MESSAGE: 'Message cannot be empty',
    INVALID_NETWORK: 'Invalid social network',
    INVALID_RECIPIENT: 'Invalid recipient type',
    MISSING_AUDIENCE_ID: 'Audience ID required for audience campaigns',
  },

  // Test scenarios
  TEST_SCENARIOS: {
    CREATE_EVERYONE_CAMPAIGN: {
      name: 'Create Campaign for Everyone',
      data: {
        recipient: SocialCampaignRecipient.EVERYONE,
        message: 'Test Campaign for All Users',
        url: 'https://www.simpplr.com/blog/2022/new-brand/',
        networks: [SocialCampaignNetwork.FACEBOOK, SocialCampaignNetwork.LINKEDIN, SocialCampaignNetwork.TWITTER],
      },
    },
    CREATE_AUDIENCE_CAMPAIGN: {
      name: 'Create Campaign for Specific Audience',
      data: {
        recipient: SocialCampaignRecipient.AUDIENCE,
        message: 'Test Campaign for Specific Audience',
        url: 'https://www.youtube.com/watch?v=6_q_LHq85Cs',
        networks: [SocialCampaignNetwork.FACEBOOK, SocialCampaignNetwork.LINKEDIN],
        audienceId: 'f6fe0c5c-9ed6-4d95-a6fd-4329173bafa0',
      },
    },
    UPDATE_CAMPAIGN_STATUS: {
      name: 'Update Campaign Status',
      actions: ['activate', 'deactivate', 'expire'],
    },
    DELETE_CAMPAIGN: {
      name: 'Delete Campaign',
      expectedResult: 'Campaign successfully deleted',
    },
  },

  // Bulk operations
  BULK_OPERATIONS: {
    CREATE_MULTIPLE_CAMPAIGNS: {
      count: 3,
      baseMessage: 'Bulk Test Campaign',
      url: 'https://www.simpplr.com/blog/2022/new-brand/',
      networks: [SocialCampaignNetwork.FACEBOOK, SocialCampaignNetwork.LINKEDIN, SocialCampaignNetwork.TWITTER],
    },
    DELETE_ALL_CAMPAIGNS: {
      operation: 'deleteAll',
      expectedResult: 'All campaigns deleted',
    },
  },
} as const;

// Type definitions for better type safety
export type SocialCampaignTestData = typeof SOCIAL_CAMPAIGN_TEST_DATA;
export type CampaignMessage = keyof typeof SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES;
export type CampaignUrl = keyof typeof SOCIAL_CAMPAIGN_TEST_DATA.URLS;
export type CampaignNetwork = keyof typeof SOCIAL_CAMPAIGN_TEST_DATA.NETWORKS;
export type CampaignRecipient = keyof typeof SOCIAL_CAMPAIGN_TEST_DATA.RECIPIENTS;
export type CampaignStatus = keyof typeof SOCIAL_CAMPAIGN_TEST_DATA.STATUSES;
