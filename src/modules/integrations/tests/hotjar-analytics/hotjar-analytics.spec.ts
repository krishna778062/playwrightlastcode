import { IntegrationsFeatureTags, IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { AnalyticsEmbedsPage } from '@/src/modules/integrations/ui/pages/analyticsEmbedsPage';

test.describe(
  'hotjar analytics test cases',
  {
    tag: [
      IntegrationsSuiteTags.INTEGRATIONS,
      IntegrationsSuiteTags.PHOENIX,
      IntegrationsSuiteTags.HOTJAR,
      IntegrationsFeatureTags.HOTJAR,
    ],
  },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      const analyticsEmbedsPage = new AnalyticsEmbedsPage(appManagerFixture.page);
      await analyticsEmbedsPage.actions.navigateToAnalyticsEmbedsPage();
      await analyticsEmbedsPage.assertions.verifyThePageIsLoaded();

      // Check if Google Analytics checkbox is checked, if yes then uncheck it
      const isGoogleAnalyticsChecked = await analyticsEmbedsPage.googleAnalyticsCheckbox.isChecked();
      if (isGoogleAnalyticsChecked) {
        await analyticsEmbedsPage.actions.clickOnGoogleAnalyticsCheckbox();
        await analyticsEmbedsPage.actions.clickOnSaveButton();
        await analyticsEmbedsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');
      }

      // Check if Hotjar checkbox is checked, if yes then uncheck it
      const isHotjarChecked = await analyticsEmbedsPage.hotjarAnalyticsCheckbox.isChecked();
      if (isHotjarChecked) {
        await analyticsEmbedsPage.actions.clickOnHotjarAnalyticsCheckbox();
        await analyticsEmbedsPage.actions.clickOnSaveButton();
        await analyticsEmbedsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');
      }
    });

    test.afterEach(async ({ appManagerFixture }) => {
      const analyticsEmbedsPage = new AnalyticsEmbedsPage(appManagerFixture.page);
      await analyticsEmbedsPage.actions.navigateToAnalyticsEmbedsPage();
      await analyticsEmbedsPage.assertions.verifyThePageIsLoaded();

      // Check if Google Analytics checkbox is checked, if yes then uncheck it
      const isGoogleAnalyticsChecked = await analyticsEmbedsPage.googleAnalyticsCheckbox.isChecked();
      if (isGoogleAnalyticsChecked) {
        await analyticsEmbedsPage.actions.clickOnGoogleAnalyticsCheckbox();
        await analyticsEmbedsPage.actions.clickOnSaveButton();
        await analyticsEmbedsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');
      }

      // Check if Hotjar checkbox is checked, if yes then uncheck it
      const isHotjarChecked = await analyticsEmbedsPage.hotjarAnalyticsCheckbox.isChecked();
      if (isHotjarChecked) {
        await analyticsEmbedsPage.actions.clickOnHotjarAnalyticsCheckbox();
        await analyticsEmbedsPage.actions.clickOnSaveButton();
        await analyticsEmbedsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');
      }
    });

    test(
      'verify hotjar analytics configuration with valid site id and version',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          storyId: 'INT-28763',
          zephyrTestId: 'INT-28833',
        });

        const analyticsEmbedsPage = new AnalyticsEmbedsPage(appManagerFixture.page);

        // Step 1: Navigate to analytics & embeds page
        await analyticsEmbedsPage.actions.navigateToAnalyticsEmbedsPage();
        await analyticsEmbedsPage.assertions.verifyThePageIsLoaded();

        // Step 2: Enable Hotjar analytics checkbox
        await analyticsEmbedsPage.actions.clickOnHotjarAnalyticsCheckbox();
        await analyticsEmbedsPage.assertions.verifyHotjarDescriptionText();

        // Step 2: Enter a valid 6 digit number in siteId and single digit number in version
        await analyticsEmbedsPage.hotjarSiteIdInputbox.fill('123456');
        await analyticsEmbedsPage.hotjarVersionInputbox.fill('1');

        // Step 3: Click on Save
        await analyticsEmbedsPage.actions.clickOnSaveButton();

        // Step 4: Wait for toast message "Saved changes successfully"
        await analyticsEmbedsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

        // Cleanup:
        await analyticsEmbedsPage.actions.clickOnHotjarAnalyticsCheckbox();
        await analyticsEmbedsPage.actions.clickOnSaveButton();
        await analyticsEmbedsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');
      }
    );

    test(
      'verify hotjar analytics validation with alphanumeric site id and version',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28834',
          storyId: 'INT-28765',
        });

        const analyticsEmbedsPage = new AnalyticsEmbedsPage(appManagerFixture.page);

        // Step 1: Navigate to analytics & embeds page
        await analyticsEmbedsPage.actions.navigateToAnalyticsEmbedsPage();
        await analyticsEmbedsPage.assertions.verifyThePageIsLoaded();

        // Step 2: Enable Hotjar analytics checkbox
        await analyticsEmbedsPage.actions.clickOnHotjarAnalyticsCheckbox();
        await analyticsEmbedsPage.assertions.verifyHotjarDescriptionText();

        // Step 3: Enter alphanumeric values in siteId and version
        await analyticsEmbedsPage.hotjarSiteIdInputbox.fill('abc123');
        await analyticsEmbedsPage.hotjarVersionInputbox.fill('abc123');
        await analyticsEmbedsPage.hotjarSiteIdInputbox.click();

        // Step 4: Verify error messages for both fields (should be number only)
        await analyticsEmbedsPage.assertions.verifyHotjarSiteIdShouldBeNumberOnlyErrorMessage();
        await analyticsEmbedsPage.assertions.verifyHotjarVersionShouldBeNumberOnlyErrorMessage();

        // Cleanup: Disable Hotjar checkbox
        await analyticsEmbedsPage.actions.clickOnHotjarAnalyticsCheckbox();
      }
    );

    test(
      'verify hotjar analytics validation with blank site id and version fields',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28835',
          storyId: 'INT-28764',
        });

        const analyticsEmbedsPage = new AnalyticsEmbedsPage(appManagerFixture.page);

        // Step 1: Navigate to analytics & embeds page
        await analyticsEmbedsPage.actions.navigateToAnalyticsEmbedsPage();
        await analyticsEmbedsPage.assertions.verifyThePageIsLoaded();

        // Step 2: Enable Hotjar analytics checkbox
        await analyticsEmbedsPage.actions.clickOnHotjarAnalyticsCheckbox();
        await analyticsEmbedsPage.assertions.verifyHotjarDescriptionText();

        await analyticsEmbedsPage.hotjarSiteIdInputbox.fill('');
        await analyticsEmbedsPage.hotjarVersionInputbox.fill('');
        await analyticsEmbedsPage.hotjarSiteIdInputbox.click();

        // Step 4: Verify "required field" error messages for both fields
        await analyticsEmbedsPage.assertions.verifyHotjarSiteIdNotEnteredErrorMessage();
        await analyticsEmbedsPage.assertions.verifyHotjarVersionNotEnteredErrorMessage();

        // Cleanup: Disable Hotjar checkbox
        await analyticsEmbedsPage.actions.clickOnHotjarAnalyticsCheckbox();
      }
    );

    test(
      'verify hotjar analytics validation with site id minimum length is 4 digits and maximum length is 7 digits',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28836',
          storyId: 'INT-28766',
        });

        const analyticsEmbedsPage = new AnalyticsEmbedsPage(appManagerFixture.page);

        // Step 1: Navigate to analytics & embeds page
        await analyticsEmbedsPage.actions.navigateToAnalyticsEmbedsPage();
        await analyticsEmbedsPage.assertions.verifyThePageIsLoaded();

        // Step 2: Enable Hotjar analytics checkbox
        await analyticsEmbedsPage.actions.clickOnHotjarAnalyticsCheckbox();
        await analyticsEmbedsPage.assertions.verifyHotjarDescriptionText();

        // Step 3: Enter Site ID with more than 6 digits and any version
        await analyticsEmbedsPage.hotjarSiteIdInputbox.fill('123'); // 4 digits (valid)
        await analyticsEmbedsPage.hotjarVersionInputbox.fill('1');
        await analyticsEmbedsPage.actions.clickOnSaveButton();
        await analyticsEmbedsPage.verifyToastMessageIsVisibleWithText('Invalid SiteId');

        // Step 6: Enter Site ID with more than 7 digits and any version
        await analyticsEmbedsPage.hotjarSiteIdInputbox.fill('12345678'); // 8 digits (invalid)
        await analyticsEmbedsPage.actions.clickOnSaveButton();
        await analyticsEmbedsPage.verifyToastMessageIsVisibleWithText('Invalid SiteId');

        // enter valid site id and version
        await analyticsEmbedsPage.hotjarSiteIdInputbox.fill('1234567'); // 7 digits (valid)
        await analyticsEmbedsPage.hotjarVersionInputbox.fill('1');
        await analyticsEmbedsPage.actions.clickOnSaveButton();
        await analyticsEmbedsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

        await analyticsEmbedsPage.hotjarSiteIdInputbox.fill('1234'); // 4 digits (valid)
        await analyticsEmbedsPage.hotjarVersionInputbox.fill('1');
        await analyticsEmbedsPage.actions.clickOnSaveButton();
        await analyticsEmbedsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

        // Cleanup: Disable Hotjar checkbox
        await analyticsEmbedsPage.actions.clickOnHotjarAnalyticsCheckbox();
        await analyticsEmbedsPage.actions.clickOnSaveButton();
      }
    );

    test(
      'verify saving google analytics and hotjar together',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28837',
          storyId: 'INT-28767',
        });

        const analyticsEmbedsPage = new AnalyticsEmbedsPage(appManagerFixture.page);

        // Step 1: Navigate to analytics & embeds page
        await analyticsEmbedsPage.actions.navigateToAnalyticsEmbedsPage();
        await analyticsEmbedsPage.assertions.verifyThePageIsLoaded();

        // Step 2: Enable Google Analytics checkbox
        await analyticsEmbedsPage.actions.clickOnGoogleAnalyticsCheckbox();
        await analyticsEmbedsPage.assertions.verifyGoogleAnalyticsDescriptionText();

        await analyticsEmbedsPage.googleAnalytics4Inputbox.fill('G-XXXXXXXXXX');

        // Step 4: Enable Hotjar analytics checkbox
        await analyticsEmbedsPage.actions.clickOnHotjarAnalyticsCheckbox();
        await analyticsEmbedsPage.assertions.verifyHotjarDescriptionText();

        // Step 5: Enter valid Hotjar Site ID and Version
        await analyticsEmbedsPage.hotjarSiteIdInputbox.fill('123456');
        await analyticsEmbedsPage.hotjarVersionInputbox.fill('1');

        // Step 6: Click on Save
        await analyticsEmbedsPage.actions.clickOnSaveButton();

        // Step 7: Verify success toast message
        await analyticsEmbedsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

        // Cleanup: Disable both Google Analytics and Hotjar
        await analyticsEmbedsPage.actions.clickOnGoogleAnalyticsCheckbox();
        await analyticsEmbedsPage.actions.clickOnHotjarAnalyticsCheckbox();
        await analyticsEmbedsPage.actions.clickOnSaveButton();
        await analyticsEmbedsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');
      }
    );

    test(
      'verify saving google analytics',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28838',
          storyId: 'INT-28768',
        });

        const analyticsEmbedsPage = new AnalyticsEmbedsPage(appManagerFixture.page);

        // Step 1: Navigate to analytics & embeds page
        await analyticsEmbedsPage.actions.navigateToAnalyticsEmbedsPage();
        await analyticsEmbedsPage.assertions.verifyThePageIsLoaded();

        // Step 2: Enable Google Analytics checkbox
        await analyticsEmbedsPage.actions.clickOnGoogleAnalyticsCheckbox();
        await analyticsEmbedsPage.assertions.verifyGoogleAnalyticsDescriptionText();

        await analyticsEmbedsPage.googleAnalytics4Inputbox.fill('G-XXXXXXXXXX');

        // Step 3: Click on Save
        await analyticsEmbedsPage.actions.clickOnSaveButton();

        // Step 7: Verify success toast message
        await analyticsEmbedsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

        // Cleanup: Disable Google Analytics
        await analyticsEmbedsPage.actions.clickOnGoogleAnalyticsCheckbox();
        await analyticsEmbedsPage.actions.clickOnSaveButton();
        await analyticsEmbedsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');
      }
    );
  }
);
