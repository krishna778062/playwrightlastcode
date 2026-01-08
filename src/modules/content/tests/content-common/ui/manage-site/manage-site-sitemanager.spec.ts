import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ManageSitePage } from '@/src/modules/content/ui/pages/manageSitePage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  ContentSuiteTags.MANAGE_SITE,
  {
    tag: [ContentSuiteTags.MANAGE_SITE],
  },
  () => {
    test.afterEach(async ({ page }) => {
      await page.close();
    });

    test(
      'verify the site activate option in manage site user drop down sites for all site types CONT-41476',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-41476'],
      },
      async ({ siteManagerFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Verify the site activate option in manage site user drop down sites for all site types',
          zephyrTestId: 'CONT-41476',
          storyId: 'CONT-41476',
          isKnownFailure: true,
          bugTicket: 'SEN-20198',
        });

        const siteTypes = [SITE_TYPES.PUBLIC, SITE_TYPES.PRIVATE, SITE_TYPES.UNLISTED];
        const manageSitePage = new ManageSitePage(siteManagerFixture.page);
        await manageSitePage.loadPage();
        await manageSitePage.clickOnFilterOptionsDropdownButton();
        await manageSitePage.selectFilterOption('All');

        for (const siteType of siteTypes) {
          const siteInfo = await siteManagerApiFixture.siteManagementHelper.getDeactivatedSite(siteType, {
            size: 1000,
            sortBy: 'alphabetical',
          });
          const siteName = siteInfo.siteName;

          await manageSitePage.searchSite(siteName);
          await manageSitePage.clickOnSearchButton();
          await manageSitePage.clickOnOptionsDropdown(siteName);
          await manageSitePage.verifyOptionIsVisibleInOptionsDropdown('Activate');
          await manageSitePage.verifyOptionIsNotVisibleInOptionsDropdown('Deactivate');
        }
      }
    );
  }
);
