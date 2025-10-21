import { SYNCING } from '@integrations-constants/common';
import { UI_ACTIONS } from '@integrations-constants/common';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { MESSAGES } from '../../constants/messageRepo';
import { UkgSyncPage } from '../../pages/ukgSyncPage';

test.describe(
  'Feature: UKG Pro Syncing',
  {
    tag: [IntegrationsSuiteTags.UKG_SYNCING, IntegrationsSuiteTags.GAMMA],
  },
  () => {
    let ukgSyncPage: UkgSyncPage;

    test.beforeEach(async ({ appManagerPage }) => {
      ukgSyncPage = new UkgSyncPage(appManagerPage);
      await ukgSyncPage.loadPage();
      await ukgSyncPage.verifyThePageIsLoaded();
    });

    test(
      'UKGPro option should not be in syncing dropdown, if not enabled at People Data and validations at App level on connection',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerPage }) => {
        void appManagerPage;
        tagTest(test.info(), {
          zephyrTestId: 'INT-7614',
        });
        await ukgSyncPage.verifyScheduledSourcesCheckBox(SYNCING.UKG_PRO);
        await ukgSyncPage.clearInputField(
          SYNCING.UKG_PRO,
          SYNCING.USERNAME,
          SYNCING.PASSWORD,
          SYNCING.BASE_URL,
          SYNCING.KEY
        );
        await ukgSyncPage.clickOnButton(UI_ACTIONS.SAVE);
        await ukgSyncPage.verifyErrorMessage(MESSAGES.MISSING_FIELD);
        await ukgSyncPage.addInputField(SYNCING.UKG_PRO, SYNCING.BASE_URL, SYNCING.TEST);
        await ukgSyncPage.clickOnButton(UI_ACTIONS.SAVE);
        await ukgSyncPage.verifyErrorMessage(MESSAGES.VALID_URL);
        await ukgSyncPage.navigateToUserSyncingProvisioningPage();
        await ukgSyncPage.selectDropdown();
        await ukgSyncPage.verifyVisibility(SYNCING.UKG_PRO);
      }
    );

    test(
      'UKGPro option should be in syncing dropdown, if enabled successfully at People Data',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerPage }) => {
        void appManagerPage;
        tagTest(test.info(), {
          zephyrTestId: 'INT-4060',
        });
        await ukgSyncPage.verifyScheduledSourcesCheckBox(SYNCING.UKG_PRO);
        await ukgSyncPage.addUkgConnectionDetails(
          SYNCING.UKG_PRO,
          SYNCING.USERNAME,
          SYNCING.PASSWORD,
          SYNCING.BASE_URL,
          SYNCING.KEY
        );
        await ukgSyncPage.clickOnButton(UI_ACTIONS.SAVE);
        await ukgSyncPage.verifyToastMessageIsVisibleWithText(MESSAGES.INTEGRATION_UPDATE_SUCCESS);
        await ukgSyncPage.navigateToUserSyncingProvisioningPage();
        await ukgSyncPage.selectDropdown();
        await ukgSyncPage.verifyVisibility(SYNCING.UKG_PRO);
      }
    );

    test(
      'Verify dropdown is getting displayed for Pay currency field with UKG as syncing source.',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerPage }) => {
        void appManagerPage;
        tagTest(test.info(), {
          zephyrTestId: 'INT-15305',
        });
        await ukgSyncPage.navigateToUserSyncingProvisioningPage();
        await ukgSyncPage.selectDropdown();
        await ukgSyncPage.selectSyncOptions(SYNCING.UKG_PRO);
        await ukgSyncPage.verifyDetailsCheckBoxVisibility(SYNCING.PAY_CURRENCY);
        await ukgSyncPage.verifyDetailsCheckBoxVisibility(SYNCING.FIRST_NAME);
        await ukgSyncPage.selectDetailsSyncCheckBox(SYNCING.FIRST_NAME, SYNCING.NAME, SYNCING.PREFERRED_NAME);
        await ukgSyncPage.verifyDetailsCheckBoxVisibility(SYNCING.HIRE_DATE);
      }
    );
  }
);
