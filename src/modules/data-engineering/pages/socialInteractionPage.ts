import { HeroMetricsComponent } from '@data-engineering/components/heroMetricsComponent';
import { DateHelper } from '@data-engineering/helpers/dateHelper';
import { SnowflakeHelper } from '@data-engineering/helpers/snowflakeHelper';
import { SocialInteractionSql } from '@data-engineering/sql/social-interaction';
import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { AnalyticsBasePage } from '@/src/modules/data-engineering/pages/analyticsBasePage';

export class SocialInteractionPage extends AnalyticsBasePage {
  readonly socialInteractionTab: Locator;
  readonly heroMetrics: HeroMetricsComponent;

  constructor(page: Page, pageUrl?: string) {
    super(page, pageUrl ?? '/analytics/social-interaction');

    this.heroMetrics = new HeroMetricsComponent(page);
    this.socialInteractionTab = this.page.getByRole('tab', { name: 'Social interaction' }).first();
  }

  async navigateToSocialInteraction(): Promise<void> {
    await test.step('Navigate to Social Interaction page', async () => {
      await this.clickOnElement(this.socialInteractionTab);
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Social Interaction page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.socialInteractionTab, {
        timeout: TIMEOUTS.VERY_LONG,
        assertionMessage: 'Social Interaction tab should be visible and active',
      });
    });
  }

  async getHeroMetricValue(metricTitle: string): Promise<string> {
    return await this.heroMetrics.getMetricValue(metricTitle);
  }

  async verifyHeroMetricHasValidValue(metricTitle: string): Promise<void> {
    await this.heroMetrics.verifyMetricHasValidValue(metricTitle);
  }

  async verifySocialCampaignShareNumberOfColumnsIsCorrect(): Promise<void> {
    await test.step(`Verify social campaign share number of columns is correct`, async () => {
      const socialCampaignShareData = await this.heroMetrics.getTableColumnHeaderText(
        'Social campaign share distribution'
      );
      expect(socialCampaignShareData.length, `Social campaign share data should have 3 columns`).toBe(3);
    });
  }

  async getSocialCampaignShareData(query: string, orgId: string, timePeriod: string): Promise<any[]> {
    const sqlKey = query.split('.').pop() as keyof typeof SocialInteractionSql;
    const rawSql = SocialInteractionSql[sqlKey];
    const dbResult = await SnowflakeHelper.runQueryWithReplacements(rawSql, {
      orgId: orgId,
      daysToSubtract: DateHelper.getPeriodDays(timePeriod),
    });
    return dbResult;
  }

  async getHeroMetricDataFromDB(query: string, orgId: string, timePeriod: string): Promise<number> {
    const sqlKey = query.split('.').pop() as keyof typeof SocialInteractionSql;
    const rawSql = SocialInteractionSql[sqlKey];
    console.log(rawSql);
    const dbResult = await SnowflakeHelper.runQueryWithReplacements(rawSql, {
      orgId: orgId,
      daysToSubtract: DateHelper.getPeriodDays(timePeriod),
    });
    // Extract the numeric value from the first column
    const firstResult = dbResult[0];
    const dbValue = Object.values(firstResult)[0];
    return typeof dbValue === 'string' ? parseInt(dbValue, 10) : Number(dbValue);
  }

  async isCampaignShareDataAvailable(dbResult: any[]): Promise<boolean> {
    if (dbResult.length === 0) {
      return false;
    }
    return (
      dbResult[0].TOTAL_SHARE ||
      dbResult[0].FACEBOOK_SHARE ||
      dbResult[0].LINKEDIN_SHARE ||
      dbResult[0].TWITTER_SHARE > 0
    );
  }

  async verifySocialCampaignShareDataMatchesWithUDL(dbResult: any[]): Promise<void> {
    await test.step(`Verify social campaign share data is correct`, async () => {
      const uiDataArray = await this.extractUIAsArray();
      const dbDataArray = this.convertDBToArray(dbResult[0]);
      await this.compareArrays(uiDataArray, dbDataArray);
    });
  }

  private async extractUIAsArray(): Promise<string[][]> {
    const tableDataElements = await this.analyticsBaseComponent.getTableData('Social campaign share distribution');
    const uiData: string[][] = [];

    for (const rowElement of tableDataElements) {
      const cells = await rowElement.locator('div[role="gridcell"]').all();

      if (cells.length >= 3) {
        const platform = (await cells[0].textContent())?.trim() || '';
        const shareCount = (await cells[1].textContent())?.trim() || '0';
        const percentage = (await cells[2].textContent())?.trim() || '0%';

        uiData.push([platform, shareCount, percentage]);
      }
    }

    console.log('UI Data Array:', uiData);
    return uiData;
  }

  private convertDBToArray(dbData: any): string[][] {
    const dbArray: string[][] = [];

    // Only add non-zero entries to DB array
    if (dbData.FACEBOOK_SHARE > 0) {
      dbArray.push(['Facebook', dbData.FACEBOOK_SHARE.toString(), `${dbData.FACEBOOK_PERCENT}%`]);
    }
    if (dbData.LINKEDIN_SHARE > 0) {
      dbArray.push(['LinkedIn', dbData.LINKEDIN_SHARE.toString(), `${dbData.LINKEDIN_PERCENT}%`]);
    }
    if (dbData.TWITTER_SHARE > 0) {
      dbArray.push(['Twitter', dbData.TWITTER_SHARE.toString(), `${dbData.TWITTER_PERCENT}%`]);
    }

    console.log('DB Data Array (non-zero only):', dbArray);
    return dbArray;
  }

  private async compareArrays(uiData: string[][], dbData: string[][]): Promise<void> {
    for (const uiEntry of uiData) {
      const [platform, shareCount, percentage] = uiEntry;

      // Find matching entry in DB data
      const dbEntry = dbData.find(db => db[0] === platform);

      if (dbEntry) {
        const [, dbShareCount, dbPercentage] = dbEntry;

        console.log(`\nChecking ${platform}:`);
        console.log(`  UI: [${platform}, ${shareCount}, ${percentage}]`);
        console.log(`  DB: [${platform}, ${dbShareCount}, ${dbPercentage}]`);

        // Compare with tolerance
        const shareDiff = Math.abs(parseInt(shareCount) - parseInt(dbShareCount));
        const percentDiff = Math.abs(
          parseFloat(percentage.replace('%', '')) - parseFloat(dbPercentage.replace('%', ''))
        );

        expect(shareDiff, `${platform} share count should match`).toBeLessThanOrEqual(1);
        expect(percentDiff, `${platform} percentage should match`).toBeLessThanOrEqual(0.1);
      } else {
        throw new Error(`${platform} found in UI but not in DB`);
      }
    }
  }
}
