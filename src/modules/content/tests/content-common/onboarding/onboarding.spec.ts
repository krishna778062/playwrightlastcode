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

  test(
    'verify the onboarding tile on home dashboard as an app manager',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20883'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify the onboarding tile on home dashboard as an app manager [CONT-20883]',
        zephyrTestId: 'CONT-20883',
        storyId: 'CONT-20883',
      });

      // Scenario: Adding Onboarding Tile to Home Dashboard
      // Given: I am an App Manager with control over the dashboard
      // (settings applied from manage app for app manager - already set up via appManagerFixture)

      // When: I add the onboarding tile to the home dashboard
      await test.step('Click on Manage dashboard & carousel button', async () => {
        await homeDashboardPage.actions.clickOnEditDashboardButton();
      });

      await test.step('Click on Add tile button', async () => {
        await homeDashboardPage.actions.clickOnAddTileButton();
      });

      await test.step('Click on Add pages, events & albums button', async () => {
        await homeDashboardPage.actions.clickOnAddContentTileOption();
      });

      await test.step('Click on Onboarding tab', async () => {
        await homeDashboardPage.actions.clickingOnOnboardingTab();
      });

      await test.step('Click on Add to home button', async () => {
        await homeDashboardPage.actions.clickingOnAddToHomeButton();
      });

      // Then: the onboarding tile should be displayed on the home dashboard
      await test.step('Verify onboarding tile is displayed on home dashboard', async () => {
        await homeDashboardPage.assertions.verifyToastMessage('Added tile to dashboard successfully');
        await homeDashboardPage.actions.clickingOnDoneButton();
        await homeDashboardPage.assertions.verifyOnboardingTileIsVisible();
      });

      // Scenario: Attempting to Add Onboarding Tile Again
      // Given: I am an App Manager with control over the dashboard
      // And: the onboarding tile is already added to the home dashboard
      // When: I try to add the onboarding tile to the home dashboard again
      await test.step('Click on Manage dashboard & carousel button again', async () => {
        await homeDashboardPage.actions.clickOnEditDashboardButton();
      });

      await test.step('Click on Add tile button again', async () => {
        await homeDashboardPage.actions.clickOnAddTileButton();
      });

      await test.step('Click on Add pages, events & albums button again', async () => {
        await homeDashboardPage.actions.clickOnAddContentTileOption();
      });

      await test.step('Click on Onboarding tab again', async () => {
        await homeDashboardPage.actions.clickingOnOnboardingTab();
      });

      // Then: the "Add to home" button should be disabled
      await test.step('Verify Add to home button is disabled', async () => {
        await homeDashboardPage.actions.verifyAddToHomeButtonIsDisabled();
      });
    }
  );
});
