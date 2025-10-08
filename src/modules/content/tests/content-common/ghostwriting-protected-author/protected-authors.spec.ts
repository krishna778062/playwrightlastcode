import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationscreenPage';
import { ManageApplicationPage } from '@/src/modules/content/ui/pages/manageApplicationPage';
import { PrivilegesScreenPage } from '@/src/modules/content/ui/pages/privilegesScreenPage';

test.describe('Protected Authors', () => {
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
    'Verify As an application manager, I should be able to add the users to protected authors - authors list)',
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
