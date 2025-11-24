import { faker } from '@faker-js/faker';
import { CUSTOM_APP_TILES_TEST_DATA } from '@integrations/test-data/customAppTiles.test-data';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { LinkComponent } from '@/src/modules/integrations/ui/components/linkComponent';
import { CustomAppTilesPage } from '@/src/modules/integrations/ui/pages/customAppTilesPage';

test.describe(
  'link Component Custom Styling Functionality',
  {
    tag: [IntegrationsSuiteTags.CUSTOM_APP_TILES, IntegrationsSuiteTags.ABSOLUTE, IntegrationsSuiteTags.LINK],
  },
  () => {
    const generateTileData = (testNamePrefix: string = 'Test') => {
      const descriptionPrefix = testNamePrefix.replace(/Test$/, 'Description');
      return {
        tileName: `Link Component ${testNamePrefix} ${faker.string.alphanumeric({ length: 6 })}`,
        tileDescription: `Link Component ${descriptionPrefix} ${faker.lorem.sentence()}`,
      };
    };

    test.beforeEach(async ({ appManagerFixture }) => {
      const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
      await customAppTilesPage.loadPage();
      await customAppTilesPage.verifyThePageIsLoaded();
    });

    test(
      'verify link component basic functionality',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29332',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData();

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await linkComponent.verifyLinkComponentFields();

        await customAppTilesPage.clickTab('Appearance', 'Link');

        await linkComponent.verifyTextStyleField();
      }
    );

    test(
      'verify link component text style selection',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-LINK-29333',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Text Style Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Appearance', 'Link');

        const textStyles = [
          {
            name: CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLES.DATA_LARGE,
            expectedMinHeight: CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLE_HEIGHTS.DATA_LARGE,
          },
          {
            name: CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLES.DATA_MEDIUM,
            expectedMinHeight: CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLE_HEIGHTS.DATA_MEDIUM,
          },
          {
            name: CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLES.DATA_SMALL,
            expectedMinHeight: CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLE_HEIGHTS.DATA_SMALL,
          },
          {
            name: CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLES.HEADING_LARGE,
            expectedMinHeight: CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLE_HEIGHTS.HEADING_LARGE,
          },
          {
            name: CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLES.HEADING_MEDIUM,
            expectedMinHeight: CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLE_HEIGHTS.HEADING_MEDIUM,
          },
          {
            name: CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLES.HEADING_SMALL,
            expectedMinHeight: CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLE_HEIGHTS.HEADING_SMALL,
          },
        ];

        for (const style of textStyles) {
          await linkComponent.selectTextStyle(style.name);
          const linkElement = linkComponent.getLinkElement('Link…', customAppTilesPage.canvasContainer);
          await linkComponent.verifyLinkHeight(linkElement, style.expectedMinHeight, style.name);
        }
      }
    );

    test(
      'verify link component custom color configuration',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27939',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Custom Color Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Appearance', 'Link');

        await linkComponent.openAdvancedColorSettings();
        await linkComponent.selectAdvancedColor(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.CUSTOM
        );
        await linkComponent.verifySelectedAdvancedColor(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.CUSTOM
        );
        await linkComponent.enterCustomColorLightTheme(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.HEX.RED);
        await linkComponent.saveAdvancedSettings();

        await linkComponent.openAdvancedColorSettings();
        await linkComponent.verifySelectedAdvancedColor(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.CUSTOM
        );
        await linkComponent.cancelAdvancedSettings();

        const linkElement = linkComponent.getLinkElement(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.DEFAULT_LINK,
          customAppTilesPage.canvasContainer
        );
        await linkComponent.verifyLinkColorApplied(
          linkElement,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.DEFAULT_LINK,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.RGB.RED
        );
      }
    );

    test(
      'verify link component color component in appearance section',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27936',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Color Component Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Appearance', 'Link');

        await linkComponent.expandColorAccordion();
        await expect(linkComponent.colorDropdown, 'Color dropdown should be visible').toBeVisible();
        await linkComponent.colorDropdown.click();
        const colorOptions = customAppTilesPage.page.getByRole('listbox');
        await expect(colorOptions, 'Color options listbox should be visible').toBeVisible();
        await expect(
          colorOptions.getByText(/System darkest/i).first(),
          'System darkest option should be visible'
        ).toBeVisible();
        await expect(colorOptions.getByText(/Advanced/i).first(), 'Advanced option should be visible').toBeVisible();
        await customAppTilesPage.page.keyboard.press('Escape');
      }
    );

    test(
      'verify link component advanced option under color component',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27937',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Advanced Color Option Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Appearance', 'Link');

        await linkComponent.openAdvancedColorSettings();
        await expect(linkComponent.advancedDialog, 'Advanced settings dialog should be visible').toBeVisible();
        await expect(
          linkComponent.advancedDialogTitle,
          'Advanced settings dialog should have correct title'
        ).toHaveText('Advanced settings');
        await linkComponent.verifySelectedAdvancedColor(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.SYSTEM_DARKEST
        );
        await expect(
          linkComponent.advancedDialog.getByText(/System colors automatically adjust/i),
          'System colors message should be visible'
        ).toBeVisible();
        await linkComponent.verifySystemColorOptions();
        await linkComponent.cancelAdvancedSettings();
      }
    );

    test(
      'verify link component system darkest default for all other headings',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27942',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('System Darkest Default Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Appearance', 'Link');

        const headingStyles = [
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLES.HEADING_LARGE,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLES.HEADING_MEDIUM,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLES.HEADING_SMALL,
        ];
        for (const style of headingStyles) {
          await linkComponent.selectTextStyle(style);
          await linkComponent.openAdvancedColorSettings();
          await linkComponent.verifySelectedAdvancedColor(
            CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.SYSTEM_DARKEST
          );
          await linkComponent.cancelAdvancedSettings();
        }
      }
    );

    test(
      'verify link component system light default for secondary text style',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27941',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('System Light Default Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Appearance', 'Link');

        await linkComponent.selectTextStyle(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLES.SECONDARY);
        await linkComponent.openAdvancedColorSettings();
        await linkComponent.verifySelectedAdvancedColor(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.SYSTEM_LIGHT
        );
        await linkComponent.cancelAdvancedSettings();
      }
    );

    test(
      'verify link component system dark default for body text style',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27943',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('System Dark Default Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Appearance', 'Link');

        await linkComponent.selectTextStyle(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLES.BODY);
        await linkComponent.openAdvancedColorSettings();
        await linkComponent.verifySelectedAdvancedColor(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.SYSTEM_DARK
        );
        await linkComponent.cancelAdvancedSettings();
      }
    );

    test(
      'verify link component alignment options',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29334',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Alignment Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Appearance', 'Link');

        await linkComponent.verifyAlignmentField();
        await linkComponent.verifyAlignmentButtonsCount(3);

        const linkElement = linkComponent.getLinkElement(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.DEFAULT_LINK,
          customAppTilesPage.canvasContainer
        );
        await linkComponent.testAllAlignmentButtons(
          linkElement,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.DEFAULT_LINK
        );
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyLinkAlignment(
          linkElement,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.DEFAULT_LINK,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.ALIGNMENT.RIGHT
        );
      }
    );

    test(
      'verify link component maximum line count options',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29335',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Line Count Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Appearance', 'Link');

        await linkComponent.verifyMaxLineCountOptions();
        await linkComponent.selectMaxLineCount(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.MAX_LINE_COUNT.ONE);
        await customAppTilesPage.clickTab('Data', 'Link');
        await linkComponent.enterLinkText(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.LONG_TEXT_FULL,
          customAppTilesPage.canvasContainer
        );
        await linkComponent.selectMaxLineCount(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.MAX_LINE_COUNT.TWO);

        const linkTextPrefix = CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.LONG_TEXT_PREFIX;
        const linkElement = linkComponent.getLinkElement(linkTextPrefix, customAppTilesPage.canvasContainer);
        await linkComponent.verifyMaxLineCountApplied(
          linkElement,
          linkTextPrefix,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.MAX_LINE_COUNT.TWO
        );
        await linkComponent.selectMaxLineCount(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.MAX_LINE_COUNT.THREE);
        await linkComponent.verifyMaxLineCountApplied(
          linkElement,
          linkTextPrefix,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.MAX_LINE_COUNT.THREE
        );
        await linkComponent.selectMaxLineCount(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.MAX_LINE_COUNT.NONE);
        await linkComponent.verifyMaxLineCountApplied(
          linkElement,
          linkTextPrefix,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.MAX_LINE_COUNT.NONE
        );
      }
    );

    test(
      'verify link component URL field validation',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29336',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('URL Validation Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await linkComponent.enterLinkText(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.TEST_LINK,
          customAppTilesPage.canvasContainer
        );
        await linkComponent.enterUrl(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.URLS.GOOGLE);

        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyRedirectUrl(tileName, CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.URLS.GOOGLE);

        await customAppTilesPage.navigateBackToEditPage();
        await customAppTilesPage.clickButton('Save');
        await customAppTilesPage.verifyToastMessageIsVisibleWithText(MESSAGES.TILE_SAVED_DRAFT);
      }
    );

    test(
      'verify link component text and URL required field validation',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29337',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Required Field Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await linkComponent.clearLinkText(customAppTilesPage.canvasContainer);
        await linkComponent.clearUrl();

        await customAppTilesPage.clickButton('Save');

        await linkComponent.verifyAtLeastOneRequiredFieldError();
        await customAppTilesPage.verifyToastMessageIsVisibleWithText(MESSAGES.SAVE_TILE_FAILED);
        await customAppTilesPage.verifyToastMessageIsVisibleWithText(MESSAGES.INVALID_BLOCK_DETAILS);
      }
    );

    test(
      'verify link component visibility rule functionality for display tile',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29338',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Visibility Rule Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Data', 'Link');

        const visibilityRule = CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.VISIBILITY_RULES.ACTIVE_STATUS;

        await linkComponent.openVisibilityRuleDialog();
        await linkComponent.verifyVisibilityRuleDialog();
        await linkComponent.enterVisibilityRule(visibilityRule);
        await linkComponent.saveVisibilityRule();
        await linkComponent.verifyVisibilityRuleSaved(visibilityRule);
      }
    );

    test(
      'verify link component cancel color configuration',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29339',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Cancel Color Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Appearance', 'Link');

        await linkComponent.openAdvancedColorSettings();
        await linkComponent.selectAdvancedColor(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.SYSTEM_DARK
        );
        await linkComponent.cancelAdvancedSettings();
      }
    );

    test(
      'verify link component dark theme color configuration',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27938',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Dark Theme Color Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Appearance', 'Link');

        await linkComponent.openAdvancedColorSettings();
        await linkComponent.selectAdvancedColor(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.CUSTOM
        );
        await linkComponent.verifyNonSystemColorWarning();
        await linkComponent.enterCustomColorLightTheme(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.HEX.RED);
        await linkComponent.enterCustomColorDarkTheme(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.HEX.GREEN);
        await linkComponent.saveAdvancedSettings();

        await linkComponent.openAdvancedColorSettings();
        await linkComponent.verifySelectedAdvancedColor(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.CUSTOM
        );
        await linkComponent.cancelAdvancedSettings();

        await linkComponent.openAdvancedColorSettings();
        await linkComponent.selectAdvancedColor(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.BRAND
        );
        await linkComponent.verifyNonSystemColorWarning();
        await linkComponent.selectLightThemeBrand();
        await linkComponent.selectDarkThemeBrand();
        await linkComponent.saveAdvancedSettings();

        await linkComponent.openAdvancedColorSettings();
        await linkComponent.verifySelectedAdvancedColor(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.BRAND
        );
        await linkComponent.cancelAdvancedSettings();
      }
    );

    test(
      'verify link component advanced color required field validation',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29340',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Color Required Field Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Appearance', 'Link');

        await linkComponent.openAdvancedColorSettings();
        await linkComponent.selectAdvancedColor(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.BRAND
        );
        await linkComponent.verifyNonSystemColorWarning();
        await linkComponent.advancedSaveButton.click();
        await linkComponent.verifyThemeFieldsRequiredErrors();

        await linkComponent.selectLightThemeBrand();
        await linkComponent.selectDarkThemeBrand();

        await linkComponent.saveAdvancedSettings();
        await linkComponent.verifyAdvancedDialogClosed();
      }
    );

    test(
      'verify link component visibility rule cancel functionality',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29341',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Visibility Rule Cancel Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Data', 'Link');

        const visibilityRule = CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.VISIBILITY_RULES.ACTIVE_STATUS;

        await linkComponent.openVisibilityRuleDialog();
        await linkComponent.verifyVisibilityRuleDialog();
        await linkComponent.enterVisibilityRule(visibilityRule);
        await linkComponent.clickVisibilityRuleCancel();
        await linkComponent.verifyVisibilityRuleDialogClosed();

        await linkComponent.openVisibilityRuleDialog();
        await linkComponent.verifyVisibilityRuleInputEmpty();
        await linkComponent.clickVisibilityRuleCancel();
      }
    );

    test(
      'verify link component URL field with invalid URL format',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29342',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Invalid URL Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await linkComponent.enterLinkText(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.TEST_LINK,
          customAppTilesPage.canvasContainer
        );
        await linkComponent.enterUrl(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.URLS.INVALID_FORMAT);

        await customAppTilesPage.clickButton('Save');
        await customAppTilesPage.verifyToastMessageIsVisibleWithText(MESSAGES.INVALID_BLOCK_DETAILS);
      }
    );

    test(
      'verify link component with special characters in text',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29343',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Special Characters Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        const specialText = CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.SPECIAL_CHARS;
        await linkComponent.enterLinkText(specialText, customAppTilesPage.canvasContainer);
        await linkComponent.enterUrl(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.URLS.EXAMPLE);

        const linkElement = linkComponent.getLinkElement(
          specialText.substring(0, 20),
          customAppTilesPage.canvasContainer
        );
        await linkComponent.verifyLinkElementVisible(
          linkElement,
          'Link element with special characters should be visible'
        );

        await customAppTilesPage.clickButton('Save');
        await customAppTilesPage.verifyToastMessageIsVisibleWithText(MESSAGES.TILE_SAVED_DRAFT);
      }
    );

    test(
      'verify link component data text binding field',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29344',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Data Binding Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Data', 'Link');

        await linkComponent.verifyDataTextBindingField();

        const bindingText = CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_TITLE;
        await linkComponent.enterDataTextBinding(bindingText);
        await linkComponent.verifyDataTextBindingField(bindingText);

        await linkComponent.clearDataTextBinding();
        await linkComponent.verifyDataTextBindingField('');
      }
    );

    test(
      'verify link component with very long text',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29354',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Long Text Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        const longText = 'A'.repeat(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.LONG_TEXT_REPEAT_COUNT);
        await linkComponent.enterLinkText(longText, customAppTilesPage.canvasContainer);
        await linkComponent.enterUrl(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.URLS.EXAMPLE);

        const linkElement = linkComponent.getLinkElement(longText.substring(0, 50), customAppTilesPage.canvasContainer);
        await linkComponent.verifyLinkElementVisible(linkElement, 'Link element with long text should be visible');

        await customAppTilesPage.clickButton('Save');
        await customAppTilesPage.verifyToastMessageIsVisibleWithText(MESSAGES.TILE_SAVED_DRAFT);
      }
    );

    test(
      'verify link component with invalid visibility rule syntax',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29355',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Invalid Visibility Rule Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Data', 'Link');

        await linkComponent.enterLinkText('Test Link', customAppTilesPage.canvasContainer);
        await linkComponent.enterUrl('https://www.example.com');

        const invalidRule = CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.VISIBILITY_RULES.INVALID_SYNTAX;
        await linkComponent.openVisibilityRuleDialog();
        await linkComponent.enterVisibilityRule(invalidRule);
        await linkComponent.saveVisibilityRule();
        await customAppTilesPage.clickButton('Save');
      }
    );

    test(
      'verify link component visibility rule that returns false',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29356',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Visibility Rule False Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Data', 'Link');

        await linkComponent.enterLinkText(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.TEST_LINK,
          customAppTilesPage.canvasContainer
        );
        await linkComponent.enterUrl(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.URLS.EXAMPLE);

        const falseRule = CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.VISIBILITY_RULES.ALWAYS_FALSE;
        await linkComponent.openVisibilityRuleDialog();
        await linkComponent.enterVisibilityRule(falseRule);
        await linkComponent.saveVisibilityRule();

        await customAppTilesPage.clickButton('Save');
        await customAppTilesPage.verifyToastMessageIsVisibleWithText(MESSAGES.TILE_SAVED_DRAFT);
        await customAppTilesPage.clickButton('Preview');
      }
    );

    test(
      'verify link component with unicode and emoji characters',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29358',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Unicode Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        const unicodeText = CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.UNICODE;
        await linkComponent.enterLinkText(unicodeText, customAppTilesPage.canvasContainer);
        await linkComponent.enterUrl(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.URLS.EXAMPLE);

        const linkElement = linkComponent.getLinkElement('Link with emoji', customAppTilesPage.canvasContainer);
        await linkComponent.verifyLinkElementVisible(linkElement, 'Link element with unicode should be visible');

        await customAppTilesPage.clickButton('Save');
        await customAppTilesPage.verifyToastMessageIsVisibleWithText(MESSAGES.TILE_SAVED_DRAFT);
      }
    );

    test(
      'verify link component state persistence after page refresh',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29360',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Persistence Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        const linkText = CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.PERSISTENT_LINK;
        const linkUrl = CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.URLS.EXAMPLE;
        await linkComponent.enterLinkText(linkText, customAppTilesPage.canvasContainer);
        await linkComponent.enterUrl(linkUrl);

        await customAppTilesPage.clickButton('Save');
        await customAppTilesPage.verifyToastMessageIsVisibleWithText(MESSAGES.TILE_SAVED_DRAFT);

        const linkElement = linkComponent.getLinkElement(linkText, customAppTilesPage.canvasContainer);
        await linkComponent.verifyLinkElementVisible(linkElement, 'Link element should be visible after save');
        await linkElement.click();

        await linkComponent.verifyLinkTextField(linkText, customAppTilesPage.canvasContainer);
        await linkComponent.verifyUrlField(linkUrl);
      }
    );

    test(
      'verify link component with dynamic data binding for Zendesk app',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29345',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Zendesk Data Binding Test');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.ZENDESK,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.GET_PRIORITIES
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.getAndVerifySuccessfulAPIResponseInTab([/zendesk/i, /priority/i]);

        await linkComponent.clearDataTextBinding();
        await linkComponent.clearUrl();

        await customAppTilesPage.clickButtonInTab('Data', 'Text', 'Add dynamic value');
        await customAppTilesPage.selectDataBindingField(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_OBJECT,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_TITLE
        );

        await customAppTilesPage.clickButtonInTab('Data', 'URL', 'Add dynamic value');
        await customAppTilesPage.selectDataBindingField('object ticket_field', 'string url');

        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.PRIORITY,
          customAppTilesPage.canvasContainer
        );
      }
    );

    test(
      'verify link component transform value dialog - Value mapping and cancel functionality',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29362',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Transform Value Mapping Test');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.ZENDESK,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.GET_PRIORITIES
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.getAndVerifySuccessfulAPIResponseInTab([/zendesk/i, /priority/i]);

        await linkComponent.clearDataTextBinding();

        await customAppTilesPage.clickButtonInTab('Data', 'Text', 'Add dynamic value');
        await customAppTilesPage.selectDataBindingField(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_OBJECT,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_TITLE
        );

        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.verifyTransformValueDialogVisible();
        await customAppTilesPage.selectTransformType(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TRANSFORM_TYPES.VALUE_MAPPING
        );
        await customAppTilesPage.verifyValueMappingDefaultValueFieldVisible();
        await customAppTilesPage.verifyDefaultValueFieldRequired();
        await customAppTilesPage.verifyAddMappingRuleButtonVisible();

        await customAppTilesPage.clickTransformValueCancel();
        await customAppTilesPage.verifyTransformValueDialogClosed();

        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.verifyTransformValueDialogVisible();
        await customAppTilesPage.verifyValueMappingRadioVisible();

        await customAppTilesPage.verifyAndClickTransformValueDialogCloseButton();
        await customAppTilesPage.verifyTransformValueDialogClosed();
      }
    );

    test(
      'verify link component transform value dialog - multiple transform types and preview',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29364',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Transform Multiple Types Test');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.ZENDESK,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.GET_PRIORITIES
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.getAndVerifySuccessfulAPIResponseInTab([/zendesk/i, /priority/i]);

        await linkComponent.clearDataTextBinding();
        await linkComponent.clearUrl();

        await customAppTilesPage.clickButtonInTab('Data', 'Text', 'Add dynamic value');
        await customAppTilesPage.selectDataBindingField(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_OBJECT,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_TITLE
        );

        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.selectTransformType(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TRANSFORM_TYPES.VALUE_MAPPING
        );
        await customAppTilesPage.clickButton('Add dynamic value');
        await customAppTilesPage.selectDataBindingField(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_TITLE,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_CREATED_AT
        );
        await customAppTilesPage.clickButton('Save');
        await linkComponent.verifyTransformedTextInCanvas(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.EXPECTED_VALUES.TRANSFORMED_DATE_ISO,
          customAppTilesPage.canvasContainer
        );
      }
    );

    test(
      'verify link component transform value dialog - Case format Uppercase and Sentence case',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29346',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Transform Case Format Options Test');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.ZENDESK,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.GET_PRIORITIES
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.getAndVerifySuccessfulAPIResponseInTab([/zendesk/i, /priority/i]);

        await linkComponent.clearDataTextBinding();

        await customAppTilesPage.clickButtonInTab('Data', 'Text', 'Add dynamic value');
        await customAppTilesPage.selectDataBindingField(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_OBJECT,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_TITLE
        );

        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.selectTransformType(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TRANSFORM_TYPES.CASE_FORMAT
        );
        await customAppTilesPage.selectCaseFormat(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.CASE_FORMAT_OPTIONS.LOWERCASE
        );
        await customAppTilesPage.clickTransformValueSave();
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.EXPECTED_VALUES.TRANSFORMED_PRIORITY_LOWERCASE,
          customAppTilesPage.canvasContainer
        );

        await customAppTilesPage.navigateBackToEditPage();
        await customAppTilesPage.clickText(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.EXPECTED_VALUES.TRANSFORMED_PRIORITY_LOWERCASE
        );
        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.selectTransformType(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TRANSFORM_TYPES.CASE_FORMAT
        );
        await customAppTilesPage.selectCaseFormat(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.CASE_FORMAT_OPTIONS.UPPERCASE
        );
        await customAppTilesPage.clickTransformValueSave();
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.EXPECTED_VALUES.TRANSFORMED_PRIORITY_UPPERCASE,
          customAppTilesPage.canvasContainer
        );

        await customAppTilesPage.navigateBackToEditPage();
        await customAppTilesPage.clickText(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.EXPECTED_VALUES.TRANSFORMED_PRIORITY_UPPERCASE
        );
        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.selectTransformType(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TRANSFORM_TYPES.CASE_FORMAT
        );
        await customAppTilesPage.selectCaseFormat(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.CASE_FORMAT_OPTIONS.SENTENCE_CASE
        );
        await customAppTilesPage.clickTransformValueSave();
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.PRIORITY,
          customAppTilesPage.canvasContainer
        );
      }
    );

    test(
      'verify link component transform value dialog - Additional date format options',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29347',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Transform Date Format Options Test');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.ZENDESK,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.GET_PRIORITIES
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.getAndVerifySuccessfulAPIResponseInTab([/zendesk/i, /priority/i]);

        await linkComponent.clearDataTextBinding();

        await customAppTilesPage.clickButtonInTab('Data', 'Text', 'Add dynamic value');
        await customAppTilesPage.selectDataBindingField(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_TITLE,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_CREATED_AT
        );

        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.selectTransformType(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TRANSFORM_TYPES.DATE_FORMAT
        );
        await customAppTilesPage.selectDateFormat(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATE_FORMAT_OPTIONS.MM_DD_YYYY
        );
        await customAppTilesPage.clickTransformValueSave();
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.EXPECTED_VALUES.TRANSFORMED_DATE_MM_DD_YYYY,
          customAppTilesPage.canvasContainer
        );

        await customAppTilesPage.navigateBackToEditPage();
        await customAppTilesPage.clickText(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.EXPECTED_VALUES.TRANSFORMED_DATE_MM_DD_YYYY
        );
        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.selectTransformType(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TRANSFORM_TYPES.DATE_FORMAT
        );
        await customAppTilesPage.selectDateFormat(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATE_FORMAT_OPTIONS.MM_DD_YY
        );
        await customAppTilesPage.clickTransformValueSave();
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.EXPECTED_VALUES.TRANSFORMED_DATE_MM_DD_YY,
          customAppTilesPage.canvasContainer
        );

        await customAppTilesPage.navigateBackToEditPage();
        await customAppTilesPage.clickText(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.EXPECTED_VALUES.TRANSFORMED_DATE_MM_DD_YY
        );
        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.selectTransformType(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TRANSFORM_TYPES.DATE_FORMAT
        );
        await customAppTilesPage.selectDateFormat(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATE_FORMAT_OPTIONS.MONTH_DAY_YEAR
        );
        await customAppTilesPage.clickTransformValueSave();
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.EXPECTED_VALUES.TRANSFORMED_DATE_MONTH_DAY_YEAR,
          customAppTilesPage.canvasContainer
        );
      }
    );

    test(
      'verify link component transform value dialog - switching between transform types',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29348',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Transform Type Switching Test');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.ZENDESK,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.GET_PRIORITIES
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.getAndVerifySuccessfulAPIResponseInTab([/zendesk/i, /priority/i]);

        await linkComponent.clearDataTextBinding();

        await customAppTilesPage.clickButtonInTab('Data', 'Text', 'Add dynamic value');
        await customAppTilesPage.selectDataBindingField(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_OBJECT,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_TITLE
        );

        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.verifyTransformValueDialogVisible();

        await customAppTilesPage.selectTransformType(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TRANSFORM_TYPES.CASE_FORMAT
        );
        await customAppTilesPage.verifyCaseFormatPlaceholderVisible();

        await customAppTilesPage.selectTransformType(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TRANSFORM_TYPES.DATE_FORMAT
        );
        await customAppTilesPage.verifyDateFormatPlaceholderVisible();

        await customAppTilesPage.selectTransformType(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TRANSFORM_TYPES.VALUE_MAPPING
        );
        await customAppTilesPage.verifyValueMappingDefaultValueFieldVisible();

        await customAppTilesPage.selectTransformType(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TRANSFORM_TYPES.CASE_FORMAT
        );
        await customAppTilesPage.verifyCaseFormatPlaceholderVisible();

        await customAppTilesPage.clickTransformValueCancel();
        await customAppTilesPage.verifyTransformValueDialogClosed();
      }
    );

    test(
      'verify link component with max line count and whitespace text',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29365',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Max Line Count Whitespace Test');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.clickTab('Appearance', 'Link');
        await linkComponent.selectMaxLineCount(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.MAX_LINE_COUNT.TWO);

        await customAppTilesPage.clickTab('Data', 'Link');

        await linkComponent.enterLinkText(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.WHITESPACE,
          customAppTilesPage.canvasContainer
        );
        await linkComponent.enterUrl(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.URLS.EXAMPLE);

        const linkElement = linkComponent.getLinkElement('   ', customAppTilesPage.canvasContainer);
        await linkComponent.verifyMaxLineCountApplied(
          linkElement,
          '   ',
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.MAX_LINE_COUNT.TWO
        );

        await customAppTilesPage.clickButton('Save');
      }
    );

    test(
      'verify link component with comprehensive configuration - binding, color, text style, alignment and max line count',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29349',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Comprehensive Config Test');

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.ZENDESK,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.GET_PRIORITIES
        );

        await customAppTilesPage.dragToCanvas('Link');
        await customAppTilesPage.clickText('Link…');

        await customAppTilesPage.getAndVerifySuccessfulAPIResponseInTab([/zendesk/i, /priority/i]);

        // Configure data binding for text and URL
        await linkComponent.clearDataTextBinding();
        await linkComponent.clearUrl();

        await customAppTilesPage.clickButtonInTab('Data', 'Text', 'Add dynamic value');
        await customAppTilesPage.selectDataBindingField(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_OBJECT,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.DATA_BINDING.TICKET_FIELD_TITLE
        );

        await customAppTilesPage.clickButtonInTab('Data', 'URL', 'Add dynamic value');
        await customAppTilesPage.selectDataBindingField('object ticket_field', 'string url');

        // Configure appearance settings
        await customAppTilesPage.clickTab('Appearance', 'Link');

        // Set text style
        await linkComponent.selectTextStyle(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEXT_STYLES.HEADING_MEDIUM);

        // Configure advanced color settings with custom colors
        await linkComponent.openAdvancedColorSettings();
        await linkComponent.selectAdvancedColor(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.CUSTOM
        );
        await linkComponent.verifyNonSystemColorWarning();
        await linkComponent.enterCustomColorLightTheme(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.HEX.BLUE);
        await linkComponent.enterCustomColorDarkTheme(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.HEX.CYAN);
        await linkComponent.saveAdvancedSettings();

        // Set alignment
        await linkComponent.verifyAlignmentField();
        await linkComponent.clickAlignmentButton(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.ALIGNMENT.CENTER);

        // Set max line count
        await linkComponent.selectMaxLineCount(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.MAX_LINE_COUNT.TWO);

        // Add visibility rule that always returns true to ensure element is visible
        await customAppTilesPage.clickTab('Data', 'Link');
        const visibilityRule = CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.VISIBILITY_RULES.ALWAYS_TRUE;
        await linkComponent.openVisibilityRuleDialog();
        await linkComponent.verifyVisibilityRuleDialog();
        await linkComponent.enterVisibilityRule(visibilityRule);
        await linkComponent.saveVisibilityRule();
        await linkComponent.verifyVisibilityRuleSaved(visibilityRule);

        // Verify in preview
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.PRIORITY,
          customAppTilesPage.canvasContainer
        );

        // Verify color is applied
        const previewLinkElement = linkComponent.getLinkElement(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.PRIORITY,
          customAppTilesPage.canvasContainer
        );
        await linkComponent.verifyLinkColorApplied(
          previewLinkElement,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.PRIORITY,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.RGB.BLUE
        );

        // Verify alignment
        await linkComponent.verifyLinkAlignment(
          previewLinkElement,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.PRIORITY,
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.ALIGNMENT.CENTER
        );

        // Save and verify persistence
        await customAppTilesPage.navigateBackToEditPage();
        await customAppTilesPage.clickText(CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.PRIORITY);
        await customAppTilesPage.clickButton('Save');
        await customAppTilesPage.verifyToastMessageIsVisibleWithText(MESSAGES.TILE_SAVED_DRAFT);

        // Verify saved configuration persists
        const savedLinkElement = linkComponent.getLinkElement(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.TEST_TEXT.PRIORITY,
          customAppTilesPage.canvasContainer
        );
        await linkComponent.verifyLinkElementVisible(savedLinkElement, 'Link element should be visible after save');
        await savedLinkElement.click();

        await customAppTilesPage.clickTab('Appearance', 'Link');
        await linkComponent.openAdvancedColorSettings();
        await linkComponent.verifySelectedAdvancedColor(
          CUSTOM_APP_TILES_TEST_DATA.LINK_COMPONENT.COLORS.ADVANCED_COLOR_TYPES.CUSTOM
        );
        await linkComponent.cancelAdvancedSettings();
      }
    );

    test(
      'clean up link component test tiles',
      {
        tag: [TestPriority.P1],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-LINK-CLEANUP',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        await customAppTilesPage.deleteAllTilesWithPrefix('', /.*\bTest\s[a-zA-Z0-9]{6}$/);
      }
    );
  }
);
