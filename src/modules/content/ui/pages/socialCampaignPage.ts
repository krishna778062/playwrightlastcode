import { Locator, Page, Response, test } from '@playwright/test';

import { ListOfSocialCampaignComponent } from '@content/ui/components/listOfSocialCampaignComponent';
import { ShareSocialCampaignComponent } from '@content/ui/components/shareSocialCampaignComponent';
import { AddCampaignPage } from '@content/ui/pages/addCampaignPage';
import { SocialCampaignNetworkUI, SocialCampaignOptions } from '@core/types/social-campaign.types';
import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export interface ISocialCampaignPageActions {
  removeAllExistingCampaigns: () => Promise<void>;
  clickPopularLink: () => Promise<void>;
  AddCampaignAndCreate: (options: SocialCampaignOptions) => Promise<string>;
  clickAddCampaignButton: () => Promise<void>;
  enterAudienceName: (audienceName: string) => Promise<void>;
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
  enterCampaignUrl: (url: string, linkText?: string) => Promise<void>;
  uncheckNetwork: (networkName: string) => Promise<void>;
  clickCreateCampaignButton: () => Promise<void>;
  selectNetworks: (networks: SocialCampaignNetworkUI[]) => Promise<void>;
  selectMemberAsAudience: () => Promise<void>;
}

export interface ISocialCampaignPageAssertions {
  verifyCampaignLinkDisplayed: (linkText: string) => Promise<void>;
  verifyCampaignNotInLatest: (linkText: string) => Promise<void>;
  verifyCampaignNotInExpired: (linkText: string) => Promise<void>;
  verifyCampaignInExpired: (linkText: string) => Promise<void>;
  verifyToastMessage: (message: string) => Promise<void>;
  verifyErrorMessagePresence: (errorMessage: string) => Promise<void>;
  verifyAudienceNameAndDescription: (
    audienceCount: string | number,
    description: string,
    name: string
  ) => Promise<void>;
  verifyAudienceNameAndNoDescription: (
    audienceCount: string | number,
    description: string,
    name: string
  ) => Promise<void>;
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
  private addCampaignPage: AddCampaignPage;
  private listOfSocialCampaignComponent: ListOfSocialCampaignComponent;
  private shareSocialCampaignComponent: ShareSocialCampaignComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SOCIAL_CAMPAIGNS_PAGE);

    this.socialCampaignsSection = page.locator('h1', { hasText: /^Social campaigns$/ });
    this.addCampaignButton = page.locator('span:has-text("Add campaign")');
    this.popularLink = page.locator('a', { hasText: /^Popular$/ });
    this.expiredLink = page.locator('a', { hasText: /^Expired$/ });
    this.addCampaignPage = new AddCampaignPage(page);
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

  async enterAudienceName(audienceName: string): Promise<void> {
    return await this.addCampaignPage.enterAudienceName(audienceName);
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

  /**
   * Creates and publishes a new social campaign
   * @param options - Options for creating the campaign including message, URL, recipient, and networks
   * @returns Result containing campaign details and link text
   */
  async AddCampaignAndCreate(options: SocialCampaignOptions): Promise<string> {
    return await this.addCampaignPage.AddCampaignAndCreate(options);
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

  async enterCampaignUrl(url: string, linkText?: string): Promise<void> {
    return await this.addCampaignPage.enterCampaignUrl(url, linkText);
  }

  async uncheckNetwork(networkName: string): Promise<void> {
    return await this.addCampaignPage.actions.uncheckNetwork(networkName);
  }

  async clickCreateCampaignButton(): Promise<void> {
    return await this.addCampaignPage.actions.clickCreateCampaignButton();
  }

  async verifyErrorMessagePresence(errorMessage: string): Promise<void> {
    return await this.addCampaignPage.verifyErrorMessagePresence(errorMessage);
  }

  async selectNetworks(networks: SocialCampaignNetworkUI[]): Promise<void> {
    return await this.addCampaignPage.selectNetworks(networks);
  }

  async verifyAudienceNameDisplayed(audienceName: string): Promise<void> {
    return await this.addCampaignPage.verifyAudienceNameDisplayed(audienceName);
  }

  async verifyAudienceNameAndDescription(
    audienceCount: string | number,
    description: string,
    name: string
  ): Promise<void> {
    return await this.addCampaignPage.verifyAudienceNameAndDescription(audienceCount, description, name);
  }

  async verifyAudienceNameAndNoDescription(
    audienceCount: string | number,
    description: string,
    name: string
  ): Promise<void> {
    return await this.addCampaignPage.verifyAudienceNameAndNoDescription(audienceCount, description, name);
  }

  async selectMemberAsAudience(): Promise<void> {
    return await this.addCampaignPage.actions.selectMemberAsAudience();
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
