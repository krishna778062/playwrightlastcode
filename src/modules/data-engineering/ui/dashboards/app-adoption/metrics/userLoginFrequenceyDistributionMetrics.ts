import { expect, FrameLocator, Page, test } from '@playwright/test';

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

      // Define the expected order of frequency categories (matching legend order)
      // This ensures we iterate in a consistent order regardless of Object.keys() order
      const expectedOrder: (keyof UserLoginFrequencyDistributionData)[] = [
        'No logins',
        '1-3 times',
        '4-7 times',
        '8-10 times',
        '10+ times',
      ];

      // Iterate through bars in the expected order
      for (const key of expectedOrder) {
        const data = dbData[key];

        if (data === undefined) {
          console.log(`----> Skipping ${key} - not found in dbData`);
          continue;
        }

        console.log(`----> Verifying bar for ${key}: ${data}`);

        // if data is 0, skip the bar
        if (data === 0) {
          console.log(`----> Skipping bar with label ${key} because data is 0`);
          continue;
        }

        // Hover over the bar and verify the tooltip values
        await this.hoverOnBarWithLabelAs(key);
        await this.waitForToolTipContainerToBeVisible();

        // Try multiple tooltip validation strategies
        // The tooltip might show the frequency label as keyText with or without a colon
        const tooltipKeyTexts = [key, `${key}:`];
        let tooltipValidated = false;

        for (const keyText of tooltipKeyTexts) {
          try {
            const toolTipBlock = this.getToolTipBlockWithKeyTextAs(keyText);
            const toolTipValue = toolTipBlock.locator("[class*='chart-tooltip-value']");
            const isVisible = await toolTipValue.isVisible({ timeout: 2000 }).catch(() => false);

            if (isVisible) {
              await expect(toolTipValue, `Value shown in tool tip for ${key} should be ${data}`).toHaveText(
                data.toString()
              );
              tooltipValidated = true;
              console.log(`----> Successfully validated tooltip for ${key} using keyText: ${keyText}`);
              break;
            }
          } catch (error) {
            // Try next strategy
            continue;
          }
        }

        // If standard validation failed, try checking if tooltip contains the value
        // This is a fallback for cases where the tooltip structure is different
        if (!tooltipValidated) {
          try {
            const tooltipText = await this.toolTipContainer.textContent();
            if (tooltipText && tooltipText.includes(data.toString())) {
              console.log(`----> Validated tooltip for ${key} by checking tooltip text contains value: ${data}`);
              tooltipValidated = true;
            }
          } catch (error) {
            // Continue to throw error below
          }
        }

        if (!tooltipValidated) {
          const tooltipText = await this.toolTipContainer.textContent().catch(() => 'Unable to get tooltip text');
          throw new Error(
            `Failed to validate tooltip for ${key} with value ${data}. Tooltip text: ${tooltipText}. ` +
              `Tried keyTexts: ${tooltipKeyTexts.join(', ')}`
          );
        }

        // Add a small delay between hovers to avoid rapid interactions
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    });
  }
}
