import { CarouselComponent } from '@content-components/carouselComponent';
import { EditBarComponent } from '@content-components/editBarComponent';
import { ListFeedComponent } from '@content-components/listFeedComponent';
import { expect, Locator, Page, test } from '@playwright/test';

import { BaseSitePage } from '@content/ui/pages/sitePages/baseSite';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export interface ISiteDashboardActions {
  navigateToManageSite: () => Promise<void>;
  clickOnFeedLink: () => Promise<void>;
  clickOnEditCarousel: () => Promise<void>;
  clickOnAddTile: () => Promise<void>;
  clickOnEditDashboard: () => Promise<void>;
  enterSearchCarouselInput: (text: string) => Promise<void>;
  selectCarouselItem: (text: string) => Promise<void>;
  clickDoneButton: () => Promise<void>;
}

export interface ISiteDashboardAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyDashboardUrl: (siteId: string) => Promise<void>;
  verifySiteCreatedSuccessfully: (siteName: string) => Promise<void>;
  verifyCategoryCreatedSuccessfully: (categoryName: string) => Promise<void>;
  verifyCampaignLinkDisplayed: (linkText: string, description: string) => Promise<void>;
  verifySocalCampaignInCarouselModal: (text: string) => Promise<void>;
  verifySocalCampaignInCarouselItem: (text: string) => Promise<void>;
  verifySocalCampaignIsNotInCarouselItem: (text: string) => Promise<void>;
  verifySocialCampaignShareButtonIsNotVisible: (description: string) => Promise<void>;
  verifyFeedSectionIsVisible: () => Promise<void>;
  verifyFeedSectionIsNotVisible: () => Promise<void>;
}

export class SiteDashboardPage extends BaseSitePage implements ISiteDashboardAssertions {
  // Locators for site and category verification
  readonly categoryLink: (categoryName: string) => Locator;
  readonly categoryHeading: (categoryName: string) => Locator;
  readonly siteLink: (siteName: string) => Locator;
  readonly feedLink: Locator;
  readonly editDashboardButton = this.page.locator('div[data-title="Edit dashboard"]');
  readonly carouselItemText = (text: string) => this.page.locator('div').filter({ hasText: text });
  readonly shareThoughtsButton: Locator;

  // Components
  readonly listFeedComponent: ListFeedComponent;
  private carouselComponent: CarouselComponent;
  private editbarComponent: EditBarComponent;
  // Actions
  get actions(): ISiteDashboardActions {
    return this;
  }

  constructor(page: Page, siteId: string) {
    super(page, siteId);
    this.listFeedComponent = new ListFeedComponent(page);
    this.carouselComponent = new CarouselComponent(page);
    this.editbarComponent = new EditBarComponent(page);
    this.feedLink = this.page.locator('a:has-text("eed")');
    this.categoryLink = (categoryName: string) => this.page.getByRole('link', { name: categoryName });
    this.categoryHeading = (categoryName: string) => this.page.getByRole('heading', { name: categoryName });
    this.siteLink = (siteName: string) => this.page.getByRole('link', { name: siteName });
    this.shareThoughtsButton = this.page.locator('span', { hasText: 'Share your thought' });
  }
  /**
   * Verifies that site was created successfully by checking if site link is visible
   * @param siteName - The site name to verify
   */
  async verifySiteCreatedSuccessfully(siteName: string): Promise<void> {
    await test.step(`Verify site "${siteName}" was created successfully`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteLink(siteName), {
        assertionMessage: `Site link "${siteName}" should be visible after creation`,
        timeout: 15000,
      });
    });
  }
  /**
   * Verifies that category was created successfully by checking if category link is visible
   * @param categoryName - The category name to verify
   */
  async verifyCategoryCreatedSuccessfully(categoryName: string): Promise<void> {
    await test.step(`Verify category "${categoryName}" was created successfully`, async () => {
      // First verify category link is visible (means category was created)
      const categoryLink = this.categoryLink(categoryName);
      await this.verifier.verifyTheElementIsVisible(categoryLink, {
        assertionMessage: `Category link "${categoryName}" should be visible`,
        timeout: 18000,
      });

      // Click on category link to navigate to category page
      await this.clickOnElement(categoryLink);

      // Then verify the heading is visible on category page
      const categoryHeading = this.categoryHeading(categoryName);
      await this.verifier.verifyTheElementIsVisible(categoryHeading, {
        assertionMessage: `Category heading "${categoryName}" should be visible`,
        timeout: 15000,
      });
    });
  }

  // Assertions
  get assertions(): ISiteDashboardAssertions {
    return this;
  }

  /**
   * Verifies that the site dashboard page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site dashboard page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Verifies that the current URL matches the expected site dashboard URL
   * @param siteId - The site ID to verify in the URL
   */
  async verifyDashboardUrl(siteId: string): Promise<void> {
    await test.step(`Verify dashboard URL matches expected URL for site ID: ${siteId}`, async () => {
      const expectedUrl = PAGE_ENDPOINTS.getSiteDashboardPage(siteId);
      await expect(this.page, `should match expected URL: ${expectedUrl}`).toHaveURL(expectedUrl);
    });
  }

  async clickOnFeedLink(): Promise<void> {
    await test.step('Click on feed link', async () => {
      await this.clickOnElement(this.feedLink);
    });
  }

  async verifyCampaignLinkDisplayed(linkText: string, description: string): Promise<void> {
    await this.listFeedComponent.verifyCampaignLinkDisplayed(linkText, description);
  }

  async verifySocialCampaignShareButtonIsNotVisible(description: string): Promise<void> {
    await this.listFeedComponent.verifySocialCampaignShareButtonIsNotVisible(description);
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

  async verifySocalCampaignInCarouselItem(text: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.carouselItemText(text));
  }

  async verifySocalCampaignIsNotInCarouselItem(text: string): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.carouselItemText(text));
  }

  async verifySocalCampaignInCarouselModal(text: string): Promise<void> {
    return this.carouselComponent.verifyCarouselItem(text);
  }

  async clickDoneButton(): Promise<void> {
    return this.carouselComponent.clickDoneButton();
  }

  async enterSearchCarouselInput(text: string): Promise<void> {
    return this.carouselComponent.getSearchCarouselInput(text);
  }

  async selectCarouselItem(text: string): Promise<void> {
    return this.carouselComponent.selectCarouselItem(text);
  }

  async verifyFeedSectionIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.shareThoughtsButton, {
      assertionMessage: 'Feed section should be visible',
    });
  }

  async verifyFeedSectionIsNotVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.shareThoughtsButton, {
      assertionMessage: 'Feed section should not be visible',
    });
  }
}
