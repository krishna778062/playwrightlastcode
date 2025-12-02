import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { TopNavBarComponent } from '@/src/core/ui/components/topNavBarComponent';
import { NotificationType } from '@/src/modules/content/constants';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { MySettingsNotificationsPage } from '@/src/modules/content/ui/pages/mySettingsNotificationsPage';

test.describe('onboarding', () => {
  let navigationHelper: NavigationHelper;
  let mySettingsNotificationsPage: MySettingsNotificationsPage;

  test.beforeEach('Setup for onboarding test', async ({ appManagerFixture }) => {
    await appManagerFixture.homePage.verifyThePageIsLoaded();
    navigationHelper = appManagerFixture.navigationHelper;
    mySettingsNotificationsPage = new MySettingsNotificationsPage(appManagerFixture.page);
  });

  test.afterEach(async ({}) => {});

  test(
    'verify UI of Share your post under My Setting',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19346'],
    },
    async ({ appManagerFixture, standardUserFixture }) => {
      tagTest(test.info(), {
        description: 'Verify UI of Share your post under My Setting',
        zephyrTestId: 'CONT-19346',
        storyId: 'CONT-19346',
      });

      // Step 2: Navigate via Side Navbar > Application settings > Application > Defaults > Email Notifications
      await navigationHelper.navigateToEmailNotificationSettingsPageViaSideNavBar();

      // Step 3: Verify My Settings Notifications page is loaded
      await test.step('Verify My Settings Notifications page is loaded', async () => {
        await mySettingsNotificationsPage.verifyThePageIsLoaded();
      });

      // Step 4: Ensure Browser > Feed is open so the checkbox is rendered
      await test.step('Expand Browser Feed notifications section', async () => {
        await mySettingsNotificationsPage.actions.expandBrowserFeedSection();
      });

      // Step 5: Verify the checkbox for "Share your post" must be available
      await test.step('Verify Share your post checkbox is available', async () => {
        await mySettingsNotificationsPage.assertions.verifyShareYourPostCheckboxIsVisible();
      });

      // Step 6: The setting will be by default turned ON for all users within the instance
      await test.step('Verify Share your post checkbox is ON by default', async () => {
        await mySettingsNotificationsPage.assertions.verifyShareYourPostCheckboxIsChecked();
      });

      // Step 7: User is able to check/uncheck the checkbox and save the setting
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

      // Step 8: When user click on overwrite settings at the bottom of the page
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
});
