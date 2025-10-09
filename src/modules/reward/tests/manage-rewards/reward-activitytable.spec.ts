import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import fs from 'fs';
import path from 'path';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { CSVUtils } from '@core/utils/csvUtils';
import { tagTest } from '@core/utils/testDecorator';
import { DialogBox } from '@modules/reward/components/common/dialog-box';
import { GiveRecognitionDialogBox } from '@modules/reward/components/recognition/give-recognition-dialog-box';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { ManageRewardsOverviewPage } from '@modules/reward/pages/manage-rewards/manage-rewards-overview-page';
import { RecognitionHubPage } from '@modules/reward/pages/recognition-hub/recognition-hub-page';

test.describe('Activity Table', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test.beforeEach(async ({ appManagerPage }) => {
    const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
    await manageRewardsOverviewPage.enableTheRewardsAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-3004] Validate Rewards Activity table if there is no activity',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ACTIVITY_TABLE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Rewards Activity table if there is no activity',
        zephyrTestId: 'RC-3004',
        storyId: 'RC-3004',
      });
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);

      // Abort the transactions API to simulate no activity
      await appManagerPage.route('**/recognition/admin/rewards/transactions?**', route => {
        route.abort(); // Simulates network interruption
      });
      await appManagerPage.reload({ waitUntil: 'domcontentloaded' });

      // Navigate to the Activity table
      await manageRewardsOverviewPage.verifier.waitUntilElementIsVisible(
        manageRewardsOverviewPage.activityContainer.last(),
        {
          timeout: 15000,
          stepInfo: 'Wait for activity container to be visible',
        }
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityPanelHeader.first()
      );

      // Validate the filter buttons
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.activityPanelFiltersButtonText.nth(0),
        'Points given'
      );
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.activityPanelFiltersButtonText.nth(1),
        'Points redeemed'
      );
      await manageRewardsOverviewPage.verifier.verifyElementHasAttribute(
        manageRewardsOverviewPage.activityPanelFiltersButton.nth(0),
        'value',
        'RECOGNITION_PEER_GIFTING'
      );
      await expect(manageRewardsOverviewPage.activityPanelFiltersButton.nth(0)).toBeChecked();
      await manageRewardsOverviewPage.verifier.verifyElementHasAttribute(
        manageRewardsOverviewPage.activityPanelFiltersButton.nth(1),
        'value',
        'REDEMPTION'
      );

      // Validate the Days filter buttons
      await manageRewardsOverviewPage.verifier.verifyElementHasAttribute(
        manageRewardsOverviewPage.activityPanelFiltersButton.nth(2),
        'value',
        '30D'
      );
      await expect(manageRewardsOverviewPage.activityPanelFiltersButton.nth(2)).toBeChecked();
      await manageRewardsOverviewPage.verifier.verifyElementHasAttribute(
        manageRewardsOverviewPage.activityPanelFiltersButton.nth(3),
        'value',
        '3M'
      );
      await manageRewardsOverviewPage.verifier.verifyElementHasAttribute(
        manageRewardsOverviewPage.activityPanelFiltersButton.nth(4),
        'value',
        '12M'
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsEnabled(
        manageRewardsOverviewPage.activityPanelFiltersButton.nth(2)
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsEnabled(
        manageRewardsOverviewPage.activityPanelFiltersButton.nth(3)
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsEnabled(
        manageRewardsOverviewPage.activityPanelFiltersButton.nth(4)
      );

      // Validate the Points Redeemed table (no activity)
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityTableNoResultHeading
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityTableNoResultText
      );
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.activityTableNoResultHeading,
        'No activity'
      );
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.activityTableNoResultText,
        'Activity will appear here once users begin receiving points'
      );

      // Validate the Points Given table (no activity)
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPanelFiltersButton.nth(1), {
        stepInfo: 'Clicking on Points Redeemed filter',
        force: true,
      });
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityTableNoResultHeading
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityTableNoResultText
      );
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.activityTableNoResultHeading,
        'No activity'
      );
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.activityTableNoResultText,
        'Redemption activity will appear here once users begin redeeming rewards'
      );
    }
  );

  test(
    '[RC-3264] Validate if Total count for entries in activity table matching number of entries, on reward overview page.',
    {
      tag: [
        REWARD_FEATURE_TAGS.REWARDS_ACTIVITY_TABLE,
        REWARD_FEATURE_TAGS.POINTS_GIVEN_ACTIVITY,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description:
          'Validate if Total count for entries in activity table matching number of entries, on reward overview page.',
        zephyrTestId: 'RC-3264',
        storyId: 'RC-3264',
      });
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
      let items: any;

      // Navigate to the Activity table
      const apiPromise = appManagerPage.waitForResponse(
        resp => resp.url().includes('/recognition/admin/rewards/transactions') && resp.status() === 200
      );

      await manageRewardsOverviewPage.verifier.waitUntilElementIsVisible(
        manageRewardsOverviewPage.activityContainer.last(),
        {
          timeout: 15000,
          stepInfo: 'Wait for activity container to be visible',
        }
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityPanelHeader.first()
      );
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPointsGivenTable, {
        stepInfo: 'Clicking on Points Given filter',
        force: true,
      });
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last()
      );

      const apiResponse = await apiPromise;
      const json = await apiResponse.json();
      items = json?.total ?? null;
      console.log(`Total Items: ${items}`);

      // Click on Show more button till all the records listed
      const oldCount = items;
      await expect(manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last()).toBeAttached();
      while (items > 0) {
        if (items <= 10) {
          break;
        }
        await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPanelTableShowMoreButton, {
          stepInfo: 'Clicking on Show More button',
        });
        await expect(manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last()).toBeAttached();
        items = items - 10;
      }
      await appManagerPage.waitForTimeout(5000);
      const updatedCount = await manageRewardsOverviewPage.activityPanelTableRows.count();
      expect(updatedCount).toEqual(oldCount);
    }
  );

  test(
    '[RC-3420] Verify Last synced data Note on Rewards Activity table',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ACTIVITY_TABLE, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify Last synced data Note on Rewards Activity table',
        zephyrTestId: 'RC-3420',
        storyId: 'RC-3420',
      });
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
      await manageRewardsOverviewPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(manageRewardsOverviewPage.rewardsTabHeading);
      const apiPromise = appManagerPage.waitForResponse(
        resp => resp.url().includes('/recognition/admin/rewards/transactions') && resp.status() === 200
      );
      const apiResponse = await apiPromise;
      const json = await apiResponse.json();
      const lastUpdatedAtFromApi = json?.lastUpdatedAt ?? null;

      await manageRewardsOverviewPage.activityPanelLastUpdatedInfoIcon.scrollIntoViewIfNeeded();
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityPanelLastUpdatedInfoIcon,
        {
          assertionMessage: ' Last Updated info icon is not visible',
        }
      );
      await manageRewardsOverviewPage.activityPanelHeader.scrollIntoViewIfNeeded();
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.activityPanelLastUpdatedText,
        'Last updated '
      );
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPanelLastUpdatedInfoIcon, {
        stepInfo: 'Clicking on Last Updated info icon',
      });
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.tooltipText,
        'Activity data is synced periodically which may impact real-time reporting'
      );
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPanelLastUpdatedInfoIcon, {
        stepInfo: 'Clicking on Last Updated info icon',
      });
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.activityPanelLastUpdatedText,
        await manageRewardsOverviewPage.getTheActivityTableUpdatedTime(lastUpdatedAtFromApi),
        {
          assertionMessage: ' Expected last synced time is not matching with the API time',
        }
      );
    }
  );

  test(
    '[RC-3421] Validate Pending Recognition activity in Rewards Activity table',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ACTIVITY_TABLE, TestPriority.P0],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Pending Recognition activity in Rewards Activity table',
        zephyrTestId: 'RC-3421',
        storyId: 'RC-3421',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const rewardOptionIndex = 3;
      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }

      // Visit the Recognition Hub and give one recognition
      await recognitionHub.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
      const rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
        0,
        1,
        'Test Message' + Math.floor(Math.random() * 1000),
        rewardOptionIndex
      );
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardOptionText,
        'Only visible to recipients, their managers and app administrators'
      );

      // Validate the new Entry in the Downloaded CSV file
      const csvUtils = new CSVUtils('./downloads');
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
      await manageRewardsOverviewPage.loadPage();

      // Trigger and capture download
      const [download] = await Promise.all([
        appManagerPage.waitForEvent('download'),
        manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityTableDownloadCSVButton, {
          stepInfo: 'Clicking on Download CSV button',
        }),
      ]);
      await download.saveAs(path.resolve('./downloads', download.suggestedFilename()));
      const validationResult = await csvUtils.validateRowValue('last', 14, 'PENDING');
      expect(validationResult.isMatch, `Expected "PENDING" but got "${validationResult.actualValue}"`).toBeTruthy();
      fs.unlinkSync(csvUtils.getLatestCSV());
    }
  );

  test(
    '[RC-5711] Validate show more button on Points redeemed activity table',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ACTIVITY_TABLE, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate show more button on Points redeemed activity table',
        zephyrTestId: 'RC-5711',
        storyId: 'RC-5711',
      });
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);

      // Navigate to the Activity table
      const apiPromise = appManagerPage.waitForResponse(
        resp => resp.url().includes('/recognition/admin/rewards/transactions') && resp.status() === 200
      );

      await manageRewardsOverviewPage.verifier.waitUntilElementIsVisible(
        manageRewardsOverviewPage.activityContainer.last(),
        { timeout: 15000, stepInfo: 'Wait for activity container' }
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityPanelHeader.first()
      );
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPointsRedeemTable, {
        stepInfo: 'Clicking on Points Redeemed filter',
        force: true,
      });
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last()
      );

      const apiResponse = await apiPromise;
      const json = await apiResponse.json();
      const items = json?.total ?? null;
      console.log(`Items: ${items}`);

      // Validate show more button
      if (Number(items) > 10) {
        const initialCount = await manageRewardsOverviewPage.activityPanelTableRows.count();
        await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
          manageRewardsOverviewPage.activityPanelTableShowMoreButton
        );
        await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPanelTableShowMoreButton, {
          stepInfo: 'Clicking on Show More button',
        });
        await manageRewardsOverviewPage.activityPanelTableRows.last().waitFor({ state: 'attached' });
        const updatedCount = await manageRewardsOverviewPage.activityPanelTableRows.count();
        expect(updatedCount).toEqual(initialCount + 10);
      }
    }
  );

  test(
    '[RC-5712] Validate filter on Rewards activity table for points redeemed',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ACTIVITY_TABLE, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate filter on Rewards activity table for points redeemed',
        zephyrTestId: 'RC-5712',
        storyId: 'RC-5712',
      });
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
      await manageRewardsOverviewPage.verifier.waitUntilElementIsVisible(
        manageRewardsOverviewPage.activityContainer.last(),
        { timeout: 15000, stepInfo: 'Wait for activity container' }
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityPanelHeader.first()
      );
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPointsRedeemTable, {
        stepInfo: 'Clicking on Points Redeemed filter',
        force: true,
      });
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last()
      );
      const apiPromise = appManagerPage.waitForResponse(
        resp =>
          resp.url().includes('&category=REDEMPTION&size=10&skip=0&dir=desc&sort=createdAt') && resp.status() === 200
      );
      const apiResponse = await apiPromise;
      const json = await apiResponse.json();
      const items = json?.total ?? null;
      expect(items).not.toBeUndefined();
      await expect(manageRewardsOverviewPage.activityPanelFiltersButton.nth(2)).toBeChecked();

      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPanelFiltersButton.nth(3), {
        stepInfo: 'Clicking on 3M filter',
        force: true,
      });
      const apiPromise3M = appManagerPage.waitForResponse(
        resp =>
          resp.url().includes('&category=REDEMPTION&size=10&skip=0&dir=desc&sort=createdAt') && resp.status() === 200
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last()
      );
      const apiResponse3M = await apiPromise3M;
      const json3M = await apiResponse3M.json();
      const newJsonValue = json3M?.total ?? null;
      expect(newJsonValue).toBeGreaterThanOrEqual(items);

      // Validate 12M filter button
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPanelFiltersButton.nth(4), {
        stepInfo: 'Clicking on 12M filter',
        force: true,
      });
      const apiPromise12M = appManagerPage.waitForResponse(
        resp =>
          resp.url().includes('&category=REDEMPTION&size=10&skip=0&dir=desc&sort=createdAt') && resp.status() === 200
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last()
      );
      const apiResponse12M = await apiPromise12M;
      const json12M = await apiResponse12M.json();
      const newJsonValue12M = json12M?.total ?? null;
      expect(newJsonValue12M).toBeGreaterThanOrEqual(items);
    }
  );

  // CSV Download tests
  const tests = [
    {
      testId: 'RC-3525',
      testTitle: 'Validate additional CSV download Fields when points given',
    },
    {
      testId: 'RC-3527',
      testTitle: 'Validate additional CSV download Fields when points redeemed',
    },
  ];

  // Predefine headers for both cases
  const HEADERS = {
    given: [
      'Date time',
      'Gifter name',
      'Gifter email',
      'Gifter department',
      'Gifter location',
      'Receiver name',
      'Receiver email',
      'Receiver department',
      'Receiver location',
      'Receiver payroll currency',
      'Custom conversion rate',
      'Type',
      'Points value',
      'USD value',
      'Transaction status',
      'Message',
      'URL',
    ],
    redeemed: [
      'Date time',
      'Redeemer name',
      'Redeemer email',
      'Redeemer department',
      'Redeemer location',
      'Redeemer payroll currency',
      'Reward class',
      'Reward type',
      'Reward category',
      'Reward',
      'Reward currency',
      'Reward value',
      'Exchange rate',
      'USD value',
      'Point cost',
      'Reward email',
      'Transaction status',
    ],
  };

  tests.forEach(({ testId, testTitle }) => {
    test(
      `[${testId}] ${testTitle}`,
      {
        tag: [REWARD_FEATURE_TAGS.REWARDS_ACTIVITY_TABLE, TestPriority.P0],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: testTitle,
          zephyrTestId: testId,
          storyId: testId,
        });
        const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
        const csvUtils = new CSVUtils('./downloads');
        await expect(manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last()).toBeAttached();
        if (testTitle.includes('points redeemed')) {
          await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPointsRedeemTable, {
            stepInfo: 'Clicking on Points Redeemed filter',
            force: true,
          });
          await expect(manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last()).toBeAttached();
        }
        const [download] = await Promise.all([
          appManagerPage.waitForEvent('download'),
          manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityTableDownloadCSVButton, {
            stepInfo: 'Clicking on Download CSV button',
          }),
        ]);
        await download.saveAs(path.resolve('./downloads', download.suggestedFilename()));
        const csvHeaders = testTitle.includes('points given') ? HEADERS.given : HEADERS.redeemed;
        const headersValidation = await csvUtils.validateHeaders(csvHeaders);
        expect(
          headersValidation.isValid,
          `Missing headers: ${headersValidation.missingHeaders}. Unexpected headers: ${headersValidation.unexpectedHeaders}`
        ).toBeTruthy();

        // Clean up
        fs.unlinkSync(csvUtils.getLatestCSV());
      }
    );
  });

  test(
    '[RC-3563] Validate removal sorting of reward name from Activity table of Points Redeemed',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ACTIVITY_TABLE, TestPriority.P0, TestGroupType.REGRESSION, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate removal sorting of reward name from Activity table of Points Redeemed',
        zephyrTestId: 'RC-3563',
        storyId: 'RC-3563',
      });
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
      await manageRewardsOverviewPage.verifyThePageIsLoaded();
      await manageRewardsOverviewPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(manageRewardsOverviewPage.rewardsTabHeading);

      await manageRewardsOverviewPage.verifier.verifyElementHasText(
        manageRewardsOverviewPage.activityPanelHeader,
        'Activity'
      );
      await manageRewardsOverviewPage.activityPanelHeader.scrollIntoViewIfNeeded();

      // Validate the Filters button in the Activity Table
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.activityPanelFiltersButtonText.nth(0),
        'Points given'
      );
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.activityPanelFiltersButtonText.nth(1),
        'Points redeemed'
      );
      await manageRewardsOverviewPage.verifier.verifyElementHasAttribute(
        manageRewardsOverviewPage.activityPanelFiltersButton.nth(0),
        'value',
        'RECOGNITION_PEER_GIFTING'
      );
      await expect(manageRewardsOverviewPage.activityPanelFiltersButton.nth(0)).toBeChecked();
      await manageRewardsOverviewPage.verifier.verifyElementHasAttribute(
        manageRewardsOverviewPage.activityPanelFiltersButton.nth(1),
        'value',
        'REDEMPTION'
      );

      // Validate the Days filter button 30D,3M,12M
      await manageRewardsOverviewPage.verifier.verifyElementHasAttribute(
        manageRewardsOverviewPage.activityPanelFiltersButton.nth(2),
        'value',
        '30D'
      );
      await expect(manageRewardsOverviewPage.activityPanelFiltersButton.nth(2)).toBeChecked();
      await manageRewardsOverviewPage.verifier.verifyElementHasAttribute(
        manageRewardsOverviewPage.activityPanelFiltersButton.nth(3),
        'value',
        '3M'
      );
      await manageRewardsOverviewPage.verifier.verifyElementHasAttribute(
        manageRewardsOverviewPage.activityPanelFiltersButton.nth(4),
        'value',
        '12M'
      );

      // Validate the Sorting columns in the Activity Table
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.activityPanelTableSortableHeaderText.nth(0),
        'Date'
      );
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.activityPanelTableHeader.nth(3),
        'Type'
      );

      await manageRewardsOverviewPage.clickOnElement(
        manageRewardsOverviewPage.activityPanelTableSortableHeaderText.nth(0),
        { stepInfo: 'Clicking on Date header' }
      );
      await expect(manageRewardsOverviewPage.activityPanelTableSortableHeader.nth(0)).toHaveClass(
        /SortableHeader-module__isSorted/
      );

      await manageRewardsOverviewPage.clickOnElement(
        manageRewardsOverviewPage.activityPanelTableSortableHeaderText.nth(1),
        { stepInfo: 'Clicking on Gifter header' }
      );
      await expect(manageRewardsOverviewPage.activityPanelTableSortableHeader.nth(1)).toHaveClass(
        /SortableHeader-module__isSorted/
      );

      await manageRewardsOverviewPage.clickOnElement(
        manageRewardsOverviewPage.activityPanelTableSortableHeaderText.nth(2),
        { stepInfo: 'Clicking on Receiver header' }
      );
      await expect(manageRewardsOverviewPage.activityPanelTableSortableHeader.nth(2)).toHaveClass(
        /SortableHeader-module__isSorted/
      );

      await manageRewardsOverviewPage.clickOnElement(
        manageRewardsOverviewPage.activityPanelTableSortableHeaderText.nth(3),
        { stepInfo: 'Clicking on Points header' }
      );
      await expect(manageRewardsOverviewPage.activityPanelTableSortableHeader.nth(3)).toHaveClass(
        /SortableHeader-module__isSorted/
      );

      await manageRewardsOverviewPage.clickOnElement(
        manageRewardsOverviewPage.activityPanelTableSortableHeaderText.nth(4),
        { stepInfo: 'Clicking on USD value header' }
      );
      await expect(manageRewardsOverviewPage.activityPanelTableSortableHeader.nth(4)).toHaveClass(
        /SortableHeader-module__isSorted/
      );

      // Validate the "Type" is not sortable in the Activity Table
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPanelTableHeader.nth(3), {
        stepInfo: 'Clicking on Type header',
      });
      await expect(manageRewardsOverviewPage.activityPanelTableHeader.nth(3)).not.toHaveClass(
        /SortableHeader-module__isSorted/
      );

      // Validate the Sorting columns in the Points Redeemed Activity Table
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPointsRedeemTable, {
        stepInfo: 'Clicking on Points Redeemed filter',
        force: true,
      });
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.activityPanelTableSortableHeaderText.nth(0),
        'Date'
      );
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.activityPanelTableHeader.nth(2),
        'Reward'
      );

      await manageRewardsOverviewPage.clickOnElement(
        manageRewardsOverviewPage.activityPanelTableSortableHeaderText.nth(0),
        { stepInfo: 'Clicking on Date header in Points Redeemed' }
      );
      await expect(manageRewardsOverviewPage.activityPanelTableSortableHeader.nth(0)).toHaveClass(
        /SortableHeader-module__isSorted/
      );

      await manageRewardsOverviewPage.clickOnElement(
        manageRewardsOverviewPage.activityPanelTableSortableHeaderText.nth(1),
        { stepInfo: 'Clicking on Redeemer header' }
      );
      await expect(manageRewardsOverviewPage.activityPanelTableSortableHeader.nth(1)).toHaveClass(
        /SortableHeader-module__isSorted/
      );

      await manageRewardsOverviewPage.clickOnElement(
        manageRewardsOverviewPage.activityPanelTableSortableHeaderText.nth(2),
        { stepInfo: 'Clicking on Points header in Points Redeemed' }
      );
      await expect(manageRewardsOverviewPage.activityPanelTableSortableHeader.nth(2)).toHaveClass(
        /SortableHeader-module__isSorted/
      );

      await manageRewardsOverviewPage.clickOnElement(
        manageRewardsOverviewPage.activityPanelTableSortableHeaderText.nth(3),
        { stepInfo: 'Clicking on USD value header in Points Redeemed' }
      );
      await expect(manageRewardsOverviewPage.activityPanelTableSortableHeader.nth(3)).toHaveClass(
        /SortableHeader-module__isSorted/
      );

      // Validate the "Reward" is not sortable in the Points Redeemed Activity Table
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPanelTableHeader.nth(2), {
        stepInfo: 'Clicking on Reward header',
      });
      await expect(manageRewardsOverviewPage.activityPanelTableHeader.nth(2)).not.toHaveClass(
        /SortableHeader-module__isSorted/
      );
    }
  );

  test(
    '[RC-3031] Validate Rewards Overview Activity Table for points Given',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ACTIVITY_TABLE, TestPriority.P0, TestGroupType.REGRESSION, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Rewards Overview Activity Table for points Given',
        zephyrTestId: 'RC-3031',
        storyId: 'RC-3031',
      });
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
      await manageRewardsOverviewPage.verifyThePageIsLoaded();
      await manageRewardsOverviewPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(manageRewardsOverviewPage.rewardsTabHeading);

      await manageRewardsOverviewPage.verifier.verifyElementHasText(
        manageRewardsOverviewPage.activityPanelHeader,
        'Activity'
      );
      await manageRewardsOverviewPage.activityPanelHeader.scrollIntoViewIfNeeded();

      // Validate the Filters button in the Activity Table
      const filterButtons = manageRewardsOverviewPage.activityPanelFiltersButton;
      const expectedValues = ['RECOGNITION_PEER_GIFTING', 'REDEMPTION', '30D', '3M', '12M'];

      for (let i = 0; i < expectedValues.length; i++) {
        await manageRewardsOverviewPage.verifier.verifyElementHasAttribute(
          filterButtons.nth(i),
          'value',
          expectedValues[i]
        );
      }

      await expect(filterButtons.nth(0)).toBeChecked();
      await expect(filterButtons.nth(2)).toBeChecked();

      // Click and verify "Show more" button until transaction data is fully loaded
      const showMoreButton = manageRewardsOverviewPage.activityPanelTableShowMoreButton;
      const expectedTransactionCount = 10;
      let totalTransactions = 0;
      let counter = 0;
      while (await manageRewardsOverviewPage.verifier.isTheElementVisible(showMoreButton)) {
        // Intercept the next transaction API call
        const [response] = await Promise.all([
          appManagerPage.waitForResponse(
            res => res.url().includes('/recognition/admin/rewards/transactions') && res.status() === 200
          ),
          showMoreButton.click(),
        ]);

        const responseBody = await response.json();
        totalTransactions = responseBody?.total || 0;
        if (totalTransactions <= expectedTransactionCount || counter <= 10) {
          break;
        }
        counter++;
      }
      console.log(`Final transaction count: ${totalTransactions}`);

      // Click on the View Recognition and validate it's opening on the same tab
      await manageRewardsOverviewPage.verifier.waitUntilElementIsVisible(
        manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last()
      );
      await manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last().scrollIntoViewIfNeeded();
      await manageRewardsOverviewPage.clickOnElement(
        manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last(),
        { stepInfo: 'Clicking on View Recognition item' }
      );
      const receiverName = await manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.nth(2).textContent();
      await manageRewardsOverviewPage.verifier.waitUntilElementIsVisible(
        manageRewardsOverviewPage.viewRecognitionDropdown
      );
      await manageRewardsOverviewPage.viewRecognitionDropdown.scrollIntoViewIfNeeded();
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.viewRecognitionDropdown
      );
      await manageRewardsOverviewPage.verifier.verifyElementHasText(
        manageRewardsOverviewPage.viewRecognitionDropdownText,
        'View recognition'
      );
      const getTheRecognitionUrl = await manageRewardsOverviewPage.viewRecognitionDropdownLink.getAttribute('href');
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.viewRecognitionDropdownLink, {
        stepInfo: 'Clicking on View Recognition link',
      });
      await manageRewardsOverviewPage.verifier.waitUntilPageHasNavigatedTo(getTheRecognitionUrl || '');
      await appManagerPage.locator('[data-testid="awardeeNames_"]').waitFor({ state: 'visible' });
      const awardeeNames = await appManagerPage.locator('[data-testid="awardeeNames_"]').textContent();
      if (!awardeeNames?.includes(receiverName || '')) {
        throw new Error(`Expected awardee name to contain ${receiverName}, but got ${awardeeNames}`);
      }
    }
  );

  test(
    '[RC-6080] Validate Message, and URL column value in Points Given CSV when points are removed or the recognition post is deleted',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_DB_CASES, REWARD_FEATURE_TAGS.REWARDS_ACTIVITY_TABLE, TestPriority.P2],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description:
          'Validate Message, and URL column value in Points Given CSV when points are removed or the recognition post is deleted',
        zephyrTestId: 'RC-6080',
        storyId: 'RC-6080',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
      const recognizedUser = process.env.STANDARD_USER_FULL_NAME || 'aishma enduser';

      // Visit the Recognition Hub and give one recognition
      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }

      await recognitionHub.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
      await giveRecognitionModal.selectTheUserForRecognition(recognizedUser);
      await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(1);
      const recognitionPostMessage = 'Test Message' + Math.floor(Math.random() * 1000);
      await giveRecognitionModal.enterTheRecognitionMessage(recognitionPostMessage);
      const rewardPointsText = await giveRecognitionModal.giftThePoints(1);

      const [response] = await Promise.all([
        appManagerPage.waitForResponse(resp => resp.url().includes('/recognition/create')),
        giveRecognitionModal.recognizeButton.click({ force: true }),
      ]);

      const body = await response.json();
      if (!body || !body.id) throw new Error(`No id in response: ${JSON.stringify(body)}`);
      const recognitionPostId = String(body.id);

      // Handle dialog box if it appears
      const dialogBox = new DialogBox(appManagerPage);
      if (await dialogBox.container.isVisible()) {
        await dialogBox.container.waitFor({ state: 'visible' });
        await dialogBox.skipButton.click();
        await expect(dialogBox.container).not.toBeVisible();
      }

      await manageRewardsOverviewPage.verifyToastMessageIsVisibleWithText('Recognition published');
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to you, your manager and app administrators'
      );

      // Validate the new Entry in the Downloaded CSV file
      const csvUtils = new CSVUtils('./downloads');
      await manageRewardsOverviewPage.loadPage();

      const [download] = await Promise.all([
        appManagerPage.waitForEvent('download'),
        manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityTableDownloadCSVButton, {
          stepInfo: 'Clicking on Download CSV button',
        }),
      ]);

      await download.saveAs(path.resolve('./downloads', download.suggestedFilename()));

      // Validate last row column values
      let validationResult = await csvUtils.validateRowValue('last', 14, 'PENDING');
      expect(validationResult.isMatch, `Expected "PENDING" but got "${validationResult.actualValue}"`).toBeTruthy();

      validationResult = await csvUtils.validateRowValue('last', 15, recognitionPostMessage);
      expect(
        validationResult.isMatch,
        `Expected "${recognitionPostMessage}" but got "${validationResult.actualValue}"`
      ).toBeTruthy();

      const appURL = process.env.FRONTEND_BASE_URL || 'https://reco.qa.simpplr.xyz';
      validationResult = await csvUtils.validateRowValue(
        'last',
        16,
        `${appURL}/recognition/recognition/${recognitionPostId}`
      );
      expect(
        validationResult.isMatch,
        `Expected "${appURL}/recognition/recognition/${recognitionPostId}" but got "${validationResult.actualValue}"`
      ).toBeTruthy();

      fs.unlinkSync(csvUtils.getLatestCSV());
      await appManagerPage.goto(`${appURL}/recognition/recognition/${recognitionPostId}`);
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to you, your manager and app administrators'
      );

      // Delete the Recognition post and validate the Download CSV again
      await recognitionHub.deleteTheFirstRecognitionPost();

      // Validate the new Entry in the Downloaded CSV file after deletion
      const [downloadAfterDelete] = await Promise.all([
        appManagerPage.waitForEvent('download'),
        manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityTableDownloadCSVButton, {
          stepInfo: 'Clicking on Download CSV button after deletion',
        }),
      ]);

      await downloadAfterDelete.saveAs(path.resolve('./downloads', downloadAfterDelete.suggestedFilename()));

      // Validate last row column values after deletion
      validationResult = await csvUtils.validateRowValue('last', 14, 'REJECTED');
      expect(validationResult.isMatch, `Expected "REJECTED" but got "${validationResult.actualValue}"`).toBeTruthy();

      validationResult = await csvUtils.validateRowValue('last', 15, 'deleted');
      expect(validationResult.isMatch, `Expected "deleted" but got "${validationResult.actualValue}"`).toBeTruthy();

      validationResult = await csvUtils.validateRowValue('last', 16, 'deleted');
      expect(validationResult.isMatch, `Expected "deleted" but got "${validationResult.actualValue}"`).toBeTruthy();

      fs.unlinkSync(csvUtils.getLatestCSV());
      await appManagerPage.goto(`${appURL}/recognition/recognition/${recognitionPostId}`);
      await recognitionHub.validateTheRecognitionPostIsDeleted();
    }
  );

  test(
    '[RC-6082] Validate the Message and URL column value in the points given CSV for the Recognition with the points',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_DB_CASES, REWARD_FEATURE_TAGS.REWARDS_ACTIVITY_TABLE, TestPriority.P2],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description:
          'Validate the Message and URL column value in the points given CSV for the Recognition with the points',
        zephyrTestId: 'RC-6082',
        storyId: 'RC-6082',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
      const recognizedUser = process.env.STANDARD_USER_FULL_NAME || 'aishma enduser';

      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }

      await recognitionHub.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerPage);
      await giveRecognitionModal.selectTheUserForRecognition(recognizedUser);
      await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(1);
      const recognitionPostMessage = 'Test Message' + Math.floor(Math.random() * 1000);
      await giveRecognitionModal.enterTheRecognitionMessage(recognitionPostMessage);
      const rewardPointsText = await giveRecognitionModal.giftThePoints(1);

      const [response] = await Promise.all([
        appManagerPage.waitForResponse(resp => resp.url().includes('/recognition/create')),
        giveRecognitionModal.recognizeButton.click({ force: true }),
      ]);

      const body = await response.json();
      if (!body || !body.id) throw new Error(`No id in response: ${JSON.stringify(body)}`);
      const recognitionPostId = String(body.id);

      // Handle dialog box if it appears
      const dialogBox = new DialogBox(appManagerPage);
      if (await dialogBox.container.isVisible()) {
        await dialogBox.container.waitFor({ state: 'visible' });
        await dialogBox.skipButton.click();
        await expect(dialogBox.container).not.toBeVisible();
      }

      await manageRewardsOverviewPage.verifyToastMessageIsVisibleWithText('Recognition published');
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to you, your manager and app administrators'
      );

      // Validate the new Entry in the Downloaded CSV file
      const csvUtils = new CSVUtils('./downloads');
      await manageRewardsOverviewPage.loadPage();

      const [download] = await Promise.all([
        appManagerPage.waitForEvent('download'),
        manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityTableDownloadCSVButton, {
          stepInfo: 'Clicking on Download CSV button',
        }),
      ]);

      await download.saveAs(path.resolve('./downloads', download.suggestedFilename()));
      let validationResult = await csvUtils.validateRowValue('last', 14, 'PENDING');
      expect(validationResult.isMatch, `Expected "PENDING" but got "${validationResult.actualValue}"`).toBeTruthy();

      validationResult = await csvUtils.validateRowValue('last', 15, recognitionPostMessage);
      expect(
        validationResult.isMatch,
        `Expected "${recognitionPostMessage}" but got "${validationResult.actualValue}"`
      ).toBeTruthy();

      const appURL = process.env.FRONTEND_BASE_URL || 'https://reco.qa.simpplr.xyz';
      validationResult = await csvUtils.validateRowValue(
        'last',
        16,
        `${appURL}/recognition/recognition/${recognitionPostId}`
      );
      expect(
        validationResult.isMatch,
        `Expected "${appURL}/recognition/recognition/${recognitionPostId}" but got "${validationResult.actualValue}"`
      ).toBeTruthy();

      fs.unlinkSync(csvUtils.getLatestCSV());
      await appManagerPage.goto(`${appURL}/recognition/recognition/${recognitionPostId}`);
      await recognitionHub.validateTheRewardElementsInRecognitionPost(
        true,
        rewardPointsText,
        'Only visible to you, your manager and app administrators'
      );
      await recognitionHub.deleteTheFirstRecognitionPost();
    }
  );

  test.skip(
    '[RC-6099] Validate the Message and URL column value in the points given CSV for the Imported Data',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_DB_CASES, REWARD_FEATURE_TAGS.REWARDS_ACTIVITY_TABLE, TestPriority.P2],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate the Message and URL column value in the points given CSV for the Imported Data',
        zephyrTestId: 'RC-6099',
        storyId: 'RC-6099',
      });

      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);

      // Trigger the Reward Data Seeding
      await manageRewardsOverviewPage.verifier.waitUntilElementIsVisible(
        manageRewardsOverviewPage.activityContainer.last(),
        { timeout: 15000, stepInfo: 'Wait for activity container' }
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityPanelHeader.first()
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last()
      );

      // Get tenant code from the page
      const tenantCode = await appManagerPage.evaluate(() => {
        return (window as any).Simpplr?.Settings?.accountId;
      });

      if (!tenantCode) {
        throw new Error('Could not retrieve tenant code from the page');
      }

      // Execute database query to update allowance job record
      const { getQuery } = await import('@modules/reward/utils/dbQuery');
      const { executeQuery } = await import('@modules/reward/utils/dbUtils');

      const resultAsSuccess = getQuery('setTheLatestCreatedDateFromAllowanceJobRecord');
      await executeQuery(resultAsSuccess.replace(/tenantCode/g, tenantCode));

      // Navigate to distribute allowances page
      await appManagerPage.goto('/manage/recognition/seed');
      await appManagerPage.waitForTimeout(15000);

      // Validate the new Entry in the Downloaded CSV file
      const csvUtils = new CSVUtils('./downloads');
      await manageRewardsOverviewPage.loadPage();
      await appManagerPage.reload();

      await manageRewardsOverviewPage.verifier.waitUntilElementIsVisible(
        manageRewardsOverviewPage.activityContainer.last(),
        { timeout: 15000, stepInfo: 'Wait for activity container after reload' }
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.activityPanelHeader.first()
      );
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityPointsGivenTable, {
        stepInfo: 'Clicking on Points Given filter',
        force: true,
      });

      const [download] = await Promise.all([
        appManagerPage.waitForEvent('download'),
        manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityTableDownloadCSVButton, {
          stepInfo: 'Clicking on Download CSV button',
        }),
      ]);

      await download.saveAs(path.resolve('./downloads', download.suggestedFilename()));
      let validationResult = await csvUtils.validateRowValue('last', 14, 'APPROVED');
      expect(validationResult.isMatch, `Expected "APPROVED" but got "${validationResult.actualValue}"`).toBeTruthy();
      validationResult = await csvUtils.validateRowValue('last', 15, 'import');
      expect(validationResult.isMatch, `Expected "import" but got "${validationResult.actualValue}"`).toBeTruthy();
      validationResult = await csvUtils.validateRowValue('last', 16, 'import');
      expect(validationResult.isMatch, `Expected "import" but got "${validationResult.actualValue}"`).toBeTruthy();
      fs.unlinkSync(csvUtils.getLatestCSV());
    }
  );

  test(
    '[RC-3021] Validate Rewards Overview Activity Table for points redeemed',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Rewards Overview Activity Table for points redeemed',
        zephyrTestId: 'RC-3021',
        storyId: 'RC-3021',
      });
      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerPage);

      // Redeem gift card and validate activity table
      await manageRewardsPage.redeemGiftCardAndValidateActivityTable('Amazon');

      // Verify the activity table for the gift card
      await manageRewardsPage.verifyTheActivityTableForGiftCard();
    }
  );
});
