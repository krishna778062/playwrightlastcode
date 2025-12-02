import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { TopNavBarComponent } from '@/src/core/ui/components/topNavBarComponent';
import { NotificationType } from '@/src/modules/content/constants';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { HomeDashboardPage } from '@/src/modules/content/ui/pages/homeDashboardPage';
import { MySettingsNotificationsPage } from '@/src/modules/content/ui/pages/mySettingsNotificationsPage';

test.describe('onboarding', () => {
  let navigationHelper: NavigationHelper;
  let mySettingsNotificationsPage: MySettingsNotificationsPage;
  let homeDashboardPage: HomeDashboardPage;

  test.beforeEach('Setup for onboarding test', async ({ appManagerFixture }) => {
    await appManagerFixture.homePage.verifyThePageIsLoaded();
    navigationHelper = appManagerFixture.navigationHelper;
    mySettingsNotificationsPage = new MySettingsNotificationsPage(appManagerFixture.page);
    homeDashboardPage = new HomeDashboardPage(appManagerFixture.page);
  });

  test.afterEach(async ({}) => {});

  test(
    'verify UI of Share your post under My Setting',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19346'],
    },
    async ({ appManagerFixture: _appManagerFixture, standardUserFixture }) => {
      tagTest(test.info(), {
        description: 'Verify UI of Share your post under My Setting',
        zephyrTestId: 'CONT-19346',
        storyId: 'CONT-19346',
      });

      await navigationHelper.navigateToEmailNotificationSettingsPageViaSideNavBar();

      await test.step('Verify My Settings Notifications page is loaded', async () => {
        await mySettingsNotificationsPage.verifyThePageIsLoaded();
      });

      await test.step('Expand Browser Feed notifications section', async () => {
        await mySettingsNotificationsPage.actions.expandBrowserFeedSection();
      });

      await test.step('Verify Share your post checkbox is available', async () => {
        await mySettingsNotificationsPage.assertions.verifyShareYourPostCheckboxIsVisible();
      });

      await test.step('Verify Share your post checkbox is ON by default', async () => {
        await mySettingsNotificationsPage.assertions.verifyShareYourPostCheckboxIsChecked();
      });

      await test.step('Test check/uncheck functionality and save', async () => {
        // Check if checkbox is ON, if so uncheck it first, then check it again
        const isChecked = await mySettingsNotificationsPage.actions.isShareYourPostCheckboxChecked();

        if (isChecked) {
          // Uncheck the checkbox
          await mySettingsNotificationsPage.actions.uncheckShareYourPostCheckbox();
          await mySettingsNotificationsPage.assertions.verifyShareYourPostCheckboxIsUnchecked();

          // Save and verify unchecked
          await mySettingsNotificationsPage.actions.saveAndVerifyUnchecked();
        }

        // Check the checkbox again
        await mySettingsNotificationsPage.actions.checkShareYourPostCheckbox();
        await mySettingsNotificationsPage.assertions.verifyShareYourPostCheckboxIsChecked();

        // Save and verify checked
        await mySettingsNotificationsPage.actions.saveAndVerifyChecked();
      });

      await test.step('Verify and click on Overwrite settings button and confirm, then login as standard user', async () => {
        await mySettingsNotificationsPage.assertions.verifyOverwriteSettingsButtonIsVisible();
        await mySettingsNotificationsPage.actions.clickOnOverwriteSettingsButton();
        await mySettingsNotificationsPage.actions.confirmOverwriteSettings();

        const standardUserTopNavBar = new TopNavBarComponent(standardUserFixture.page);
        const standardUserMySettingsPage = new MySettingsNotificationsPage(standardUserFixture.page);

        const standardUserProfileDropdown = await standardUserTopNavBar.openProfileSettings({
          stepInfo: 'Open profile settings dropdown for standard user',
        });
        await standardUserProfileDropdown.clickOnMySettingsButton({
          stepInfo: 'Click on My settings for standard user',
        });
        await standardUserMySettingsPage.navigateToCurrentUserNotificationSettings(NotificationType.EMAIL);
        await standardUserMySettingsPage.actions.clickOnFeedTab();
        await standardUserMySettingsPage.assertions.verifyShareYourPostCheckboxIsChecked();
      });
    }
  );

  test(
    'verify the onboarding tile on home dashboard as an app manager',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20883'],
    },
    async ({ appManagerFixture: _appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify the onboarding tile on home dashboard as an app manager [CONT-20883]',
        zephyrTestId: 'CONT-20883',
        storyId: 'CONT-20883',
      });

      await homeDashboardPage.actions.clickOnEditDashboardButton();
      await homeDashboardPage.actions.clickOnAddTileButton();
      await homeDashboardPage.actions.clickOnAddContentTileOption();
      await homeDashboardPage.actions.clickingOnOnboardingTab();

      const isButtonDisabled = await homeDashboardPage.actions.isAddToHomeButtonDisabled();
      if (!isButtonDisabled) {
        await homeDashboardPage.actions.clickingOnAddToHomeButton();
        await homeDashboardPage.assertions.verifyToastMessage('Added tile to dashboard successfully');
        await homeDashboardPage.actions.clickingOnDoneButton();
      }

      await homeDashboardPage.actions.clickOnEditDashboardButton();
      await homeDashboardPage.actions.clickOnAddTileButton();
      await homeDashboardPage.actions.clickOnAddContentTileOption();
      await homeDashboardPage.actions.clickingOnOnboardingTab();
      await homeDashboardPage.actions.verifyAddToHomeButtonIsDisabled();
    }
  );
});
