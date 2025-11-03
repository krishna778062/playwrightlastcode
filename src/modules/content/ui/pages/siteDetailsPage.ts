import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { SiteDetailsComponent } from '@/src/modules/content/ui/components/siteDetailsComponent';

export interface ISiteDetailsPageActions {
  ViewSite: () => Promise<void>;
  clickOnContentTab: () => Promise<void>;
  typeContentInSearchBar: (inputText: string) => Promise<void>;
  clickSearchIcon: () => Promise<void>;
  openContentDetailsPage: () => Promise<void>;
}
export interface ISiteDetailsPageAssertions {
  validatingCategory: () => Promise<void>;
  validatingCategoryToUncategorized: () => Promise<void>;
}
export class SiteDetailsPage extends BasePage {
  private siteDetailsComponent: SiteDetailsComponent;
  readonly categoryName = this.page.locator('id="category":has-text("Uncategorized")');
  readonly contentTab = this.page.getByRole('tab', { name: 'Content' });
  readonly searchBar = this.page.locator("[aria-label='Search…']");
  readonly searchIcon = this.page.locator('.SearchField-submit');
  readonly clickingOnCheckbox: Locator = this.page.locator('input[type="checkbox"][aria-label="Select"]').first();

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.SITE_DETAILS_PAGE(siteId));
    this.siteDetailsComponent = new SiteDetailsComponent(page);
  }

  get assertions(): ISiteDetailsPageAssertions {
    return this;
  }

  get actions(): ISiteDetailsPageActions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site details page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteDetailsComponent.dashboardAndFeedSection, {
        assertionMessage: 'Site details page should be visible',
      });
    });
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
  async openContentDetailsPage(): Promise<void> {
    await this.clickOnElement(this.clickingOnCheckbox);
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Enter');
  }
}
