import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';
import type { TestOptions } from '@/src/core/types/test.types';
import { AnalyticsLandingPage } from '@/src/modules/data-engineering/pages/analyticsLandingPage';

export class SideNavBarComponent extends BaseComponent {
  readonly createSection: Locator;
  readonly feedLink: Locator;
  readonly homeLink: Locator;
  readonly analyticsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.createSection = page.getByRole('button', { name: 'Create' });
    this.analyticsButton = page.getByRole('menuitem', { name: 'Analytics', exact: true });
    this.feedLink = page.locator('p', { hasText: 'Feed' });
    this.homeLink = page.locator('p', { hasText: 'Home' });
  }
  /**
   * Clicks on the Create button in the side navigation
   * @param options - The options for the step
   */
  async clickOnCreateButton(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `Clicking Create button in side navigation`, async () => {
      await this.clickOnElement(this.createSection);
    });
  }

  async clickOnGlobalFeed(): Promise<void> {
    await test.step('Clicking Global Feed button in side navigation', async () => {
      if (await this.verifier.verifyTheElementIsVisible(this.feedLink)) {
        await this.clickOnElement(this.feedLink);
      } else {
        await this.clickOnElement(this.homeLink);
      }
    });
  }

  async clickOnAnalyticsButton(options?: TestOptions): Promise<AnalyticsLandingPage> {
    await test.step(options?.stepInfo || `Clicking Analytics button in side navigation`, async () => {
      await this.clickOnElement(this.analyticsButton);
    });
    return new AnalyticsLandingPage(this.page);
  }

  async verifyAnalyticsButtonVisibility(visible: boolean, options?: TestOptions): Promise<void> {
    const defaultStep = visible
      ? 'Verifying Analytics button is visible in side navigation'
      : 'Verifying Analytics button is not visible in side navigation';
    await test.step(options?.stepInfo || defaultStep, async () => {
      if (visible) {
        await expect(this.analyticsButton).toBeVisible();
      } else {
        await expect(this.analyticsButton).not.toBeVisible();
      }
    });
  }
}
