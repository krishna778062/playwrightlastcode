/**
 * @fileoverview Site Creation Test Data
 * @description Test data for site creation scenarios - both UI verification and functionality tests
 * @author Diksha Gaur
 */

import { faker } from '@faker-js/faker';
import { SiteType } from '@/src/modules/content/constants/siteType';

// =============================================================================
// INTERFACES - Define the shape of our test data
// =============================================================================

export interface SiteTestData {
  name: string;
  type: SiteType;
  category: string;
}

export interface UITextElements {
  buttons: Record<string, string>;
  labels: Record<string, string>;
  placeholders: Record<string, string>;
  descriptions: Record<string, string>;
}

export const SITE_CREATION_TEST_DATA = {
  
  // ---------------------------------------------------------------------------
  // COMMON UI ELEMENTS - Text and labels that appear for ALL sites
  // ---------------------------------------------------------------------------
  UI_ELEMENTS: {
    // Button texts that we need to click
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

    // Headings and section titles  
    HEADINGS: {
      ADD_SITE: 'Add site',
      ACCESS: 'Access',
      TARGET_AUDIENCE: 'Target audience and subscriptions',
      SUBSCRIPTIONS: 'Subscriptions',
      MEMBERSHIP_REQUESTS: 'Membership requests',
    },

    // Form field labels
    LABELS: {
      SITE_NAME: 'Site name *',
      CATEGORY: 'Category: This is a required',
      TARGET_AUDIENCE: 'Target audience *',
      MAKE_PRIVATE: 'Make site private',
    },

    // Placeholder texts
    PLACEHOLDERS: {
      CATEGORY: 'Add or select existing category',
      NO_AUDIENCES: 'No audiences selected',
      NO_SUBSCRIPTIONS: 'No subscriptions added',
    },

    // Help texts and descriptions
    DESCRIPTIONS: {
      PRIVATE_HELP: 'Users will have to request permission to join this site',
      TARGET_AUDIENCE_HELP: 'Defining the target audience establishes who in your organization can access this site',
      SUBSCRIPTIONS_HELP: 'When a subscription is created, the users within the defined audience will automatically follow the selected sites or people.',
      SUBSCRIPTION_WARNING: 'Target audience must be set before you can add a subscription',
    },

    // Success/Status messages
    MESSAGES: {
      SITE_CREATED: 'Created site successfully',
      ALL_ORG_SELECTED: "You've selected 'All",
      ALL_ORG_DESCRIPTION: 'This will target everyone in',
    },
  },

  // ---------------------------------------------------------------------------
  // PUBLIC SITE DATA - Everything needed to create a public site
  // ---------------------------------------------------------------------------
  PUBLIC_SITE: {
    // Basic site information
    name: `Public Site ${faker.company.name()}`,
    type: SiteType.PUBLIC,
    category: 'Uncategorized',
    
    // What we expect the UI to show
    expected: {
      privateToggle: false,        // Should stay OFF for public sites
      membershipApproval: 'manual', // Default setting
    },

    // Membership request options (only shown for public sites)
    membershipOptions: {
      manual: 'Manually approve membership requests',
      automatic: 'Automatically approve membership requests',
    },
  },

  // ---------------------------------------------------------------------------
  // PRIVATE SITE DATA - Everything needed to create a private site  
  // ---------------------------------------------------------------------------
  PRIVATE_SITE: {
    // Basic site information
    name: `Private Site ${faker.company.name()}`,
    type: SiteType.PRIVATE,
    category: 'Uncategorized',
    
    // What we expect the UI to show
    expected: {
      privateToggle: true,         // Should be ON for private sites
      membershipApproval: 'manual', // Always manual for private sites (no UI option)
    },

    // Confirmation modal that appears when making site private
    confirmationModal: {
      title: 'Make site private',
      message: 'Setting this site to private will make all followers of this site members. This includes users who were added through subscriptions.',
      cancelButton: 'Cancel',
      confirmButton: 'Make private',
    },
  },

  // ---------------------------------------------------------------------------
  // TARGET AUDIENCE DATA - Settings for "All Organization" audience
  // ---------------------------------------------------------------------------
  TARGET_AUDIENCE: {
    // All Organization option 
    allOrganization: {
      name: 'All organization',
      displayText: 'Everyone in organization',
      userCountPattern: /\d+ users/,  // Dynamic - matches any number like "9922 users"
      confirmationText: 'All organization',
      descriptionText: 'Based on the audiences',
    },

    // Modal texts
    modal: {
      title: 'Audiences',
      doneButton: 'Done',
    },
  },

  // ---------------------------------------------------------------------------
  // DEFAULT FORM STATES - What the form should look like when first opened
  // ---------------------------------------------------------------------------
  DEFAULT_STATES: {
    privateToggle: false,           // Private toggle starts as OFF
    manuallyApprove: true,          // Manual approval is selected by default
    anyoneCanPost: true,            // Anyone can post is enabled
    contentSubmissionsEnabled: true, // Content submissions enabled
    questionsEnabled: true,         // Questions enabled  
    dashboardLanding: true,         // Dashboard as landing page
    postsEnabled: true,             // Posts enabled
  },

} as const;

// =============================================================================
// HELPER FUNCTIONS - Make it easy to get test data
// =============================================================================

/**
 * Get a fresh site name (useful for tests that need unique names)
 */
export function getUniquePublicSiteName(): string {
  return `Public Site ${faker.company.name()} ${faker.number.int(1000)}`;
}

export function getUniquePrivateSiteName(): string {
  return `Private Site ${faker.company.name()} ${faker.number.int(1000)}`;
}

/**
 * Get site data for a specific type
 */
export function getSiteDataByType(type: SiteType): SiteTestData {
  if (type === SiteType.PUBLIC) {
    return {
      name: SITE_CREATION_TEST_DATA.PUBLIC_SITE.name,
      type: SITE_CREATION_TEST_DATA.PUBLIC_SITE.type,
      category: SITE_CREATION_TEST_DATA.PUBLIC_SITE.category,
    };
  } else {
    return {
      name: SITE_CREATION_TEST_DATA.PRIVATE_SITE.name,
      type: SITE_CREATION_TEST_DATA.PRIVATE_SITE.type,
      category: SITE_CREATION_TEST_DATA.PRIVATE_SITE.category,
    };
  }
}

// =============================================================================
// TYPE EXPORTS - For TypeScript support
// =============================================================================
export type SiteCreationTestData = typeof SITE_CREATION_TEST_DATA; 