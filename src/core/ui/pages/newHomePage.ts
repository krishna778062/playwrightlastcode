import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestOptions } from '@core/types/test.types';
import { BasePage } from '@core/ui/pages/basePage';

import { FooterComponent } from '../components/footerComponent';

import { AddTileComponent } from '@/src/modules/content/ui/components/addTileComponent';
import { CarouselComponent } from '@/src/modules/content/ui/components/carouselComponent';
import { ChangeLayoutComponent } from '@/src/modules/content/ui/components/changeLayoutComponent';
import { EditBarComponent } from '@/src/modules/content/ui/components/editBarComponent';

export interface INewHomePageActions {
  clickOnManageDashboardCarousel: (options?: { stepInfo?: string }) => Promise<void>;
  clickOnEditCarousel: () => Promise<void>;
  clickOnEditDashboard: () => Promise<void>;
  clickOnAddTile: () => Promise<void>;
  clickOnSocialCampaignTile: () => Promise<void>;
  clickAddToHomeButton: () => Promise<string>;
  enterTileTitle: (tileTitle: string) => Promise<void>;
  clickOnCustomSCTile: () => Promise<void>;
  setCustomSCTitle: (title: string) => Promise<void>;
  clickOnChangeLayout: () => Promise<void>;
  clickExcludeFeed: () => Promise<void>;
  enterSearchCarouselInput: (text: string) => Promise<void>;
  selectCarouselItem: (text: string) => Promise<void>;
  clickDoneButton: () => Promise<void>;
  clickHomeDashboardDoneButton: () => Promise<void>;
}

export interface INewHomePageAssertions {
  verifyTileIsDisplayed: (tileTitle: string) => Promise<void>;
  verifySocialCampaignNameInTheDisplayed: (socialCampaignName: string) => Promise<void>;
  verifySocialCampaignNameNotDisplayed: (socialCampaignName: string) => Promise<void>;
  verifySocalCampaignInCarouselModal: (text: string) => Promise<void>;
  verifySocalCampaignInCarouselItem: (text: string) => Promise<void>;
  verifySocalCampaignIsNotInCarouselItem: (text: string) => Promise<void>;
}

export class NewHomePage extends BasePage {
  readonly changeLayoutComponent: ChangeLayoutComponent;
  readonly footerComponent: FooterComponent;
  readonly manageDashboardCarouselButton: Locator;
  readonly editDashboardButton: Locator;
  readonly editbarComponent: EditBarComponent;
  readonly addTileComponent: AddTileComponent;
  readonly tileListComponent: (tileTitle: string) => Locator;
  readonly socialCampaignNameInTileList: (socialCampaignName: string) => Locator;
  readonly peopleButton: Locator;
  readonly carouselItemText: (text: string) => Locator;
  private carouselComponent: CarouselComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.footerComponent = new FooterComponent(page);
    this.editbarComponent = new EditBarComponent(page);
    this.addTileComponent = new AddTileComponent(page);
    this.carouselComponent = new CarouselComponent(page);
    this.manageDashboardCarouselButton = page.getByRole('button', { name: 'Manage dashboard & carousel' });
    this.editDashboardButton = page.locator('div[data-title="Edit dashboard"]');
    this.tileListComponent = (tileTitle: string) => page.getByRole('heading', { name: tileTitle });
    this.socialCampaignNameInTileList = (socialCampaignName: string) =>
      page.getByRole('button', { name: socialCampaignName }).first();
    this.carouselItemText = (text: string) => page.locator('div').filter({ hasText: text });
    this.changeLayoutComponent = new ChangeLayoutComponent(page);
    this.peopleButton = page.getByRole('menuitem', { name: 'People People' });
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

  async clickOnPeople(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `side navbar: clicking on People`, async () => {
      await this.clickOnElement(this.peopleButton);
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

  async clickOnEditDashboard(): Promise<void> {
    await test.step('Click on edit dashboard', async () => {
      await this.clickOnElement(this.editDashboardButton);
    });
  }

  async clickOnAddTile(): Promise<void> {
    return this.editbarComponent.clickOnAddTile();
  }

  async clickOnSocialCampaignTile(): Promise<void> {
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

  async verifySocialCampaignNameNotDisplayed(socialCampaignName: string): Promise<void> {
    await test.step('Verifying social campaign name is displayed in the displayed', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.socialCampaignNameInTileList(socialCampaignName), {
        timeout: 20000,
        assertionMessage: `Social campaign name '${socialCampaignName}' should be displayed`,
      });
    });
  }

  async clickOnCustomSCTile(): Promise<void> {
    return this.addTileComponent.clickCustomTab();
  }

  async setCustomSCTitle(title: string): Promise<void> {
    return this.addTileComponent.setCustomSCTitle(title);
  }

  async clickOnChangeLayout(): Promise<void> {
    return this.editbarComponent.clickChangeLayout();
  }

  async clickExcludeFeed(): Promise<void> {
    return this.changeLayoutComponent.clickExcludeFeed();
  }

  async enterSearchCarouselInput(text: string): Promise<void> {
    return this.carouselComponent.getSearchCarouselInput(text);
  }

  async selectCarouselItem(text: string): Promise<void> {
    return this.carouselComponent.selectCarouselItem(text);
  }

  async clickDoneButton(): Promise<void> {
    return this.carouselComponent.clickDoneButton();
  }

  async verifySocalCampaignInCarouselModal(text: string): Promise<void> {
    return this.carouselComponent.verifyCarouselItem(text);
  }

  async verifySocalCampaignInCarouselItem(text: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.carouselItemText(text));
  }

  async verifySocalCampaignIsNotInCarouselItem(text: string): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.carouselItemText(text));
  }

  async clickHomeDashboardDoneButton(): Promise<void> {
    return this.carouselComponent.clickHomeDashboardDoneButton();
  }
}
