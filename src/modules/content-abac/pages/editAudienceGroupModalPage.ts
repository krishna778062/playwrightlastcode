import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export interface ISiteDetailsPageActions {
  clickingOnIUnderstandCheckbox: () => Promise<void>;
  clickingOnContinueButton: () => Promise<void>;
}

export interface ISiteDetailsPageAssertions {}
export class EditAudienceGroupModalPage extends BasePage {
  readonly editAudienceGroupModalHeading = this.page.getByText('Edit audience group', { exact: true });
  readonly iUnderstandCheckbox = this.page.getByRole('checkbox', { name: 'I understand' });
  readonly continueButton = this.page.locator('[type="button"]:has-text("Continue")');

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.SITE_DETAILS_PAGE(siteId));
  }

  get actions(): ISiteDetailsPageActions {
    return this;
  }

  get assertions(): ISiteDetailsPageAssertions {
    return this;
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
