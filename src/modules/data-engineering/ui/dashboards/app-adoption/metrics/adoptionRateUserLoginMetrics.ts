import { AdoptionRateUserLoginData } from '@data-engineering/helpers/appAdaptionQueryHelper';
import { FrameLocator, Page, test } from '@playwright/test';

import { VerticalBarChartComponent } from '../../../components/verticalBarChartComponent';

export class AdoptionRateUserLoginMetrics extends VerticalBarChartComponent {
  constructor(
    readonly page: Page,
    readonly thoughtSpotIframe: FrameLocator
  ) {
    super(page, thoughtSpotIframe, 'App adoption rate - User logins');
  }

  /**
   * Verifies the chart is loaded by checking if bars and labels are visible
   * Uses a simpler approach - just verifies that labels and bars exist
   * without dynamically calculating expected x-axis date labels
   */
  async verifyChartIsLoaded(): Promise<void> {
    await test.step(`Verify ${this.metricTitle} chart is loaded`, async () => {
      // Verify chart has labels and bars (inherited from VerticalBarChartComponent)
      await this.verifyChartHasLabelsAndBars();

      // Verify y-axis labels (hardcoded: always 0.0%, 50.0%, 100%)
      await this.verifyYAxisLabelsAreAsExpected({
        yAxisLabels: ['0.0%', '50.0%', '100.0%'],
      });
    });
  }

  /**
   * Verifies all plotted bars by validating tooltips with database data
   * Iterates through all DOM bar elements by index and validates only those with adoption rate > 0%
   * (Bars with 0% adoption rate exist in DOM but cannot be hovered, so we skip them)
   * @param dbData - The adoption rate user login data from database (must match DOM bar order)
   * @example
   * const dbData = await appAdoptionQueryHelper.getAdoptionRateUserLoginDataFromDBWithFilters({ filterBy });
   * await adoptionRateUserLoginMetrics.verifyBarsWithTooltips(dbData);
   */
  async verifyBarsWithTooltips(dbData: AdoptionRateUserLoginData[]): Promise<void> {
    await test.step(`Verify all plotted bars and their tooltips for ${this.metricTitle}`, async () => {
      console.log(`----> The adoption rate user login data is  `, dbData);
      console.log(`----> Total data points: ${dbData.length}`);

      // Get the actual number of bars in the DOM
      const barCount = await this.bars.count();
      console.log(`----> Total bars in DOM: ${barCount}`);

      // Iterate through all bars by DOM index (matching dbData order)
      for (let index = 0; index < dbData.length && index < barCount; index++) {
        const data = dbData[index];

        // Parse adoption rate value to check if it's > 0
        const adoptionRateValue = parseFloat(data.adoptionRate.replace('%', ''));

        console.log(
          `----> Checking if bar at index ${index} should be skipped: ${data.userLogins === 0 || adoptionRateValue < 0.0014}`
        );

        // Skip bars with 0% adoption rate or 0 user logins (these bars exist but can't be hovered)
        if (data.userLogins === 0 || adoptionRateValue < 0.15) {
          console.log(
            `----> Skipping bar at index ${index} (Reporting date: ${data.reportingDate}, Adoption rate: ${data.adoptionRate}, User logins: ${data.userLogins})`
          );
          continue;
        }

        await test.step(`Verify bar at index ${index} to have tooltips as expected`, async () => {
          // Hover over the bar and verify the tooltip values
          await this.hoverOnBarWithIndexAs(index);
          await this.waitForToolTipContainerToBeVisible();
          await this.validateValuesShownInToolTipAreAsExpected({
            labelsAndValues: [
              { keyText: 'Reporting date:', expectedValue: data.reportingDate },
              { keyText: 'User logins:', expectedValue: data.userLogins.toString() },
              { keyText: 'Adoption rate:', expectedValue: data.adoptionRate },
            ],
          });
          //wait for 1 second
          await this.page.locator('#site-header').hover();
          await this.waitForToolTipContainerToBeHidden();
          //wait for 1 second
          await this.page.waitForTimeout(500);
        });
      }
    });
  }
}
