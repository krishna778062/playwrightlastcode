import { AnalyticsBaseComponent } from '@data-engineering/components/analyticsBaseComponent';
import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import type { TestOptions } from '@/src/core/types/test.types';
import { BasePage } from '@/src/core/ui/pages/basePage';

export class AnalyticsBasePage extends BasePage {
  readonly appAnalyticsButton: Locator;
  readonly recognitionAnalyticsButton: Locator;
  readonly campaignAnalyticsButton: Locator;
  readonly analyticsBaseComponent: AnalyticsBaseComponent;

  constructor(page: Page, pageUrl?: string) {
    super(page, pageUrl);
    this.appAnalyticsButton = page.getByRole('button', { name: 'App', exact: true });
    this.recognitionAnalyticsButton = page.getByRole('button', { name: 'Recognition' });
    this.campaignAnalyticsButton = page.getByRole('button', { name: 'Campaigns' });
    this.analyticsBaseComponent = new AnalyticsBaseComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifyAllAnalyticsOptionsAreVisible();
  }

  async clickOnAppAnalyticsButton(options?: TestOptions) {
    await test.step(options?.stepInfo || `Clicking App Analytics button in analytics landing page`, async () => {
      await this.appAnalyticsButton.first().click();
    });
  }

  async clickOnRecognitionAnalyticsButton(options?: TestOptions) {
    await test.step(
      options?.stepInfo || `Clicking Recognition Analytics button in analytics landing page`,
      async () => {
        await this.recognitionAnalyticsButton.first().click();
      }
    );
  }

  async clickOnCampaignAnalyticsButton(options?: TestOptions) {
    await test.step(options?.stepInfo || `Clicking Campaign Analytics button in analytics landing page`, async () => {
      await this.campaignAnalyticsButton.first().click();
    });
  }

  async verifyAppAnalyticsButtonIsVisible(options?: TestOptions): Promise<void> {
    await test.step(
      options?.stepInfo || `Verifying App Analytics button is visible in analytics landing page`,
      async () => {
        await expect(this.appAnalyticsButton.first()).toBeVisible({ timeout: TIMEOUTS.SHORT });
      }
    );
  }

  async verifyRecognitionAnalyticsButtonIsVisible(options?: TestOptions): Promise<void> {
    await test.step(
      options?.stepInfo || `Verifying Recognition Analytics button is visible in analytics landing page`,
      async () => {
        await expect(this.recognitionAnalyticsButton.first()).toBeVisible();
      }
    );
  }

  async verifyCampaignAnalyticsButtonIsVisible(options?: TestOptions): Promise<void> {
    await test.step(
      options?.stepInfo || `Verifying Campaign Analytics button is visible in analytics landing page`,
      async () => {
        await expect(this.campaignAnalyticsButton.first()).toBeVisible();
      }
    );
  }

  async verifyAllAnalyticsOptionsAreVisible(options?: TestOptions): Promise<void> {
    await this.verifyAppAnalyticsButtonIsVisible(options);
    await this.verifyRecognitionAnalyticsButtonIsVisible(options);
    await this.verifyCampaignAnalyticsButtonIsVisible(options);
  }

  async verifyTableColumnHeaderTextIsVisible(metricTitle: string, columnTitles: string[]): Promise<void> {
    await this.analyticsBaseComponent.verifyTableColumnHeaderTextIsVisible(metricTitle, columnTitles);
  }

  async scrollToAnswer(metricTitle: string): Promise<void> {
    await this.analyticsBaseComponent.scrollToAnswer(metricTitle);
  }

  async verifyAnswerTitleIsVisible(metricTitle: string): Promise<void> {
    await this.analyticsBaseComponent.verifyAnswerTitleIsVisible(metricTitle);
  }

  async verifyAnswerSubTitleIsVisible(metricSubTitle: string): Promise<void> {
    await this.analyticsBaseComponent.verifyAnswerSubTitleIsVisible(metricSubTitle);
  }

  async verifyLowFilterResultMessageIsVisible(title: string): Promise<void> {
    await this.analyticsBaseComponent.verifyNoDataMessageIsVisible(title);
  }
}
