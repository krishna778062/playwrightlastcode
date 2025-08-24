import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { SiteCreationPage } from './siteCreationPage';

export interface ISitesListActions {
  clickAddSiteButton: () => Promise<SiteCreationPage>;
}

export interface ISitesListAssertions {
  verifySitesPageLoaded: () => Promise<void>;
}

export class SitesListPage extends BasePage implements ISitesListActions, ISitesListAssertions {
  // Add site button locators
  readonly addSiteButton: Locator;
  readonly addSiteButtonAlt1: Locator;
  readonly addSiteButtonAlt2: Locator;

  constructor(page: Page) {
    super(page);

    // Add site button locators
    this.addSiteButton = page.getByRole('button', { name: 'Add site' });
    this.addSiteButtonAlt1 = page.locator('button:has-text("Add site")').first();
    this.addSiteButtonAlt2 = page.locator('[data-testid="add-site-button"]');
  }

  get actions(): ISitesListActions {
    return this;
  }

  get assertions(): ISitesListAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Sites List page is loaded', async () => {
      // Try multiple locator strategies
      let buttonFound = false;
      const locators = [this.addSiteButton, this.addSiteButtonAlt1, this.addSiteButtonAlt2];

      for (const locator of locators) {
        try {
          await this.verifier.verifyTheElementIsVisible(locator, {
            assertionMessage: 'Add site button should be visible',
            timeout: 5000,
          });
          buttonFound = true;
          break;
        } catch {
          console.log(`Locator failed: ${locator}, trying next...`);
        }
      }

      if (!buttonFound) {
        throw new Error('Add site button not found with any locator strategy');
      }
    });
  }

  async verifySitesPageLoaded(): Promise<void> {
    await this.verifyThePageIsLoaded();
  }

  /**
   * Clicks the Add Site button to navigate to site creation page
   * @returns SiteCreationPage instance
   */
  async clickAddSiteButton(): Promise<SiteCreationPage> {
    await test.step('Click Add Site button', async () => {
      // Wait for page elements to be ready
      await this.page.waitForTimeout(2000);

      // Direct approach - find and click Add site button
      const addSiteBtn = this.page.locator('button:has-text("Add site")').first();

      try {
        // Wait for button and click
        await addSiteBtn.waitFor({ state: 'visible', timeout: 15000 });
        await addSiteBtn.scrollIntoViewIfNeeded();
        await addSiteBtn.click({ force: true });
        console.log(`✅ Successfully clicked Add site button`);
      } catch (error) {
        console.log(`❌ Failed to click Add site button: ${error}`);
        throw error;
      }
    });

    const siteCreationPage = new SiteCreationPage(this.page);

    // Wait for site creation page to load with retry
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await siteCreationPage.verifyThePageIsLoaded();
        break;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`Site creation page load attempt ${attempt} failed: ${errorMessage}`);
        if (attempt === maxRetries) {
          throw error;
        }
        await this.page.waitForTimeout(3000);
      }
    }

    return siteCreationPage;
  }
}
