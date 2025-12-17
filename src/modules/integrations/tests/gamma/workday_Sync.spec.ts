import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { GammaIntegrationsFeatureTags, IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { WORKDAY_SYNC } from '@/src/modules/integrations/test-data/gamma-data-file';
import { WorkdaySyncPage } from '@/src/modules/integrations/ui/pages/workdaySyncPage';

let workdaySync: WorkdaySyncPage;

test.describe(
  'workday sync integration',
  {
    tag: [IntegrationsSuiteTags.GAMMA, GammaIntegrationsFeatureTags.WORKDAY_SYNC],
  },
  () => {
    test.beforeEach(async ({ appManagerPage }) => {
      workdaySync = new WorkdaySyncPage(appManagerPage);
      await workdaySync.loadPage();
      await workdaySync.verifyThePageIsLoaded();
      await workdaySync.clickOnWorkdayCheckbox();
      await workdaySync.clickOnSaveButton();
    });
    test(
      'verify the New workday UI fields: username, password, WSDL and TenantID, verify Required field validations for workday fields, verify when enter wrong WSDL/Tenant ID at the time of integration',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY, TestGroupType.HEALTHCHECK],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-27995', 'INT-28147', 'INT-27468', 'INT-27466'],
          storyId: 'INT-27256',
        });
        await workdaySync.verifyWorkdayFieldIsVisible(WORKDAY_SYNC.USERNAME_FIELD);
        await workdaySync.verifyWorkdayFieldIsVisible(WORKDAY_SYNC.PASSWORD_FIELD);
        await workdaySync.verifyWorkdayFieldIsVisible(WORKDAY_SYNC.WSDL_FIELD);
        await workdaySync.verifyWorkdayFieldIsVisible(WORKDAY_SYNC.TENANTID_FIELD);
        await workdaySync.clickOnSaveButton();
        await workdaySync.verifyFieldRequiredError(WORKDAY_SYNC.USERNAME_FIELD, WORKDAY_SYNC.BLANK_ERROR_MESSAGE);
        await workdaySync.verifyFieldRequiredError(WORKDAY_SYNC.PASSWORD_FIELD, WORKDAY_SYNC.BLANK_ERROR_MESSAGE);
        await workdaySync.verifyFieldRequiredError(WORKDAY_SYNC.WSDL_FIELD, WORKDAY_SYNC.BLANK_ERROR_MESSAGE);
        await workdaySync.verifyFieldRequiredError(WORKDAY_SYNC.TENANTID_FIELD, WORKDAY_SYNC.BLANK_ERROR_MESSAGE);
        await workdaySync.fillAllWorkdayFields(WORKDAY_SYNC.WSDL_FIELD, WORKDAY_SYNC.WRONG_WSDL);
        await workdaySync.verifyFieldRequiredError(WORKDAY_SYNC.WSDL_FIELD, WORKDAY_SYNC.URL_VALIDATION_ERROR);
        await workdaySync.fillAllWorkdayFields(WORKDAY_SYNC.PASSWORD_FIELD, WORKDAY_SYNC.PASSWORD_FIELD);
        await workdaySync.verifyFieldRequiredError(WORKDAY_SYNC.PASSWORD_FIELD, WORKDAY_SYNC.PASSWORD_VALIDATION_ERROR);
      }
    );

    test(
      'verify syncing scheduler is failing when enter wrong integration details',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, TestGroupType.SANITY],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-27461', 'INT-27515'],
          storyId: 'INT-27256',
        });
        await workdaySync.fillAllWorkdayFields(WORKDAY_SYNC.USERNAME_FIELD, WORKDAY_SYNC.USERNAME_FIELD);
        await workdaySync.fillAllWorkdayFields(WORKDAY_SYNC.PASSWORD_FIELD, WORKDAY_SYNC.PASSWORD);
        await workdaySync.fillAllWorkdayFields(WORKDAY_SYNC.WSDL_FIELD, WORKDAY_SYNC.WSDL);
        await workdaySync.fillAllWorkdayFields(WORKDAY_SYNC.TENANTID_FIELD, WORKDAY_SYNC.PASSWORD);
        await workdaySync.clickOnSaveButton();
        await workdaySync.clickOnTab(WORKDAY_SYNC.PEOPLE_TAB);
        await workdaySync.selectWorkdayAsSyncSource(WORKDAY_SYNC.SOURCE_NAME);
        await workdaySync.clickOnSaveButton();
        await workdaySync.clickOnTab(WORKDAY_SYNC.SETUP_TAB);
        await workdaySync.clickOnTab(WORKDAY_SYNC.SCHEDULERS_TAB);
        await workdaySync.clickUserSyncingRunNow(WORKDAY_SYNC.USER_SYNCING);
        await workdaySync.verifyErrorMessage(MESSAGES.SUCCESS_SCHEDULER_MESSAGE);
        await workdaySync.refreshUntilSchedulerButtonEnabled(WORKDAY_SYNC.USER_SYNCING);
        await workdaySync.verifyLastRunStatus(WORKDAY_SYNC.USER_SYNCING, WORKDAY_SYNC.FAILURE_RUN_STATUS);
        await workdaySync.clickOnTab(WORKDAY_SYNC.PEOPLE_TAB);
        await workdaySync.selectWorkdayAsSyncSource(WORKDAY_SYNC.NONE);
        await workdaySync.clickOnSaveButton();
      }
    );
  }
);
