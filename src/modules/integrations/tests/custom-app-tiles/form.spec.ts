import { faker } from '@faker-js/faker';
import { CUSTOM_APP_TILES_TEST_DATA } from '@integrations/test-data/customAppTiles.test-data';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { CustomAppTilesPage } from '@/src/modules/integrations/ui/pages/customAppTilesPage';

test.describe(
  'form App Tiles Management',
  {
    tag: [IntegrationsSuiteTags.CUSTOM_APP_TILES, IntegrationsSuiteTags.ABSOLUTE, IntegrationsSuiteTags.FORM],
  },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
      await customAppTilesPage.loadPage();
      await customAppTilesPage.verifyThePageIsLoaded();
    });

    test(
      'verify form tile creation and navigation',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28945',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const tileName = `Form Tile Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Form Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.clickCreateCustomAppTileButton();
        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.FORM);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT);
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
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        await customAppTilesPage.clickCreateCustomAppTileButton();

        // enter tile name and description
        const tileName = `Form Overlay Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Form Overlay Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.FORM);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppTilesPage.page.waitForTimeout(2000);
        await customAppTilesPage.clickButton('Configure API action');
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.CREATE_TICKET);
        // Configure form fields to get from user input
        await customAppTilesPage.configureFormFieldsAsUserInput('Get from user', ['Email', 'Summary', 'Description']);

        // Verify both display options are available (inline vs overlay)
        await customAppTilesPage.verifyDisplayDropdownOptions(
          CUSTOM_APP_TILES_TEST_DATA.FORM_BEHAVIOR.DISPLAY_IN_TILE,
          CUSTOM_APP_TILES_TEST_DATA.FORM_BEHAVIOR.DISPLAY_IN_OVERLAY
        );

        // select display option in form behaviour
        await customAppTilesPage.selectDisplayOptionInFormBehaviour(
          CUSTOM_APP_TILES_TEST_DATA.FORM_BEHAVIOR.DISPLAY_IN_OVERLAY
        );

        // verify canvas is auto populated with button
        await customAppTilesPage.verifyCanvasIsAutoPopulatedWithButton();
      }
    );

    test(
      'verify form tile with inline behavior',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28946',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        await customAppTilesPage.clickCreateCustomAppTileButton();

        const tileName = `Form Inline Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Form Inline Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.FORM);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppTilesPage.page.waitForTimeout(2000);
        await customAppTilesPage.clickButton('Configure API action');
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.CREATE_TICKET);

        // Configure form fields
        await customAppTilesPage.configureFormFieldsAsUserInput('Get from user', ['Email', 'Summary', 'Description']);

        // Select inline display option
        await customAppTilesPage.selectDisplayOptionInFormBehaviour(
          CUSTOM_APP_TILES_TEST_DATA.FORM_BEHAVIOR.DISPLAY_IN_TILE
        );

        // Verify form is displayed inline
        await customAppTilesPage.verifyCanvasIsAutoPopulatedWithButton();
      }
    );

    test(
      'verify form tile description required field error',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28947',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        await customAppTilesPage.clickCreateCustomAppTileButton();

        const tileName = `Form Publish Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Form Publish Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.FORM);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT);

        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppTilesPage.page.waitForTimeout(2000);
        await customAppTilesPage.clickButton('Configure API action');
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.CREATE_TICKET);
        await customAppTilesPage.configureFormFieldsAsUserInput('Get from user', ['Email', 'Summary']);

        // Verify Description required field error is visible
        await customAppTilesPage.verifyRequiredFieldError('Description');
      }
    );

    test(
      'verify form validation for required fields',
      {
        tag: [TestPriority.P1],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28948',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        await customAppTilesPage.clickCreateCustomAppTileButton();

        const tileName = `Form Validation Test ${faker.string.alphanumeric({ length: 6 })}`;

        // Verify buttons are disabled without required fields
        await customAppTilesPage.verifyButtonStates();

        // Add tile name only
        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.verifyButtonStates();

        // Add description
        const tileDescription = `Form Validation Description ${faker.lorem.sentence()}`;
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.verifyButtonStates();

        // Select form tile type
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.FORM);
        await customAppTilesPage.verifyButtonStates();
      }
    );

    test.fixme(
      'verify form tile type change to display',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-FORM-005',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const tileName = `Form to Display Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Form to Display Description ${faker.lorem.sentence()}`;

        // Create a form tile initially
        await customAppTilesPage.createCustomAppTile(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.FORM,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.CREATE_TICKET
        );

        // Configure form and add content
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await customAppTilesPage.page.waitForTimeout(2000);
        await customAppTilesPage.clickButton('Configure API action');
        await customAppTilesPage.selectApiAction(CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.CREATE_TICKET);
        await customAppTilesPage.configureFormFieldsAsUserInput('Get from user', ['Email']);

        // Save and change tile type to Display
        await customAppTilesPage.changeTileTypeAfterSaving(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY, true);
      }
    );

    test(
      'verify form tile empty validation',
      {
        tag: [TestPriority.P1],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28949',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.clickCreateCustomAppTileButton();

        const tileName = `Empty Form Test ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Empty Form Description ${faker.lorem.sentence()}`;

        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.FORM);
        await customAppTilesPage.selectApp(CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH);

        // Navigate to Tile Builder without configuring form
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT);

        // Try to save empty form tile
        await customAppTilesPage.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.SAVE);

        // Verify error message appears - form has invalid details (not configured)
        await customAppTilesPage.verifyToastMessage(MESSAGES.SAVE_TILE_FAILED);
        await customAppTilesPage.verifyToastMessage(MESSAGES.INVALID_BLOCK_DETAILS);
      }
    );

    test(
      'clean up form test tiles',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-FORM-CLEANUP',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        // Delete all form test tiles created during test runs
        await customAppTilesPage.deleteAllTilesWithPrefix('', /.*\bTest\s[a-zA-Z0-9]{6}$/);
      }
    );
  }
);
