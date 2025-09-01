import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ManageContentPage } from '../../../pages/manageContentPage';
import { ManageFeaturePage } from '../../../pages/manageFeaturePage';

import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';

test.describe(
  ContentSuiteTags.MANAGE_CONTENT,
  {
    tag: [ContentSuiteTags.MANAGE_CONTENT],
  },
  () => {
    let manageFeaturePage: ManageFeaturePage;
    let manageContentPage: ManageContentPage;
    test.beforeEach(async ({ loginAs, page }) => {
      // Login as app manager using loginAs

      manageFeaturePage = new ManageFeaturePage(page);
      manageContentPage = new ManageContentPage(page);
    });

    test.afterEach(async ({ page }) => {
      await page.close();
    });
    test(
      'Verify "Nothing to show here" should come when user searches non-existing content and on clicking x all results should come based on relevant filters',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({ loginAs }) => {
        tagTest(test.info(), {
          description: 'Login as Admin',
          zephyrTestId: 'CONT-25055',
          storyId: 'CONT-25055',
        });
        await loginAs('appManager');

        const title = faker.lorem.words(10);
        await manageFeaturePage.actions.navigateToContentButton();
        await manageContentPage.actions.writeRandomTextInSearchBar(title);
        await manageContentPage.actions.clickSearchIcon();
        await manageContentPage.assertions.nothingToShowHereText();
        await manageContentPage.actions.clickXButton();
        await manageContentPage.assertions.placeHolderTextShouldBeVisible();
      }
    );
    test(
      'Verify "Nothing to show here" should come when user searches non-existing content and on clicking x all results should come based on relevant filters - End User',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({ loginAs }) => {
        tagTest(test.info(), {
          description: 'Login as End User who is Site Owner/Manager of any site',
          zephyrTestId: 'CONT-25055',
          storyId: 'CONT-25055',
        });
        await loginAs('endUser');
        const title = faker.lorem.words(10);
        await manageFeaturePage.actions.navigateToContentButton();
        await manageContentPage.actions.writeRandomTextInSearchBar(title);
        await manageContentPage.actions.clickSearchIcon();
        await manageContentPage.assertions.nothingToShowHereText();
        await manageContentPage.actions.clickXButton();
        await manageContentPage.assertions.placeHolderTextShouldBeVisible();
      }
    );

    test(
      'Verify Bulk actions Functionality in My Content Screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({ loginAs }) => {
        tagTest(test.info(), {
          description: 'Login as Admin',
          zephyrTestId: 'CONT-25055',
          storyId: 'CONT-25055',
        });
        await loginAs('endUser');
        await manageFeaturePage.actions.navigateToContentButton();
        await manageContentPage.actions.clickOnFirstContentButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnUnpublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnPublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnMoveButton();
        await manageContentPage.actions.clickOnApplyButton();
        const siteName = 'Testing';
        await manageContentPage.actions.moveContentSearchBar(siteName);
        await manageContentPage.actions.siteListSelecting();
        await manageContentPage.actions.clickOnMoveConfirmButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnDeleteButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.clickOnSelectAllButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnValidateButton();
        await manageContentPage.actions.clickOnApplyButton();
      }
    );

    test(
      'Verify content publish and unpublish option in My Content Screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({ loginAs }) => {
        tagTest(test.info(), {
          description: 'Login as Admin',
          zephyrTestId: 'CONT-25055',
          storyId: 'CONT-25055',
        });
        await loginAs('endUser');
        await manageFeaturePage.actions.navigateToContentButton();
        await manageContentPage.actions.clickOnFirstDropDownOption();
        await manageContentPage.actions.checkPublishOption();
      }
    );

    test(
      'Verify Delete Modal Cancel and Delete Button of Content from My Content Screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({ loginAs }) => {
        tagTest(test.info(), {
          description: 'Login as Admin',
          zephyrTestId: 'CONT-25055',
          storyId: 'CONT-25055',
        });
        await loginAs('endUser');
        await manageFeaturePage.actions.navigateToContentButton();
        await manageContentPage.actions.clickOnFirstDropDownOption();
        await manageContentPage.actions.clickDeleteOption();
        await manageContentPage.actions.clickDeleteModalConfirmButton();
      }
    );

    test.only(
      'Verification of various aspects of My Content screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({ loginAs }) => {
        tagTest(test.info(), {
          description: 'Login as Admin',
          zephyrTestId: 'CONT-25055',
          storyId: 'CONT-25055',
        });
        await loginAs('endUser');
        await manageFeaturePage.actions.navigateToContentButton();
      }
    );
  }
);
