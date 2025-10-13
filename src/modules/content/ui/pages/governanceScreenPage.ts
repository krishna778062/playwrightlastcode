import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IGovernanceScreenPageActions {
  clickOnTimeline: () => Promise<void>;
  clickOnSave: () => Promise<void>;
}

export class GovernanceScreenPage extends BasePage implements IGovernanceScreenPageActions {
  // Governance locators (moved from GovernanceComponent)
  readonly timelineButton: Locator;
  readonly saveButton: Locator;
  readonly timelineAndFeed: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.GOVERNANCE_SCREEN);

    // Initialize Governance locators
    this.timelineButton = page.getByText('Timeline', { exact: true });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.timelineAndFeed = page.getByRole('heading', { name: 'Timeline & feed' });
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
      await this.clickOnElement(this.timelineButton);
    });
  }

  async clickOnSave(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.saveButton);
    });
  }
}
