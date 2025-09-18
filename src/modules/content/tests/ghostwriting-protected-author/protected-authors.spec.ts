import { expect, Page } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { tagTest } from '@core/utils/testDecorator';

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

  test.beforeEach('Setup for protected authors test', async ({ page, loginAs }) => {
    await loginAs('appManager');
    applicationScreen = new ApplicationScreenPage(page);
    homePage = new NewUxHomePage(page);
    manageApplicationPage = new ManageApplicationPage(page);
    privilegesScreenPage = new PrivilegesScreenPage(page);
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
      const userName = await page.evaluate(() => {
        const user = (window as any).Simpplr?.CurrentUser;
        return user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email;
      });
      await homePage.actions.navigateToApplication();
      await applicationScreen.actions.clickOnApplication();
      await manageApplicationPage.actions.clickOnPrivileges();
      await privilegesScreenPage.assertions.verifyTheProtectedAuthorsAuthorsIsVisible();
      await privilegesScreenPage.assertions.verifyTheProtectedAuthorsAllowlistIsVisible();
      await privilegesScreenPage.actions.verifyAndFillProtectedAuthorsAuthors(userName);
      await privilegesScreenPage.actions.clickOnSave();
      await privilegesScreenPage.assertions.verifyTheChangesConfirmationIsVisible();
      await privilegesScreenPage.actions.clickOnCrossUser();
      await privilegesScreenPage.actions.clickOnSave();
    }
  );
});
