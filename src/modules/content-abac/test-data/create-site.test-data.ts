import { faker } from '@faker-js/faker';
import { SiteType } from '@/src/modules/content-abac/constants/siteType';
import { SiteCreationUI } from '@/src/modules/content-abac/constants/siteCreation';

export interface SiteTestData {
  name: string;
  type: SiteType;
  category: string;
}

export const SITE_CREATION_TEST_DATA = {
  PUBLIC_SITE: {
    name: `Public Site ${faker.company.name()}`,
    type: SiteType.PUBLIC,
    category: SiteCreationUI.CATEGORIES.DEFAULT,
  },
  PRIVATE_SITE: {
    name: `Private Site ${faker.company.name()}`,
    type: SiteType.PRIVATE,
    category: SiteCreationUI.CATEGORIES.DEFAULT,
  },
} as const;

export type SiteCreationTestData = typeof SITE_CREATION_TEST_DATA;
