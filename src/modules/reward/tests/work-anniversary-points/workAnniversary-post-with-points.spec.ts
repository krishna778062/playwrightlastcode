import { getRewardTenantConfigFromCache } from '@rewards/config/rewardConfig';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRecognitionPage } from '@rewards-pages/manage-recognition/manage-recognition-page';
import { WorkAnniversaryPage } from '@rewards-pages/work-anniversary/work-anniversary-page';

import { TestPriority } from '@core/constants';
import { tagTest } from '@core/utils';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { waitUntilNext10thMinuteWithPlusOne } from '@core/utils/timeUtil';

test.describe('work anniversary with points', { tag: [REWARD_SUITE_TAGS.MANAGE_WORK_ANNIVERSARY] }, () => {
  test.describe.configure({
    timeout: 25 * 60 * 1000, // 25 minutes per test
  });
  let tenantCode: string;
  test.beforeEach('Login to Application and open Manage work anniversary page', async ({ appManagerFixture }) => {
    const manageRecognitionPage = new ManageRecognitionPage(appManagerFixture.page);
    await manageRecognitionPage.rewards.enableTheRewardsAndPeerGiftingIfDisabled();
    const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);
    await workAnniversaryPage.loadPage();
    tenantCode = await appManagerFixture.page.evaluate(() => {
      return (window as any).Simpplr?.Settings?.accountId;
    });
  });

  test(
    '[RC-5787, RC-5788, RC-5789, RC-5860, RC-5790] Work anniversary post for 1st, 2nd, and 3rd year with points',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, REWARD_FEATURE_TAGS.REWARDS_DB_CASES, TestPriority.P3],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify the WA post with points and numbered badges in the Recognition Hub',
        zephyrTestId: 'RC-5787',
        storyId: 'RC-5787',
      });
      tagTest(test.info(), {
        description: 'Verify the WA post without points but numbered badges in the Recognition Hub',
        zephyrTestId: 'RC-5788',
        storyId: 'RC-5788',
      });
      tagTest(test.info(), {
        description: 'Verify WA post when numbered badges with points set on Milestone instance',
        zephyrTestId: 'RC-5789',
        storyId: 'RC-5789',
      });
      tagTest(test.info(), {
        description: 'Verify adjust point balances for specific cycles of the work anniversary milestones',
        zephyrTestId: 'RC-5860',
        storyId: 'RC-5860',
      });
      tagTest(test.info(), {
        description: 'Verify WA post when custom badges with points set as zero on Milestone instance',
        zephyrTestId: 'RC-5859',
        storyId: 'RC-5859',
      });
      tagTest(test.info(), {
        description: 'Verify WA post when numbered badges without points set on Milestone award instance',
        zephyrTestId: 'RC-5790',
        storyId: 'RC-5790',
      });
      const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);
      const userIds = [
        getRewardTenantConfigFromCache().appManagerUserId,
        getRewardTenantConfigFromCache().recognitionManagerUserId,
        getRewardTenantConfigFromCache().endUserUserId,
      ];
      const anniversaryPoints = [null, 10, 50];
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.cleanUpTheDataIfAlreadySet();
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.setTheDefaultPointsInWorkAnniversary(20);
      await workAnniversaryPage.clickOnPreviewAwardButtonAndValidateThePoints(20);
      await workAnniversaryPage.setTheDataForWorkAnniversaryAwardInstance(0, false, false, false, anniversaryPoints[0]);
      await workAnniversaryPage.setTheDataForWorkAnniversaryAwardInstance(1, false, true, true, anniversaryPoints[1]);
      await workAnniversaryPage.setTheDataForWorkAnniversaryAwardInstance(2, true, false, true, anniversaryPoints[2]);
      await workAnniversaryPage.setToggleAndSaveChangesInWorkAnniversary(true);
      await workAnniversaryPage.dismissTheToastMessage({
        toastText: 'Saved changes successfully',
      });
      await workAnniversaryPage.deleteAllExistingWorkAnniversaryForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.setTheUserIdsStartDateAsCurrentDate(userIds, tenantCode);
      await workAnniversaryPage.setTheStartDateForUsersForWorkAnniversary(userIds[0], 1, tenantCode);
      await workAnniversaryPage.setTheStartDateForUsersForWorkAnniversary(userIds[1], 2, tenantCode);
      await workAnniversaryPage.setTheStartDateForUsersForWorkAnniversary(userIds[2], 3, tenantCode);
      const finishedAt = await waitUntilNext10thMinuteWithPlusOne(appManagerFixture.page);
      console.log('Wait finished at:', finishedAt.toISOString());
      const recognitionResults: { recognitionId: string; year: number }[] =
        await workAnniversaryPage.getTheLatestWorkAnniversaryRecognitionIdForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.validateTheWorkAnniversaryRecognitionPost(recognitionResults, anniversaryPoints);
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
      const userIds = [
        getRewardTenantConfigFromCache().appManagerUserId,
        getRewardTenantConfigFromCache().recognitionManagerUserId,
        getRewardTenantConfigFromCache().endUserUserId,
      ];
      const anniversaryPoints = [null, 10, 50];
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.cleanUpTheDataIfAlreadySet();
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.setTheDefaultPointsInWorkAnniversary(20);
      await workAnniversaryPage.clickOnPreviewAwardButtonAndValidateThePoints(20);
      await workAnniversaryPage.setTheDataForWorkAnniversaryAwardInstance(0, false, false, false, anniversaryPoints[0]);
      await workAnniversaryPage.setTheDataForWorkAnniversaryAwardInstance(1, false, true, true, anniversaryPoints[1]);
      await workAnniversaryPage.setTheDataForWorkAnniversaryAwardInstance(2, true, false, true, anniversaryPoints[2]);
      await workAnniversaryPage.setToggleAndSaveChangesInWorkAnniversary(true);
      await workAnniversaryPage.dismissTheToastMessage({
        toastText: 'Saved changes successfully',
      });
      await workAnniversaryPage.deleteAllExistingWorkAnniversaryForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.setTheUserIdsStartDateAsCurrentDate(userIds, tenantCode);
      await workAnniversaryPage.setTheStartDateForUsersForWorkAnniversary(userIds[0], 1, tenantCode);
      await workAnniversaryPage.setTheStartDateForUsersForWorkAnniversary(userIds[1], 2, tenantCode);
      await workAnniversaryPage.setTheStartDateForUsersForWorkAnniversary(userIds[2], 3, tenantCode);
      let finishedAt = await waitUntilNext10thMinuteWithPlusOne(appManagerFixture.page);
      console.log('Wait finished at:', finishedAt.toISOString());
      const recognitionResults: { recognitionId: string; year: number }[] =
        await workAnniversaryPage.getTheLatestWorkAnniversaryRecognitionIdForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.validateTheWorkAnniversaryRecognitionPost(recognitionResults, anniversaryPoints);
      const newPoint = TestDataGenerator.getRandomNo(0, 30, anniversaryPoints[2]!);
      await workAnniversaryPage.visit();
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.updateThePointInTheAwardInstance(2, newPoint);
      await workAnniversaryPage.saveTheWorkAnniversaryChanges();
      finishedAt = await waitUntilNext10thMinuteWithPlusOne(appManagerFixture.page);
      console.log('Wait finished at:', finishedAt.toISOString());
      const newRecognitionResults: {
        recognitionId: string;
        year: number;
      }[] = await workAnniversaryPage.getTheLatestWorkAnniversaryRecognitionIdForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.validateTheWorkAnniversaryRecognitionPostWithSpecificPoints(
        newRecognitionResults,
        anniversaryPoints[2]!
      );
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
      const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerFixture.page);
      const userIds = [getRewardTenantConfigFromCache().endUserUserId];
      const anniversaryPoints = [10];
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.cleanUpTheDataIfAlreadySet();
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.setTheDefaultPointsInWorkAnniversary(20);
      await workAnniversaryPage.clickOnPreviewAwardButtonAndValidateThePoints(20);
      await workAnniversaryPage.setTheDataForWorkAnniversaryAwardInstance(0, false, false, false, anniversaryPoints[0]);
      await workAnniversaryPage.setToggleAndSaveChangesInWorkAnniversary(true);
      await workAnniversaryPage.dismissTheToastMessage({
        toastText: 'Saved changes successfully',
      });
      await workAnniversaryPage.deleteAllExistingWorkAnniversaryForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.setTheUserIdsStartDateAsCurrentDate(userIds, tenantCode);
      await workAnniversaryPage.setTheStartDateForUsersForWorkAnniversary(userIds[0], 1, tenantCode);
      const finishedAt = await waitUntilNext10thMinuteWithPlusOne(appManagerFixture.page);
      console.log('Wait finished at:', finishedAt.toISOString());
      const recognitionResults: { recognitionId: string; year: number }[] =
        await workAnniversaryPage.getTheLatestWorkAnniversaryRecognitionIdForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.validateTheWorkAnniversaryRecognitionPost(recognitionResults, anniversaryPoints);
      await manageRecognitionPage.rewards.visit();
      await workAnniversaryPage.validateTheCSVDataForPointsGiven(
        anniversaryPoints[0],
        `Congratulations ${getRewardTenantConfigFromCache().endUserName} on reaching your 1st work anniversary! We're grateful to have you as part of our company!`
      );
      await workAnniversaryPage.deleteAllExistingWorkAnniversaryForTheUserIds(userIds, tenantCode);
      await workAnniversaryPage.setTheUserIdsStartDateAsCurrentDate(userIds, tenantCode);
    }
  );
});
