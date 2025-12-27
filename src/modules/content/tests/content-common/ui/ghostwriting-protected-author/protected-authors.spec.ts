import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationsScreenPage';
import { ManageApplicationPage } from '@/src/modules/content/ui/pages/manageApplicationPage';
import { PrivilegesScreenPage } from '@/src/modules/content/ui/pages/privilegesScreenPage';

test.describe('protected Authors', () => {
  let applicationScreen: ApplicationScreenPage;
  let manageApplicationPage: ManageApplicationPage;
  let privilegesScreenPage: PrivilegesScreenPage;

  test.beforeEach('Setup for protected authors test', async ({ appManagerFixture }) => {
    applicationScreen = new ApplicationScreenPage(appManagerFixture.page);
    manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
    privilegesScreenPage = new PrivilegesScreenPage(appManagerFixture.page);
  });

  test.afterEach(async ({}) => {});

  test(
    'verify As an application manager, I should be able to add the users to protected authors - authors list) CONT-32768',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.ADD_USERS_TO_AUTHOR],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Verify As an application manager, I should be able to add the users to protected authors - authors list',
        zephyrTestId: 'CONT-32768',
        storyId: 'CONT-32768',
      });
      const loggedInUserName = await appManagerFixture.homePage.getCurrentLoggedInUserName(
        'Get current logged-in user name'
      );
      await appManagerFixture.homePage.verifyThePageIsLoaded();
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreen.clickOnApplication();
      await manageApplicationPage.clickOnPrivileges();
      await privilegesScreenPage.verifyProtectedAuthorsAuthorsFieldBarIsVisible();
      await privilegesScreenPage.verifyProtectedAuthorsAllowlistFieldBarIsVisible();
      await privilegesScreenPage.fillProtectedAuthorsAuthorsFieldBarWithLoggedInUser(loggedInUserName);
      await privilegesScreenPage.clickOnSave();
      await privilegesScreenPage.verifyTheChangesConfirmationToastMessageIsVisible();
      await privilegesScreenPage.clickOnCrossUserFromAuthorList();
      await privilegesScreenPage.clickOnSave();
      await privilegesScreenPage.verifyTheChangesConfirmationToastMessageIsVisible();
      await privilegesScreenPage.reloadScreen();
    }
  );

  test(
    'verify As an application manager, I should be able to add the users to protected authors - allow list) CONT-32769',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.ADD_USERS_TO_ALLOWLIST],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Verify As an application manager, I should be able to add the users to protected authors - allow list',
        zephyrTestId: 'CONT-32769',
        storyId: 'CONT-32769',
      });
      const loggedInUserName = await appManagerFixture.homePage.getCurrentLoggedInUserName(
        'Get current logged-in user name'
      );
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreen.clickOnApplication();
      await manageApplicationPage.clickOnPrivileges();
      await privilegesScreenPage.verifyProtectedAuthorsAuthorsFieldBarIsVisible();
      await privilegesScreenPage.verifyProtectedAuthorsAllowlistFieldBarIsVisible();
      await privilegesScreenPage.fillProtectedAuthorsAllowlistFieldBarWithLoggedInUser(loggedInUserName);
      await privilegesScreenPage.clickOnSave();
      await privilegesScreenPage.verifyTheChangesConfirmationToastMessageIsVisible();
      await privilegesScreenPage.clickOnCrossAllowlistUser();
      await privilegesScreenPage.clickOnSave();
      await privilegesScreenPage.verifyTheChangesConfirmationToastMessageIsVisible();
      await privilegesScreenPage.reloadScreen();
      await privilegesScreenPage.verifyAddedUserGotRemovedFromList(loggedInUserName);
    }
  );
});
