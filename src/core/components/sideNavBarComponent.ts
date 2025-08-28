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
  readonly clickOnFeed: Locator;
  readonly verfiyFeedSection: Locator;
  readonly clickOnContQA: Locator;
  readonly clickOnFeedSideMenu: Locator;

  constructor(page: Page) {
    super(page);
    this.createSection = page.locator('span', { hasText: 'Create' });
    this.analyticsButton = page.getByRole('menuitem', { name: 'Analytics', exact: true });
    this.feedLink = page.locator('p', { hasText: 'Feed' });
    this.homeLink = page.locator('p', { hasText: 'Home' });
    this.sitesButton = page.getByRole('button', { name: 'Sites' });
    this.navigateOnApplication = page.locator('[aria-label="Application settings"]').last();
    this.clickOnApplication = page.locator('[data-testid="landing-page-item"]:has-text("Application")');
    this.clickOnGovernance = page.locator('a[role="tab"]#governance');
    this.clickOnTimeline = page.locator('#feedMode_timeline');
    this.clickOnSave = page.locator('button[type="submit"]');
    this.clickOnManageFeature = page.locator('[aria-label="Manage features"]').first();
    this.clickOnContentCard = page.locator('[data-testid="landing-page-item"]').first();
    this.clickOnContent = page.locator(
      '[href="/site/524199e6-88b7-45d5-8088-774718ed3b11/album/89bf220a-c291-4844-a740-f442241c7236?utm_medium=internal&utm_source=my_content"]'
    );
    this.checkCommentOption = page.locator('button[title="Post on this content"]');
    this.clickOnSitesCard = page.locator('[data-testid="landing-page-item"]:has-text("Sites")');
    this.clickOnSite = page.locator('[href="/manage/sites/1ba05ddd-35d5-4764-9a7b-337755382ce0/setup"]').first();
    this.ViewSite = page.locator('[href="/site/1ba05ddd-35d5-4764-9a7b-337755382ce0"]').first();
    this.clickOnFeed = page.locator('[href="/site/1ba05ddd-35d5-4764-9a7b-337755382ce0/feed"]');
    this.verfiyFeedSection = page.locator('[id="defaultToastContainer"]').first();
    this.clickOnContQA = page.locator('[aria-label="User mode"]').first();
    this.clickOnFeedSideMenu = page.locator('[data-testid="icon-test"]').nth(1);
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
}
