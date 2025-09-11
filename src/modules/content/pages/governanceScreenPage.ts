import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { GovernanceComponent } from '../components/governanceComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { ManageApplicationComponent } from '@/src/modules/content/components/manageApplicationComponent';

export interface IGovernanceScreenPageActions {
  clickOnTimeline: () => Promise<void>;
  clickOnSave: () => Promise<void>;
}

export interface IFeaturedSiteAssertions {}
export class GovernanceScreenPage extends BasePage {
  private governanceComponent: GovernanceComponent;
  actions: any;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.GOVERNANCE_SCREEN);
    this.governanceComponent = new GovernanceComponent(page);
    this.actions = {
      clickOnTimeline: this.clickOnTimeline.bind(this),
      clickOnSave: this.clickOnSave.bind(this),
    };
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify governance page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.governanceComponent.timelineAndFeed, {
        assertionMessage: 'Governance page should be visible',
      });
    });
  }

  async clickOnTimeline(): Promise<void> {
    await test.step('Clicking on timeline', async () => {
      await this.clickOnElement(this.governanceComponent.clickOnTimeline);
    });
  }

  async clickOnSave(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.governanceComponent.clickOnSave);
    });
  }
}
