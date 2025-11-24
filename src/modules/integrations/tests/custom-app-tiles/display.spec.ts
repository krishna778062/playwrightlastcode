import { faker } from '@faker-js/faker';
import {
  CUSTOM_APP_TILES_TEST_DATA,
  DEFAULT_CUSTOM_APP_TILE_CONFIG,
  IMAGE_ASPECT_RATIO_1_1,
  IMAGE_ASPECT_RATIO_16_9,
} from '@integrations/test-data/customAppTiles.test-data';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { CustomAppTilesPage } from '@/src/modules/integrations/ui/pages/customAppTilesPage';

test.describe(
  'display App Tiles Management',
  {
    tag: [IntegrationsSuiteTags.CUSTOM_APP_TILES, IntegrationsSuiteTags.ABSOLUTE, IntegrationsSuiteTags.DISPLAY],
  },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
      await customAppTilesPage.loadPage();
      await customAppTilesPage.verifyThePageIsLoaded();
    });

    test(
      'verify Custom App Tiles page loads correctly',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28723',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const tileName = `Test Tile Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Test Description ${faker.lorem.sentence()}`;

        const { tileType, app, apiAction, previewButton, nextButton } = DEFAULT_CUSTOM_APP_TILE_CONFIG;

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
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.searchForTiles(CUSTOM_APP_TILES_TEST_DATA.SEARCH_TERMS.JIRA_TEST);
        await customAppTilesPage.clearSearch();
        await customAppTilesPage.verifySearchFieldIsEmpty();
        await customAppTilesPage.verifyAllAppTilesVisible();
        await customAppTilesPage.searchForTiles(CUSTOM_APP_TILES_TEST_DATA.SEARCH_TERMS.NO_RESULTS);
        await customAppTilesPage.verifyResultCount(0);
        await customAppTilesPage.verifyNoResultsText(MESSAGES.NO_RESULTS_TEXT);
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
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.verifyCustomAppsCountAtMost(100);

        // "Show more" button appears when there are 10 or more tiles
        // This test handles varying tile counts dynamically
        const showMoreThreshold = 10;

        // Check if button is visible (it appears at 10+ tiles when more tiles exist)
        const isShowMoreVisible = await customAppTilesPage.showMoreButton
          .isVisible({ timeout: 2000 })
          .catch(() => false);

        if (isShowMoreVisible) {
          // Verify and interact with "Show more" button
          await customAppTilesPage.verifyShowMoreIsVisibleIfAboveThreshold(showMoreThreshold - 1);
          await customAppTilesPage.clickShowMore();
          // After clicking, button may disappear if all tiles are now shown
          await customAppTilesPage.verifyShowMoreIsNotVisible();
        } else {
          // Verify "Show more" is not visible when tile count is below threshold or all tiles are shown
          await customAppTilesPage.verifyShowMoreIsNotVisible();
        }
        await customAppTilesPage.selectAppsInDropdown([
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.APPS.SERVICENOW_CUSTOM_APP,
        ]);
        await customAppTilesPage.closeAppsDropdownWithEscapeKey();
        await customAppTilesPage.verifyAppsFilterApplied(2);
        await customAppTilesPage.verifyVisibleApps([CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH]);
        await customAppTilesPage.clickOnAppsDropdown();
        await customAppTilesPage.clickClearButtonAboveSearch();
        await customAppTilesPage.closeAppsDropdownWithEscapeKey();
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
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        await customAppTilesPage.clickCreateCustomAppTileButton();
        const tileName = `Test Tile Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Test Description ${faker.lorem.sentence()}`;
        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        // verify API action is disabled without selecting app
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
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        await customAppTilesPage.clickCreateCustomAppTileButton();
        // enter tile name and description
        const tileName = `Test Tile Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Test Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);

        // Buttons are disabled until API action is selected
        await customAppTilesPage.verifySaveAndNextDisabled('Save', 'Next');
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS);
        await customAppTilesPage.verifySaveButtonIsEnabled();
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.SAVE);

        // After saving, Next button should turn primary (blue) to indicate progress
        await customAppTilesPage.verifyNextButtonIsPrimary();

        // Navigate back to tiles list to verify the tile was saved
        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();

        // Verify tile was saved and appears at the top of the list (most recent first)
        await customAppTilesPage.verifyCreatedTileStatus(CUSTOM_APP_TILES_TEST_DATA.TILE_STATUS.DRAFT);
        await customAppTilesPage.verifyTileIsOnTop(tileName);
      }
    );

    test(
      'verify display tile save and publish',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28950',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // enter tile name and description
        const tileName = `Display Container Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Display Container Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS);
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT);

        // Drag container and text blocks
        await customAppTilesPage.dragToCanvas('Text');

        // Save and preview
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.SAVE);
        await customAppTilesPage.verifyToastMessage(MESSAGES.TILE_SAVED_DRAFT);
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.PUBLISH);
        await customAppTilesPage.verifyToastMessage(MESSAGES.TILE_PUBLISHED);
      }
    );

    test(
      'verify tile creation form validation',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28707',
        });
        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.clickCreateCustomAppTileButton();

        // Verify buttons are disabled on empty form (no tile name/description yet)
        await customAppTilesPage.verifyButtonStates();

        // enter tile name and description
        const tileName = `Validation Test ${faker.string.alphanumeric({ length: 6 })}`;
        await customAppTilesPage.enterTileName(tileName);

        // Still disabled - missing description, app, and API action
        await customAppTilesPage.verifyButtonStates();

        const tileDescription = `Validation Description ${faker.lorem.sentence()}`;
        await customAppTilesPage.enterTileDescription(tileDescription);

        // Still disabled - missing app and API action (required fields)
        await customAppTilesPage.verifyButtonStates();
      }
    );

    test(
      'verify API action dropdown is enabled after app selection',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28709',
        });
        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // enter tile name and description
        const tileName = `API Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `API Test Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);

        // verify API action is enabled after app selection
        await customAppTilesPage.verifyApiActionEnabled();
      }
    );

    test(
      'verify cancel button functionality',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28710',
        });
        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // enter tile name and description
        const tileName = `Cancel Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Cancel Test Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.clickButton('Cancel');

        // verify the page is loaded
        await customAppTilesPage.verifyThePageIsLoaded();
      }
    );

    test(
      'verify search with special characters',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28711',
        });
        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        // Test search with special characters (should return no results)
        await customAppTilesPage.searchForTiles('!@#$%^&*()');
        await customAppTilesPage.verifyResultCount(0);

        // Test search with empty string (should show all tiles)
        await customAppTilesPage.searchForTiles('');
        await customAppTilesPage.verifyAllAppTilesVisible();

        // Test search with very long string (maxlength is 64, so will be truncated)
        const longSearchTerm = 'a'.repeat(100);
        await customAppTilesPage.searchForTiles(longSearchTerm);
        await customAppTilesPage.verifyResultCount(0);
      }
    );

    test(
      'verify tile operations menu',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28712',
        });
        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const tileCount = await customAppTilesPage.getRenderedTileCount();
        if (tileCount > 0) {
          await customAppTilesPage.clickOnElement(customAppTilesPage.tileMoreButton.first());
          await customAppTilesPage.verifyTileMenuOptionsVisible();
          await customAppTilesPage.page.keyboard.press('Escape');
        }
      }
    );

    test(
      'verify add custom app link redirect',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerUiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28713',
        });
        const customAppTilesPage = new CustomAppTilesPage(appManagerUiFixture.page);
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // click add custom app button and verify redirect to custom apps integration page
        await customAppTilesPage.clickCreateButton(
          'Add custom app',
          `${PAGE_ENDPOINTS.CUSTOM_APPS_INTEGRATION_PAGE}/new`
        );
      }
    );

    test(
      'verify create API action link redirect',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerUiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28714',
        });
        const customAppTilesPage = new CustomAppTilesPage(appManagerUiFixture.page);
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // click create API action button and verify redirect to API actions page
        await customAppTilesPage.clickCreateButton('Create API action', `${PAGE_ENDPOINTS.API_ACTIONS_PAGE}/create`);
      }
    );

    test(
      'verify status filter shows only filtered tiles',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28715',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        // Get total tile count before filtering
        const totalTileCount = await customAppTilesPage.getRenderedTileCount();

        if (totalTileCount > 0) {
          // Filter by Draft status - should show only draft tiles
          await customAppTilesPage.selectStatusFilter('Draft');
          const draftTileCount = await customAppTilesPage.getRenderedTileCount();

          // Verify draft filter is applied - count changes from total
          await customAppTilesPage.verifyResultCount(draftTileCount);

          // Filter by Published status - should show only published tiles
          await customAppTilesPage.selectStatusFilter('Published');
          const publishedTileCount = await customAppTilesPage.getRenderedTileCount();

          // Verify published filter is applied
          await customAppTilesPage.verifyResultCount(publishedTileCount);

          // Clear status filter - should show all tiles again
          await customAppTilesPage.clearStatusFilter();

          // Verify all tiles are visible again after clearing filter
          await customAppTilesPage.verifyResultCount(totalTileCount);
        }
      }
    );

    test(
      'verify back button navigates to tiles list',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28716',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        // Click create button to go to create form
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // Click back button to navigate back to tiles list
        await customAppTilesPage.clickBackToTilesList();

        // Verify we're back on the tiles list page
        await customAppTilesPage.verifyThePageIsLoaded();
      }
    );

    test(
      'verify cancel button redirects to tiles list',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28717',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        // Start creating a new tile
        await customAppTilesPage.clickCreateCustomAppTileButton();

        const tileName = `Cancel Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Cancel Description ${faker.lorem.sentence()}`;

        // Fill in tile details
        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS);

        // Click Cancel button to cancel creating the tile
        await customAppTilesPage.clickButton('Cancel');

        // Verify we're redirected back to the tiles list page
        await customAppTilesPage.verifyThePageIsLoaded();
      }
    );

    test(
      'verify navigation to tile builder step',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28718',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.clickCreateCustomAppTileButton();

        const tileName = `Builder Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Builder Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS);

        // Click Next to navigate to Tile Builder step
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT);

        // Verify we're on the Tile Builder step (stepper shows active)
        await customAppTilesPage.verifyTileBuilderStepIsActive();
      }
    );

    test(
      'verify publish empty tile shows error message',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28719',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.clickCreateCustomAppTileButton();

        const tileName = `Empty Tile Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Empty Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS);

        // Navigate to Tile Builder step without adding any blocks (empty tile)
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT);

        // Try to publish empty tile
        await customAppTilesPage.clickButton('Publish');

        // Verify error message appears
        await customAppTilesPage.verifyToastMessage(MESSAGES.SAVE_TILE_FAILED);
        await customAppTilesPage.verifyToastMessage(MESSAGES.TILE_CANNOT_BE_EMPTY);
      }
    );

    test(
      'verify save empty tile shows error message',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28720',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.clickCreateCustomAppTileButton();

        const tileName = `Empty Save Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Empty Save Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS);

        // Navigate to Tile Builder step without adding any blocks (empty tile)
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT);

        // Try to save empty tile
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.SAVE);

        // Verify error message appears
        await customAppTilesPage.verifyToastMessage(MESSAGES.SAVE_TILE_FAILED);
        await customAppTilesPage.verifyToastMessage(MESSAGES.TILE_CANNOT_BE_EMPTY);
      }
    );

    test(
      'verify save and publish buttons disabled for empty tile',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28721',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.clickCreateCustomAppTileButton();

        const tileName = `Disabled Buttons Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Disabled Buttons Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS);

        // Navigate to Tile Builder step without adding any blocks (empty tile)
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT);

        // Click on Preview button
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.PREVIEW);

        // Verify Save and Publish buttons are disabled
        await customAppTilesPage.verifyButtonStatus('disabled', CUSTOM_APP_TILES_TEST_DATA.BUTTONS.SAVE);
        await customAppTilesPage.verifyButtonStatus('disabled', CUSTOM_APP_TILES_TEST_DATA.BUTTONS.PUBLISH);
      }
    );

    test(
      'verify delete single tile from menu',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28722',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        // Create a tile first to test deletion
        await customAppTilesPage.clickCreateCustomAppTileButton();

        const tileName = `Delete Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Delete Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS);

        // Save as draft
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.SAVE);

        // Navigate back to list
        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();

        // Delete the tile we just created
        await customAppTilesPage.clickThreeDotsForTileStartingWith(tileName);

        // Select Delete option from menu
        await customAppTilesPage.selectOptionFromTileMenuDropdown('Delete');

        // Confirm deletion in dialog
        await customAppTilesPage.clickConfirmDeleteButton();
        await customAppTilesPage.verifyToastMessage(MESSAGES.getAppDeletedMessage(tileName));

        // Verify tile is deleted by searching for it (should not find it)
        await customAppTilesPage.searchForTiles(tileName);
        await customAppTilesPage.verifyResultCount(0);
      }
    );

    test(
      'verify unsaved changes popup appears on cancel with changes om preview button',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28951',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.clickCreateCustomAppTileButton();

        const tileName = `Cancel Pop Message Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Cancel Pop Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS);

        // Navigate to Tile Builder and add content to create unsaved changes
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT);

        // Drag container and image blocks
        await customAppTilesPage.dragToCanvas('Image');

        // Click on Preview button
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.PREVIEW);

        // Click Cancel link to trigger the unsaved changes dialog and capture it
        const dialog = await customAppTilesPage.clickCancelLinkWithUnsavedChanges();

        // Verify the popup is shown with correct message from constants
        await customAppTilesPage.verifyUnsavedChangesDialog(dialog, MESSAGES.UNSAVED_CHANGES_MESSAGE);

        // Dismiss the dialog (click Cancel to stay on page)
        await dialog.dismiss();
      }
    );

    test(
      'verify unsaved changes popup appears on cancel with changes',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28952',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.clickCreateCustomAppTileButton();

        const tileName = `Cancel Pop Message Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Cancel Pop Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS);

        // Navigate to Tile Builder and add content to create unsaved changes
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT);

        // Drag container and image blocks
        await customAppTilesPage.dragToCanvas('Image');

        // Click Cancel link to trigger the unsaved changes dialog and capture it
        const dialog = await customAppTilesPage.clickCancelLinkWithUnsavedChanges();

        // Verify the popup is shown with correct message from constants
        await customAppTilesPage.verifyUnsavedChangesDialog(dialog, MESSAGES.UNSAVED_CHANGES_MESSAGE);

        // Dismiss the dialog (click Cancel to stay on page)
        await dialog.dismiss();
      }
    );

    test(
      'back to edit page from preview page',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28953',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const tileName = `Back to Edit Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Back to Edit Description ${faker.lorem.sentence()}`;

        // Create a custom app tile and navigate to tile builder
        await customAppTilesPage.createCustomAppTile(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        // Drag an image block into canvas
        await customAppTilesPage.dragToCanvas('Image');

        // Click on Preview button to go to preview page
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.PREVIEW);

        // Verify we're on preview page by checking for Back to editing button
        await customAppTilesPage.verifyBackToEditingButtonVisible();

        // Navigate back to edit page and verify
        await customAppTilesPage.navigateBackToEditPage();
      }
    );

    test(
      'verify tile type change confirmation',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-25967',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        // Generate unique tile data
        const tileName = `Tile Type Change Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Tile Type Change Description ${faker.lorem.sentence()}`;

        // Create a custom app tile and navigate to tile builder
        await customAppTilesPage.createCustomAppTile(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        // Get and verify API response
        await customAppTilesPage.getAndVerifySuccessfulAPIResponse([/issues/, /id/]);

        // Drag a text block into canvas
        await customAppTilesPage.dragToCanvas('Text');

        // Change tile type to Form after saving (this will verify the dialog and confirm the change)
        await customAppTilesPage.changeTileTypeAfterSaving(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.FORM, true);
      }
    );

    test(
      'verify image configuration with different sizes',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-19706',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        // Generate unique tile data
        const tileName = `Image Configuration Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Image Configuration Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.createCustomAppTile(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        // Drag container and image blocks
        await customAppTilesPage.dragToCanvas('Image');

        // Upload image
        await customAppTilesPage.uploadFile('Jira_Custom_App.jpg', 'image');
        await customAppTilesPage.getAndVerifySuccessfulAPIResponse([/issues/, /id/]);

        // Test Small size
        await customAppTilesPage.selectImageSize(CUSTOM_APP_TILES_TEST_DATA.IMAGE_SIZES.SMALL);
        await customAppTilesPage.verifyImageContainerWidth(`${IMAGE_ASPECT_RATIO_16_9.SMALL_IMAGE_SIZE.WIDTH}px`);

        // Test Large size
        await customAppTilesPage.selectImageSize(CUSTOM_APP_TILES_TEST_DATA.IMAGE_SIZES.LARGE);
        await customAppTilesPage.verifyImageContainerWidth(`${IMAGE_ASPECT_RATIO_16_9.LARGE_IMAGE_SIZE.WIDTH}px`);

        // Test Medium size
        await customAppTilesPage.selectImageSize(CUSTOM_APP_TILES_TEST_DATA.IMAGE_SIZES.MEDIUM);
        await customAppTilesPage.verifyImageContainerWidth(`${IMAGE_ASPECT_RATIO_16_9.MEDIUM_IMAGE_SIZE.WIDTH}px`);

        // Test target URL
        await customAppTilesPage.clickTab('Data', 'Image');
        await customAppTilesPage.enterTargetUrl(CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.GOOGLE);

        // Click on Preview button
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.PREVIEW);

        // Verify image container width in preview page
        await customAppTilesPage.verifyImageContainerWidth(`${IMAGE_ASPECT_RATIO_16_9.MEDIUM_IMAGE_SIZE.WIDTH}px`);

        // Click on image to verify it opens URL in new tab
        await customAppTilesPage.verifyNewTabUrlContains(CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.GOOGLE);

        await customAppTilesPage.navigateBackToEditPage();

        //publish the tile and verify toast message
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.PUBLISH);
        await customAppTilesPage.verifyToastMessage(MESSAGES.TILE_PUBLISHED);
      }
    );

    test(
      'verify image configuration with different ',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28954',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        // Generate unique tile data
        const tileName = `Image Configuration Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Image Configuration Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.createCustomAppTile(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        // Drag container and image blocks
        await customAppTilesPage.dragToCanvas('Image');

        // Upload image
        await customAppTilesPage.uploadFile('Jira_Custom_App.jpg', 'image');
        await customAppTilesPage.getAndVerifySuccessfulAPIResponse([/issues/, /id/]);

        // Test Small size
        await customAppTilesPage.selectImageSize(CUSTOM_APP_TILES_TEST_DATA.IMAGE_SIZES.SMALL);
        await customAppTilesPage.verifyImageContainerWidth(`${IMAGE_ASPECT_RATIO_16_9.SMALL_IMAGE_SIZE.WIDTH}px`);
        await customAppTilesPage.switchAspectRatio('1:1');
        await customAppTilesPage.verifyImageContainerWidth(`${IMAGE_ASPECT_RATIO_1_1.SMALL_IMAGE_SIZE.WIDTH}px`);

        // Test Large size
        await customAppTilesPage.selectImageSize(CUSTOM_APP_TILES_TEST_DATA.IMAGE_SIZES.LARGE);
        await customAppTilesPage.verifyImageContainerWidth(`${IMAGE_ASPECT_RATIO_1_1.LARGE_IMAGE_SIZE.WIDTH}px`);
        await customAppTilesPage.switchAspectRatio('16:9');
        await customAppTilesPage.verifyImageContainerWidth(`${IMAGE_ASPECT_RATIO_16_9.LARGE_IMAGE_SIZE.WIDTH}px`);

        // Test Medium size
        await customAppTilesPage.selectImageSize(CUSTOM_APP_TILES_TEST_DATA.IMAGE_SIZES.MEDIUM);
        await customAppTilesPage.verifyImageContainerWidth(`${IMAGE_ASPECT_RATIO_16_9.MEDIUM_IMAGE_SIZE.WIDTH}px`);
        await customAppTilesPage.switchAspectRatio('1:1');
        await customAppTilesPage.verifyImageContainerWidth(`${IMAGE_ASPECT_RATIO_1_1.MEDIUM_IMAGE_SIZE.WIDTH}px`);
      }
    );

    test(
      'verify text style heights change for Data large, medium and small',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28955',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        // Generate unique tile data
        const tileName = `Text Style Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Text Style Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.createCustomAppTile(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        // Drag text element to canvas
        await customAppTilesPage.dragToCanvas('Text');

        // Verify text style heights change correctly for all sizes
        await customAppTilesPage.verifyTextStyleHeights();
      }
    );

    test(
      'clean up display test tiles',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-DISPLAY-CLEANUP',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        // Delete all display test tiles created during test runs
        // Match tiles that don't start with "Form" and end with "Test" followed by space and 6 alphanumeric characters
        await customAppTilesPage.deleteAllTilesWithPrefix('', /.*\bTest\s[a-zA-Z0-9]{6}$/);
      }
    );
  }
);
