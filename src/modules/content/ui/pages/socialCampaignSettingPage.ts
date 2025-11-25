import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/ui/pages/basePage';

export interface ISocialCampaignSettingPageActions {
  uncheckSocialCampaignCheckOutbox: () => Promise<void>;
  checkSocialCampaignCheckOutbox: () => Promise<void>;
  clickOnFacebookCheckbox: () => Promise<void>;
  clickOnTwitterCheckbox: () => Promise<void>;
  clickOnLinkedinCheckbox: () => Promise<void>;
  clickOnConfirmButton: () => Promise<void>;
}

export interface ISocialCampaignSettingPageAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
}

export class SocialCampaignSettingPage
  extends BasePage
  implements ISocialCampaignSettingPageActions, ISocialCampaignSettingPageAssertions
{
  readonly pageHeading: Locator;
  readonly socialCampaignCheckOutbox: Locator;
  readonly facebookCheckbox: Locator;
  readonly twitterCheckbox: Locator;
  readonly linkedinCheckbox: Locator;
  readonly saveButton: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SOCIAL_CAMPAIGN_SETTING_PAGE);
    this.pageHeading = page.getByRole('heading', { name: 'Social campaigns' });
    this.socialCampaignCheckOutbox = page.locator('#employeeAdvocacy');
    this.facebookCheckbox = page.locator('#facebookIntegrationEnabled');
    this.twitterCheckbox = page.locator('#twitterIntegrationEnabled');
    this.linkedinCheckbox = page.locator('#linkedinIntegrationEnabled');
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  get actions(): ISocialCampaignSettingPageActions {
    return this;
  }

  get assertions(): ISocialCampaignSettingPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify social campaign setting page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageHeading, {
        assertionMessage: 'Social campaign setting page should be visible',
      });
    });
  }

  async uncheckSocialCampaignCheckOutbox(): Promise<void> {
    await test.step('Clicking on social campaign check outbox', async () => {
      const isChecked = await this.socialCampaignCheckOutbox.isChecked();
      if (isChecked) {
        await this.socialCampaignCheckOutbox.uncheck();
        await this.clickOnElement(this.saveButton);
        await this.clickOnConfirmButton();
        await this.verifier.verifyTheElementIsVisible(
          this.toastMessages.filter({ hasText: 'Saved changes successfully' })
        );
      }
    });
  }

  async checkSocialCampaignCheckOutbox(): Promise<void> {
    await test.step('Clicking on social campaign check outbox', async () => {
      const isChecked = await this.socialCampaignCheckOutbox.isChecked();
      if (!isChecked) {
        await this.socialCampaignCheckOutbox.check();
        await this.clickOnFacebookCheckbox();
        await this.clickOnTwitterCheckbox();
        await this.clickOnLinkedinCheckbox();
        await this.clickOnElement(this.saveButton);
        await this.verifier.verifyTheElementIsVisible(
          this.toastMessages.filter({ hasText: 'Saved changes successfully' })
        );
      }
    });
  }

  async clickOnFacebookCheckbox(): Promise<void> {
    await test.step('Clicking on facebook checkbox', async () => {
      await this.clickOnElement(this.facebookCheckbox);
    });
  }

  async clickOnTwitterCheckbox(): Promise<void> {
    await test.step('Clicking on twitter checkbox', async () => {
      await this.clickOnElement(this.twitterCheckbox);
    });
  }

  async clickOnLinkedinCheckbox(): Promise<void> {
    await test.step('Clicking on linkedin checkbox', async () => {
      await this.clickOnElement(this.linkedinCheckbox);
    });
  }

  async clickOnConfirmButton(): Promise<void> {
    await test.step('Clicking on confirm button', async () => {
      await this.clickOnElement(this.confirmButton);
    });
  }
}
