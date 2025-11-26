import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { tagTest } from '@/src/core/utils/testDecorator';
import { ACTION_LABELS, UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { GammaIntegrationsFeatureTags, IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { AZURE_SYNCING, SYNCING, WORKDAY_SYNC } from '@/src/modules/integrations/test-data/gamma-data-file';
import { AzureSyncingPage } from '@/src/modules/integrations/ui/pages/azureSyncPage';

let azureSyncing: AzureSyncingPage;

test.describe(
  'ad group integrati\on',
  {
    tag: [IntegrationsSuiteTags.GAMMA, GammaIntegrationsFeatureTags.AZURE_SYNC],
  },
  () => {
    test.beforeEach(async ({ appManagerPage }) => {
      azureSyncing = new AzureSyncingPage(appManagerPage);
      await azureSyncing.loadPage();
      await azureSyncing.verifyThePageIsLoaded();
    });
    test.afterEach(async ({}, testInfo) => {
      await azureSyncing.page.goto(PAGE_ENDPOINTS.USER_SYNCING_PAGE);
      await azureSyncing.selectSyncSource(SYNCING.OPTION_NONE);
      await azureSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
      if (testInfo.title.includes('verify Active Directory Sync when Email is selected as unique Identifier')) {
        return;
      }
      await azureSyncing.page.goto(PAGE_ENDPOINTS.SIMPPLR_IDP_PAGE);
      await azureSyncing.setLoginIdentifierState(SYNCING.EMAIL, true);
      await azureSyncing.setLoginIdentifierState(SYNCING.MOBILE, false);
      await azureSyncing.setLoginIdentifierState(SYNCING.ALTERNATE, false);
      await azureSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
      await azureSyncing.verifyErrorMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
    });

    test(
      'verify Active Directory Sync when Email is selected as unique Identifier',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY, TestGroupType.HEALTHCHECK],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-5085',
          storyId: 'INT-3002',
        });
        await azureSyncing.page.goto(PAGE_ENDPOINTS.SIMPPLR_IDP_PAGE);
        await azureSyncing.setLoginIdentifierState(SYNCING.EMAIL, true);
        await azureSyncing.setLoginIdentifierState(SYNCING.MOBILE, false);
        await azureSyncing.setLoginIdentifierState(SYNCING.ALTERNATE, false);
        await azureSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
        await azureSyncing.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
        await azureSyncing.searchForUser(AZURE_SYNCING.USER_EMAIL);
        await azureSyncing.verifyFirstnameAndClickMoreButton(AZURE_SYNCING.USER_FIRSTNAME);
        await azureSyncing.clickDropdownMenuItem(SYNCING.EDIT_USER);
        await azureSyncing.enterRandomTextInMultipleUserInformationFields([
          SYNCING.ZIP_CODE,
          SYNCING.JOB_TITLE,
          SYNCING.ADDRESS_1,
          SYNCING.DIVISION,
          SYNCING.CITY,
          SYNCING.STATE,
          SYNCING.COUNTRY_NAME,
          SYNCING.DIVISION,
          SYNCING.DEPARTMENT,
        ]);
        await azureSyncing.clickOnSaveButton(ACTION_LABELS.UPDATE);
        await azureSyncing.page.goto(PAGE_ENDPOINTS.USER_SYNCING_PAGE);
        await azureSyncing.selectSyncSource(AZURE_SYNCING.MICROSOFT_ENTRA_ID_OPTION);
        await azureSyncing.uncheckCheckboxIfChecked(AZURE_SYNCING.SELECT_ALL_FIELDS_CHECKBOX_ID);
        await azureSyncing.checkSyncCheckboxesForMultipleFields([
          AZURE_SYNCING.FIELD_LABELS.FIRST_NAME,
          AZURE_SYNCING.FIELD_LABELS.LAST_NAME,
          AZURE_SYNCING.FIELD_LABELS.JOB_TITLE,
          AZURE_SYNCING.FIELD_LABELS.DEPARTMENT,
          AZURE_SYNCING.FIELD_LABELS.COMPANY_NAME,
          AZURE_SYNCING.FIELD_LABELS.ADDRESS_1,
          AZURE_SYNCING.FIELD_LABELS.CITY,
          AZURE_SYNCING.FIELD_LABELS.STATE_PROVINCE,
          AZURE_SYNCING.FIELD_LABELS.ZIP_CODE,
          AZURE_SYNCING.FIELD_LABELS.COUNTRY,
        ]);
        await azureSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
        await azureSyncing.verifyErrorMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
        await azureSyncing.clickOnTab(WORKDAY_SYNC.SETUP_TAB);
        await azureSyncing.clickOnTab(WORKDAY_SYNC.SCHEDULERS_TAB);
        await azureSyncing.clickUserSyncingRunNow(WORKDAY_SYNC.USER_SYNCING);
        await azureSyncing.verifyErrorMessage(MESSAGES.SUCCESS_SCHEDULER_MESSAGE);
        await azureSyncing.waitForUserSyncingSuccess(WORKDAY_SYNC.USER_SYNCING);
        await azureSyncing.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
        await azureSyncing.searchForUser(AZURE_SYNCING.USER_EMAIL);
        await azureSyncing.verifyFirstnameAndClickMoreButton(AZURE_SYNCING.USER_FIRSTNAME);
        await azureSyncing.clickDropdownMenuItem(SYNCING.EDIT_USER);
        await azureSyncing.verifyAllExpectedSyncedValues(AZURE_SYNCING.EXPECTED_SYNCED_VALUES);
      }
    );

    test(
      'verify Active Directory Sync when Mobile Phone is selected as unique Identifier',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY, TestGroupType.HEALTHCHECK],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-5086',
          storyId: 'INT-3002',
        });
        await azureSyncing.page.goto(PAGE_ENDPOINTS.SIMPPLR_IDP_PAGE);
        await azureSyncing.setLoginIdentifierState(SYNCING.EMAIL, false);
        await azureSyncing.setLoginIdentifierState(SYNCING.MOBILE, true);
        await azureSyncing.setLoginIdentifierState(SYNCING.ALTERNATE, false);
        await azureSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
        await azureSyncing.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
        await azureSyncing.searchForUser(AZURE_SYNCING.USER_MOBILE);
        await azureSyncing.verifyFirstnameAndClickMoreButton(AZURE_SYNCING.USER_FIRSTNAME_MOBILE);
        await azureSyncing.clickDropdownMenuItem(SYNCING.EDIT_USER);
        await azureSyncing.enterRandomTextInMultipleUserInformationFields([
          SYNCING.ZIP_CODE,
          SYNCING.JOB_TITLE,
          SYNCING.ADDRESS_1,
          SYNCING.DIVISION,
          SYNCING.CITY,
          SYNCING.STATE,
          SYNCING.COUNTRY_NAME,
          SYNCING.DIVISION,
          SYNCING.DEPARTMENT,
        ]);
        await azureSyncing.clickOnSaveButton(ACTION_LABELS.UPDATE);
        await azureSyncing.page.goto(PAGE_ENDPOINTS.USER_SYNCING_PAGE);
        await azureSyncing.selectSyncSource(AZURE_SYNCING.MICROSOFT_ENTRA_ID_OPTION);
        await azureSyncing.uncheckCheckboxIfChecked(AZURE_SYNCING.SELECT_ALL_FIELDS_CHECKBOX_ID);
        await azureSyncing.checkSyncCheckboxesForMultipleFields([
          AZURE_SYNCING.FIELD_LABELS.FIRST_NAME,
          AZURE_SYNCING.FIELD_LABELS.LAST_NAME,
          AZURE_SYNCING.FIELD_LABELS.JOB_TITLE,
          AZURE_SYNCING.FIELD_LABELS.DEPARTMENT,
          AZURE_SYNCING.FIELD_LABELS.COMPANY_NAME,
          AZURE_SYNCING.FIELD_LABELS.ADDRESS_1,
          AZURE_SYNCING.FIELD_LABELS.CITY,
          AZURE_SYNCING.FIELD_LABELS.STATE_PROVINCE,
          AZURE_SYNCING.FIELD_LABELS.ZIP_CODE,
          AZURE_SYNCING.FIELD_LABELS.COUNTRY,
          AZURE_SYNCING.FIELD_LABELS.MOBILE_PHONE,
        ]);
        await azureSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
        await azureSyncing.verifyErrorMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
        await azureSyncing.clickOnTab(WORKDAY_SYNC.SETUP_TAB);
        await azureSyncing.clickOnTab(WORKDAY_SYNC.SCHEDULERS_TAB);
        await azureSyncing.clickUserSyncingRunNow(WORKDAY_SYNC.USER_SYNCING);
        await azureSyncing.verifyErrorMessage(MESSAGES.SUCCESS_SCHEDULER_MESSAGE);
        await azureSyncing.waitForUserSyncingSuccess(WORKDAY_SYNC.USER_SYNCING);
        await azureSyncing.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
        await azureSyncing.searchForUser(AZURE_SYNCING.USER_MOBILE);
        await azureSyncing.verifyFirstnameAndClickMoreButton(AZURE_SYNCING.USER_FIRSTNAME_MOBILE);
        await azureSyncing.clickDropdownMenuItem(SYNCING.EDIT_USER);
        await azureSyncing.verifyAllExpectedSyncedValues(AZURE_SYNCING.EXPECTED_SYNCED_VALUES);
      }
    );

    test(
      'verify Active Directory Sync when Phone is selected as unique Identifier',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY, TestGroupType.HEALTHCHECK],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-5088',
          storyId: 'INT-3002',
        });
        await azureSyncing.page.goto(PAGE_ENDPOINTS.SIMPPLR_IDP_PAGE);
        await azureSyncing.setLoginIdentifierState(SYNCING.EMAIL, false);
        await azureSyncing.setLoginIdentifierState(SYNCING.MOBILE, false);
        await azureSyncing.setLoginIdentifierState(SYNCING.ALTERNATE, true);
        await azureSyncing.selectPhoneAsAlternateIdentifier();
        await azureSyncing.selectQuestionValue(SYNCING.VALIDATION_QUESTION_VALUE);
        await azureSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
        await azureSyncing.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
        await azureSyncing.searchForUser(AZURE_SYNCING.USER_PHONE);
        await azureSyncing.verifyFirstnameAndClickMoreButton(AZURE_SYNCING.USER_PHONE_FIRSTNAME);
        await azureSyncing.clickDropdownMenuItem(SYNCING.EDIT_USER);
        await azureSyncing.enterRandomTextInMultipleUserInformationFields([
          SYNCING.ZIP_CODE,
          SYNCING.JOB_TITLE,
          SYNCING.ADDRESS_1,
          SYNCING.DIVISION,
          SYNCING.CITY,
          SYNCING.STATE,
          SYNCING.COUNTRY_NAME,
          SYNCING.DIVISION,
          SYNCING.DEPARTMENT,
        ]);
        await azureSyncing.clickOnSaveButton(ACTION_LABELS.UPDATE);
        await azureSyncing.page.goto(PAGE_ENDPOINTS.USER_SYNCING_PAGE);
        await azureSyncing.selectSyncSource(AZURE_SYNCING.MICROSOFT_ENTRA_ID_OPTION);
        await azureSyncing.uncheckCheckboxIfChecked(AZURE_SYNCING.SELECT_ALL_FIELDS_CHECKBOX_ID);
        await azureSyncing.checkSyncCheckboxesForMultipleFields([
          AZURE_SYNCING.FIELD_LABELS.FIRST_NAME,
          AZURE_SYNCING.FIELD_LABELS.LAST_NAME,
          AZURE_SYNCING.FIELD_LABELS.JOB_TITLE,
          AZURE_SYNCING.FIELD_LABELS.DEPARTMENT,
          AZURE_SYNCING.FIELD_LABELS.COMPANY_NAME,
          AZURE_SYNCING.FIELD_LABELS.ADDRESS_1,
          AZURE_SYNCING.FIELD_LABELS.CITY,
          AZURE_SYNCING.FIELD_LABELS.STATE_PROVINCE,
          AZURE_SYNCING.FIELD_LABELS.ZIP_CODE,
          AZURE_SYNCING.FIELD_LABELS.COUNTRY,
          AZURE_SYNCING.FIELD_LABELS.PHONE,
        ]);
        await azureSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
        await azureSyncing.verifyErrorMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
        await azureSyncing.clickOnTab(WORKDAY_SYNC.SETUP_TAB);
        await azureSyncing.clickOnTab(WORKDAY_SYNC.SCHEDULERS_TAB);
        await azureSyncing.clickUserSyncingRunNow(WORKDAY_SYNC.USER_SYNCING);
        await azureSyncing.verifyErrorMessage(MESSAGES.SUCCESS_SCHEDULER_MESSAGE);
        await azureSyncing.waitForUserSyncingSuccess(WORKDAY_SYNC.USER_SYNCING);
        await azureSyncing.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
        await azureSyncing.searchForUser(AZURE_SYNCING.USER_PHONE);
        await azureSyncing.verifyFirstnameAndClickMoreButton(AZURE_SYNCING.USER_PHONE_FIRSTNAME);
        await azureSyncing.clickDropdownMenuItem(SYNCING.EDIT_USER);
        await azureSyncing.verifyAllExpectedSyncedValues(AZURE_SYNCING.EXPECTED_SYNCED_VALUES);
      }
    );
  }
);
