import {
  RecognitionFeatureTags,
  RecognitionSuitTags,
  RecurringAwardsFeatureTags,
} from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { getRecognitionTenantConfigFromCache } from '@/src/modules/recognition/config/recognitionConfig';
import { NominationInstanceStatus, RecurringAwardTableStatus } from '@/src/modules/recognition/constants/genericEnums';
import MESSAGES from '@/src/modules/recognition/constants/messages';
import { SubTabIndicator } from '@/src/modules/recognition/ui/components/common/sub-tab-indicator';
import { ManageRecognitionPage } from '@/src/modules/recognition/ui/pages/manage/manageRecognitionPage';
import { RecurringAwardPage } from '@/src/modules/recognition/ui/pages/manage/recurringAwardPage';
import { TestDbScenarios } from '@/src/modules/recognition/utils/testDatabaseHelper';

test.describe('custom recurring award creation & status update via DB', () => {
  test(
    'Verify Monthly award with Custom participation window and Custom nomination close date',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        RecurringAwardsFeatureTags.RECURRING_AWARD_STATUS_DB,
        TestPriority.P1,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture, recurringAwardsApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6094',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const subTabIndicator = new SubTabIndicator(appManagerPage);
      const appManagerName = getRecognitionTenantConfigFromCache().appManagerName;
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);

      // Click on the 'New recurring award' and create a new recurring award
      await recurringAwardPage.clickRecurringAwardNewButton();
      const awardName = await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.fillRecurringAwardFormPageTwo(
        appManagerName,
        'Nominations',
        'Monthly',
        'America/Los_Angeles',
        1
      );
      await recurringAwardPage.confirmAndCreateRecurringAward();
      await recurringAwardPage.submitRecurringAward();
      const creationResponsePromise = recurringAwardsApi.waitForRecurringAwardCreationResponse(appManagerPage);
      await manageRecognitionPage.assertToastMessageIsVisible(MESSAGES.NEW_AWARD_CREATED);

      // Get the nomination ID and award ID from the creation response
      const creationResult = await creationResponsePromise;
      const { nominationId, awardId } = recurringAwardsApi.validateCreationResult(creationResult);
      const tenantCode = await recurringAwardsApi.getTenantCode(appManagerPage);
      console.log('Recurring award created', { awardName, awardId, nominationId, tenantCode });

      // Update the nomination instance in the database
      const opensAt = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const closesAt = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().slice(0, 10); // YYYY-MM-DD
      const status = NominationInstanceStatus.PREOPEN;
      const overduesAt = new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().slice(0, 10); // YYYY-MM-DD
      await TestDbScenarios.getNominationInstancesDataFromDBByNominationId(tenantCode, nominationId);
      await TestDbScenarios.updateNominationInstanceByNominationId(tenantCode, nominationId, {
        opensAt,
        closesAt,
        status,
        overduesAt,
      });
      // Trigger the recurring award sync status API
      await recurringAwardsApi.hitRecurringSyncAwardApi(appManagerPage, tenantCode);
      await TestDbScenarios.checkAwardStatusInDBByNominationId(
        tenantCode,
        nominationId,
        NominationInstanceStatus.OPEN,
        1
      );

      // Navigate to the recurring award listing page and verify the award status
      await subTabIndicator.clickOnColumnButton('Created', 2);
      await subTabIndicator.checkTheAwardNameInTable(awardName);
      await subTabIndicator.checkRecentlyCreatedAwardStatus(RecurringAwardTableStatus.ACTIVE);
      await manageRecognitionPage.cleanupCreatedAwardInRecurringAwards();
    }
  );

  test(
    'Verify default configuration with Monthly frequency, Whole Month participation window, and nomination close  Last Day of month',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        RecurringAwardsFeatureTags.RECURRING_AWARD_STATUS_DB,
        TestPriority.P1,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture, recurringAwardsApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6093',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const appManagerName = getRecognitionTenantConfigFromCache().appManagerName;

      // Create recurring award with default Monthly configuration (Whole Month / Last Day close)
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      const awardName = await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.fillRecurringAwardFormPageTwo(
        appManagerName,
        'Nominations',
        'Monthly',
        'America/Los_Angeles',
        1
      );
      await recurringAwardPage.confirmAndCreateRecurringAward();
      await recurringAwardPage.submitRecurringAward();

      const creationResponsePromise = recurringAwardsApi.waitForRecurringAwardCreationResponse(appManagerPage);
      const creationResult = await creationResponsePromise;
      const { nominationId, awardId } = recurringAwardsApi.validateCreationResult(creationResult);
      const tenantCode = await recurringAwardsApi.getTenantCode(appManagerPage);
      console.log('Recurring award created', { awardName, awardId, nominationId, tenantCode });

      // Set DB dates to simulate whole-month nomination window
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      const overduesAt = lastOfMonth;

      // validate the award status changes to Open from Pre-open
      await TestDbScenarios.getNominationInstancesDataFromDBByNominationId(tenantCode, nominationId);
      await TestDbScenarios.updateNominationInstanceByNominationId(tenantCode, nominationId, {
        opensAt: firstOfMonth,
        closesAt: lastOfMonth,
        status: NominationInstanceStatus.PREOPEN,
        overduesAt,
      });
      await recurringAwardsApi.hitRecurringSyncAwardApi(appManagerPage, tenantCode);
      await TestDbScenarios.checkAwardStatusInDBByNominationId(
        tenantCode,
        nominationId,
        NominationInstanceStatus.OPEN,
        1
      );

      // validate the award status changes to Closed from Open (simulate month end)
      await TestDbScenarios.updateNominationInstanceByNominationId(tenantCode, nominationId, {
        opensAt: firstOfMonth,
        closesAt: firstOfMonth,
        status: NominationInstanceStatus.OPEN,
        overduesAt,
      });
      await recurringAwardsApi.hitRecurringSyncAwardApi(appManagerPage, tenantCode);
      await TestDbScenarios.checkAwardStatusInDBByNominationId(
        tenantCode,
        nominationId,
        NominationInstanceStatus.CLOSED,
        1
      );
      await recurringAwardsApi.deleteAwardViaApi(appManagerPage, 'Recurring Award', awardId);
    }
  );

  test(
    'Verify Quarterly award with Custom participation window and Last Day of quarter nomination close',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        RecurringAwardsFeatureTags.RECURRING_AWARD_STATUS_DB,
        TestPriority.P2,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture, recurringAwardsApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6096',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const appManagerName = getRecognitionTenantConfigFromCache().appManagerName;

      // Create recurring award with Quarterly configuration
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      const awardName = await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.fillRecurringAwardFormPageTwo(
        appManagerName,
        'Nominations',
        'Quarterly',
        'America/Los_Angeles',
        3
      );
      await recurringAwardPage.confirmAndCreateRecurringAward();
      await recurringAwardPage.submitRecurringAward();

      const creationResponsePromise = recurringAwardsApi.waitForRecurringAwardCreationResponse(appManagerPage);
      const creationResult = await creationResponsePromise;
      const { nominationId, awardId } = recurringAwardsApi.validateCreationResult(creationResult);
      const tenantCode = await recurringAwardsApi.getTenantCode(appManagerPage);
      console.log('Recurring award created (Quarterly)', { awardName, awardId, nominationId, tenantCode });

      // OPEN -> CLOSED on quarter end
      const pastOpenDate = new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().slice(0, 10);
      const presentClosedDate = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10); // YYYY-MM-DD
      const overduesAt = new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().slice(0, 10); // YYYY-MM-DD
      await TestDbScenarios.updateNominationInstanceByNominationId(tenantCode, nominationId, {
        opensAt: pastOpenDate,
        closesAt: presentClosedDate,
        status: NominationInstanceStatus.OPEN,
        overduesAt: overduesAt,
      });
      await recurringAwardsApi.hitRecurringSyncAwardApi(appManagerPage, tenantCode);
      await TestDbScenarios.checkAwardStatusInDBByNominationId(
        tenantCode,
        nominationId,
        NominationInstanceStatus.CLOSED,
        1
      );
      await recurringAwardsApi.deleteAwardViaApi(appManagerPage, 'Recurring Award', awardId);
    }
  );

  test(
    'Verify Quarterly award with Whole Quarter participation window and Custom nomination close date',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        RecurringAwardsFeatureTags.RECURRING_AWARD_STATUS_DB,
        TestPriority.P1,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture, recurringAwardsApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6095',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const appManagerName = getRecognitionTenantConfigFromCache().appManagerName;

      // Create recurring award with Quarterly configuration
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      const awardName = await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.fillRecurringAwardFormPageTwo(
        appManagerName,
        'Nominations',
        'Quarterly',
        'America/Los_Angeles',
        2
      );
      await recurringAwardPage.confirmAndCreateRecurringAward();
      await recurringAwardPage.submitRecurringAward();

      const creationResponsePromise = recurringAwardsApi.waitForRecurringAwardCreationResponse(appManagerPage);
      const creationResult = await creationResponsePromise;
      const { nominationId, awardId } = recurringAwardsApi.validateCreationResult(creationResult);
      const tenantCode = await recurringAwardsApi.getTenantCode(appManagerPage);
      console.log('Recurring award created (Quarterly)', { awardName, awardId, nominationId, tenantCode });
      const opensAt = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const closesAt = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().slice(0, 10); // YYYY-MM-DD
      const overduesAt = new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().slice(0, 10); // YYYY-MM-DD

      // PREOPEN -> OPEN on first day of month
      await TestDbScenarios.updateNominationInstanceByNominationId(tenantCode, nominationId, {
        opensAt: opensAt,
        closesAt: closesAt,
        status: NominationInstanceStatus.PREOPEN,
        overduesAt: overduesAt,
      });
      await recurringAwardsApi.hitRecurringSyncAwardApi(appManagerPage, tenantCode);
      await TestDbScenarios.checkAwardStatusInDBByNominationId(
        tenantCode,
        nominationId,
        NominationInstanceStatus.OPEN,
        1
      );

      // OPEN -> CLOSED on quarter end
      const pastOpenDate = new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().slice(0, 10);
      const presentClosedDate = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10); // YYYY-MM-DD
      await TestDbScenarios.updateNominationInstanceByNominationId(tenantCode, nominationId, {
        opensAt: pastOpenDate,
        closesAt: presentClosedDate,
        status: NominationInstanceStatus.OPEN,
        overduesAt: overduesAt,
      });
      await recurringAwardsApi.hitRecurringSyncAwardApi(appManagerPage, tenantCode);
      await TestDbScenarios.checkAwardStatusInDBByNominationId(
        tenantCode,
        nominationId,
        NominationInstanceStatus.CLOSED,
        1
      );
      await recurringAwardsApi.deleteAwardViaApi(appManagerPage, 'Recurring Award', awardId);
    }
  );

  test(
    'Verify Monthly award with Custom Days (Max) and Nomination Close (Max)',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        RecurringAwardsFeatureTags.RECURRING_AWARD_STATUS_DB,
        TestPriority.P3,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture, recurringAwardsApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6119',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const appManagerName = getRecognitionTenantConfigFromCache().appManagerName;

      // Create Monthly award with custom participation/close
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      const awardName = await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.fillRecurringAwardFormPageTwo(
        appManagerName,
        'Nominations',
        'Monthly',
        'America/Los_Angeles',
        1
      );
      await recurringAwardPage.confirmAndCreateRecurringAward();
      await recurringAwardPage.submitRecurringAward();
      const creationResult = await recurringAwardsApi.waitForRecurringAwardCreationResponse(appManagerPage);
      await manageRecognitionPage.assertToastMessageIsVisible(MESSAGES.NEW_AWARD_CREATED);

      const { awardId, nominationId } = recurringAwardsApi.validateCreationResult(creationResult);
      const tenantCode = await recurringAwardsApi.getTenantCode(appManagerPage);
      console.log('Monthly recurring award created', { awardId, awardName, nominationId, tenantCode });
      const pastOpenDate = new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().slice(0, 10);
      const presentClosedDate = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10); // YYYY-MM-DD
      const overduesAt = new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().slice(0, 10);
      // OPEN -> CLOSED exactly at custom close date
      await TestDbScenarios.updateNominationInstanceByNominationId(tenantCode, nominationId, {
        opensAt: pastOpenDate,
        closesAt: presentClosedDate,
        status: NominationInstanceStatus.OPEN,
        overduesAt: overduesAt,
      });
      await recurringAwardsApi.hitRecurringSyncAwardApi(appManagerPage, tenantCode);
      await TestDbScenarios.checkAwardStatusInDBByNominationId(
        tenantCode,
        nominationId,
        NominationInstanceStatus.CLOSED,
        1
      );
      await recurringAwardsApi.deleteAwardViaApi(appManagerPage, 'Recurring Award', awardId);
    }
  );
});
