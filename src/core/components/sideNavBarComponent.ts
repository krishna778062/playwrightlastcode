import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';
import type { TestOptions } from '@/src/core/types/test.types';
import { AnalyticsLandingPage } from '@/src/modules/data-engineering/pages/analyticsLandingPage';

export class SideNavBarComponent extends BaseComponent {
  readonly createSection: Locator;
  readonly feedLink: Locator;
  readonly homeLink: Locator;
  readonly analyticsButton: Locator;
  readonly sitesButton: Locator;
  readonly applicationSettings: Locator;
  readonly rolesButton: Locator;

  constructor(page: Page) {
    super(page);
    this.createSection = page.locator('span', { hasText: 'Create' });
    this.analyticsButton = page.getByRole('menuitem', { name: 'Analytics', exact: true });
    this.feedLink = page.locator('p', { hasText: 'Feed' });
    this.homeLink = page.locator('p', { hasText: 'Home' });
    this.applicationSettings = page.locator('p', { hasText: 'Application settings' });
    this.sitesButton = page.getByRole('menuitem', { name: 'Sites Sites' });
    this.rolesButton = page.getByRole('menuitem', { name: 'Roles' });
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
      if (await this.verifier.isTheElementVisible(this.feedLink)) {
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

  /**
   * Clicks on the Sites button in the side navigation
   * @param options - The options for the step
   */
  async clickOnSites(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `Clicking Sites button in side navigation`, async () => {
      // Wait for the menuitem to be ready
      await this.sitesButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.sitesButton.waitFor({ state: 'attached', timeout: 5000 });

      // Click on sites button using framework method
      await this.clickOnElement(this.sitesButton);
    });
  }

  /**
   * Clicks on the Home button in the side navigation
   * @param options - The options for the step
   */
  async clickOnHome(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `Clicking Home button in side navigation`, async () => {
      await this.clickOnElement(this.homeLink);
    });
  }

  /**
   * Clicks on the application settings button on the side navigation panel
   * @param options - The options for the step
   */
  async clickOnApplicationSettings(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `Clicking Application settings button in side navigation`, async () => {
      await this.clickOnElement(this.applicationSettings);
    });
  }

  /**
   * Verifies the visibility of Roles button on the side navigation panel
   * @param visible - The visibility of the Roles button
   * @param options - The options for the step
   */
  async verifyRolesButtonVisibility(visible: boolean, options?: TestOptions): Promise<void> {
    const defaultStep = visible
      ? 'Verifying Roles button is visible in side navigation'
      : 'Verifying Roles button is not visible in side navigation';
    await test.step(options?.stepInfo || defaultStep, async () => {
      if (visible) {
        await expect(this.rolesButton).toBeVisible();
      } else {
        await expect(this.rolesButton).not.toBeVisible();
      }
    });
  }
}
