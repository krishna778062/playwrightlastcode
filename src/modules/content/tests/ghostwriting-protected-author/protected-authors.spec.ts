import { expect, Page } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { tagTest } from '@core/utils/testDecorator';

import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';
import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ApplicationScreenPage } from '@/src/modules/content/pages/applicationscreenPage';
import { ManageApplicationPage } from '@/src/modules/content/pages/manageApplicationPage';
import { PrivilegesScreenPage } from '@/src/modules/content/pages/privilegesScreenPage';

test.describe('Protected Authors', () => {
  let applicationScreen: ApplicationScreenPage;
  let homePage: NewUxHomePage;
  let manageApplicationPage: ManageApplicationPage;
  let privilegesScreenPage: PrivilegesScreenPage;
  let baseActionUtil: BaseActionUtil;

  test.beforeEach('Setup for protected authors test', async ({ appManagersPage }) => {
    applicationScreen = new ApplicationScreenPage(appManagersPage);
    homePage = new NewUxHomePage(appManagersPage);
    manageApplicationPage = new ManageApplicationPage(appManagersPage);
    privilegesScreenPage = new PrivilegesScreenPage(appManagersPage);
    baseActionUtil = new BaseActionUtil(appManagersPage);
  });

  test.afterEach(async ({}) => {});
  test(
    'Verify As an application manager, I should be able to add the users to protected authors - authors list)',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.ADD_USERS_TO_AUTHOR],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        description:
          'Verify As an application manager, I should be able to add the users to protected authors - authors list',
        zephyrTestId: 'CONT-32768',
        storyId: 'CONT-32768',
      });
      const loggedInUserName = await baseActionUtil.getCurrentLoggedInUserName('Get current logged-in user name');
      await homePage.actions.navigateToApplication();
      await applicationScreen.actions.clickOnApplication();
      await manageApplicationPage.actions.clickOnPrivileges();
      await privilegesScreenPage.assertions.verifyProtectedAuthorsAuthorsFieldBarIsVisible();
      await privilegesScreenPage.assertions.verifyProtectedAuthorsAllowlistFieldBarIsVisible();
      await privilegesScreenPage.actions.fillProtectedAuthorsAuthorsFieldBarWithLoggedInUser(loggedInUserName);
      await privilegesScreenPage.actions.clickOnSave();
      await privilegesScreenPage.assertions.verifyTheChangesConfirmationToastMessageIsVisible();
      await privilegesScreenPage.actions.clickOnCrossUserFromAuthorList();
      await privilegesScreenPage.actions.clickOnSave();
      await privilegesScreenPage.assertions.verifyTheChangesConfirmationToastMessageIsVisible();
      await privilegesScreenPage.reloadScreen();
    }
  );
});
