import { faker } from '@faker-js/faker';
import {
  CUSTOM_APP_TILES_TEST_DATA,
  DEFAULT_CUSTOM_APP_TILE_CONFIG,
} from '@integrations/test-data/customAppTiles.test-data';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { CustomAppTilesPage } from '@/src/modules/integrations/ui/pages/customAppTilesPage';

test.describe(
  'custom App Tiles Management',
  {
    tag: [IntegrationsSuiteTags.CUSTOM_APP_TILES, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    test(
      'verify Custom App Tiles page loads correctly',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27020',
          storyId: 'INT-18854',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        // Generate unique tile data
        const tileName = `Test Tile ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Test Description ${faker.lorem.sentence()}`;

        // test data
        const { tileType, app, apiAction, previewButton, nextButton } = DEFAULT_CUSTOM_APP_TILE_CONFIG;

        // Navigate to Custom App Tiles page and verify it loads
        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();
        await customAppTilesPage.clickCreateCustomAppTileButton();
        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(tileType);
        await customAppTilesPage.selectApp(app);
        await customAppTilesPage.selectApiAction(apiAction);
        await customAppTilesPage.clickButton(nextButton);
        await customAppTilesPage.clickButton(previewButton);
      }
    );

    test(
      'verify search field functionality',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-18762',
          storyId: 'INT-18762',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();

        // Test search functionality
        await customAppTilesPage.searchForTiles(CUSTOM_APP_TILES_TEST_DATA.SEARCH_TERMS.JIRA_TEST);
        await customAppTilesPage.clearSearch();
        await customAppTilesPage.verifySearchFieldIsEmpty();
        await customAppTilesPage.verifyAllAppTilesVisible();

        // Test no results
        await customAppTilesPage.searchForTiles(CUSTOM_APP_TILES_TEST_DATA.SEARCH_TERMS.NO_RESULTS);
        await customAppTilesPage.verifyResultCount(0);
        await customAppTilesPage.verifyNoResultsText(CUSTOM_APP_TILES_TEST_DATA.MESSAGES.NO_RESULTS_TEXT);
      }
    );

    test(
      'verify apps dropdown functionality',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-18764',
          storyId: 'INT-18764',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();

        // Test apps dropdown
        await customAppTilesPage.verifyCustomAppsCountAtMost(100);

        // Test show more functionality BEFORE clicking it
        await customAppTilesPage.verifyShowMoreIsVisibleIfAboveThreshold(12);

        // Click "Show more" to see all tiles including older Servicenow tiles
        await customAppTilesPage.clickShowMore();

        // Verify "Show more" button is no longer visible after clicking it
        await customAppTilesPage.verifyShowMoreIsNotVisible();

        // Now select apps and verify both are visible after showing more tiles
        await customAppTilesPage.selectAppsInDropdown([
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.APPS.SERVICENOW_CUSTOM_APP,
        ]);
        await customAppTilesPage.closeAppsDropdownWithEscapeKey();

        // Verify that the apps filter is applied (should show "2" in the dropdown)
        await customAppTilesPage.verifyAppsFilterApplied(2);

        // Verify that at least Jira apps are visible (we know these exist)
        await customAppTilesPage.verifyVisibleApps([CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH]);

        // Test that we can clear the filter and see all apps
        await customAppTilesPage.clickOnAppsDropdown();
        await customAppTilesPage.clickClearButtonAboveSearch();
        await customAppTilesPage.closeAppsDropdownWithEscapeKey();

        // Now verify that both app types are visible when no filter is applied
        await customAppTilesPage.verifyVisibleApps([
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.APPS.SERVICENOW_CUSTOM_APP,
        ]);
      }
    );

    test(
      'verify API action field is disabled without selecting app',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-18842',
          storyId: 'INT-18842',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // Generate unique tile data
        const tileName = `Test Tile ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Test Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);

        // Verify API action is disabled
        await customAppTilesPage.verifyApiActionDisabled();
      }
    );

    test(
      'verify save button functionality for app tile',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-18846',
          storyId: 'INT-18846',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // Generate unique tile data
        const tileName = `Test Tile ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Test Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);

        // Verify buttons are disabled initially
        await customAppTilesPage.verifySaveAndNextDisabled('Save', 'Next');

        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS);

        // Verify Save button is now enabled after filling all required fields
        await customAppTilesPage.verifySaveButtonIsEnabled();

        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.SAVE);

        // Verify that Save was successful - Next button should turn blue
        await customAppTilesPage.verifyNextButtonIsPrimary();

        // Navigate back to tiles list to verify the tile was saved
        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();

        // Verify tile is saved and appears in list
        await customAppTilesPage.verifyCreatedTileStatus(CUSTOM_APP_TILES_TEST_DATA.TILE_STATUS.DRAFT);
        await customAppTilesPage.verifyTileIsOnTop(tileName);
      }
    );

    test(
      'verify form tile with overlay behavior',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24557',
          storyId: 'INT-24557',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // Generate unique tile data
        const tileName = `Test Tile ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Test Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.FORM);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT);

        // Configure API action
        await customAppTilesPage.clickButton('Configure API action');
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.CREATE_TICKET);

        // Select "Get from user" options for form fields
        await customAppTilesPage.selectRadioForField('Get from user', 'Email');
        await customAppTilesPage.selectRadioForField('Get from user', 'Summary');
        await customAppTilesPage.selectRadioForField('Get from user', 'Description');

        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.SAVE);

        // Verify "Display in tile" and "Display in overlay" two options are there
        await customAppTilesPage.verifyDisplayDropdownOptions(
          CUSTOM_APP_TILES_TEST_DATA.FORM_BEHAVIOR.DISPLAY_IN_TILE,
          CUSTOM_APP_TILES_TEST_DATA.FORM_BEHAVIOR.DISPLAY_IN_OVERLAY
        );

        // Select overlay behavior
        await customAppTilesPage.selectDisplayOptionInFormBehaviour(
          CUSTOM_APP_TILES_TEST_DATA.FORM_BEHAVIOR.DISPLAY_IN_OVERLAY
        );

        // Verify canvas is auto-populated with button
        await customAppTilesPage.verifyCanvasIsAutoPopulatedWithButton();
      }
    );

    test(
      'verify tile creation form validation',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // Verify buttons are disabled initially (empty form)
        await customAppTilesPage.verifyButtonStates();

        // Test with only tile name
        const tileName = `Validation Test ${faker.string.alphanumeric({ length: 6 })}`;
        await customAppTilesPage.enterTileName(tileName);

        // Verify buttons are still disabled
        await customAppTilesPage.verifyButtonStates();

        // Test with tile name and description
        const tileDescription = `Validation Description ${faker.lorem.sentence()}`;
        await customAppTilesPage.enterTileDescription(tileDescription);

        // Verify buttons are still disabled (missing app and API action)
        await customAppTilesPage.verifyButtonStates();
      }
    );

    test(
      'verify API action dropdown is enabled after app selection',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // Fill required fields
        const tileName = `API Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `API Test Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY);

        // Select an app
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);

        // Verify API action dropdown is enabled
        await customAppTilesPage.verifyApiActionEnabled();
      }
    );

    test(
      'verify cancel button functionality',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // Fill some data
        const tileName = `Cancel Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Cancel Test Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);

        // Click cancel
        await customAppTilesPage.clickButton('Cancel');

        // Verify we're back on the main page
        await customAppTilesPage.verifyThePageIsLoaded();
      }
    );

    test(
      'verify search with special characters',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();

        // Test search with special characters
        await customAppTilesPage.searchForTiles('!@#$%^&*()');
        await customAppTilesPage.verifyResultCount(0);

        // Test search with empty string
        await customAppTilesPage.searchForTiles('');
        await customAppTilesPage.verifyAllAppTilesVisible();

        // Test search with very long string
        const longSearchTerm = 'a'.repeat(100);
        await customAppTilesPage.searchForTiles(longSearchTerm);
        await customAppTilesPage.verifyResultCount(0);
      }
    );

    test(
      'verify tile operations menu',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();

        // Find a tile to test with
        const tileCount = await customAppTilesPage.getRenderedTileCount();
        if (tileCount > 0) {
          // Click on the first tile's more options button
          await customAppTilesPage.clickOnElement(customAppTilesPage.tileMoreButton.first());

          // Verify menu options are visible
          await customAppTilesPage.verifyTileMenuOptionsVisible();

          // Close menu
          await customAppTilesPage.page.keyboard.press('Escape');
        }
      }
    );

    test(
      'verify add custom app link redirect',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ appManagerUiFixture }) => {
        const customAppTilesPage = new CustomAppTilesPage(appManagerUiFixture.page);

        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // Click on "Add custom app" link and verify redirect to new tab
        await customAppTilesPage.clickCreateButton(
          'Add custom app',
          `${PAGE_ENDPOINTS.CUSTOM_APPS_INTEGRATION_PAGE}/new`
        );
      }
    );

    test(
      'verify create API action link redirect',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ appManagerUiFixture }) => {
        const customAppTilesPage = new CustomAppTilesPage(appManagerUiFixture.page);

        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // Click on "Create API action" link and verify redirect to new tab
        await customAppTilesPage.clickCreateButton('Create API action', `${PAGE_ENDPOINTS.API_ACTIONS_PAGE}/create`);
      }
    );

    test(
      'clean up test tiles',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-CLEANUP',
          storyId: 'INT-CLEANUP',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();

        // Clean up all test tiles
        await customAppTilesPage.deleteAllTilesWithPrefix('Test Tile');
      }
    );
  }
);
