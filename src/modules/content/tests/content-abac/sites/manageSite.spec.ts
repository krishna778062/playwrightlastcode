import { NewHomePage } from '@/src/core';
import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { EditAudienceGroupModalPage } from '@/src/modules/content/ui/pages/editAudienceGroupModalPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturePage';
import { ManageSiteSetUpPage } from '@/src/modules/content/ui/pages/manageSiteSetUpPage';
import { SiteDetailsPage } from '@/src/modules/content/ui/pages/siteDetailsPage';

test.describe('manage Site Test Suite (ABAC)', { tag: [ContentSuiteTags.MANAGE_SITE] }, () => {
  let homePage: NewHomePage;
  let manageFeaturePage: ManageFeaturesPage;
  let manageSiteSetUpPage: ManageSiteSetUpPage;
  let siteDetailsPage: SiteDetailsPage;
  let editAudienceGroupModalPage: EditAudienceGroupModalPage;

  test.beforeEach('Setting up the test environment for site creation', async ({ appManagerFixture }) => {
    await appManagerFixture.homePage.verifyThePageIsLoaded();
    homePage = new NewHomePage(appManagerFixture.page);
    manageFeaturePage = new ManageFeaturesPage(appManagerFixture.page);
    manageSiteSetUpPage = new ManageSiteSetUpPage(appManagerFixture.page, '');
    siteDetailsPage = new SiteDetailsPage(appManagerFixture.page, '');
    editAudienceGroupModalPage = new EditAudienceGroupModalPage(appManagerFixture.page, '');
  });

  test.afterEach('Site Clean up', async ({ appManagerFixture }) => {});

  test(
    'verify Warning Message Appears After Changing Target Audience',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-38912'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify Warning Message Appears After Changing Target Audience',
        zephyrTestId: 'CONT-38912',
        storyId: 'CONT-38912',
      });
      await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
      await manageFeaturePage.actions.clickOnSitesCard();
      await manageSiteSetUpPage.actions.selectSite();
      await siteDetailsPage.actions.removingAudienceGroup();
      await editAudienceGroupModalPage.actions.clickingOnIUnderstandCheckbox();
      await editAudienceGroupModalPage.actions.clickingOnContinueButton();
      await siteDetailsPage.assertions.verifyWarningMessage();
    }
  );
});
