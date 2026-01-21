import { Locator, Page, test } from '@playwright/test';

import { CommonActionsComponent } from './commonActionsComponent';

import { BaseActionUtil, BaseComponent, PAGE_ENDPOINTS, TIMEOUTS } from '@/src/core';

export class DefaultNotificationSettingsComponent extends BaseComponent {
  readonly commonActionsComponent: CommonActionsComponent;
  readonly baseActionUtil: BaseActionUtil;
  readonly immediateEmailButton: Locator;
  readonly summarizeDailyEmailButton: Locator;
  readonly overwriteButton: Locator;
  readonly useRecommendedButton: Locator;
  readonly orgCommunicationExpandButton: Locator;
  readonly profileExpertiseExpandButton: Locator;
  readonly feedExpandButton: Locator;
  readonly sitesExpandButton: Locator;
  readonly contentExpandButton: Locator;
  readonly eventsExpandButton: Locator;
  readonly siteManagementExpandButton: Locator;
  readonly appManagementExpandButton: Locator;
  readonly profileNotificationSettingsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.commonActionsComponent = new CommonActionsComponent(page);
    this.immediateEmailButton = page.getByLabel('Immediately');
    this.summarizeDailyEmailButton = page.getByLabel('Summarize daily');
    this.overwriteButton = page.locator('button', { hasText: 'Overwrite notification settings for all users' });
    this.useRecommendedButton = page.locator('span.Button-text', { hasText: 'Use recommended' });
    this.orgCommunicationExpandButton = page.locator('button[aria-labelledby="orgCommunications"]');
    this.profileExpertiseExpandButton = page.locator('button[aria-labelledby="profileAndExpertise"]');
    this.feedExpandButton = page.locator('button[aria-labelledby="feed"]');
    this.sitesExpandButton = page.locator('button[aria-labelledby="sites"]');
    this.contentExpandButton = page.locator('button[aria-labelledby="content"]');
    this.eventsExpandButton = page.locator('button[aria-labelledby="events"]');
    this.siteManagementExpandButton = page.locator('button[aria-labelledby="siteManager"]');
    this.appManagementExpandButton = page.locator('button[aria-labelledby="appManager"]');
    this.baseActionUtil = new BaseActionUtil(page);
    this.profileNotificationSettingsButton = page.getByRole('button', { name: 'Profile notification settings' });
  }
  /**
   * Navigates to defaults notification settings page
   */
  async navigateToDefaultsNotificationSettingsPage(): Promise<void> {
    await this.goToUrl(PAGE_ENDPOINTS.NOTIFICATION_SETTINGS_DEFAULT_PAGE + '/email-notifications');
  }

  async verifyTabIsDisplayed(tabName: string): Promise<void> {
    const tabLocator = this.page.getByRole('tab', { name: tabName });
    await test.step(`Verify ${tabName} tab is visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(tabLocator, {
        assertionMessage: `Expected ${tabName} tab to be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async clickOnTab(tabName: string): Promise<void> {
    const tabLocator = this.page.getByRole('tab', { name: tabName });
    await test.step(`Click on ${tabName} tab`, async () => {
      await tabLocator.click();
    });
  }

  async verifyNotificationTabHeadingIsDisplayed(headingText: string): Promise<void> {
    const headingLocator = this.page.getByRole('heading', { name: headingText });
    await test.step(`Verify heading "${headingText}" is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(headingLocator, {
        assertionMessage: `Expected heading "${headingText}" to be visible`,
        timeout: TIMEOUTS.LONG,
      });
    });
  }

  async verifyDescriptionTextIsDisplayed(text: string): Promise<void> {
    const locator = this.page.getByText(text);

    await test.step(`Verify description text "${text}" is visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(locator, {
        assertionMessage: `Expected description text "${text}" to be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyMultipleTextsAreVisible(textList: string[]): Promise<void> {
    for (const text of textList) {
      const locator = this.page.getByText(text, { exact: true });
      await test.step(`Verify "${text}" is visible`, async () => {
        await this.verifier.verifyTheElementIsVisible(locator, {
          assertionMessage: `Expected text "${text}" to be visible`,
          timeout: TIMEOUTS.MEDIUM,
        });
      });
    }
  }
  async verifyImmediateEmailOptionIsVisible(): Promise<void> {
    await test.step('Verify "Immediately" email option is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.immediateEmailButton, {
        assertionMessage: 'Verify "Immediately" email option is visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifySummarizedDailyEmailOptionIsVisible(): Promise<void> {
    await test.step('Verify "Summarized daily" email option is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.summarizeDailyEmailButton, {
        assertionMessage: 'Verify "Summarized daily" email option is visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }
  async verifyOverwriteButtonIsVisible(): Promise<void> {
    await test.step('Verify "Overwrite notification settings for all users" button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.overwriteButton, {
        assertionMessage: 'Verify "Overwrite notification settings for all users" button is visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }
  async clickOnOverwriteButton(): Promise<void> {
    await test.step('Click on "Overwrite notification settings for all users" button', async () => {
      await this.clickOnElement(this.overwriteButton, {
        stepInfo: 'Click on "Overwrite notification settings for all users" button',
      });
    });
  }

  async verifyUseRecommendedButtonIsVisible(): Promise<void> {
    await test.step('Verify "Use recommended" button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.useRecommendedButton, {
        assertionMessage: 'Verify "Use recommended" button is visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }
  async clickOnUseRecommendedButton(): Promise<void> {
    await test.step('Click on "Use recommended" button', async () => {
      await this.clickOnElement(this.useRecommendedButton, {
        stepInfo: 'Click on "Use recommended" button',
      });
    });
  }

  async checkMultipleCheckboxes(checkboxText: string[]): Promise<void> {
    for (const text of checkboxText) {
      const locator = this.page.getByLabel(text, { exact: true });

      await test.step(`Check checkbox "${text}"`, async () => {
        if ((await locator.getAttribute('value'))?.toLowerCase() == 'false') {
          await locator.check();
        }
      });
    }
  }
  async uncheckMultipleCheckboxes(checkboxText: string[]): Promise<void> {
    for (const text of checkboxText) {
      const locator = this.page.getByLabel(text, { exact: true });
      await test.step(`Uncheck checkbox "${text}"`, async () => {
        if ((await locator.getAttribute('value'))?.toLowerCase() == 'true') {
          await locator.uncheck();
        }
      });
    }
  }

  async verifyMultipleCheckboxesAreChecked(checkboxText: string[]): Promise<void> {
    for (const text of checkboxText) {
      const locator = this.page.getByLabel(text, { exact: true });
      await test.step(`Verify checkbox "${text}" is checked`, async () => {
        await this.verifier.verifyTheElementIsChecked(locator, {
          assertionMessage: `Verify checkbox "${text}" is checked`,
          timeout: TIMEOUTS.MEDIUM,
        });
      });
    }
  }
  async verifyMultipleCheckboxesAreUnchecked(checkboxText: string[]): Promise<void> {
    for (const text of checkboxText) {
      const locator = this.page.getByLabel(text, { exact: true });
      await test.step(`Verify checkbox "${text}" is unchecked`, async () => {
        await this.verifier.verifyTheElementIsNotChecked(locator, {
          assertionMessage: `Verify checkbox "${text}" is unchecked`,
          timeout: TIMEOUTS.MEDIUM,
        });
      });
    }
  }
  async expandOrgCommunicationSection(): Promise<void> {
    await test.step('Expand org communication section', async () => {
      await this.clickOnElement(this.orgCommunicationExpandButton, {
        stepInfo: 'Expand org communication section',
      });
    });
  }
  async expandProfileExpertiseSection(): Promise<void> {
    await test.step('Expand profile expertise section', async () => {
      await this.clickOnElement(this.profileExpertiseExpandButton, {
        stepInfo: 'Expand profile expertise section',
      });
    });
  }
  async expandFeedSection(): Promise<void> {
    await test.step('Expand feed section', async () => {
      await this.clickOnElement(this.feedExpandButton, {
        stepInfo: 'Expand feed section',
      });
    });
  }
  async expandSitesSection(): Promise<void> {
    await test.step('Expand sites section', async () => {
      await this.clickOnElement(this.sitesExpandButton, {
        stepInfo: 'Expand sites section',
      });
    });
  }
  async expandContentSection(): Promise<void> {
    await test.step('Expand content section', async () => {
      await this.clickOnElement(this.contentExpandButton, {
        stepInfo: 'Expand content section',
      });
    });
  }
  async expandEventsSection(): Promise<void> {
    await test.step('Expand events section', async () => {
      await this.clickOnElement(this.eventsExpandButton, {
        stepInfo: 'Expand events section',
      });
    });
  }
  async expandSiteManagementSection(): Promise<void> {
    await test.step('Expand site management section', async () => {
      await this.clickOnElement(this.siteManagementExpandButton, {
        stepInfo: 'Expand site management section',
      });
    });
  }
  async expandAppManagementSection(): Promise<void> {
    await test.step('Expand app management section', async () => {
      await this.clickOnElement(this.appManagementExpandButton, {
        stepInfo: 'Expand app management section',
      });
    });
  }
}
