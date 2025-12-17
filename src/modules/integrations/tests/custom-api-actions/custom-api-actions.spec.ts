import { IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { CustomApiActionsPage } from '@/src/modules/integrations/ui/pages/customApiActionsPage';

let createdAppName: string | null = null;

test.describe(
  'custom api actions management',
  {
    tag: [IntegrationsSuiteTags.CUSTOM_API_ACTIONS, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      createdAppName = null;
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
          zephyrTestId: 'INT-16368',
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
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.HEALTH_CHECK],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27996',
          storyId: 'INT-15403',
        });
        const customApiActionsPage = new CustomApiActionsPage(appManagerFixture.page);
        await customApiActionsPage.clickAndVerifyAppsFilter();
        await customApiActionsPage.selectDeselectBehaviour('Zendesk');
        await customApiActionsPage.verifyAppsFilterSearchSelectClear('Zendesk');
      }
    );
  }
);
