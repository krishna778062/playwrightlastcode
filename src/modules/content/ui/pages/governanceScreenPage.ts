import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';

export interface IGovernanceScreenPageActions {
  disableContentSubmissions: (message: string) => Promise<void>;
  enableContentSubmissions: (message: string) => Promise<void>;
  clickOnTimelineFeedEnabled: () => Promise<void>;
  clickOnTimelineFeedDisabled: () => Promise<void>;
  selectContentValidationPeriodTime: (time: string) => Promise<void>;
}

export interface IGovernanceScreenPageAssertions {}

export class GovernanceScreenPage extends BasePage implements IGovernanceScreenPageActions {
  // Governance locators (moved from GovernanceComponent)
  private baseActionUtil: BaseActionUtil;
  readonly clickOnTimelineButton: Locator;
  readonly clickOnSaveButton: Locator;
  readonly timelineAndFeed: Locator;
  readonly timelineFeedEnabled: Locator;
  readonly successToastMessage: (message: string) => Locator;
  readonly clickOnContentSubmissions: Locator;
  readonly clickOnSave: Locator;
  readonly clickOnContentValidationPeriodTime: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.GOVERNANCE_SCREEN);
    this.baseActionUtil = new BaseActionUtil(page);

    this.clickOnTimelineButton = page.getByText('Timeline', { exact: true });
    this.timelineFeedEnabled = page.locator('#feedMode_timeline_comment_post');
    this.clickOnSaveButton = page.getByRole('button', { name: 'Save' });
    this.timelineAndFeed = page.getByRole('heading', { name: 'Timeline & feed' });
    this.successToastMessage = (message: string) => this.page.locator('div[class*="Toast-module"]').getByText(message);
    this.clickOnContentSubmissions = this.page.locator('#contentSubmissions');
    this.clickOnSave = this.page.getByRole('button', { name: 'Save' });
    this.clickOnContentValidationPeriodTime = page.locator('#autoGovValidationPeriod');
  }

  get actions(): IGovernanceScreenPageActions {
    return this;
  }

  get assertions(): IGovernanceScreenPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify governance page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.timelineAndFeed, {
        assertionMessage: 'Governance page should be visible',
      });
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
  async clickOnTimelineFeedDisabled(): Promise<void> {
    await test.step('Clicking on timeline feed disabled if not already checked', async () => {
      const isChecked = await this.clickOnTimelineButton.isChecked();
      if (!isChecked) {
        await this.clickOnElement(this.clickOnTimelineButton);
        await this.clickOnElement(this.clickOnSaveButton);
        await this.verifier.verifyTheElementIsVisible(this.successToastMessage('Saved changes successfully'), {
          assertionMessage: 'Timeline feed should be enabled',
        });
      }
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

  async selectContentValidationPeriodTime(time: string): Promise<void> {
    await test.step('Clicking on content validation period time', async () => {
      await this.clickOnElement(this.clickOnContentValidationPeriodTime);
      await this.clickOnContentValidationPeriodTime.selectOption(time);
      await this.clickOnElement(this.clickOnSave);
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
