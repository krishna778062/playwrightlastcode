import { Locator, Page, test } from '@playwright/test';

import { ListOfSocialCampaignComponent } from '@content/ui/components/listOfSocialCampaignComponent';
import { ShareSocialCampaignComponent } from '@content/ui/components/shareSocialCampaignComponent';
import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export interface ISocialCampaignPageActions {
  removeAllExistingCampaigns: () => Promise<void>;
  clickPopularLink: () => Promise<void>;
  clickAddCampaignButton: () => Promise<void>;
  clickCampaignOptions: () => Promise<void>;
  clickExpireCampaignButton: () => Promise<void>;
  confirmExpireCampaign: () => Promise<void>;
  clickDeleteCampaignButton: () => Promise<void>;
  clickExpiredLink: () => Promise<void>;
  getSocialCampaignCount: () => Promise<number>;
  confirmDeleteCampaign: () => Promise<void>;
  clickShareToFeedButton: () => Promise<void>;
  selectShareOptionAsSiteFeed: () => Promise<void>;
  enterShareDescription: (description: string) => Promise<void>;
  enterSiteName: (siteName: string) => Promise<void>;
  clickShareButton: () => Promise<void>;
}

export interface ISocialCampaignPageAssertions {
  verifyCampaignLinkDisplayed: (linkText: string) => Promise<void>;
  verifyCampaignNotInLatest: (linkText: string) => Promise<void>;
  verifyCampaignNotInExpired: (linkText: string) => Promise<void>;
  verifyCampaignInExpired: (linkText: string) => Promise<void>;
  verifyToastMessage: (message: string) => Promise<void>;
  verifyAddCampaignButtonIsNotVisible: () => Promise<void>;
  verifyExpireTabNotVisible: () => Promise<void>;
  verifyExpireCampaignButtonIsNotVisible: () => Promise<void>;
  verifyDeleteCampaignButtonIsNotVisible: () => Promise<void>;
}

export class SocialCampaignPage extends BasePage implements ISocialCampaignPageActions, ISocialCampaignPageAssertions {
  readonly socialCampaignsSection: Locator;
  readonly addCampaignButton: Locator;
  readonly popularLink: Locator;
  readonly expiredLink: Locator;
  private listOfSocialCampaignComponent: ListOfSocialCampaignComponent;
  private shareSocialCampaignComponent: ShareSocialCampaignComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SOCIAL_CAMPAIGNS_PAGE);

    this.socialCampaignsSection = page.locator('h1', { hasText: /^Social campaigns$/ });
    this.addCampaignButton = page.locator('span:has-text("Add campaign")');
    this.popularLink = page.locator('a', { hasText: /^Popular$/ });
    this.expiredLink = page.locator('a', { hasText: /^Expired$/ });
    this.listOfSocialCampaignComponent = new ListOfSocialCampaignComponent(page);
    this.shareSocialCampaignComponent = new ShareSocialCampaignComponent(page);
  }

  get actions(): ISocialCampaignPageActions {
    return this;
  }

  get assertions(): ISocialCampaignPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify social campaign page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.socialCampaignsSection, {
        assertionMessage: 'Social campaign page should be visible',
      });
    });
  }

  async clickAddCampaignButton(): Promise<void> {
    await test.step('Click Add campaign button', async () => {
      await this.clickOnElement(this.addCampaignButton);
    });
  }

  async removeAllExistingCampaigns(): Promise<void> {
    await test.step('Remove all existing social campaigns', async () => {
      // Implementation to remove existing campaigns
      console.log('Removing all existing social campaigns');
    });
  }

  async verifyCampaignLinkDisplayed(linkText: string): Promise<void> {
    return await this.listOfSocialCampaignComponent.verifyCampaignLinkDisplayed(linkText);
  }

  async clickCampaignOptions(): Promise<void> {
    return await this.listOfSocialCampaignComponent.clickCampaignOptions();
  }

  async clickExpireCampaignButton(): Promise<void> {
    return await this.listOfSocialCampaignComponent.clickExpireCampaignButton();
  }

  async confirmExpireCampaign(): Promise<void> {
    return await this.listOfSocialCampaignComponent.confirmExpireCampaign();
  }

  async getSocialCampaignCount(): Promise<number> {
    return await this.listOfSocialCampaignComponent.getSocialCampaignCount();
  }

  async verifyCampaignNotInLatest(linkText: string): Promise<void> {
    return await this.listOfSocialCampaignComponent.verifyCampaignNotInLatest(linkText);
  }

  async verifyCampaignInExpired(linkText: string): Promise<void> {
    return await this.listOfSocialCampaignComponent.verifyCampaignInExpired(linkText);
  }

  async clickPopularLink(): Promise<void> {
    await test.step('Click Popular link', async () => {
      await this.clickOnElement(this.popularLink);
    });
  }

  async clickExpiredLink(): Promise<void> {
    await test.step('Click Expired link', async () => {
      await this.clickOnElement(this.expiredLink);
    });
  }

  async clickDeleteCampaignButton(): Promise<void> {
    return await this.listOfSocialCampaignComponent.clickDeleteCampaignButton();
  }

  async confirmDeleteCampaign(): Promise<void> {
    return await this.listOfSocialCampaignComponent.confirmDeleteCampaign();
  }

  async verifyCampaignNotInExpired(linkText: string): Promise<void> {
    return await this.listOfSocialCampaignComponent.verifyCampaignNotInExpired(linkText);
  }

  async verifyToastMessage(message: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.toastMessages.filter({ hasText: message }), {
      assertionMessage: `Verify toast message: "${message}"`,
    });
  }

  async clickShareToFeedButton(): Promise<void> {
    await test.step('Click Share to feed button', async () => {
      await this.listOfSocialCampaignComponent.clickShareToFeedButton();
    });
  }

  async selectShareOptionAsSiteFeed(): Promise<void> {
    return await this.shareSocialCampaignComponent.selectShareOptionAsSiteFeed();
  }

  async enterShareDescription(description: string): Promise<void> {
    return await this.shareSocialCampaignComponent.enterShareDescription(description);
  }

  async enterSiteName(siteName: string): Promise<void> {
    return await this.shareSocialCampaignComponent.enterSiteName(siteName);
  }

  async clickShareButton(): Promise<void> {
    return await this.shareSocialCampaignComponent.clickShareButton();
  }

  async verifyAddCampaignButtonIsNotVisible(): Promise<void> {
    await test.step('Verify Add Campaign button is not visible to end user', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.addCampaignButton, {
        assertionMessage: 'Add Campaign button should not be visible to end user',
      });
    });
  }

  async verifyExpireTabNotVisible(): Promise<void> {
    await test.step('Verify Expired tab is not visible to end user', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.expiredLink, {
        assertionMessage: 'Expired tab should not be visible to end user',
      });
    });
  }

  async verifyExpireCampaignButtonIsNotVisible(): Promise<void> {
    return await this.listOfSocialCampaignComponent.verifyExpireCampaignButtonIsNotVisible();
  }

  async verifyDeleteCampaignButtonIsNotVisible(): Promise<void> {
    return await this.listOfSocialCampaignComponent.verifyDeleteCampaignButtonIsNotVisible();
  }
}
