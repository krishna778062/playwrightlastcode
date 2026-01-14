import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export class EditAudienceGroupModalPage extends BasePage {
  readonly editAudienceGroupModalHeading: Locator;
  readonly iUnderstandCheckbox: Locator;
  readonly continueButton: Locator;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.SITE_DETAILS_PAGE(siteId));

    // Initialize locators
    this.editAudienceGroupModalHeading = this.page.getByText('Edit audience group', { exact: true });
    this.iUnderstandCheckbox = this.page.getByRole('checkbox', { name: 'I understand' });
    this.continueButton = this.page.locator('[type="button"]:has-text("Continue")');
  }
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site details page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.editAudienceGroupModalHeading, {
        assertionMessage: 'Site details page should be visible',
      });
    });
  }

  async clickingOnIUnderstandCheckbox(): Promise<void> {
    await test.step('Clicking on i understand checkbox', async () => {
      await this.clickOnElement(this.iUnderstandCheckbox);
    });
  }

  async clickingOnContinueButton(): Promise<void> {
    await test.step('Clicking on continue button', async () => {
      await this.clickOnElement(this.continueButton);
    });
  }
}
