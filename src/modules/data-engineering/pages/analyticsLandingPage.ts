import { expect, Locator, Page, test } from '@playwright/test';

import type { TestOptions } from '@/src/core/types/test.types';

export class AnalyticsLandingPage {
  readonly appAnalyticsButton: Locator;
  readonly recognitionAnalyticsButton: Locator;
  readonly campaignAnalyticsButton: Locator;

  constructor(page: Page) {
    this.appAnalyticsButton = page.getByRole('menuitem', { name: 'App' });
    this.recognitionAnalyticsButton = page.getByRole('menuitem', { name: 'Recognition' });
    this.campaignAnalyticsButton = page.getByRole('menuitem', { name: 'Campaigns' });
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
        await expect(this.appAnalyticsButton.first()).toBeVisible();
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
}
