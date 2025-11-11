import { FrameLocator, Page, test } from '@playwright/test';

import { UserLoginFrequencyDistributionData } from '@/src/modules/data-engineering/helpers/appAdaptionQueryHelper';
import { HorizontalBarChartComponent } from '@/src/modules/data-engineering/ui/components/horizontalBarChartComponent';

export class UserLoginFrequencyDistributionMetrics extends HorizontalBarChartComponent {
  constructor(
    readonly page: Page,
    readonly thoughtSpotIframe: FrameLocator
  ) {
    super(page, thoughtSpotIframe, 'User login frequency distribution');
  }

  /**
   * Verifies the bars with tooltips for user login frequency distribution metric
   * @param dbData - The user login frequency distribution data from database
   * @example
   * const dbData = await appAdoptionQueryHelper.getUserLoginFrequencyDistributionDataFromDBWithFilters({ filterBy });
   * await userLoginFrequencyDistributionMetrics.verifyBarsWithTooltips(dbData);
   */
  async verifyBarsWithTooltips(dbData: UserLoginFrequencyDistributionData): Promise<void> {
    await test.step(`Verify bars with tooltips for user login frequency distribution metric`, async () => {
      console.log(`----> The user login frequency distribution data is  `, dbData);
      console.log(`----> Total data points: ${Object.values(dbData).length}`);

      // Get the actual number of bars in the DOM
      const barCount = await this.bars.count();
      console.log(`----> Total bars in DOM: ${barCount}`);

      // Iterate through all bars by DOM index (matching dbData order)
      for (let index = 0; index < Object.values(dbData).length && index < barCount; index++) {
        const key = Object.keys(dbData)[index];
        const data = Object.values(dbData)[index];
        console.log(`----> Data at index ${index}: ${data}`);

        // if data is 0, skip the bar
        if (data === 0) {
          console.log(`----> Skipping bar with label ${key} because data is 0`);
          continue;
        }

        // Hover over the bar and verify the tooltip values
        await this.hoverOnBarWithLabelAs(key);
        await this.waitForToolTipContainerToBeVisible();
        await this.validateValuesShownInToolTipAreAsExpected({
          labelsAndValues: [{ keyText: key, expectedValue: data.toString() }],
        });
      }
    });
  }
}
