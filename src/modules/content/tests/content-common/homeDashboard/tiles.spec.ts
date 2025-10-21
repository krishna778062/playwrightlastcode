import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { HomeDashboardPage } from '@/src/modules/content/ui/pages/homeDashboardPage';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';

test.describe('edit Topic', () => {
  let homeDashboardPage: HomeDashboardPage;
  let contentPreviewPage: ContentPreviewPage;
  let manageFeaturesPage: ManageFeaturesPage;
  let manageContentPage: ManageContentPage;
  test.beforeEach('Setup for home dashboard tiles test', async ({ appManagerFixture }) => {
    homeDashboardPage = new HomeDashboardPage(appManagerFixture.page);
    contentPreviewPage = new ContentPreviewPage(appManagerFixture.page);
    manageFeaturesPage = new ManageFeaturesPage(appManagerFixture.page);
    manageContentPage = new ManageContentPage(appManagerFixture.page);
  });

  test.afterEach(async ({}) => {});

  test(
    'to verify content changes in home dashboard tiles',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.CONTENT_HOME_DASHBOARD_TILES],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'to verify content changes in home dashboard tiles',
        zephyrTestId: 'CONT-22815',
        storyId: 'CONT-22815',
      });
      await homeDashboardPage.actions.clickOnEditDashboardButton();
      await homeDashboardPage.actions.clickOnAddTileButton();
      await homeDashboardPage.actions.clickOnAddContentTileOption();
      await homeDashboardPage.actions.selectingPagesAsContentType();
      const tileName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Tile`;
      await homeDashboardPage.actions.namingTheTile(tileName);
      await homeDashboardPage.actions.clickingOnAddToHomeButton();
      await homeDashboardPage.assertions.verifyToastMessage('Added tile to dashboard successfully');
      await homeDashboardPage.actions.clickingOnDoneButton();
      await homeDashboardPage.assertions.verifyingThePageTileSectionIsVisible(tileName);

      // Get the "All Employees" site ID for API page creation
      const allEmployeesSiteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName('All Employees');

      // Generate random page name using faker
      const randomPageName = CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.title;

      // Create page using API with the topic
      const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
        siteId: allEmployeesSiteId,
        contentInfo: {
          contentType: 'page',
          contentSubType: 'knowledge',
        },
        options: {
          pageName: randomPageName,
          contentDescription: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.description,
          waitForSearchIndex: false,
        },
      });
      await appManagerFixture.page.reload();
      await homeDashboardPage.assertions.verifyingCreatedPageIsVisibleInTile(randomPageName);
      await homeDashboardPage.actions.openingCreatedPageInTile(randomPageName);
      await contentPreviewPage.actions.unpublishingTheContent();
      await contentPreviewPage.assertions.verifyUnpulishedContentToastMessage('Unpublished content successfully');
      await appManagerFixture.navigationHelper.clickOnHomeButton();
      await appManagerFixture.page.reload();
      await homeDashboardPage.assertions.verifyingCreatedPageIsNotVisibleInTile(randomPageName);
      await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
      await manageFeaturesPage.actions.clickOnContentCard();
      await manageContentPage.actions.writeRandomTextInSearchBar(randomPageName);
      await manageContentPage.actions.clickSearchIcon();
      await appManagerFixture.page.reload();
      await manageContentPage.actions.openContentDetailsPage();
      await contentPreviewPage.actions.publishingTheContent();
      await appManagerFixture.navigationHelper.clickOnHomeButton();
      await appManagerFixture.page.reload();
      await homeDashboardPage.assertions.verifyingCreatedPageIsVisibleInTile(randomPageName);
      await homeDashboardPage.actions.openingCreatedPageInTile(randomPageName);
      // Delete the page using API
      await appManagerFixture.contentManagementHelper.deleteContent(allEmployeesSiteId, pageInfo.contentId);
      await appManagerFixture.navigationHelper.clickOnHomeButton();
      await appManagerFixture.page.reload();
      await homeDashboardPage.assertions.verifyingCreatedPageIsNotVisibleInTile(randomPageName);
      await homeDashboardPage.actions.clickOnEditDashboardButton();
      await homeDashboardPage.actions.clickingOnEditTileButton(tileName);
      await homeDashboardPage.actions.selectingSiteRadioButton('All Employees');
      await homeDashboardPage.actions.selectingShowcaseRadioButton();
      await homeDashboardPage.actions.clickingOnSaveButton();
      await homeDashboardPage.assertions.verifyToastMessage('Edited dashboard tile successfully');
      await homeDashboardPage.actions.clickingOnRemoveTileButton(tileName);
      await homeDashboardPage.assertions.verifyToastMessage('Removed tile from dashboard successfully');
      await homeDashboardPage.assertions.verifyingThePageTileSectionIsNotVisible(tileName);
    }
  );
});
