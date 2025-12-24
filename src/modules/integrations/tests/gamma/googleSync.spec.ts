import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { tagTest } from '@/src/core/utils/testDecorator';
import { ACTION_LABELS, UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { GammaIntegrationsFeatureTags, IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { GOOGLE_SYNCING, SYNCING, WORKDAY_SYNC } from '@/src/modules/integrations/test-data/gamma-data-file';
import { SyncingPage } from '@/src/modules/integrations/ui/pages/syncingPage';

test.describe(
  'google syncing',
  {
    tag: [IntegrationsSuiteTags.GAMMA, GammaIntegrationsFeatureTags.GOOGLE_SYNC],
  },
  () => {
    let googleSyncing: SyncingPage;

    test.beforeEach(async ({ appManagerPage }) => {
      googleSyncing = new SyncingPage(appManagerPage);
      await googleSyncing.loadPage();
      await googleSyncing.verifyThePageIsLoaded();
    });
    test.afterEach(async ({}, testInfo) => {
      await googleSyncing.page.goto(PAGE_ENDPOINTS.USER_SYNCING_PAGE);
      await googleSyncing.selectSyncSource(SYNCING.OPTION_NONE);
      await googleSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
      if (testInfo.title.includes('verify Google Sync when Email is selected as unique Identifier')) {
        return;
      }
      await googleSyncing.page.goto(PAGE_ENDPOINTS.SIMPPLR_IDP_PAGE);
      await googleSyncing.setLoginIdentifierState(SYNCING.EMAIL, true);
      await googleSyncing.setLoginIdentifierState(SYNCING.MOBILE, false);
      await googleSyncing.setLoginIdentifierState(SYNCING.ALTERNATE, false);
      await googleSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
      await googleSyncing.verifyErrorMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
    });

    test(
      'verify Google Sync when Email is selected as unique Identifier',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY, TestGroupType.HEALTHCHECK],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-4461'],
          storyId: 'INT-4441',
        });
        await googleSyncing.page.goto(PAGE_ENDPOINTS.SIMPPLR_IDP_PAGE);
        await googleSyncing.setLoginIdentifierState(SYNCING.EMAIL, true);
        await googleSyncing.setLoginIdentifierState(SYNCING.MOBILE, false);
        await googleSyncing.setLoginIdentifierState(SYNCING.ALTERNATE, false);
        await googleSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
        await googleSyncing.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
        await googleSyncing.searchForUser(GOOGLE_SYNCING.USER_EMAIL);
        await googleSyncing.verifyFirstnameAndClickMoreButton(GOOGLE_SYNCING.USER_FIRSTNAME);
        await googleSyncing.clickDropdownMenuItem(SYNCING.EDIT_USER);
        await googleSyncing.enterRandomTextInMultipleUserInformationFields([
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
        await googleSyncing.clickOnSaveButton(ACTION_LABELS.UPDATE);
        await googleSyncing.page.goto(PAGE_ENDPOINTS.USER_SYNCING_PAGE);
        await googleSyncing.selectSyncSource(SYNCING.GOOGLE_WORKSPACE_SYNCING);
        await googleSyncing.uncheckCheckboxIfChecked(SYNCING.SELECT_ALL_FIELDS_CHECKBOX_ID_GOOGLE);
        await googleSyncing.checkSyncCheckboxesForMultipleFields(SYNCING.COMMON_SYNC_FIELDS);
        await googleSyncing.fillSchemaMappingForCheckedFields(GOOGLE_SYNCING.MAPPING_FILDS);
        await googleSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
        await googleSyncing.verifyErrorMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
        await googleSyncing.clickOnTab(WORKDAY_SYNC.SETUP_TAB);
        await googleSyncing.clickOnTab(WORKDAY_SYNC.SCHEDULERS_TAB);
        await googleSyncing.clickUserSyncingRunNow(WORKDAY_SYNC.USER_SYNCING);
        await googleSyncing.verifyErrorMessage(MESSAGES.SUCCESS_SCHEDULER_MESSAGE);
        await googleSyncing.waitForUserSyncingSuccess(WORKDAY_SYNC.USER_SYNCING);
        await googleSyncing.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
        await googleSyncing.searchForUser(GOOGLE_SYNCING.USER_EMAIL);
        await googleSyncing.verifyFirstnameAndClickMoreButton(GOOGLE_SYNCING.USER_FIRSTNAME);
        await googleSyncing.clickDropdownMenuItem(SYNCING.EDIT_USER);
        await googleSyncing.verifyAllExpectedSyncedValues(SYNCING.EXPECTED_SYNCED_VALUES);
      }
    );

    test(
      'verify Google Sync when Mobile Phone is selected as unique Identifier',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY, TestGroupType.HEALTHCHECK],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-5076'],
          storyId: 'INT-4441',
        });
        await googleSyncing.page.goto(PAGE_ENDPOINTS.SIMPPLR_IDP_PAGE);
        await googleSyncing.setLoginIdentifierState(SYNCING.EMAIL, false);
        await googleSyncing.setLoginIdentifierState(SYNCING.MOBILE, true);
        await googleSyncing.setLoginIdentifierState(SYNCING.ALTERNATE, false);
        await googleSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
        await googleSyncing.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
        await googleSyncing.searchForUser(GOOGLE_SYNCING.USER_EMAIL);
        await googleSyncing.verifyFirstnameAndClickMoreButton(GOOGLE_SYNCING.USER_FIRSTNAME);
        await googleSyncing.clickDropdownMenuItem(SYNCING.EDIT_USER);
        await googleSyncing.enterRandomTextInMultipleUserInformationFields([
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
        await googleSyncing.clickOnSaveButton(ACTION_LABELS.UPDATE);
        await googleSyncing.page.goto(PAGE_ENDPOINTS.USER_SYNCING_PAGE);
        await googleSyncing.selectSyncSource(SYNCING.GOOGLE_WORKSPACE_SYNCING);
        await googleSyncing.uncheckCheckboxIfChecked(SYNCING.SELECT_ALL_FIELDS_CHECKBOX_ID_GOOGLE);
        await googleSyncing.checkSyncCheckboxesForMultipleFields([...SYNCING.COMMON_SYNC_FIELDS, SYNCING.MOBILE_PHONE]);
        await googleSyncing.fillSchemaMappingForCheckedFields(GOOGLE_SYNCING.MAPPING_FILDS);
        await googleSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
        await googleSyncing.verifyErrorMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
        await googleSyncing.clickOnTab(WORKDAY_SYNC.SETUP_TAB);
        await googleSyncing.clickOnTab(WORKDAY_SYNC.SCHEDULERS_TAB);
        await googleSyncing.clickUserSyncingRunNow(WORKDAY_SYNC.USER_SYNCING);
        await googleSyncing.verifyErrorMessage(MESSAGES.SUCCESS_SCHEDULER_MESSAGE);
        await googleSyncing.waitForUserSyncingSuccess(WORKDAY_SYNC.USER_SYNCING);
        await googleSyncing.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
        await googleSyncing.searchForUser(GOOGLE_SYNCING.USER_MOBILE);
        await googleSyncing.verifyFirstnameAndClickMoreButton(GOOGLE_SYNCING.USER_FIRSTNAME);
        await googleSyncing.clickDropdownMenuItem(SYNCING.EDIT_USER);
        await googleSyncing.verifyAllExpectedSyncedValues(SYNCING.EXPECTED_SYNCED_VALUES);
      }
    );

    test(
      'verify Google Sync when Employee Number is selected as unique Identifier',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY, TestGroupType.HEALTHCHECK],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-5077'],
          storyId: 'INT-4441',
        });
        await googleSyncing.page.goto(PAGE_ENDPOINTS.SIMPPLR_IDP_PAGE);
        await googleSyncing.setLoginIdentifierState(SYNCING.EMAIL, false);
        await googleSyncing.setLoginIdentifierState(SYNCING.MOBILE, false);
        await googleSyncing.setLoginIdentifierState(SYNCING.ALTERNATE, true);
        await googleSyncing.selectQuestionValue(SYNCING.VALIDATION_QUESTION_VALUE);
        await googleSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
        await googleSyncing.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
        await googleSyncing.searchForUser(GOOGLE_SYNCING.USER_EMAIL);
        await googleSyncing.verifyFirstnameAndClickMoreButton(GOOGLE_SYNCING.USER_FIRSTNAME);
        await googleSyncing.clickDropdownMenuItem(SYNCING.EDIT_USER);
        await googleSyncing.enterRandomTextInMultipleUserInformationFields([
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
        await googleSyncing.clickOnSaveButton(ACTION_LABELS.UPDATE);
        await googleSyncing.page.goto(PAGE_ENDPOINTS.USER_SYNCING_PAGE);
        await googleSyncing.selectSyncSource(SYNCING.GOOGLE_WORKSPACE_SYNCING);
        await googleSyncing.uncheckCheckboxIfChecked(SYNCING.SELECT_ALL_FIELDS_CHECKBOX_ID_GOOGLE);
        await googleSyncing.checkSyncCheckboxesForMultipleFields([
          ...SYNCING.COMMON_SYNC_FIELDS,
          SYNCING.EMPLOYEE_NUMBER,
        ]);
        await googleSyncing.fillSchemaMappingForCheckedFields(GOOGLE_SYNCING.MAPPING_FILDS);
        await googleSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
        await googleSyncing.verifyErrorMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
        await googleSyncing.clickOnTab(WORKDAY_SYNC.SETUP_TAB);
        await googleSyncing.clickOnTab(WORKDAY_SYNC.SCHEDULERS_TAB);
        await googleSyncing.clickUserSyncingRunNow(WORKDAY_SYNC.USER_SYNCING);
        await googleSyncing.verifyErrorMessage(MESSAGES.SUCCESS_SCHEDULER_MESSAGE);
        await googleSyncing.waitForUserSyncingSuccess(WORKDAY_SYNC.USER_SYNCING);
        await googleSyncing.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
        await googleSyncing.searchForUser(GOOGLE_SYNCING.USER_EMPLOYEE_NUMBER);
        await googleSyncing.verifyFirstnameAndClickMoreButton(GOOGLE_SYNCING.USER_FIRSTNAME);
        await googleSyncing.clickDropdownMenuItem(SYNCING.EDIT_USER);
        await googleSyncing.verifyAllExpectedSyncedValues(SYNCING.EXPECTED_SYNCED_VALUES);
      }
    );

    test(
      'verify Google Sync when Phone is selected as unique Identifier',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY, TestGroupType.HEALTHCHECK],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-5078'],
          storyId: 'INT-4441',
        });
        await googleSyncing.page.goto(PAGE_ENDPOINTS.SIMPPLR_IDP_PAGE);
        await googleSyncing.setLoginIdentifierState(SYNCING.EMAIL, false);
        await googleSyncing.setLoginIdentifierState(SYNCING.MOBILE, false);
        await googleSyncing.setLoginIdentifierState(SYNCING.ALTERNATE, true);
        await googleSyncing.selectPhoneAsAlternateIdentifier();
        await googleSyncing.selectQuestionValue(SYNCING.VALIDATION_QUESTION_VALUE);
        await googleSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
        await googleSyncing.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
        await googleSyncing.searchForUser(GOOGLE_SYNCING.USER_EMAIL);
        await googleSyncing.verifyFirstnameAndClickMoreButton(GOOGLE_SYNCING.USER_FIRSTNAME);
        await googleSyncing.clickDropdownMenuItem(SYNCING.EDIT_USER);
        await googleSyncing.enterRandomTextInMultipleUserInformationFields([
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
        await googleSyncing.clickOnSaveButton(ACTION_LABELS.UPDATE);
        await googleSyncing.page.goto(PAGE_ENDPOINTS.USER_SYNCING_PAGE);
        await googleSyncing.selectSyncSource(SYNCING.GOOGLE_WORKSPACE_SYNCING);
        await googleSyncing.uncheckCheckboxIfChecked(SYNCING.SELECT_ALL_FIELDS_CHECKBOX_ID_GOOGLE);
        await googleSyncing.checkSyncCheckboxesForMultipleFields([...SYNCING.COMMON_SYNC_FIELDS, SYNCING.PHONE]);
        await googleSyncing.fillSchemaMappingForCheckedFields(GOOGLE_SYNCING.MAPPING_FILDS);
        await googleSyncing.clickOnSaveButton(UI_ACTIONS.SAVE);
        await googleSyncing.verifyErrorMessage(MESSAGES.SAVE_CHANGES_SUCCESS_MESSAGE);
        await googleSyncing.clickOnTab(WORKDAY_SYNC.SETUP_TAB);
        await googleSyncing.clickOnTab(WORKDAY_SYNC.SCHEDULERS_TAB);
        await googleSyncing.clickUserSyncingRunNow(WORKDAY_SYNC.USER_SYNCING);
        await googleSyncing.verifyErrorMessage(MESSAGES.SUCCESS_SCHEDULER_MESSAGE);
        await googleSyncing.waitForUserSyncingSuccess(WORKDAY_SYNC.USER_SYNCING);
        await googleSyncing.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
        await googleSyncing.searchForUser(GOOGLE_SYNCING.USER_PHONE);
        await googleSyncing.verifyFirstnameAndClickMoreButton(GOOGLE_SYNCING.USER_FIRSTNAME);
        await googleSyncing.clickDropdownMenuItem(SYNCING.EDIT_USER);
        await googleSyncing.verifyAllExpectedSyncedValues(SYNCING.EXPECTED_SYNCED_VALUES);
      }
    );
  }
);
