import { NewHomePage } from '@/src/core';
import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentAbacTestFixture as test } from '@/src/modules/content-abac/fixtures/contentAbacFixture';
import { EditAudienceGroupModalPage } from '@/src/modules/content-abac/ui/pages/editAudienceGroupModalPage';
import { ManageFeaturesPage } from '@/src/modules/content-abac/ui/pages/manageFeaturePage';
import { ManageSitePage } from '@/src/modules/content-abac/ui/pages/manageSitePage';
import { SiteDetailsPage } from '@/src/modules/content-abac/ui/pages/siteDetailsPage';

test.describe('manage Site Test Suite (ABAC)', { tag: [ContentSuiteTags.MANAGE_SITE] }, () => {
  let homePage: NewHomePage;
  let manageFeaturePage: ManageFeaturesPage;
  let manageSitePage: ManageSitePage;
  let siteDetailsPage: SiteDetailsPage;
  let editAudienceGroupModalPage: EditAudienceGroupModalPage;

  test.beforeEach(
    'Setting up the test environment for site creation',
    async ({ appManagerHomePage, appManagerPage }) => {
      await appManagerHomePage.verifyThePageIsLoaded();
      homePage = new NewHomePage(appManagerPage);
      manageFeaturePage = new ManageFeaturesPage(appManagerPage);
      manageSitePage = new ManageSitePage(appManagerPage, '');
      siteDetailsPage = new SiteDetailsPage(appManagerPage, '');
      editAudienceGroupModalPage = new EditAudienceGroupModalPage(appManagerPage, '');
    }
  );

  test.afterEach('Site Clean up', async ({ siteManagementService }) => {});

  test(
    'verify Warning Message Appears After Changing Target Audience',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.CONT_38912, '@CONT-38912'],
    },
    async ({ appManagerUINavigationHelper }) => {
      tagTest(test.info(), {
        description: 'Verify Warning Message Appears After Changing Target Audience',
        zephyrTestId: 'CONT-38912',
        storyId: 'CONT-38912',
      });
      await appManagerUINavigationHelper.openManageFeatureSectionInSideBar();
      await manageFeaturePage.actions.clickOnSitesCard();
      await manageSitePage.actions.selectSite();
      await siteDetailsPage.actions.removingAudienceGroup();
      await editAudienceGroupModalPage.actions.clickingOnIUnderstandCheckbox();
      await editAudienceGroupModalPage.actions.clickingOnContinueButton();
      await siteDetailsPage.assertions.verifyWarningMessage();
    }
  );
});
