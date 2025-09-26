import { ACTION_LABELS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { APP_NAMES, EXPENSIFY_CREDS } from '@integrations-test-data/app-tiles.test-data';
import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { UserCredentials } from '@core/types/test.types';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

import { AppConnectorOptions } from '@/src/modules/integrations/ui/components/customAppsListComponent';
import { CustomAppsIntegrationPage } from '@/src/modules/integrations/ui/pages/customAppsIntegrationPage';

const adminUser: UserCredentials = {
  email: getEnvConfig().appManagerEmail,
  password: getEnvConfig().appManagerPassword,
};

test.describe(
  'expensify Integration Setup',
  {
    tag: [IntegrationsSuiteTags.EXPENSIFY, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await LoginHelper.loginWithPassword(page, adminUser);
    });

    test(
      'verify that App Manager is able to connect Expensify from Manage->Integrations',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ page }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-25946',
          storyId: 'INT-24423',
        });
        const customIntegrationsPage = new CustomAppsIntegrationPage(page);

        // Navigate to Manage->Integrations->Custom page
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.searchAndSelectAppWithNameToPerformAction(
          APP_NAMES.EXPENSIFY,
          AppConnectorOptions.Delete
        );
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(
          MESSAGES.getAppDeletedMessage(APP_NAMES.EXPENSIFY)
        );
        await customIntegrationsPage.addPrebuiltApp(APP_NAMES.EXPENSIFY);
        await customIntegrationsPage.clickSaveButton();
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(
          MESSAGES.getAppAddedMessage(APP_NAMES.EXPENSIFY)
        );
        await customIntegrationsPage.enterCredentials(EXPENSIFY_CREDS.USER_ID, EXPENSIFY_CREDS.USER_SECRET);
        await customIntegrationsPage.openConnectorOptions(ACTION_LABELS.ENABLE);
        await customIntegrationsPage.verifyToastMessageIsVisibleWithText(
          MESSAGES.getAppEnabledMessage(APP_NAMES.EXPENSIFY)
        );
      }
    );
  }
);
