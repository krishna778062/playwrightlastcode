import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { SiteCreationPage } from '@/src/modules/content/pages/siteCreationPage';

export interface ISitesListActions {
  clickAddSiteButton: () => Promise<SiteCreationPage>;
}

export interface ISitesListAssertions {}

export class SitesListPage extends BasePage implements ISitesListActions, ISitesListAssertions {
  // Add site button locators
  readonly addSiteButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SITES_LIST_PAGE);

    // Add site button locators
    this.addSiteButton = page.getByRole('button', { name: 'Add site' });
  }

  get actions(): ISitesListActions {
    return this;
  }

  get assertions(): ISitesListAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Sites List page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addSiteButton, {
        assertionMessage: 'Add site button should be visible',
        timeout: TIMEOUTS.LONG,
      });
    });
  }

  /**
   * Clicks the Add Site button to navigate to site creation page
   * @returns SiteCreationPage instance
   */
  async clickAddSiteButton(): Promise<SiteCreationPage> {
    await this.clickOnElement(this.addSiteButton, {
      stepInfo: 'Clicking on Add site button',
    });

    const siteCreationPage = new SiteCreationPage(this.page);
    await siteCreationPage.verifyThePageIsLoaded();

    return siteCreationPage;
  }
}
