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
      const testTitle = test.info().title.toLowerCase();
      if (testTitle.includes('create api action')) {
        const createApiActionPage = new CreateApiActionPage(appManagerFixture.page);
        await createApiActionPage.loadPage();
        await createApiActionPage.verifyThePageIsLoaded();
      } else {
        const customApiActionsPage = new CustomApiActionsPage(appManagerFixture.page);
        await customApiActionsPage.loadPage();
        await customApiActionsPage.verifyThePageIsLoaded();
      }
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
        await createApiActionPage.verifyButtonsAreDisabled();
        await createApiActionPage.selectCustomApp('Zendesk');
        await createApiActionPage.enterApiActionName('Test API Action');
        await createApiActionPage.verifyButtonsAreEnabled();
      }
    );
  }
);
