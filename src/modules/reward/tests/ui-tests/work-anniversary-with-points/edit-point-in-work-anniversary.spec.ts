import { getRewardTenantConfigFromCache } from '@rewards/config/rewardConfig';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRecognitionPage } from '@rewards-pages/manage-recognition/manage-recognition-page';
import { WorkAnniversaryPage } from '@rewards-pages/work-anniversary/work-anniversary-page';

import { TestGroupType, TestPriority } from '@core/constants';
import { tagTest } from '@core/utils';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { waitUntilNextDecadePlusOne } from '@core/utils/timeUtil';

test.describe('work Anniversary with points', { tag: [REWARD_SUITE_TAGS.MANAGE_WORK_ANNIVERSARY] }, () => {
  let tenantCode: string;
  test.beforeEach('Login to the Application and check basic Details', async ({ appManagerFixture }) => {
    const manageRecognitionPage = new ManageRecognitionPage(appManagerFixture.page);
    await manageRecognitionPage.rewards.enableTheRewardsAndPeerGiftingIfDisabled();
    tenantCode = await appManagerFixture.page.evaluate(() => {
      return (window as any).Simpplr?.Settings?.accountId;
    });
  });

  test(
    '[RC-5715, RC-5716] Validate all the Elements in the Work Anniversary Edit page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate all the Elements in the Work Anniversary Edit page',
        zephyrTestId: 'RC-5715, RC-5716',
        storyId: 'RC-5715',
      });

      const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);
      await workAnniversaryPage.visit();
      await workAnniversaryPage.verifyThePageIsLoaded();
      await workAnniversaryPage.validateAllTheTableElements();
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.validateTheElementsInEditWorkAnniversaryPage();
    }
  );

  test(
    '[RC-5785,RC-5786] Validate the Default Badge numbering and Text in Work Anniversary Instances',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate the Default Badge numbering and Text in Work Anniversary Instances',
        zephyrTestId: 'RC-5785, RC-5786',
        storyId: 'RC-5785',
      });

      const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);
      await workAnniversaryPage.visit();
      await workAnniversaryPage.verifyThePageIsLoaded();
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.selectTheDefaultBadgeInWorkAnniversary();
      await workAnniversaryPage.validateTheYearNumberInAwardBadgeForDefaultBadge();
      await workAnniversaryPage.validateTheYearNumberInAwardInstanceLabels();
    }
  );

  test(
    '[RC-5787, RC-5788, RC-5789, RC-5860, RC-5790] Validate the Work Anniversary for logged in User',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, REWARD_FEATURE_TAGS.REWARDS_DB_CASES, TestPriority.P2],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate the Work Anniversary for logged in User',
        zephyrTestId: 'RC-5787, RC-5788, RC-5789, RC-5860, RC-5790',
        storyId: 'RC-5787',
      });

      const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);
      await workAnniversaryPage.visit();
      await workAnniversaryPage.verifyThePageIsLoaded();
      const userIds = [
        getRewardTenantConfigFromCache().appManagerUserId,
        getRewardTenantConfigFromCache().recognitionManagerUserId,
        getRewardTenantConfigFromCache().endUserUserId,
      ].filter((id): id is string => id !== undefined);
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.cleanUpTheDataIfAlreadySet();
      await workAnniversaryPage.setTheDefaultPointsInWorkAnniversary(20);
      await workAnniversaryPage.clickOnPreviewAwardButtonAndValidateThePoints(20);
      await workAnniversaryPage.editTheWorkAnniversaryInstanceAndSetThePoints(0, undefined);
      await workAnniversaryPage.editTheWorkAnniversaryInstanceAndSetThePoints(1, 0);
      await workAnniversaryPage.editTheWorkAnniversaryInstanceAndSetThePoints(2, 30);
      await workAnniversaryPage.saveTheWorkAnniversaryChanges();
      await workAnniversaryPage.visit();
      await workAnniversaryPage.deleteAllExistingWorkAnniversaryForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.setTheUserIdsStartDateAsCurrentDate(userIds, tenantCode);
      await workAnniversaryPage.setTheStartDateForUsersForWorkAnniversary(userIds[0], 1, tenantCode);
      await workAnniversaryPage.setTheStartDateForUsersForWorkAnniversary(userIds[1], 2, tenantCode);
      await workAnniversaryPage.setTheStartDateForUsersForWorkAnniversary(userIds[2], 3, tenantCode);
      const finishedAt = await waitUntilNextDecadePlusOne(appManagerFixture.page);
      console.log('Wait finished at:', finishedAt.toISOString());
      const recognitionResults: { recognitionId: string; year: number }[] =
        await workAnniversaryPage.getTheLatestWorkAnniversaryRecognitionIdForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.validateTheWorkAnniversaryRecognitionPost(recognitionResults);
      await workAnniversaryPage.deleteAllExistingWorkAnniversaryForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.setTheUserIdsStartDateAsCurrentDate(userIds, tenantCode);
    }
  );

  test(
    '[RC-5808] Validate WA post when manager edit points after anniversary date',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, REWARD_FEATURE_TAGS.REWARDS_DB_CASES, TestPriority.P2],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate WA post when manager edit points after anniversary date',
        zephyrTestId: 'RC-5808',
        storyId: 'RC-5808',
      });
      const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);

      await workAnniversaryPage.visit();
      await workAnniversaryPage.verifyThePageIsLoaded();
      const point = TestDataGenerator.getRandomNo(0, 30);
      const userIds = [getRewardTenantConfigFromCache().endUserUserId].filter((id): id is string => id !== undefined);
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.cleanUpTheDataIfAlreadySet();
      await workAnniversaryPage.setTheDefaultPointsInWorkAnniversary(20);
      await workAnniversaryPage.editTheWorkAnniversaryInstanceAndSetThePoints(0, point);
      await workAnniversaryPage.saveTheWorkAnniversaryChanges();
      await workAnniversaryPage.deleteAllExistingWorkAnniversaryForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.setTheUserIdsStartDateAsCurrentDate(userIds, tenantCode);
      await workAnniversaryPage.setTheStartDateForUsersForWorkAnniversary(userIds[0], 1, tenantCode);
      let finishedAt = await waitUntilNextDecadePlusOne(appManagerFixture.page);
      console.log('Wait finished at:', finishedAt.toISOString());
      const recognitionResults: { recognitionId: string; year: number }[] =
        await workAnniversaryPage.getTheLatestWorkAnniversaryRecognitionIdForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.validateTheWorkAnniversaryRecognitionPostWithSpecificPoints(recognitionResults, point);
      const newPoint = TestDataGenerator.getRandomNo(0, 30, point);
      await workAnniversaryPage.visit();
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.cleanUpTheDataIfAlreadySet();
      await workAnniversaryPage.editTheWorkAnniversaryInstanceAndSetThePoints(0, newPoint);
      await workAnniversaryPage.saveTheWorkAnniversaryChanges();
      finishedAt = await waitUntilNextDecadePlusOne(appManagerFixture.page);
      console.log('Wait finished at:', finishedAt.toISOString());
      const newRecognitionResults: {
        recognitionId: string;
        year: number;
      }[] = await workAnniversaryPage.getTheLatestWorkAnniversaryRecognitionIdForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.validateTheWorkAnniversaryRecognitionPostWithSpecificPoints(
        newRecognitionResults,
        point
      );
      await workAnniversaryPage.deleteAllExistingWorkAnniversaryForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.setTheUserIdsStartDateAsCurrentDate(userIds, tenantCode);
    }
  );

  test(
    '[RC-6087] Validate the Message and URL column value in the points given CSV for the Work Anniversary with the points',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, REWARD_FEATURE_TAGS.REWARDS_DB_CASES, TestPriority.P2],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Validate the Message and URL column value in the points given CSV for the Work Anniversary with the points',
        zephyrTestId: 'RC-6087',
        storyId: 'RC-6087',
      });

      const manageRecognitionPage = new ManageRecognitionPage(appManagerFixture.page);
      const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);

      await workAnniversaryPage.visit();
      await workAnniversaryPage.verifyThePageIsLoaded();
      const userIds = [getRewardTenantConfigFromCache().endUserUserId].filter((id): id is string => id !== undefined);
      const point = TestDataGenerator.getRandomNo(0, 30);
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.cleanUpTheDataIfAlreadySet();
      await workAnniversaryPage.setTheDefaultPointsInWorkAnniversary(20);
      await workAnniversaryPage.editTheWorkAnniversaryInstanceAndSetThePoints(0, point);
      await workAnniversaryPage.saveTheWorkAnniversaryChanges();
      await workAnniversaryPage.deleteAllExistingWorkAnniversaryForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.setTheUserIdsStartDateAsCurrentDate(userIds, tenantCode);
      await workAnniversaryPage.setTheStartDateForUsersForWorkAnniversary(userIds[0], 1, tenantCode);
      const finishedAt = await waitUntilNextDecadePlusOne(appManagerFixture.page);
      console.log('Wait finished at:', finishedAt.toISOString());
      const recognitionResults: { recognitionId: string; year: number }[] =
        await workAnniversaryPage.getTheLatestWorkAnniversaryRecognitionIdForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.validateTheWorkAnniversaryRecognitionPostWithSpecificPoints(recognitionResults, point);
      await manageRecognitionPage.rewards.visit();
      await workAnniversaryPage.validateTheCSVDataForPointsGiven(
        point,
        `Congratulations ${getRewardTenantConfigFromCache().endUserName} on reaching your 1st work anniversary! We're grateful to have you as part of our company!`
      );
      await workAnniversaryPage.deleteAllExistingWorkAnniversaryForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.setTheUserIdsStartDateAsCurrentDate(userIds, tenantCode);
    }
  );

  test(
    '[RC-5859] Verify WA post when custom badges with points set as zero on Milestone instance',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, REWARD_FEATURE_TAGS.REWARDS_DB_CASES, TestPriority.P2],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify WA post when custom badges with points set as zero on Milestone instance',
        zephyrTestId: 'RC-5859',
        storyId: 'RC-5859',
      });

      const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);

      await workAnniversaryPage.visit();
      await workAnniversaryPage.verifyThePageIsLoaded();
      const userIds = [getRewardTenantConfigFromCache().endUserUserId].filter((id): id is string => id !== undefined);
      const point = 0;
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.cleanUpTheDataIfAlreadySet();
      await workAnniversaryPage.setTheDefaultPointsInWorkAnniversary(20);
      await workAnniversaryPage.editTheWorkAnniversaryInstanceAndSetThePoints(0, point, 2);
      await workAnniversaryPage.saveTheWorkAnniversaryChanges();
      await workAnniversaryPage.deleteAllExistingWorkAnniversaryForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.setTheUserIdsStartDateAsCurrentDate(userIds, tenantCode);
      await workAnniversaryPage.setTheStartDateForUsersForWorkAnniversary(userIds[0], 1, tenantCode);
      const finishedAt = await waitUntilNextDecadePlusOne(appManagerFixture.page);
      console.log('Wait finished at:', finishedAt.toISOString());
      const recognitionResults: { recognitionId: string; year: number }[] =
        await workAnniversaryPage.getTheLatestWorkAnniversaryRecognitionIdForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.validateTheWorkAnniversaryRecognitionPostWithSpecificPoints(
        recognitionResults,
        point,
        true
      );
      await workAnniversaryPage.visit();
      await workAnniversaryPage.verifyThePageIsLoaded();
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.cleanUpTheDataIfAlreadySet();
      await workAnniversaryPage.deleteAllExistingWorkAnniversaryForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.setTheUserIdsStartDateAsCurrentDate(userIds, tenantCode);
    }
  );
});
