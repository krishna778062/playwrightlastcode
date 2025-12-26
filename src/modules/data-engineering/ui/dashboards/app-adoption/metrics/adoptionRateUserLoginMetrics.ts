import { AdoptionRateUserLoginData } from '@data-engineering/helpers/appAdaptionQueryHelper';
import { FilterOptions } from '@data-engineering/helpers/baseAnalyticsQueryHelper';
import { DateHelper } from '@data-engineering/helpers/dateHelper';
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
   * Validates axis labels and chart structure based on filter configuration
   * Note: X-axis label values are not validated because Highcharts dynamically
   * determines which date labels to display based on chart width and data density.
   * @param filterBy - Filter options including time period
   */
  async verifyAxisLabelsForFilter(filterBy: FilterOptions): Promise<void> {
    await test.step(`Verify axis labels for filter: ${filterBy.timePeriod}`, async () => {
      // Get date replacements to calculate horizontal axis label
      const dateReplacements = DateHelper.getDateReplacements(
        filterBy.timePeriod,
        filterBy.customStartDate,
        filterBy.customEndDate
      );

      // Parse start and end dates to determine year span
      const startDateStr = dateReplacements.startDate.split(' ')[0];
      const endDateStr = dateReplacements.endDate.split(' ')[0];
      const startDate = DateHelper.parseIsoAsUTC(startDateStr);
      const endDate = DateHelper.parseIsoAsUTC(endDateStr);

      // Determine horizontal axis label based on whether dates span one or multiple years
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      const horizontalAxisLabel = startYear === endYear ? `Reporting date (for ${startYear})` : 'Reporting date';

      // Verify axis labels (title labels, not data labels)
      await this.verifyAxisLabelsAreAsExpected({
        verticalAxisLabel: 'Adoption rate',
        horizontalAxisLabel,
      });

      // Verify y-axis labels (hardcoded: always 0.0%, 50.0%, 100%)
      await this.verifyYAxisLabelsAreAsExpected({
        yAxisLabels: ['0.0%', '50.0%', '100.0%'],
      });

      // Verify that X-axis has date labels present (without checking specific values)
      // Highcharts dynamically determines which labels to show based on available space
      await this.verifyChartHasLabelsAndBars();
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

        // Skip bars with 0% adoption rate or 0 user logins (these bars exist but can't be hovered)
        if (data.userLogins === 0 || adoptionRateValue === 0) {
          console.log(
            `----> Skipping bar at index ${index} (Reporting date: ${data.reportingDate}, Adoption rate: ${data.adoptionRate}, User logins: ${data.userLogins})`
          );
          continue;
        }

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
        console.log(
          `----> Verified bar at index ${index} (Reporting date: ${data.reportingDate}, Adoption rate: ${data.adoptionRate}, User logins: ${data.userLogins})`
        );
        // Hold 1 second between hovers to avoid rapid interactions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
  }
}
