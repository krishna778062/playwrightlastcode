import { faker } from '@faker-js/faker';
import {
  CONTAINER_APPEARANCE_COMBINATIONS,
  CUSTOM_APP_TILES_TEST_DATA,
} from '@integrations/test-data/customAppTiles.test-data';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { CustomAppTilesPage } from '@/src/modules/integrations/ui/pages/customAppTilesPage';

const CONTAINER = CUSTOM_APP_TILES_TEST_DATA.CONTAINER;

test.describe(
  'Container Component Custom Styling Functionality',
  {
    tag: [IntegrationsSuiteTags.CUSTOM_APP_TILES, IntegrationsSuiteTags.ABSOLUTE, IntegrationsSuiteTags.CONTAINER],
  },
  () => {
    const generateTileData = (testNamePrefix: string = 'Test') => {
      const descriptionPrefix = testNamePrefix.replace(/Test$/, 'Description');
      return {
        tileName: `Container Component ${testNamePrefix} ${faker.string.alphanumeric({ length: 6 })}`,
        tileDescription: `Container Component ${descriptionPrefix} ${faker.lorem.sentence()}`,
      };
    };

    const getAddContentPlaceholder = (page: CustomAppTilesPage) =>
      page.canvasContainer.getByText(CONTAINER.ADD_CONTENT_PLACEHOLDER, { exact: false });

    test.beforeEach(async ({ appManagerFixture }) => {
      const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
      await customAppTilesPage.loadPage();
      await customAppTilesPage.verifyThePageIsLoaded();
    });

    test(
      'verify Container Component basic functionality',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-31270',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const { tileName, tileDescription } = generateTileData();

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas(CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.CONTAINER);
        await expect(getAddContentPlaceholder(customAppTilesPage)).toBeVisible();
      }
    );

    test(
      'verify Container block is available in Tile builder and can be added to canvas',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-31271',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const { tileName, tileDescription } = generateTileData('Block Available');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await expect(customAppTilesPage.containerBlock).toBeVisible();
        await customAppTilesPage.dragToCanvas(CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.CONTAINER);
        await expect(getAddContentPlaceholder(customAppTilesPage)).toBeVisible();
      }
    );

    test(
      'verify Container Data and Appearance tabs when Container is selected',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-31272',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const { tileName, tileDescription } = generateTileData('Tabs');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas(CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.CONTAINER);
        await customAppTilesPage.clickText(CONTAINER.ADD_CONTENT_PLACEHOLDER, false);

        await customAppTilesPage.clickTab(CONTAINER.TABS.DATA, CONTAINER.PANEL_HEADING);
        await customAppTilesPage.clickTab(CONTAINER.TABS.APPEARANCE, CONTAINER.PANEL_HEADING);
      }
    );

    test(
      'verify all components inside Container Appearance tab after drag',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-31273',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const { tileName, tileDescription } = generateTileData('Appearance');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas(CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.CONTAINER);
        await customAppTilesPage.clickText(CONTAINER.ADD_CONTENT_PLACEHOLDER, false);
        await customAppTilesPage.clickTab(CONTAINER.TABS.APPEARANCE, CONTAINER.PANEL_HEADING);

        await customAppTilesPage.containerComponent.verifyAllAppearanceSections();
      }
    );

    test(
      'verify Container Size options: Hug contents, Fill parent container, Custom with Width/Height',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-31274',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const { tileName, tileDescription } = generateTileData('Sizes');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas(CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.CONTAINER);
        await customAppTilesPage.clickText(CONTAINER.ADD_CONTENT_PLACEHOLDER, false);
        await customAppTilesPage.clickTab(CONTAINER.TABS.APPEARANCE, CONTAINER.PANEL_HEADING);

        await customAppTilesPage.containerComponent.verifySizeOptionsAndCustomInputs();
      }
    );

    test(
      'verify all components inside Container Data tab after drag',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-31275',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const { tileName, tileDescription } = generateTileData('Data');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas(CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.CONTAINER);
        await customAppTilesPage.clickText(CONTAINER.ADD_CONTENT_PLACEHOLDER, false);
        await customAppTilesPage.clickTab(CONTAINER.TABS.DATA, CONTAINER.PANEL_HEADING);

        await customAppTilesPage.containerComponent.verifyDataTabContent();
      }
    );

    test(
      'verify Container canvas toolbar when container is selected',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-31276',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const { tileName, tileDescription } = generateTileData('Toolbar');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas(CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.CONTAINER);
        await customAppTilesPage.clickText(CONTAINER.ADD_CONTENT_PLACEHOLDER, false);

        await customAppTilesPage.containerComponent.verifyCanvasToolbar();
      }
    );

    test(
      'verify Container panel Cancel button closes the panel',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-31277',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const { tileName, tileDescription } = generateTileData('Panel Cancel');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas(CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.CONTAINER);
        await customAppTilesPage.clickText(CONTAINER.ADD_CONTENT_PLACEHOLDER, false);

        await customAppTilesPage.containerComponent.clickPanelCancelAndVerifyPanelClosed();
      }
    );

    test(
      'verify Container Appearance options can be changed without error',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-31278',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const { tileName, tileDescription } = generateTileData('Change Options');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas(CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.CONTAINER);
        await customAppTilesPage.clickText(CONTAINER.ADD_CONTENT_PLACEHOLDER, false);
        await customAppTilesPage.clickTab(CONTAINER.TABS.APPEARANCE, CONTAINER.PANEL_HEADING);

        await customAppTilesPage.containerComponent.applyAppearanceOptions({
          margin: 'Small',
          direction: 'Horizontal',
          alignH: 'Align center',
          alignV: 'Align center',
          spacing: 'Small',
        });

        await customAppTilesPage.containerComponent.verifyAppearanceTabAndCanvasVisible(
          getAddContentPlaceholder(customAppTilesPage)
        );
      }
    );

    for (const combo of CONTAINER_APPEARANCE_COMBINATIONS) {
      test(
        `verify Container Appearance combination: ${combo.label}`,
        {
          tag: [TestPriority.P2],
        },
        async ({ appManagerFixture }) => {
          tagTest(test.info(), {
            zephyrTestId: 'INT-31279',
          });

          const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
          const { tileName, tileDescription } = generateTileData(`Combo ${combo.label.replace(/\s/g, '')}`);

          await customAppTilesPage.createcustom(
            tileName,
            tileDescription,
            CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
            CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
            CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
          );

          await customAppTilesPage.dragToCanvas(CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.CONTAINER);
          await customAppTilesPage.clickText(CONTAINER.ADD_CONTENT_PLACEHOLDER, false);
          await customAppTilesPage.clickTab(CONTAINER.TABS.APPEARANCE, CONTAINER.PANEL_HEADING);

          await customAppTilesPage.containerComponent.applyAppearanceCombination(combo);

          await customAppTilesPage.containerComponent.verifyAppearanceTabAndCanvasVisible(
            getAddContentPlaceholder(customAppTilesPage)
          );
        }
      );
    }

    test(
      'verify multiple Container blocks can be added to canvas',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-31280',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const { tileName, tileDescription } = generateTileData('Multiple');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas(CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.CONTAINER);
        await customAppTilesPage.dragToCanvas(CUSTOM_APP_TILES_TEST_DATA.CANVAS_COMPONENTS.CONTAINER);

        const addContentPlaceholders = customAppTilesPage.canvasContainer.getByText(CONTAINER.ADD_CONTENT_PLACEHOLDER, {
          exact: false,
        });
        await expect(addContentPlaceholders).toHaveCount(2);
      }
    );

    test(
      'clean up container and tag component test tiles',
      {
        tag: [TestPriority.P1],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-FORM-CLEANUP',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        await customAppTilesPage.deleteAllTilesWithPrefix('', /Container Component .+\s[a-zA-Z0-9]{6}$/);
        await customAppTilesPage.deleteAllTilesWithPrefix('', /.*\bTest\s[a-zA-Z0-9]{6}$/);
      }
    );
  }
);
