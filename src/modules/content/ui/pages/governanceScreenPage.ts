import { Page, test } from '@playwright/test';

import { GovernanceComponent } from '../components/governanceComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IGovernanceScreenPageActions {
  clickOnTimeline: () => Promise<void>;
  clickOnSave: () => Promise<void>;
}

export class GovernanceScreenPage extends BasePage {
  private governanceComponent: GovernanceComponent;
  actions: any;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.GOVERNANCE_SCREEN);
    this.governanceComponent = new GovernanceComponent(page);
    this.actions = {
      clickOnTimeline: this.clickOnTimeline.bind(this),
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
      const outerHTML = await this.governanceComponent.clickOnTimeline.evaluate(el => el.outerHTML);
      const isChecked = outerHTML.includes('checked');
      if (isChecked === true) {
        console.log('Timeline is already checked');
        return;
      }
      await this.clickOnElement(this.governanceComponent.clickOnTimeline);
      await this.clickOnElement(this.governanceComponent.clickOnSave);
    });
  }
}
