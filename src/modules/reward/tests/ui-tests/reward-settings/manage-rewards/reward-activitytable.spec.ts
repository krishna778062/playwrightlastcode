import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { TestDbScenarios } from '@rewards/utils/testDatabaseHelper';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';

import { CSVUtils } from '@core/utils/csvUtils';

import { FileUtil, tagTest, TestPriority } from '@/src/core';

test(
  '[RC-6099] Validate the Message and URL column value in the points given CSV for the Imported Data',
  {
    tag: [
      REWARD_FEATURE_TAGS.REWARDS_ACTIVITY_TABLE,
      REWARD_FEATURE_TAGS.REWARDS_DB_CASES,
      REWARD_FEATURE_TAGS.REWARDS_CSV_CASES,
      TestPriority.P3,
    ],
  },
  async ({ appManagerFixture }) => {
    tagTest(test.info(), {
      description: 'Validate the Message and URL column value in the points given CSV for the Imported Data',
      zephyrTestId: 'RC-6099',
      storyId: 'RC-6099',
    });

    const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerFixture.page);

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
    const tenantCode = await appManagerFixture.page.evaluate(() => {
      return (window as any).Simpplr?.Settings?.accountId;
    });

    if (!tenantCode) {
      throw new Error('Could not retrieve tenant code from the page');
    }

    // Execute database query to update allowance job record
    await TestDbScenarios.setupImportedData(tenantCode);

    // Navigate to distribute allowances page
    await manageRewardsOverviewPage.page.goto('/manage/recognition/seed');

    // Validate the new Entry in the Downloaded CSV file
    await manageRewardsOverviewPage.loadPage();
    await appManagerFixture.page.reload();

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

    // Download with unique filename using BaseActionUtil
    const csvFile = await manageRewardsOverviewPage.downloadAndSaveFile(
      () =>
        manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.activityTableDownloadCSVButton, {
          stepInfo: 'Clicking on Download CSV button',
        }),
      { stepInfo: 'Download CSV file' }
    );

    try {
      let validationResult = await CSVUtils.validateRowValue('last', 14, 'APPROVED', csvFile.filePath);
      expect(validationResult.isMatch, `Expected "APPROVED" but got "${validationResult.actualValue}"`).toBeTruthy();
      validationResult = await CSVUtils.validateRowValue('last', 15, 'import', csvFile.filePath);
      expect(validationResult.isMatch, `Expected "import" but got "${validationResult.actualValue}"`).toBeTruthy();
      validationResult = await CSVUtils.validateRowValue('last', 16, 'import', csvFile.filePath);
      expect(validationResult.isMatch, `Expected "import" but got "${validationResult.actualValue}"`).toBeTruthy();
    } finally {
      // Clean up using FileUtil
      FileUtil.deleteTemporaryFile(csvFile.filePath);
    }
  }
);
