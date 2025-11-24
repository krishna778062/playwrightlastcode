import { faker } from '@faker-js/faker';
import { CUSTOM_APP_TILES_TEST_DATA } from '@integrations/test-data/customAppTiles.test-data';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { LinkComponent } from '@/src/modules/integrations/ui/components/linkComponent';
import { CustomAppTilesPage } from '@/src/modules/integrations/ui/pages/customAppTilesPage';

test.describe(
  'link Component Custom Styling Functionality',
  {
    tag: [IntegrationsSuiteTags.CUSTOM_APP_TILES, IntegrationsSuiteTags.ABSOLUTE],
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
          zephyrTestId: 'INT-LINK-001',
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
          zephyrTestId: 'INT-LINK-002',
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
          { name: 'Data large', expectedMinHeight: 18 },
          { name: 'Data medium', expectedMinHeight: 14 },
          { name: 'Data small', expectedMinHeight: 10 },
          { name: 'Heading large', expectedMinHeight: 28 },
          { name: 'Heading medium', expectedMinHeight: 22 },
          { name: 'Heading small', expectedMinHeight: 19 },
        ];

        for (const style of textStyles) {
          await linkComponent.selectTextStyle(style.name);
          const linkElement = linkComponent.getLinkElement('Link…', customAppTilesPage.canvasContainer);
          await linkComponent.verifyLinkHeight(linkElement, style.expectedMinHeight, style.name);
        }
      }
    );

    test(
      'verify link component color configuration with system colors',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27943',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const linkComponent = new LinkComponent(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Color Test');
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
        await linkComponent.verifySystemColorOptions();
        await linkComponent.selectAdvancedColor('System darkest');
        await linkComponent.verifySelectedAdvancedColor('System darkest');
        await linkComponent.saveAdvancedSettings();

        await linkComponent.openAdvancedColorSettings();
        await linkComponent.verifySelectedAdvancedColor('System darkest');
        await linkComponent.cancelAdvancedSettings();

        const linkElement = linkComponent.getLinkElement('Link…', customAppTilesPage.canvasContainer);
        await linkComponent.verifyLinkColorApplied(linkElement, 'Link…', 'rgb(0, 0, 0)');
      }
    );

    test(
      'verify link component custom color configuration',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-LINK-004',
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
        await linkComponent.selectAdvancedColor('Custom');
        await linkComponent.verifySelectedAdvancedColor('Custom');
        await linkComponent.enterCustomColorLightTheme('#FF0000');
        await linkComponent.saveAdvancedSettings();

        await linkComponent.openAdvancedColorSettings();
        await linkComponent.verifySelectedAdvancedColor('Custom');
        await linkComponent.cancelAdvancedSettings();

        const linkElement = linkComponent.getLinkElement('Link…', customAppTilesPage.canvasContainer);
        await linkComponent.verifyLinkColorApplied(linkElement, 'Link…', 'rgb(255, 0, 0)');
      }
    );

    test(
      'verify link component alignment options',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-LINK-005',
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

        const linkElement = linkComponent.getLinkElement('Link…', customAppTilesPage.canvasContainer);
        await linkComponent.testAllAlignmentButtons(linkElement, 'Link…');
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyLinkAlignment(linkElement, 'Link…', 'right');
      }
    );

    test(
      'verify link component maximum line count options',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-LINK-006',
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
        await linkComponent.selectMaxLineCount('1');
        await customAppTilesPage.clickTab('Data', 'Link');
        await linkComponent.enterLinkText(
          'This is a very long link text that should wrap to multiple lines when None is selected',
          customAppTilesPage.canvasContainer
        );
        await linkComponent.selectMaxLineCount('2');

        const linkTextPrefix = 'This is a very long link text';
        const linkElement = linkComponent.getLinkElement(linkTextPrefix, customAppTilesPage.canvasContainer);
        await linkComponent.verifyMaxLineCountApplied(linkElement, linkTextPrefix, '2');
        await linkComponent.selectMaxLineCount('3');
        await linkComponent.verifyMaxLineCountApplied(linkElement, linkTextPrefix, '3');
        await linkComponent.selectMaxLineCount('None');
        await linkComponent.verifyMaxLineCountApplied(linkElement, linkTextPrefix, 'None');
      }
    );

    test(
      'verify link component URL field validation',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-LINK-007',
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

        await linkComponent.enterLinkText('Test Link', customAppTilesPage.canvasContainer);
        await linkComponent.enterUrl('https://www.google.com');

        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyRedirectUrl(tileName, 'https://www.google.com');

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
          zephyrTestId: 'INT-LINK-008',
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
          zephyrTestId: 'INT-LINK-009',
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

        const visibilityRule = "return apiData.status === 'active';";

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
          zephyrTestId: 'INT-LINK-012',
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
        await linkComponent.selectAdvancedColor('System dark');
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
          zephyrTestId: 'INT-LINK-013',
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
        await linkComponent.selectAdvancedColor('Custom');
        await linkComponent.verifyNonSystemColorWarning();
        await linkComponent.enterCustomColorLightTheme('#FF0000');
        await linkComponent.enterCustomColorDarkTheme('#00FF00');
        await linkComponent.saveAdvancedSettings();

        await linkComponent.openAdvancedColorSettings();
        await linkComponent.verifySelectedAdvancedColor('Custom');
        await linkComponent.cancelAdvancedSettings();

        await linkComponent.openAdvancedColorSettings();
        await linkComponent.selectAdvancedColor('Brand');
        await linkComponent.verifyNonSystemColorWarning();
        await linkComponent.selectLightThemeBrand();
        await linkComponent.selectDarkThemeBrand();
        await linkComponent.saveAdvancedSettings();

        await linkComponent.openAdvancedColorSettings();
        await linkComponent.verifySelectedAdvancedColor('Brand');
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
          zephyrTestId: 'INT-LINK-019',
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
        await linkComponent.selectAdvancedColor('Brand');
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
          zephyrTestId: 'INT-LINK-014',
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

        const visibilityRule = "return apiData.status === 'active';";

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
          zephyrTestId: 'INT-LINK-015',
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

        await linkComponent.enterLinkText('Test Link', customAppTilesPage.canvasContainer);
        await linkComponent.enterUrl('invalid-url-format');

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
          zephyrTestId: 'INT-LINK-016',
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

        const specialText = 'Link with special chars: @#$%^&*()_+-=[]{}|;\':",./<>?';
        await linkComponent.enterLinkText(specialText, customAppTilesPage.canvasContainer);
        await linkComponent.enterUrl('https://www.example.com');

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
          zephyrTestId: 'INT-LINK-017',
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

        const bindingText = 'apiData.ticket.title';
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
          zephyrTestId: 'INT-LINK-022',
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

        const longText = 'A'.repeat(250);
        await linkComponent.enterLinkText(longText, customAppTilesPage.canvasContainer);
        await linkComponent.enterUrl('https://www.example.com');

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
          zephyrTestId: 'INT-LINK-023',
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

        const invalidRule = 'return apiData.status ===';
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
          zephyrTestId: 'INT-LINK-024',
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

        await linkComponent.enterLinkText('Test Link', customAppTilesPage.canvasContainer);
        await linkComponent.enterUrl('https://www.example.com');

        const falseRule = 'return false;';
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
          zephyrTestId: 'INT-LINK-025',
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

        const unicodeText = 'Link with emoji 🚀 and unicode: 中文 العربية русский';
        await linkComponent.enterLinkText(unicodeText, customAppTilesPage.canvasContainer);
        await linkComponent.enterUrl('https://www.example.com');

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
          zephyrTestId: 'INT-LINK-026',
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

        const linkText = 'Persistent Link';
        const linkUrl = 'https://www.example.com';
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
          zephyrTestId: 'INT-LINK-020',
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
        await customAppTilesPage.selectDataBindingField('object ticket_field', 'string title');

        await customAppTilesPage.clickButtonInTab('Data', 'URL', 'Add dynamic value');
        await customAppTilesPage.selectDataBindingField('object ticket_field', 'string url');

        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas('Priority', customAppTilesPage.canvasContainer);
      }
    );

    test(
      'verify link component transform value dialog - Value mapping and cancel functionality',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-LINK-029',
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
        await customAppTilesPage.selectDataBindingField('object ticket_field', 'string title');

        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.verifyTransformValueDialogVisible();
        await customAppTilesPage.selectTransformType('Value mapping');
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
          zephyrTestId: 'INT-LINK-030',
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
        await customAppTilesPage.selectDataBindingField('object ticket_field', 'string title');

        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.selectTransformType('Value mapping');
        await customAppTilesPage.clickButton('Add dynamic value');
        await customAppTilesPage.selectDataBindingField('object ticket_field', 'string created_at');
        await customAppTilesPage.clickButton('Save');
        await linkComponent.verifyTransformedTextInCanvas('2024-10-16T11:51:47Z', customAppTilesPage.canvasContainer);
      }
    );

    test(
      'verify link component transform value dialog - Case format Uppercase and Sentence case',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-LINK-010',
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
        await customAppTilesPage.selectDataBindingField('object ticket_field', 'string title');

        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.selectTransformType('Case format');
        await customAppTilesPage.selectCaseFormat('Lowercase');
        await customAppTilesPage.clickTransformValueSave();
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas('priority', customAppTilesPage.canvasContainer);

        await customAppTilesPage.navigateBackToEditPage();
        await customAppTilesPage.clickText('priority');
        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.selectTransformType('Case format');
        await customAppTilesPage.selectCaseFormat('Uppercase');
        await customAppTilesPage.clickTransformValueSave();
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas('PRIORITY', customAppTilesPage.canvasContainer);

        await customAppTilesPage.navigateBackToEditPage();
        await customAppTilesPage.clickText('PRIORITY');
        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.selectTransformType('Case format');
        await customAppTilesPage.selectCaseFormat('Sentence case');
        await customAppTilesPage.clickTransformValueSave();
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas('Priority', customAppTilesPage.canvasContainer);
      }
    );

    test(
      'verify link component transform value dialog - Additional date format options',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-LINK-011',
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
        await customAppTilesPage.selectDataBindingField('object ticket_field', 'string created_at');

        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.selectTransformType('Date format');
        await customAppTilesPage.selectDateFormat('MM/DD/YYYY');
        await customAppTilesPage.clickTransformValueSave();
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas('10/16/2024', customAppTilesPage.canvasContainer);

        await customAppTilesPage.navigateBackToEditPage();
        await customAppTilesPage.clickText('10/16/2024');
        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.selectTransformType('Date format');
        await customAppTilesPage.selectDateFormat('MM/DD/YY');
        await customAppTilesPage.clickTransformValueSave();
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas('10/16/24', customAppTilesPage.canvasContainer);

        await customAppTilesPage.navigateBackToEditPage();
        await customAppTilesPage.clickText('10/16/24');
        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.selectTransformType('Date format');
        await customAppTilesPage.selectDateFormat('Month Day, Year');
        await customAppTilesPage.clickTransformValueSave();
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas('Oct 16, 2024', customAppTilesPage.canvasContainer);
      }
    );

    test(
      'verify link component transform value dialog - switching between transform types',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-LINK-033',
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
        await customAppTilesPage.selectDataBindingField('object ticket_field', 'string title');

        await customAppTilesPage.clickTransformValue('Data', 'Text');
        await customAppTilesPage.verifyTransformValueDialogVisible();

        await customAppTilesPage.selectTransformType('Case format');
        await customAppTilesPage.verifyCaseFormatPlaceholderVisible();

        await customAppTilesPage.selectTransformType('Date format');
        await customAppTilesPage.verifyDateFormatPlaceholderVisible();

        await customAppTilesPage.selectTransformType('Value mapping');
        await customAppTilesPage.verifyValueMappingDefaultValueFieldVisible();

        await customAppTilesPage.selectTransformType('Case format');
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
          zephyrTestId: 'INT-LINK-034',
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
        await linkComponent.selectMaxLineCount('2');

        await customAppTilesPage.clickTab('Data', 'Link');

        await linkComponent.enterLinkText('   \n   \n   ', customAppTilesPage.canvasContainer);
        await linkComponent.enterUrl('https://www.example.com');

        const linkElement = linkComponent.getLinkElement('   ', customAppTilesPage.canvasContainer);
        await linkComponent.verifyMaxLineCountApplied(linkElement, '   ', '2');

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
          zephyrTestId: 'INT-LINK-035',
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
        await customAppTilesPage.selectDataBindingField('object ticket_field', 'string title');

        await customAppTilesPage.clickButtonInTab('Data', 'URL', 'Add dynamic value');
        await customAppTilesPage.selectDataBindingField('object ticket_field', 'string url');

        // Configure appearance settings
        await customAppTilesPage.clickTab('Appearance', 'Link');

        // Set text style
        await linkComponent.selectTextStyle('Heading medium');

        // Configure advanced color settings with custom colors
        await linkComponent.openAdvancedColorSettings();
        await linkComponent.selectAdvancedColor('Custom');
        await linkComponent.verifyNonSystemColorWarning();
        await linkComponent.enterCustomColorLightTheme('#0066CC');
        await linkComponent.enterCustomColorDarkTheme('#00CCFF');
        await linkComponent.saveAdvancedSettings();

        // Set alignment
        await linkComponent.verifyAlignmentField();
        await linkComponent.expandAlignmentAccordion();
        // Use force: true because radio input intercepts the button click
        const centerAlignButton = customAppTilesPage.page.getByRole('button', { name: 'Align center' });
        await centerAlignButton.click({ force: true });

        // Set max line count
        await linkComponent.selectMaxLineCount('2');

        // Add visibility rule that always returns true to ensure element is visible
        await customAppTilesPage.clickTab('Data', 'Link');
        const visibilityRule = 'return true;';
        await linkComponent.openVisibilityRuleDialog();
        await linkComponent.verifyVisibilityRuleDialog();
        await linkComponent.enterVisibilityRule(visibilityRule);
        await linkComponent.saveVisibilityRule();
        await linkComponent.verifyVisibilityRuleSaved(visibilityRule);

        // Verify in preview
        await customAppTilesPage.clickButton('Preview');
        await linkComponent.verifyTransformedTextInCanvas('Priority', customAppTilesPage.canvasContainer);

        // Verify color is applied
        const previewLinkElement = linkComponent.getLinkElement('Priority', customAppTilesPage.canvasContainer);
        await linkComponent.verifyLinkColorApplied(previewLinkElement, 'Priority', 'rgb(0, 102, 204)');

        // Verify alignment
        await linkComponent.verifyLinkAlignment(previewLinkElement, 'Priority', 'center');

        // Save and verify persistence
        await customAppTilesPage.navigateBackToEditPage();
        await customAppTilesPage.clickText('Priority');
        await customAppTilesPage.clickButton('Save');
        await customAppTilesPage.verifyToastMessageIsVisibleWithText(MESSAGES.TILE_SAVED_DRAFT);

        // Verify saved configuration persists
        const savedLinkElement = linkComponent.getLinkElement('Priority', customAppTilesPage.canvasContainer);
        await linkComponent.verifyLinkElementVisible(savedLinkElement, 'Link element should be visible after save');
        await savedLinkElement.click();

        await customAppTilesPage.clickTab('Appearance', 'Link');
        await linkComponent.openAdvancedColorSettings();
        await linkComponent.verifySelectedAdvancedColor('Custom');
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
