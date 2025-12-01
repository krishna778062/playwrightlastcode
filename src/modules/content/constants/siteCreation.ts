export const SiteCreationUI = {
  BUTTONS: {
    CREATE: '+',
    SITE_OPTION: 'Site',
    CANCEL: 'Cancel',
    ADD_SITE: 'Add site',
    BROWSE: 'Browse',
    MAKE_PRIVATE: 'Make private',
    ADD_SUBSCRIPTION: 'Add subscription',
    DONE: 'Done',
  },
  HEADINGS: {
    ADD_SITE: 'Add site',
    ACCESS: 'Access',
    TARGET_AUDIENCE: 'Site visibility and subscriptions',
    SUBSCRIPTIONS: 'Subscriptions',
    MEMBERSHIP_REQUESTS: 'Membership requests',
  },
  LABELS: {
    SITE_NAME: 'Site name *',
    CATEGORY: 'Category: This is a required',
    TARGET_AUDIENCE: 'Site visibility *',
    MAKE_PRIVATE: 'Make site private',
  },
  PLACEHOLDERS: {
    CATEGORY: 'Add or select existing category',
    NO_AUDIENCES: 'No audiences selected',
    NO_SUBSCRIPTIONS: 'No subscriptions added',
  },
  DESCRIPTIONS: {
    PRIVATE_HELP: 'Users will have to request permission to join this site',
    TARGET_AUDIENCE_HELP:
      'Defining site visibility establishes who in your organization can access this site. Users who are not part of your audience selection will not be able to see or interact with this site.',
    SUBSCRIPTIONS_HELP:
      'When a subscription is created, the users within the defined audience will automatically be made members of this site.',
    SUBSCRIPTION_WARNING: 'Site visibility must be set before you can add a subscription',
  },
  MESSAGES: {
    SITE_CREATED: 'Created site successfully',
  },
  CATEGORIES: {
    DEFAULT: 'Uncategorized',
  },
} as const;
