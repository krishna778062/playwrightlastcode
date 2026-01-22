import { IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { CreateApiActionPage } from '@/src/modules/integrations/ui/pages/createApiActionPage';
import { CustomApiActionsPage } from '@/src/modules/integrations/ui/pages/customApiActionsPage';

test.describe(
  'custom api actions management',
  {
    tag: [IntegrationsSuiteTags.CUSTOM_API_ACTIONS, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      const customApiActionsPage = new CustomApiActionsPage(appManagerFixture.page);
      await customApiActionsPage.loadPage();
      await customApiActionsPage.verifyThePageIsLoaded();
    });

    test(
      'verify search field and show more behaviour for API actions list',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.HEALTH_CHECK],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16368, INT-16372',
          storyId: 'INT-15403',
        });
        const customApiActionsPage = new CustomApiActionsPage(appManagerFixture.page);
        await customApiActionsPage.searchForApiActions('List All Tickets');
        await customApiActionsPage.verifyApiActionIsDisplayedInList('List All Tickets');
        await customApiActionsPage.clearSearch();
        await customApiActionsPage.verifyShowMoreVisibilityBehaviour();
      }
    );

    test(
      'verify Apps filter functionality for API actions list',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16370',
          storyId: 'INT-15403',
        });
        const customApiActionsPage = new CustomApiActionsPage(appManagerFixture.page);
        await customApiActionsPage.clickAndVerifyAppsFilter();
        await customApiActionsPage.selectDeselectBehaviour('Zendesk');
        await customApiActionsPage.verifyAppsFilterSearchSelectClear('Zendesk');
      }
    );

    test(
      'verify Status filter functionality',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16371',
          storyId: 'INT-15403',
        });

        const customApiActionsPage = new CustomApiActionsPage(appManagerFixture.page);
        await customApiActionsPage.selectStatusFilter('Draft');
        await customApiActionsPage.verifyAllApiActionsHaveStatus('Draft');
        await customApiActionsPage.selectStatusFilter('Published');
        await customApiActionsPage.verifyAllApiActionsHaveStatus('Published');
      }
    );

    test(
      'verify Sort functionality for API actions list',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16373',
          storyId: 'INT-15403',
        });

        const customApiActionsPage = new CustomApiActionsPage(appManagerFixture.page);
        // Test sorting by Name
        await customApiActionsPage.selectSortBy('Name');
        await customApiActionsPage.verifySortDropdownLabel('Name');
        await customApiActionsPage.selectSortOrder('Oldest first');
        await customApiActionsPage.verifyApiActionsSortedAlphabeticallyAZ();
        await customApiActionsPage.selectSortOrder('Newest first');
        await customApiActionsPage.verifyApiActionsSortedAlphabeticallyZA();

        // Test sorting by Date created
        await customApiActionsPage.selectSortBy('Date created');
        await customApiActionsPage.verifySortDropdownLabel('Date created');
        await customApiActionsPage.verifyThePageIsLoaded();

        // Test sorting by Last updated
        await customApiActionsPage.selectSortBy('Last updated');
        await customApiActionsPage.verifySortDropdownLabel('Last updated');
        await customApiActionsPage.verifyThePageIsLoaded();
      }
    );

    test(
      'verify API action count is displayed correctly',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16374',
          storyId: 'INT-15403',
        });

        const customApiActionsPage = new CustomApiActionsPage(appManagerFixture.page);
        await customApiActionsPage.verifyApiActionCountDisplayed();
        await customApiActionsPage.verifyApiActionCountIsGreaterThanZero();
      }
    );

    test(
      'verify Create API action button navigation',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16375',
          storyId: 'INT-15403',
        });

        const customApiActionsPage = new CustomApiActionsPage(appManagerFixture.page);
        await customApiActionsPage.verifyCreateApiActionButtonNavigation();
      }
    );

    test(
      'verify sorting by Name with different order options',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16376',
          storyId: 'INT-15403',
        });

        const customApiActionsPage = new CustomApiActionsPage(appManagerFixture.page);
        // Sort by Name - Newest first
        await customApiActionsPage.selectSortBy('Name');
        await customApiActionsPage.selectSortOrder('Newest first');
        await customApiActionsPage.verifyApiActionsSortedAlphabeticallyZA();

        // Sort by Name - Oldest first
        await customApiActionsPage.selectSortOrder('Oldest first');
        await customApiActionsPage.verifyApiActionsSortedAlphabeticallyAZ();
      }
    );

    test(
      'verify Create API action page loads with all required elements',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16377',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.verifyButtonsAreDisabled();
        await createApiActionPage.verifyStepIndicatorsDisabled();
      }
    );

    test(
      'verify Cancel button navigation',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16378',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.verifyCancelButtonNavigation();
      }
    );

    test(
      'verify Add custom app link navigation',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16379',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.verifyAddCustomAppLinkNavigation();
      }
    );

    test(
      'verify back to API actions link navigation',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16380',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.verifyBackToApiActionsLinkNavigation();
      }
    );

    test(
      'verify custom app selection enables buttons',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16381',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.verifyButtonsAreDisabled();
        await createApiActionPage.selectCustomApp('Zendesk');
        await createApiActionPage.enterApiActionName('Test API Action');
        await createApiActionPage.verifyButtonsAreEnabled();
      }
    );

    test(
      'verify API action name input accepts text',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16382',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.selectCustomApp('Zendesk');
        await createApiActionPage.enterApiActionName('Test API Action');
        await createApiActionPage.verifyButtonsAreEnabled();
      }
    );

    test(
      'verify custom app combobox search functionality',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16383',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.selectCustomApp('Jira Custom App Basic Auth');
        await createApiActionPage.enterApiActionName('Test API Action');
        await createApiActionPage.verifyButtonsAreEnabled();
      }
    );

    test(
      'verify form validation - buttons enabled after selecting custom app',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16384',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.verifyButtonsAreDisabled();
        await createApiActionPage.selectCustomApp('Zendesk');
        await createApiActionPage.enterApiActionName('Test API Action');
        await createApiActionPage.verifyButtonsAreEnabled();
      }
    );

    test(
      'verify Save Draft functionality saves API action',
      {
        tag: [TestPriority.P9, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16385',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.selectCustomApp('Zendesk');
        await createApiActionPage.enterApiActionName('Test Save Draft API Action');
        await createApiActionPage.verifyButtonsAreEnabled();
        await createApiActionPage.clickSaveDraft();
        await createApiActionPage.verifyNavigationToApiActionsList();
        const customApiActionsPage = new CustomApiActionsPage(appManagerFixture.page);
        await customApiActionsPage.verifyThePageIsLoaded();
      }
    );

    test(
      'verify Next button navigates to API configuration step',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16386',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.selectCustomApp('Zendesk');
        await createApiActionPage.enterApiActionName('Test API Configuration Navigation');
        await createApiActionPage.verifyButtonsAreEnabled();
        await createApiActionPage.clickNext();
        await createApiActionPage.verifyApiConfigurationStepIsVisible();
      }
    );

    test(
      'verify API action creation with Github custom app',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16387',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.selectCustomApp('Github');
        await createApiActionPage.enterApiActionName('Search Pull Requests');
        await createApiActionPage.verifyButtonsAreEnabled();
        await createApiActionPage.clickNext();
        await createApiActionPage.verifyApiConfigurationStepIsVisible();
      }
    );

    test(
      'verify API action creation with Jira custom app',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16388',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.selectCustomApp('Jira Custom App Basic Auth');
        await createApiActionPage.enterApiActionName('View Assigned Tickets');
        await createApiActionPage.verifyButtonsAreEnabled();
        await createApiActionPage.clickNext();
        await createApiActionPage.verifyApiConfigurationStepIsVisible();
      }
    );

    test(
      'verify API action creation with ServiceNow custom app',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16389',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.selectCustomApp('ServiceNow');
        await createApiActionPage.enterApiActionName('List All Tickets');
        await createApiActionPage.verifyButtonsAreEnabled();
        await createApiActionPage.clickNext();
        await createApiActionPage.verifyApiConfigurationStepIsVisible();
      }
    );

    test(
      'verify API action creation with Airtable custom app',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16390',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.selectCustomApp('Airtable (Prod)');
        await createApiActionPage.enterApiActionName('List All Records');
        await createApiActionPage.verifyButtonsAreEnabled();
        await createApiActionPage.clickNext();
        await createApiActionPage.verifyApiConfigurationStepIsVisible();
      }
    );

    test(
      'verify API action name field accepts long text',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16391',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.selectCustomApp('Zendesk');
        const longActionName = 'A'.repeat(100);
        await createApiActionPage.enterApiActionName(longActionName);
        await createApiActionPage.verifyButtonsAreEnabled();
      }
    );

    test(
      'verify API action name field accepts special characters',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16392',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.selectCustomApp('Zendesk');
        await createApiActionPage.enterApiActionName('Test API Action - Special Characters: @#$%');
        await createApiActionPage.verifyButtonsAreEnabled();
      }
    );

    test(
      'verify buttons remain disabled when only custom app is selected without name',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16393',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.selectCustomApp('Zendesk');
        // Don't enter API action name
        await createApiActionPage.verifyButtonsAreDisabled();
      }
    );

    test(
      'verify buttons remain disabled when only API action name is entered without custom app',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16394',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.enterApiActionName('Test API Action Without App');
        // Don't select custom app
        await createApiActionPage.verifyButtonsAreDisabled();
      }
    );

    test(
      'verify step indicators state after completing details step',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16395',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.verifyStepIndicatorsDisabled();
        await createApiActionPage.selectCustomApp('Zendesk');
        await createApiActionPage.enterApiActionName('Test Step Indicators');
        await createApiActionPage.verifyButtonsAreEnabled();
        await createApiActionPage.clickNext();
        await createApiActionPage.verifyApiConfigurationStepIsVisible();
      }
    );

    test(
      'verify API action creation with Box custom app',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16396',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
        await createApiActionPage.selectCustomApp('Box');
        await createApiActionPage.enterApiActionName('List Files in Folder');
        await createApiActionPage.verifyButtonsAreEnabled();
        await createApiActionPage.clickNext();
        await createApiActionPage.verifyApiConfigurationStepIsVisible();
      }
    );

    test(
      'verify API action creation with multiple custom apps selection flow',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-16397',
          storyId: 'INT-15403',
        });

        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();

        // Select first app
        await createApiActionPage.selectCustomApp('Zendesk');
        await createApiActionPage.enterApiActionName('First API Action');
        await createApiActionPage.verifyButtonsAreEnabled();

        // Change to different app
        await createApiActionPage.selectCustomApp('Github');
        // Name should persist, buttons should still be enabled
        await createApiActionPage.verifyButtonsAreEnabled();
      }
    );
  }
);
