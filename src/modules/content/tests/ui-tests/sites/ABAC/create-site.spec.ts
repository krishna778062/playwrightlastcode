/**
 * @fileoverview Site Creation Test Suite
 * @description Tests for creating public and private sites through the UI
 * @author Diksha Gaur
 */

import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SiteType } from '@/src/modules/content/constants/siteTypeAbac';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as contentTest } from '@/src/modules/content/fixtures/contentFixture';
import { SITE_CREATION_TEST_DATA } from '@/src/modules/content/test-data/abacCreateSite.test-data';

contentTest.describe('Site Creation Test Suite', { tag: [ContentSuiteTags.SITE_CREATION] }, () => {
  const SITE_TEST_DATA = [
    {
      name: SITE_CREATION_TEST_DATA.PUBLIC_SITE.name,
      category: SITE_CREATION_TEST_DATA.PUBLIC_SITE.category,
      siteType: SiteType.PUBLIC,
    },
    {
      name: SITE_CREATION_TEST_DATA.PRIVATE_SITE.name,
      category: SITE_CREATION_TEST_DATA.PRIVATE_SITE.category,
      siteType: SiteType.PRIVATE,
    },
  ] as const;

  for (const site of SITE_TEST_DATA) {
    contentTest(
      `Verify user is able to create a ${site.siteType} site`,
      { tag: [ContentSuiteTags.SITE_CREATION, TestPriority.P0, TestGroupType.REGRESSION] },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description: 'Verify Target Audience section displays correctly with proper labels and placeholders',
          zephyrTestId: site.siteType === SiteType.PUBLIC ? 'CONT-38637' : 'CONT-37643',
          storyId: 'CONT-33515',
        });

        // STEP 1: Open site creation page
        const siteCreationPage = await appManagerHomePage.actions.openSiteCreationForm();

        // STEP 2: Verify sections (Access, Target Audience, Subscriptions)
        await siteCreationPage.verifySiteCreationFormStructure();

        // STEP 3: Create the site
        await siteCreationPage.createSite({
          name: site.name,
          category: site.category,
          type: site.siteType,
        });

        await siteCreationPage.verifySiteCreatedSuccessfully(site.name);
      }
    );
  }
});
