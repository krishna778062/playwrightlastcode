import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IGovernanceScreenPageActions {
  clickOnTimeline: () => Promise<void>;
  clickOnSave: () => Promise<void>;
  clickOnTimelineFeedEnabled: () => Promise<void>;
}

export class GovernanceScreenPage extends BasePage implements IGovernanceScreenPageActions {
  // Governance locators (moved from GovernanceComponent)
  readonly clickOnTimelineButton: Locator;
  readonly clickOnSaveButton: Locator;
  readonly timelineAndFeed: Locator;
  readonly timelineFeedEnabled: Locator;
  readonly successToastMessage: (message: string) => Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.GOVERNANCE_SCREEN);

    this.clickOnTimelineButton = page.getByText('Timeline', { exact: true });
    this.timelineFeedEnabled = page.locator('#feedMode_timeline_comment_post');
    this.clickOnSaveButton = page.getByRole('button', { name: 'Save' });
    this.timelineAndFeed = page.getByRole('heading', { name: 'Timeline & feed' });
    this.successToastMessage = (message: string) => this.page.locator('div[class*="Toast-module"]').getByText(message);
  }

  get actions(): IGovernanceScreenPageActions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify governance page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.timelineAndFeed, {
        assertionMessage: 'Governance page should be visible',
      });
    });
  }

  async clickOnTimeline(): Promise<void> {
    await test.step('Clicking on timeline', async () => {
      await this.clickOnElement(this.clickOnTimelineButton);
    });
  }

  async clickOnSave(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.clickOnSaveButton);
    });
  }

  async clickOnTimelineFeedEnabled(): Promise<void> {
    await test.step('Clicking on timeline feed enabled if not already checked', async () => {
      const isChecked = await this.timelineFeedEnabled.isChecked();
      if (!isChecked) {
        await this.clickOnElement(this.timelineFeedEnabled);
        await this.clickOnElement(this.clickOnSaveButton);
        await this.verifier.verifyTheElementIsVisible(this.successToastMessage('Saved changes successfully'), {
          assertionMessage: 'Timeline feed should be enabled',
        });
      } else {
        console.log('Timeline feed is already enabled, skipping click');
      }
    });
  }
}
