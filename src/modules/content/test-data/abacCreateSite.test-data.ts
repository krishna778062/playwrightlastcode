/**
 * @fileoverview Site Creation Test Data
 * @description Only dynamic/scenario data lives here. Static UI strings moved to constants/siteCreation.ui.ts
 */

import { faker } from '@faker-js/faker';
import { SiteType } from '@/src/modules/content/constants/siteTypeAbac';
import { SiteCreationUI } from '@/src/modules/content/constants/siteCreation.abac';

// Scenario-level data structures
export interface SiteTestData {
  name: string;
  type: SiteType;
  category: string;
}

export const SITE_CREATION_TEST_DATA = {
  // Public site scenario
  PUBLIC_SITE: {
    name: `Public Site ${faker.company.name()}`,
    type: SiteType.PUBLIC,
    category: SiteCreationUI.CATEGORIES.DEFAULT,
  },

  // Private site scenario
  PRIVATE_SITE: {
    name: `Private Site ${faker.company.name()}`,
    type: SiteType.PRIVATE,
    category: SiteCreationUI.CATEGORIES.DEFAULT,
  },
} as const;

export function getUniquePublicSiteName(): string {
  return `Public Site ${faker.company.name()} ${faker.number.int(1000)}`;
}

export function getUniquePrivateSiteName(): string {
  return `Private Site ${faker.company.name()} ${faker.number.int(1000)}`;
}

export function getSiteDataByType(type: SiteType): SiteTestData {
  if (type === SiteType.PUBLIC) {
    return {
      name: SITE_CREATION_TEST_DATA.PUBLIC_SITE.name,
      type: SITE_CREATION_TEST_DATA.PUBLIC_SITE.type,
      category: SiteCreationUI.CATEGORIES.DEFAULT,
    };
  }
  return {
    name: SITE_CREATION_TEST_DATA.PRIVATE_SITE.name,
    type: SITE_CREATION_TEST_DATA.PRIVATE_SITE.type,
    category: SiteCreationUI.CATEGORIES.DEFAULT,
  };
}

export type SiteCreationTestData = typeof SITE_CREATION_TEST_DATA; 