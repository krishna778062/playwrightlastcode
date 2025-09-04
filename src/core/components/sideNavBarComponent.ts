import { expect, Locator, Page, test } from '@playwright/test';
import { text } from 'stream/consumers';

import { BaseComponent } from '@/src/core/components/baseComponent';
import type { TestOptions } from '@/src/core/types/test.types';
import { AnalyticsLandingPage } from '@/src/modules/data-engineering/pages/analyticsLandingPage';

export class SideNavBarComponent extends BaseComponent {
  readonly createSection: Locator;
  readonly feedLink: Locator;
  readonly homeLink: Locator;
  readonly analyticsButton: Locator;
  readonly sitesButton: Locator;
  readonly navigateOnApplication: Locator;
  readonly clickOnApplication: Locator;
  readonly clickOnGovernance: Locator;
  readonly clickOnTimeline: Locator;
  readonly clickOnSave: Locator;
  readonly clickOnManageFeature: Locator;
  readonly clickOnContentCard: Locator;
  readonly clickOnContent: Locator;
  readonly checkCommentOption: Locator;
  readonly clickOnSitesCard: Locator;
  readonly clickOnSite: Locator;
  readonly ViewSite: Locator;
  readonly verfiyFeedSection: Locator;
  readonly clickingOnHome: Locator;
  readonly clickOnFeedSideMenu: Locator;
  readonly clickOnSettingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.createSection = page.locator('span', { hasText: 'Create' });
    this.analyticsButton = page.getByRole('menuitem', { name: 'Analytics', exact: true });
    this.feedLink = page.locator('p', { hasText: 'Feed' });
    this.homeLink = page.locator('p', { hasText: 'Home' });
    this.sitesButton = page.getByRole('button', { name: 'Sites' });
    this.navigateOnApplication = page.getByRole('menuitem', { name: 'Application settings', exact: true });
    this.clickOnApplication = page.getByRole('button', { name: 'Application' });
    this.clickOnGovernance = page.getByRole('tab', { name: 'Governance' });
    this.clickOnTimeline = page.getByText('Timeline', { exact: true });
    this.clickOnSave = page.getByRole('button', { name: 'Save' });
    this.clickOnManageFeature = page.getByRole('menuitem', { name: 'Manage features', exact: true });
    this.clickOnContentCard = page.getByRole('button', { name: 'Content', exact: true });
    this.clickOnContent = page.locator('[aria-label="Select"]').first();
    this.checkCommentOption = page.getByRole('button', { name: 'Post on this content' });
    this.clickOnSitesCard = page.getByRole('menuitem', { name: 'Sites Sites' });
    this.clickOnSite = page.getByRole('cell', { name: 'Name' });
    this.ViewSite = page.getByRole('link', { name: 'View site' });
    this.verfiyFeedSection = page.locator('[id="defaultToastContainer"]').first();
    this.clickingOnHome = page.getByRole('menuitem', { name: 'User mode' });
    this.clickOnFeedSideMenu = page.getByRole('menuitem', { name: 'Feed Feed' });
    this.clickOnSettingButton = page.getByRole('menuitem', { name: 'Application settings', exact: true });
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

  async clickOnApplicationSettings(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `Clicking Application Settings button in side navigation`, async () => {
      await this.clickOnElement(this.clickOnSettingButton);
    });
  }
}
