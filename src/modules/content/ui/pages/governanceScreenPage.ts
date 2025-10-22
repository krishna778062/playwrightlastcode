import { Locator, Page, test } from '@playwright/test';

import { GovernanceComponent } from '../components/governanceComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';

export interface IGovernanceScreenPageActions {
  clickOnTimeline: () => Promise<void>;
  disableContentSubmissions: (message: string) => Promise<void>;
  enableContentSubmissions: (message: string) => Promise<void>;
}

export interface IGovernanceScreenPageAssertions {}

export class GovernanceScreenPage extends BasePage {
  private governanceComponent: GovernanceComponent;
  private baseActionUtil: BaseActionUtil;
  readonly clickOnContentSubmissions: Locator = this.page.locator('#contentSubmissions');
  readonly clickOnSave: Locator = this.page.getByRole('button', { name: 'Save' });
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.GOVERNANCE_SCREEN);
    this.governanceComponent = new GovernanceComponent(page);
    this.baseActionUtil = new BaseActionUtil(page);
  }

  get actions(): IGovernanceScreenPageActions {
    return this;
  }

  get assertions(): IGovernanceScreenPageAssertions {
    return this;
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
  async disableContentSubmissions(message: string): Promise<void> {
    await test.step('Clicking on content submissions checkbox', async () => {
      const outerHTML = await this.clickOnContentSubmissions.evaluate(el => el.outerHTML);
      const isChecked = outerHTML.includes('checked');
      if (isChecked === false) {
        console.log('Content submissions is already disabled');
        return;
      }
      await this.clickOnElement(this.clickOnContentSubmissions);
      await this.clickOnElement(this.clickOnSave);
      await this.baseActionUtil.verifyToastMessageIsVisibleWithText(message, {
        stepInfo: 'Verify the changes confirmation toast message is visible',
      });
    });
  }

  async enableContentSubmissions(message: string): Promise<void> {
    await test.step('Clicking on content submissions checkbox', async () => {
      const outerHTML = await this.clickOnContentSubmissions.evaluate(el => el.outerHTML);
      const isChecked = outerHTML.includes('checked');
      if (isChecked === true) {
        console.log('Content submissions is already enabled');
        return;
      }
      await this.clickOnElement(this.clickOnContentSubmissions);
      await this.clickOnElement(this.clickOnSave);
      await this.baseActionUtil.verifyToastMessageIsVisibleWithText(message, {
        stepInfo: 'Verify the changes confirmation toast message is visible',
      });
    });
  }
}
