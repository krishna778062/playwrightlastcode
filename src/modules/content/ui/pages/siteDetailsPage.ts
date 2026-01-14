import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { SiteDetailsComponent } from '@/src/modules/content/ui/components/siteDetailsComponent';
import { TargetAudienceComponent } from '@/src/modules/content/ui/components/targetAudienceComponent';

export class SiteDetailsPage extends BasePage {
  private siteDetailsComponent: SiteDetailsComponent;
  readonly categoryName: Locator;
  readonly contentTab: Locator;
  readonly searchBar: Locator;
  readonly searchIcon: Locator;
  readonly clickingOnCheckbox: Locator;
  readonly contentLink: (pageName: string) => Locator;
  private targetAudienceComponent: TargetAudienceComponent;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.SITE_DETAILS_PAGE(siteId));
    this.targetAudienceComponent = new TargetAudienceComponent(page);
    this.siteDetailsComponent = new SiteDetailsComponent(page);

    // Initialize locators
    this.categoryName = this.page.locator('id="category":has-text("Uncategorized")');
    this.contentTab = this.page.getByRole('tab', { name: 'Content' });
    this.searchBar = this.page.locator("[aria-label='Search…']");
    this.searchIcon = this.page.locator('.SearchField-submit');
    this.clickingOnCheckbox = this.page.locator('input[type="checkbox"][aria-label="Select"]').first();
    this.contentLink = (pageName: string) => this.page.getByRole('link', { name: pageName });
  }
  async verifyThePageIsLoaded(): Promise<void> {}

  async removingAudienceGroup(): Promise<void> {
    await this.targetAudienceComponent.removingAudienceGroup();
  }

  async verifyWarningMessage(): Promise<void> {
    await this.targetAudienceComponent.verifyWarningMessage();
  }

  async typeContentInSearchBar(inputText: string): Promise<void> {
    await test.step(`Writing random text in the search bar`, async () => {
      await this.clickOnElement(this.searchBar);
      await this.searchBar.type(inputText);
    });
  }
  async clickSearchIcon(): Promise<void> {
    await test.step(`Clicking on search icon`, async () => {
      await this.clickOnElement(this.searchIcon);
    });
  }

  async openContentDetailsPage(pageName: string): Promise<void> {
    await this.clickOnElement(this.contentLink(pageName));
  }

  async ViewSite(): Promise<void> {
    await test.step('Viewing site', async () => {
      await this.clickOnElement(this.siteDetailsComponent.ViewSite);
    });
  }

  async validatingCategory(): Promise<void> {
    await test.step('Validating category', async () => {
      await this.categoryName.isHidden();
    });
  }

  async validatingCategoryToUncategorized(): Promise<void> {
    await test.step('Validating category to Uncategorized', async () => {
      await this.verifier.verifyTheElementIsVisible(this.categoryName, {
        assertionMessage: 'Category name should be Uncategorized',
      });
    });
  }
  async clickOnContentTab(): Promise<void> {
    await test.step('Clicking on content tab', async () => {
      await this.clickOnElement(this.contentTab);
    });
  }
}
