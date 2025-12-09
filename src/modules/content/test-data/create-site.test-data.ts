import { faker } from '@faker-js/faker';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { SiteCreationUI } from '@/src/modules/content/constants/siteCreation';

export interface SiteTestData {
  name: string;
  type: SITE_TYPES;
  category: string;
}

export const SITE_CREATION_TEST_DATA = {
  PUBLIC_SITE: {
    name: `Public Site ${faker.company.name()}`,
    type: SITE_TYPES.PUBLIC,
    category: SiteCreationUI.CATEGORIES.DEFAULT,
  },
  PRIVATE_SITE: {
    name: `Private Site ${faker.company.name()}`,
    type: SITE_TYPES.PRIVATE,
    category: SiteCreationUI.CATEGORIES.DEFAULT,
  },
} as const;

export type SiteCreationTestData = typeof SITE_CREATION_TEST_DATA;
