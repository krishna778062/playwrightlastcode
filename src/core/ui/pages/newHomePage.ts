import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/ui/pages/basePage';

import { FooterComponent } from '../components/footerComponent';

import { AddTileComponent } from '@/src/modules/content/ui/components/addTileComponent';
import { EditBarComponent } from '@/src/modules/content/ui/components/editBarComponent';

export interface INewHomePageActions {
  clickOnManageDashboardCarousel: (options?: { stepInfo?: string }) => Promise<void>;
  clickOnEditCarousel: () => Promise<void>;
  clickOnAddTile: () => Promise<void>;
  clickOnSocialCampaignTile: (tileTitle: string) => Promise<void>;
  clickAddToHomeButton: () => Promise<void>;
  enterTileTitle: (tileTitle: string) => Promise<void>;
}

export interface INewHomePageAssertions {
  verifyTileIsDisplayed: (tileTitle: string) => Promise<void>;
  verifySocialCampaignNameInTheDisplayed: (socialCampaignName: string) => Promise<void>;
}

export class NewHomePage extends BasePage {
  readonly footerComponent: FooterComponent;
  readonly manageDashboardCarouselButton: Locator;
  readonly editbarComponent: EditBarComponent;
  readonly addTileComponent: AddTileComponent;
  readonly tileListComponent: (tileTitle: string) => Locator;
  readonly socialCampaignNameInTileList: (socialCampaignName: string) => Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.footerComponent = new FooterComponent(page);
    this.editbarComponent = new EditBarComponent(page);
    this.addTileComponent = new AddTileComponent(page);
    this.manageDashboardCarouselButton = page.getByRole('button', { name: 'Manage dashboard & carousel' });
    this.tileListComponent = (tileTitle: string) => page.getByRole('heading', { name: tileTitle });
    this.socialCampaignNameInTileList = (socialCampaignName: string) =>
      page.getByRole('button', { name: socialCampaignName }).first();
  }

  get actions(): INewHomePageActions {
    return this;
  }

  get assertions(): INewHomePageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the home page is loaded', async () => {
      await expect(this.page.locator('h1'), "Expected to find 'Home' in the page title").toContainText('Home', {
        timeout: 35_000,
      });
    });
  }

  get footer(): FooterComponent {
    return this.footerComponent;
  }

  /**
   * Clicks on the "Manage dashboard & carousel" button
   * @param options - The options for the step
   */
  async clickOnManageDashboardCarousel(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Clicking on Manage dashboard & carousel', async () => {
      await this.clickOnElement(this.manageDashboardCarouselButton);
    });
  }

  async clickOnEditCarousel(): Promise<void> {
    return this.editbarComponent.clickEditCarousel();
  }

  async clickOnAddTile(): Promise<void> {
    return this.editbarComponent.clickOnAddTile();
  }

  async clickOnSocialCampaignTile(tileTitle: string): Promise<void> {
    return this.addTileComponent.clickSocialCampaignsButton();
  }

  async clickAddToHomeButton(): Promise<string> {
    return this.addTileComponent.clickAddToHomeButton();
  }

  async enterTileTitle(tileTitle: string): Promise<void> {
    return this.addTileComponent.setTileTitle(tileTitle);
  }

  async verifyTileIsDisplayed(tileTitle: string): Promise<void> {
    await test.step('Verifying tile is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.tileListComponent(tileTitle), {
        timeout: 20000,
        assertionMessage: `Tile title '${tileTitle}' should be displayed`,
      });
    });
  }

  async verifySocialCampaignNameInTheDisplayed(socialCampaignName: string): Promise<void> {
    await test.step('Verifying social campaign name is displayed in the displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.socialCampaignNameInTileList(socialCampaignName), {
        timeout: 20000,
        assertionMessage: `Social campaign name '${socialCampaignName}' should be displayed`,
      });
    });
  }
}
