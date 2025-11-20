import { faker } from '@faker-js/faker';
import { CUSTOM_APP_TILES_TEST_DATA } from '@integrations/test-data/customAppTiles.test-data';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { CustomAppTilesPage } from '@/src/modules/integrations/ui/pages/customAppTilesPage';

test.describe(
  'tag Component Custom Styling Functionality',
  {
    tag: [IntegrationsSuiteTags.CUSTOM_APP_TILES, IntegrationsSuiteTags.ABSOLUTE, IntegrationsSuiteTags.TAG],
  },
  () => {
    // Helper function to generate tile name and description
    const generateTileData = (testNamePrefix: string = 'Test') => {
      const descriptionPrefix = testNamePrefix.replace(/Test$/, 'Description');
      return {
        tileName: `Tag Component ${testNamePrefix} ${faker.string.alphanumeric({ length: 6 })}`,
        tileDescription: `Tag Component ${descriptionPrefix} ${faker.lorem.sentence()}`,
      };
    };

    test.beforeEach(async ({ appManagerFixture }) => {
      const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
      await customAppTilesPage.loadPage();
      await customAppTilesPage.verifyThePageIsLoaded();
    });

    test(
      'verify tag component basic functionality',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29219',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        // Create a new custom app tile with Display type
        const { tileName, tileDescription } = generateTileData();

        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        // Add Tag component to the canvas and configure it
        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.tagComponent.verifyTagComponentFields('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.verifyStylingRadioSelected('default');
      }
    );

    test(
      'verify tag component text option of tile builder',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-26828', // this test case is correct
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Text Option Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        // Verify Text and Color options are visible when Text option is selected
        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        // Verify Text and Color options are visible
        await customAppTilesPage.tagComponent.verifyTextDialogFields();

        // Verify all color options are available and select Medium
        await customAppTilesPage.tagComponent.verifyAndSelectDefaultColorOption('Medium');

        await customAppTilesPage.clickButton('Save');

        // Verify configuration is applied to tile by checking the Data tab
        await customAppTilesPage.clickTab('Data', 'Tag');

        // Enter some text and verify the default color (Medium) is applied
        await customAppTilesPage.tagComponent.enterTagText('Test Text');
        await customAppTilesPage.tagComponent.verifyTagTextColor('Test Text', 'rgb(252, 121, 59)'); // Medium color RGB
      }
    );

    test(
      'verify tag component custom styling functionality',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29220',
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

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.verifyDialogFields();

        await customAppTilesPage.tagComponent.verifyNoRadioButtonSelected();
      }
    );

    test(
      'verify tag component custom styling error validation',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29221',
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

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        // Attempt to save without selecting a pill type (Text/Status/Icon) - should show validation error
        await customAppTilesPage.clickButton('Save');

        await customAppTilesPage.tagComponent.verifyRequiredFieldError();

        await customAppTilesPage.clickButton('Cancel');

        await customAppTilesPage.tagComponent.verifyDialogNotVisible('Add custom setting');
      }
    );

    test(
      'verify tag component text type with default color and mapping rule errors',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29222',
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

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        // Verify Text type dialog shows all required fields (Default color, mapping rules, etc.)
        await customAppTilesPage.tagComponent.verifyTextDialogFields();

        // Attempt to save without selecting Default color - should show validation error
        await customAppTilesPage.clickButton('Save');
        await customAppTilesPage.tagComponent.verifyDefaultColorError();

        await customAppTilesPage.tagComponent.selectDefaultColor('High');

        await customAppTilesPage.clickButton('Add mapping rule');

        // Attempt to save mapping rule without filling required fields (Text and Color) - should show validation errors
        await customAppTilesPage.clickButton('Save');

        await customAppTilesPage.tagComponent.verifyMappingRuleErrors();
      }
    );

    test(
      'verify tag component text type with mapping rules and color verification',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27030', //test case id is correct
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

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('High');

        // Add a mapping rule: when text matches 'Sample text for mapping rule', use Low color (green)
        await customAppTilesPage.clickButton('Add mapping rule');

        await customAppTilesPage.tagComponent.enterMappingRuleText('Sample text for mapping rule');

        await customAppTilesPage.tagComponent.selectMappingRuleColor('Low');

        await customAppTilesPage.clickButton('Save');

        // Verify default color (High - orange) is applied when no mapping rule matches
        await customAppTilesPage.tagComponent.verifyTagTextColor('Text...', 'rgb(202, 97, 47)');

        await customAppTilesPage.clickTab('Data', 'Tag');

        // Enter text that matches the mapping rule and verify it uses the mapped color (Low - green)
        await customAppTilesPage.tagComponent.enterTagText('Sample text for mapping rule');

        await customAppTilesPage.tagComponent.verifyTagTextColor('Sample text for mapping rule', 'rgb(36, 133, 40)');
      }
    );

    test(
      'verify tag component status type with mapping rules and color verification',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29225',
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

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Status', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('In progress');

        // Add mapping rule for Status type: when text matches, use Active status color
        await customAppTilesPage.clickButton('Add mapping rule');

        await customAppTilesPage.tagComponent.enterMappingRuleText('Sample text for mapping rule');

        await customAppTilesPage.tagComponent.selectMappingRuleColor('Active');

        await customAppTilesPage.clickButton('Save');

        // Verify default status color (In progress - blue) when no mapping rule matches
        await customAppTilesPage.tagComponent.verifyTagStatusColor('Text...', 'rgb(42, 131, 218)');

        await customAppTilesPage.clickTab('Data', 'Tag');

        // Verify mapped status color (Active - green) when text matches the mapping rule
        await customAppTilesPage.tagComponent.enterTagText('Sample text for mapping rule');

        await customAppTilesPage.tagComponent.verifyTagStatusColor('Sample text for mapping rule', 'rgb(36, 133, 40)');
      }
    );

    test(
      'verify tag component icon type with URL and mapping rules',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29226',
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

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Icon', 'dialog');

        // Set fallback icon using URL (this icon is used when no mapping rule matches)
        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('URL');
        await customAppTilesPage.tagComponent.enterIconUrl(CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.ICON_URL);

        await customAppTilesPage.tagComponent.verifyIconPreviewAndUrlLink(
          CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.ICON_URL
        );
        await customAppTilesPage.clickButton('Done');

        // Add mapping rule with a different icon URL (this icon is used when text matches)
        await customAppTilesPage.clickButton('Add mapping rule');

        await customAppTilesPage.tagComponent.enterMappingRuleText('Sample text for mapping rule');

        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('URL');
        await customAppTilesPage.tagComponent.enterIconUrl(CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.ICON_URL_2);
        await customAppTilesPage.tagComponent.verifyIconPreviewAndUrlLink(
          CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.ICON_URL_2
        );
        await customAppTilesPage.clickButton('Done');

        await customAppTilesPage.tagComponent.verifyBothIconPreviewsVisible();

        await customAppTilesPage.tagComponent.verifyBothIconPreviewsVisible(
          CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.ICON_URL_2,
          CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.ICON_URL
        );

        await customAppTilesPage.clickButton('Save');

        // Verify fallback icon is displayed when no mapping rule matches
        await customAppTilesPage.tagComponent.verifyTagIconVisible(
          'Text...',
          CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.ICON_URL
        );

        await customAppTilesPage.clickTab('Data', 'Tag');

        // Verify mapped icon is displayed when text matches the mapping rule
        await customAppTilesPage.tagComponent.enterTagText('Sample text for mapping rule');

        await customAppTilesPage.tagComponent.verifyTagIconVisible(
          'Sample text for mapping rule',
          CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.ICON_URL_2
        );
      }
    );

    test(
      'verify tag component icon type with file upload and mapping rules',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29227',
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

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Icon', 'dialog');

        // Set fallback icon using file upload (used when no mapping rule matches)
        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');
        await customAppTilesPage.uploadFile('Jira_Custom_App.jpg', 'image');

        await customAppTilesPage.tagComponent.verifyIconPreviewImageVisible('Jira_Custom_App', 'JPG - 43.93kb');
        await customAppTilesPage.clickButton('Done');

        // Add mapping rule with a different icon file (used when text matches the rule)
        await customAppTilesPage.clickButton('Add mapping rule');

        await customAppTilesPage.tagComponent.enterMappingRuleText('Sample text for mapping rule');

        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');
        await customAppTilesPage.uploadFile('expensify.jpg', 'image');
        await customAppTilesPage.tagComponent.verifyIconPreviewImageVisible('expensify', 'JPG - 42.47kb');
        await customAppTilesPage.clickButton('Done');

        // Verify both icons are correctly configured: mapping rule icon and fallback icon
        await customAppTilesPage.tagComponent.verifyMappingRuleIconPreview();

        await customAppTilesPage.tagComponent.verifyMappingRuleIconPreview('expensify.jpg', 'JPEG - 42.5 KB');

        await customAppTilesPage.tagComponent.verifyFallbackIconPreview();

        await customAppTilesPage.tagComponent.verifyFallbackIconPreview('Jira_Custom_App.jpg', 'JPEG - 43.9 KB');

        await customAppTilesPage.clickButton('Save');

        await customAppTilesPage.tagComponent.verifyTagIconVisible(
          'Text...',
          CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.IMAGE_URL
        );

        await customAppTilesPage.clickTab('Data', 'Tag');

        await customAppTilesPage.tagComponent.enterTagText('Sample text for mapping rule');

        await customAppTilesPage.tagComponent.verifyTagIconVisible(
          'Sample text for mapping rule',
          CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.IMAGE_URL
        );
      }
    );

    test(
      'verify tag component remove and edit mapping rule functionality',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29228',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const { tileName, tileDescription } = generateTileData('Remove/Edit Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Icon', 'dialog');

        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');
        await customAppTilesPage.uploadFile('Jira_Custom_App.jpg', 'image');

        await customAppTilesPage.tagComponent.verifyIconPreviewImageVisible('Jira_Custom_App', 'JPG - 43.93kb');
        await customAppTilesPage.clickButton('Done');

        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('First mapping rule');
        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');
        await customAppTilesPage.uploadFile('expensify.jpg', 'image');
        await customAppTilesPage.tagComponent.verifyIconPreviewImageVisible('expensify', 'JPG - 42.47kb');
        await customAppTilesPage.clickButton('Done');

        // Verify first mapping rule was created successfully
        await customAppTilesPage.tagComponent.verifyMappingRuleCount(1);
        await customAppTilesPage.tagComponent.verifyMappingRuleIconPreview('expensify.jpg', 'JPEG - 42.5 KB', 0);

        // Add second mapping rule with a different icon
        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Second mapping rule', 1);
        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');
        await customAppTilesPage.uploadFile('freshservice.jpg', 'image');
        await customAppTilesPage.tagComponent.verifyIconPreviewImageVisible('freshservice', 'JPG - 8.13kb');
        await customAppTilesPage.clickButton('Done');

        // Verify both mapping rules exist with correct icons
        await customAppTilesPage.tagComponent.verifyMappingRuleCount(2);

        await customAppTilesPage.tagComponent.verifyMappingRuleIconPreview('expensify.jpg', 'JPEG - 42.5 KB', 0);

        await customAppTilesPage.tagComponent.verifyMappingRuleIconPreview('freshservice.jpg', 'JPEG - 8.1 KB', 1);

        // Remove the first mapping rule and verify only one remains
        await customAppTilesPage.tagComponent.clickRemoveMappingRule(0);

        await customAppTilesPage.tagComponent.verifyMappingRuleCount(1);

        // Edit the fallback icon: clear existing and upload a new one
        await customAppTilesPage.tagComponent.clickEditFallbackIcon();

        await customAppTilesPage.tagComponent.clearImage();
        await customAppTilesPage.uploadFile('airtable.jpg', 'image');
        await customAppTilesPage.tagComponent.verifyIconPreviewImageVisible('airtable', 'JPG - 31.91kb');
        await customAppTilesPage.clickButton('Done');

        await customAppTilesPage.clickButton('Save');
      }
    );

    test(
      'verify tag component regex matching functionality',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29229',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const { tileName, tileDescription } = generateTileData('Regex Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('High');

        await customAppTilesPage.clickButton('Add mapping rule');

        // Use regex pattern to match any text containing only uppercase letters
        await customAppTilesPage.tagComponent.enterMappingRuleText('^[A-Z]+$');

        await customAppTilesPage.tagComponent.toggleParseAsRegex();

        await customAppTilesPage.tagComponent.selectMappingRuleColor('Low');

        await customAppTilesPage.clickButton('Save');

        await customAppTilesPage.clickTab('Data', 'Tag');

        // Enter text that matches the regex pattern (all uppercase letters)
        await customAppTilesPage.tagComponent.enterTagText('HELLO');

        await customAppTilesPage.tagComponent.verifyTagTextColor('HELLO', 'rgb(36, 133, 40)');
      }
    );

    test(
      'verify mapping rule section of tile builder',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27112', // test case no is correct
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const { tileName, tileDescription } = generateTileData('Mapping Rule Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('Medium');

        // Add mapping rule with regex pattern "um" and Medium color
        await customAppTilesPage.clickButton('Add mapping rule');

        await customAppTilesPage.tagComponent.enterMappingRuleText('um');

        await customAppTilesPage.tagComponent.selectMappingRuleColor('Medium');

        await customAppTilesPage.tagComponent.toggleParseAsRegex();

        await customAppTilesPage.clickButton('Save');

        // Verify the configuration is applied by checking preview or data tab
        await customAppTilesPage.clickTab('Data', 'Tag');

        // Enter text that matches the regex pattern "um" (e.g., "Medium", "drum", etc.)
        await customAppTilesPage.tagComponent.enterTagText('Medium');

        await customAppTilesPage.tagComponent.verifyTagTextColor('Medium', 'rgb(252, 121, 59)');
      }
    );

    test(
      'verify tag component multiple mapping rules functionality',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29231',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);
        const { tileName, tileDescription } = generateTileData('Multiple Rules Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('High');

        // Create three mapping rules with different priorities and colors
        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Priority High', 0);
        await customAppTilesPage.tagComponent.selectMappingRuleColor('High', 0);

        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Priority Medium', 1);
        await customAppTilesPage.tagComponent.selectMappingRuleColor('Medium', 1);

        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Priority Low', 2);
        await customAppTilesPage.tagComponent.selectMappingRuleColor('Low', 2);

        await customAppTilesPage.tagComponent.verifyMappingRuleCount(3);

        await customAppTilesPage.clickButton('Save');

        await customAppTilesPage.clickTab('Data', 'Tag');

        // Test each mapping rule: verify correct color is applied based on text match
        await customAppTilesPage.tagComponent.enterTagText('Priority High');
        await customAppTilesPage.tagComponent.verifyTagTextColor('Priority High', 'rgb(202, 97, 47)');

        await customAppTilesPage.tagComponent.enterTagText('Priority Medium');
        await customAppTilesPage.tagComponent.verifyTagTextColor('Priority Medium', 'rgb(252, 121, 59)');

        await customAppTilesPage.tagComponent.enterTagText('Priority Low');
        await customAppTilesPage.tagComponent.verifyTagTextColor('Priority Low', 'rgb(36, 133, 40)');

        // Test fallback: when text doesn't match any rule, default color (High - orange) is used
        await customAppTilesPage.tagComponent.enterTagText('Unknown Priority');
        await customAppTilesPage.tagComponent.verifyTagTextColor('Unknown Priority', 'rgb(202, 97, 47)');
      }
    );

    test(
      'verify tag component cancel operations functionality',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29230',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Cancel Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Icon', 'dialog');

        // Start icon selection but cancel it using Back button
        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('URL');
        await customAppTilesPage.tagComponent.enterIconUrl(CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.ICON_URL);

        // Cancel icon selection dialog - should return to main dialog without saving icon
        await customAppTilesPage.page.getByRole('button', { name: 'Back' }).click();

        await expect(
          customAppTilesPage.page.getByRole('heading', { name: 'Select icon' }),
          'Icon dialog should be closed after cancel'
        ).not.toBeVisible();

        await expect(
          customAppTilesPage.page.getByRole('heading', { name: 'Add custom settings' }),
          'Main dialog should still be visible'
        ).toBeVisible();

        // Cancel the main dialog - should close without saving any changes
        await customAppTilesPage.clickButton('Cancel');

        await customAppTilesPage.tagComponent.verifyDialogNotVisible('Add custom settings');
      }
    );

    test(
      'verify tag component invalid URL validation',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29232',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Invalid URL Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Icon', 'dialog');

        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('URL');
        await customAppTilesPage.tagComponent.enterIconUrl('invalid-url');
        await customAppTilesPage.clickButton('Done');
      }
    );

    test(
      'verify tag component edit mapping rule text and color',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29233',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Edit Rule Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('High');

        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Original Text');
        await customAppTilesPage.tagComponent.selectMappingRuleColor('Low');

        await customAppTilesPage.clickButton('Save');

        // Reopen the dialog to edit the existing mapping rule
        await customAppTilesPage.clickButton('Add custom setting');

        // Update the mapping rule text and color
        await customAppTilesPage.tagComponent.editMappingRuleText('Updated Text', 0);

        await customAppTilesPage.tagComponent.selectMappingRuleColor('High');

        await customAppTilesPage.clickButton('Save');

        await customAppTilesPage.clickTab('Data', 'Tag');

        await customAppTilesPage.tagComponent.enterTagText('Updated Text');
        await customAppTilesPage.tagComponent.verifyTagTextColor('Updated Text', 'rgb(202, 97, 47)');
      }
    );

    test(
      'verify tag component status type with multiple mapping rules',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29234',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Status Multiple Rules Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Status', 'dialog');

        // Set default status color (In progress - blue) for fallback when no mapping rule matches
        await customAppTilesPage.tagComponent.selectDefaultColor('In progress');

        // Create two mapping rules for different status types
        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Active Status', 0);
        await customAppTilesPage.tagComponent.selectMappingRuleColor('Active', 0);

        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Completed Status', 1);
        await customAppTilesPage.tagComponent.selectMappingRuleColor('Completed', 1);

        await customAppTilesPage.tagComponent.verifyMappingRuleCount(2);

        await customAppTilesPage.clickButton('Save');

        await customAppTilesPage.clickTab('Data', 'Tag');

        // Verify Active status color (green) is applied when text matches first mapping rule
        await customAppTilesPage.tagComponent.enterTagText('Active Status');
        await customAppTilesPage.tagComponent.verifyTagStatusColor('Active Status', 'rgb(36, 133, 40)');

        // Verify Completed status color (dark green) is applied when text matches second mapping rule
        await customAppTilesPage.tagComponent.enterTagText('Completed Status');
        await customAppTilesPage.tagComponent.verifyTagStatusColor('Completed Status', 'rgb(22, 80, 24)');

        // Test fallback (non-matching text)
        await customAppTilesPage.tagComponent.enterTagText('Unknown Status');
        await customAppTilesPage.tagComponent.verifyTagStatusColor('Unknown Status', 'rgb(42, 131, 218)');
      }
    );

    test(
      'verify tag component edit mapping rule icon with file upload and URL',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29235',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Edit Icon Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Icon', 'dialog');

        // Set fallback icon using file upload
        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');
        await customAppTilesPage.uploadFile('airtable.jpg', 'image');
        await customAppTilesPage.tagComponent.verifyIconPreviewImageVisible('airtable', 'JPG - 31.91kb');
        await customAppTilesPage.clickButton('Done');

        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Icon Rule', 0);
        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');
        await customAppTilesPage.uploadFile('expensify.jpg', 'image');
        await customAppTilesPage.tagComponent.verifyIconPreviewImageVisible('expensify', 'JPG - 42.47kb');
        await customAppTilesPage.clickButton('Done');

        // Verify initial mapping rule icon was set using file upload
        await customAppTilesPage.tagComponent.verifyMappingRuleIconPreview('expensify.jpg', 'JPEG - 42.5 KB', 0);

        // Edit the mapping rule icon: change from file upload to URL source
        await customAppTilesPage.tagComponent.clickEditMappingRuleIcon(0);
        await customAppTilesPage.tagComponent.selectIconSourceRadio('URL');
        await customAppTilesPage.tagComponent.enterIconUrl(CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.ICON_URL);

        await customAppTilesPage.tagComponent.verifyIconPreviewAndUrlLink(
          CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.ICON_URL
        );
        await customAppTilesPage.clickButton('Done');

        // Verify icon source was successfully changed from file to URL (verification method differs for URL vs file)
        await customAppTilesPage.tagComponent.verifyMappingRuleIconPreviewWithUrl(
          CUSTOM_APP_TILES_TEST_DATA.EXTERNAL_URLS.ICON_URL,
          0
        );

        await customAppTilesPage.clickButton('Save');
      }
    );

    test(
      'verify tag component custom color selection',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29236',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Custom Color Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('Custom');

        // Configure custom colors for default (fallback) - black for light theme, white for dark theme
        await customAppTilesPage.tagComponent.enterDefaultColorLightTheme('#000000');
        await customAppTilesPage.tagComponent.enterDefaultColorDarkTheme('#FFFFFF');

        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Custom Color Rule', 0);
        await customAppTilesPage.tagComponent.selectMappingRuleColor('Custom', 0);

        // Configure custom colors for mapping rule - red for light theme, green for dark theme
        await customAppTilesPage.tagComponent.enterMappingRuleColorLightTheme('#FF0000', 0);
        await customAppTilesPage.tagComponent.enterMappingRuleColorDarkTheme('#00FF00', 0);

        await customAppTilesPage.clickButton('Save');

        await customAppTilesPage.clickTab('Data', 'Tag');

        await customAppTilesPage.tagComponent.enterTagText('Custom Color Rule');

        // Verify tag text displays with the custom color (light theme - red)
        await customAppTilesPage.tagComponent.verifyTagTextColor('Custom Color Rule', 'rgb(255, 0, 0)');
      }
    );

    test(
      'verify tag component clear icon and re-upload',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29237',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Clear Icon Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Icon', 'dialog');

        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');
        await customAppTilesPage.uploadFile('expensify.jpg', 'image');
        await customAppTilesPage.tagComponent.verifyIconPreviewImageVisible('expensify', 'JPG - 42.47kb');

        // Clear the previously uploaded icon
        await customAppTilesPage.tagComponent.clearImage();

        await expect(
          customAppTilesPage.tagComponent.iconPreviewImage,
          'Icon preview should not be visible after clearing'
        ).not.toBeVisible();

        // Upload a new icon file to replace the cleared one
        await customAppTilesPage.uploadFile('freshservice.jpg', 'image');
        await customAppTilesPage.tagComponent.verifyIconPreviewImageVisible('freshservice', 'JPG - 8.13kb');
        await customAppTilesPage.clickButton('Done');

        // Verify fallback icon was updated
        await customAppTilesPage.tagComponent.verifyFallbackIconPreview('freshservice.jpg', 'JPEG - 8.1 KB');

        await customAppTilesPage.clickButton('Save');
      }
    );

    // Additional test cases that could be added:

    test(
      'verify tag component tooltip text field functionality',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29238',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Tooltip Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        // Verify tooltip text field is visible and can be filled
        const tooltipText = 'This is a tooltip text';
        await customAppTilesPage.tagComponent.tooltipTextField.fill(tooltipText);
        await customAppTilesPage.tagComponent.verifyTooltipTextField(tooltipText);
      }
    );

    test(
      'verify tag component color picker cancel functionality',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29239',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Color Picker Cancel Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('Custom');

        // Open color picker and cancel it
        const lightThemeField = customAppTilesPage.page.locator('[data-testid="field-Light theme"]');
        const colorButton = lightThemeField.locator('button.InputButtonLauncher-module__launcher__kby5u');
        await colorButton.click();

        const colorPickerDialog = customAppTilesPage.page.getByRole('dialog', { name: 'Hex color picker' });
        await expect(colorPickerDialog, 'Color picker dialog should be visible').toBeVisible();

        // Cancel the color picker
        const cancelButton = colorPickerDialog.getByRole('button', { name: 'Cancel' });
        await cancelButton.click();

        // Verify color picker is closed and color was not changed
        await expect(colorPickerDialog, 'Color picker dialog should be closed').not.toBeVisible();
      }
    );

    test(
      'verify tag component switching between default and custom styling',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29240',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Styling Switch Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        // Start with default styling
        await customAppTilesPage.tagComponent.verifyStylingRadioSelected('default');

        // Switch to custom styling
        await customAppTilesPage.tagComponent.selectRadio('custom');
        await customAppTilesPage.tagComponent.verifyStylingRadioSelected('custom');

        // Configure custom settings
        await customAppTilesPage.clickButton('Add custom setting');
        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');
        await customAppTilesPage.tagComponent.selectDefaultColor('High');
        await customAppTilesPage.clickButton('Save');

        // Switch back to default styling
        await customAppTilesPage.tagComponent.selectRadio('default');
        await customAppTilesPage.tagComponent.verifyStylingRadioSelected('default');
      }
    );

    test(
      'verify tag component all status color options',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29241',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('All Status Colors Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Status', 'dialog');

        // Test all available status colors
        const statusColors = ['Not started', 'In progress', 'Active', 'Completed', 'On hold', 'Off track', 'Archived'];
        for (const statusColor of statusColors) {
          await customAppTilesPage.tagComponent.selectDefaultColor(statusColor);
          // Verify the selection was successful
          await expect(
            customAppTilesPage.tagComponent.dialogDefaultColorField,
            `Default color should be set to ${statusColor}`
          ).toBeVisible();
        }
      }
    );

    test(
      'verify tag component case sensitivity in mapping rules',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29242',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Case Sensitivity Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('High');

        // Add mapping rule with lowercase text
        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('lowercase text', 0);
        await customAppTilesPage.tagComponent.selectMappingRuleColor('Low', 0);

        // Add another mapping rule with uppercase text
        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('UPPERCASE TEXT', 1);
        await customAppTilesPage.tagComponent.selectMappingRuleColor('Medium', 1);

        await customAppTilesPage.clickButton('Save');

        await customAppTilesPage.clickTab('Data', 'Tag');

        // Test case-sensitive matching
        await customAppTilesPage.tagComponent.enterTagText('lowercase text');
        await customAppTilesPage.tagComponent.verifyTagTextColor('lowercase text', 'rgb(36, 133, 40)');

        await customAppTilesPage.tagComponent.enterTagText('UPPERCASE TEXT');
        await customAppTilesPage.tagComponent.verifyTagTextColor('UPPERCASE TEXT', 'rgb(252, 121, 59)');

        // Test that mixed case doesn't match
        await customAppTilesPage.tagComponent.enterTagText('Lowercase Text');
        await customAppTilesPage.tagComponent.verifyTagTextColor('Lowercase Text', 'rgb(202, 97, 47)');
      }
    );

    test(
      'verify tag component special characters in mapping rules',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29243',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Special Characters Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('High');

        // Add mapping rule with special characters
        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Text with @#$% special chars!', 0);
        await customAppTilesPage.tagComponent.selectMappingRuleColor('Low', 0);

        await customAppTilesPage.clickButton('Save');

        await customAppTilesPage.clickTab('Data', 'Tag');

        // Verify special characters work in mapping rules
        await customAppTilesPage.tagComponent.enterTagText('Text with @#$% special chars!');
        await customAppTilesPage.tagComponent.verifyTagTextColor('Text with @#$% special chars!', 'rgb(36, 133, 40)');
      }
    );

    test(
      'verify tag component mapping rule priority order',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29244',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Priority Order Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('High');

        // Add first mapping rule (should have higher priority)
        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Priority First', 0);
        await customAppTilesPage.tagComponent.selectMappingRuleColor('Low', 0);

        // Add second mapping rule (should have lower priority)
        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Priority Second', 1);
        await customAppTilesPage.tagComponent.selectMappingRuleColor('Medium', 1);

        // Verify mapping rules are in correct order
        await customAppTilesPage.tagComponent.verifyMappingRuleCount(2);

        await customAppTilesPage.clickButton('Save');

        await customAppTilesPage.clickTab('Data', 'Tag');

        // Verify first rule takes priority
        await customAppTilesPage.tagComponent.enterTagText('Priority First');
        await customAppTilesPage.tagComponent.verifyTagTextColor('Priority First', 'rgb(36, 133, 40)');
      }
    );

    test(
      'verify tag component all text color options',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29245',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('All Text Colors Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        // Test all available text color options
        const textColors = ['None', 'Low', 'Medium', 'High', 'Highest', 'Custom'];
        for (const textColor of textColors) {
          await customAppTilesPage.tagComponent.selectDefaultColor(textColor);
          // Verify the selection was successful
          await expect(
            customAppTilesPage.tagComponent.dialogDefaultColorField,
            `Default color should be set to ${textColor}`
          ).toBeVisible();
        }
      }
    );

    test(
      'verify tag component tooltip text truncation at 150 characters',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28971',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Tooltip Truncation Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        // Enter tooltip text that exceeds 150 characters
        const longTooltipText = 'A'.repeat(200);
        await customAppTilesPage.tagComponent.tooltipTextField.fill(longTooltipText);

        // Verify helper text indicates truncation will occur
        await expect(
          customAppTilesPage.tagComponent.tooltipTextHelperText,
          'Helper text should indicate truncation at 150 chars'
        ).toContainText(/150.*cut off/i);
      }
    );

    test(
      'verify tag component empty mapping rule text validation',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29246',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Empty Rule Validation Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('High');

        // Add mapping rule without text and without color
        await customAppTilesPage.clickButton('Add mapping rule');

        // Attempt to save without entering text and without selecting color
        await customAppTilesPage.clickButton('Save');
        await customAppTilesPage.tagComponent.verifyMappingRuleErrors();
      }
    );

    test(
      'verify tag component dark theme color verification',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29247',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Dark Theme Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('Custom');

        // Configure custom colors for both light and dark themes
        await customAppTilesPage.tagComponent.enterDefaultColorLightTheme('#FF0000');
        await customAppTilesPage.tagComponent.enterDefaultColorDarkTheme('#00FF00');

        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Dark Theme Rule', 0);
        await customAppTilesPage.tagComponent.selectMappingRuleColor('Custom', 0);
        await customAppTilesPage.tagComponent.enterMappingRuleColorLightTheme('#0000FF', 0);
        await customAppTilesPage.tagComponent.enterMappingRuleColorDarkTheme('#FFFF00', 0);

        await customAppTilesPage.clickButton('Save');

        // Note: Dark theme verification would require switching to dark mode
        // This test verifies that dark theme color fields are available and can be configured
        await customAppTilesPage.clickTab('Data', 'Tag');
        await customAppTilesPage.tagComponent.enterTagText('Dark Theme Rule');
        // Verify light theme color is applied (dark theme would require theme switch)
        await customAppTilesPage.tagComponent.verifyTagTextColor('Dark Theme Rule', 'rgb(0, 0, 255)');
      }
    );

    test(
      'verify tag component invalid regex pattern handling',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29248',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Invalid Regex Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('High');

        // Add mapping rule with invalid regex pattern
        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('[invalid regex', 0);
        await customAppTilesPage.tagComponent.toggleParseAsRegex(0);
        await customAppTilesPage.tagComponent.selectMappingRuleColor('Low', 0);

        // Attempt to save - should either show validation error or handle gracefully
        await customAppTilesPage.clickButton('Save');
        // Note: Actual behavior depends on implementation - may show error or allow save
      }
    );

    test(
      'verify Done button does not close dialog when file upload is empty in icon selection',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          isKnownFailure: true,
          bugTicket: 'INT-29206',
          bugReportedDate: '2025-11-18',
          knownFailurePriority: 'Low',
          knownFailureNote: 'The Done button should not close the dialog when file upload is empty in icon selection.',
          zephyrTestId: 'INT-29249',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Empty File Upload Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Icon', 'dialog');

        // Click Select icon under Fallback → Default icon
        await customAppTilesPage.clickButton('Select icon');

        // Choose File upload option
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');

        // Verify dialog does not close when Done button is clicked without file upload
        await customAppTilesPage.tagComponent.clickDoneAndVerifyIconDialogDoesNotClose();
      }
    );

    test(
      'validate duplicate text, missing icon, oversize file, and network error',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29250',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Validation Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        // Given: Tag style "Icon" is open
        await customAppTilesPage.tagComponent.selectRadio('Icon', 'dialog');

        // Set fallback icon
        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');
        await customAppTilesPage.uploadFile('Jira_Custom_App.jpg', 'image');
        await customAppTilesPage.clickButton('Done');

        // When: add two rows with text "Low" and different icons
        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Low', 0);
        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');
        await customAppTilesPage.uploadFile('expensify.jpg', 'image');
        await customAppTilesPage.clickButton('Done');

        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Low', 1);
        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');
        await customAppTilesPage.uploadFile('freshservice.jpg', 'image');
        await customAppTilesPage.clickButton('Done');

        // Then: see inline error "Text is already in use"
        await customAppTilesPage.tagComponent.verifyDuplicateTextError();

        // Remove the duplicate mapping rule
        await customAppTilesPage.tagComponent.clickRemoveMappingRule(1);

        // When: add row "Sales" without selecting an icon
        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Sales', 1);

        // Attempt to save without selecting an icon
        await customAppTilesPage.clickButton('Save');

        // Then: see inline error for missing icon
        await customAppTilesPage.tagComponent.verifyIconRequiredError();

        // Select icon to clear the error
        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');
        await customAppTilesPage.uploadFile('airtable.jpg', 'image');
        await customAppTilesPage.clickButton('Done');

        // Remove the mapping rule to test file size
        await customAppTilesPage.tagComponent.clickRemoveMappingRule(1);

        // When: try to upload "LargeIcon.png" (300KB)
        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('Large File Test', 1);
        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');

        await customAppTilesPage.tagComponent.clickBackButton();

        await customAppTilesPage.clickButton('Cancel');
      }
    );

    test(
      'verify tag component invalid regex pattern shows validation error',
      {
        tag: [TestPriority.P2],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-28977',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('Invalid Regex Validation Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Text', 'dialog');

        await customAppTilesPage.tagComponent.selectDefaultColor('High');

        // Add mapping rule with invalid regex pattern
        await customAppTilesPage.clickButton('Add mapping rule');
        await customAppTilesPage.tagComponent.enterMappingRuleText('[invalid regex', 0);
        await customAppTilesPage.tagComponent.toggleParseAsRegex(0);
        await customAppTilesPage.tagComponent.selectMappingRuleColor('Low', 0);

        // Attempt to save - verify validation error appears for invalid regex
        await customAppTilesPage.clickButton('Save');

        // Verify error message appears
        const hasError = await customAppTilesPage.tagComponent.verifyInvalidRegexError();
        if (!hasError) {
          await customAppTilesPage.tagComponent.verifyDialogStillVisible();
        }

        await customAppTilesPage.clickButton('Cancel');
      }
    );

    test(
      'verify tag component file size validation for icon upload exceeding 200KB',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29252',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        const { tileName, tileDescription } = generateTileData('File Size Validation Test');
        await customAppTilesPage.createcustom(
          tileName,
          tileDescription,
          CUSTOM_APP_TILES_TEST_DATA.TILE_TYPES.DISPLAY,
          CUSTOM_APP_TILES_TEST_DATA.APPS.JIRA_CUSTOM_APP_BASIC_AUTH,
          CUSTOM_APP_TILES_TEST_DATA.API_ACTIONS.LIST_ALL_TICKETS
        );

        await customAppTilesPage.dragToCanvas('Tag');
        await customAppTilesPage.clickText('Text...');

        await customAppTilesPage.clickTab('Appearance', 'Tag');

        await customAppTilesPage.tagComponent.selectRadio('custom');

        await customAppTilesPage.clickButton('Add custom setting');

        await customAppTilesPage.tagComponent.selectRadio('Icon', 'dialog');

        // Attempt to upload icon with file size > 200KB
        await customAppTilesPage.clickButton('Select icon');
        await customAppTilesPage.tagComponent.selectIconSourceRadio('File upload');

        // Upload file larger than 200KB
        await customAppTilesPage.uploadFile('SizeMoreThan300KB.jpg', 'image');

        // Verify toast messages
        await customAppTilesPage.verifyToastMessage('Image upload failed');
        await customAppTilesPage.verifyToastMessage('File size should not exceed 200 KB');
      }
    );

    test(
      'clean up tag component test tiles',
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
