import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { HomeFeedComponent } from '@/src/modules/content/ui/components/homeFeedComponent';

export class DefaultScreenPage extends BasePage {
  private homeFeedComponent: HomeFeedComponent;
  readonly clickingOnHomeFeed: Locator;
  readonly emailNotificationHeading: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.DEFAULT_SCREEN);
    this.homeFeedComponent = new HomeFeedComponent(page);

    // Initialize locators
    this.clickingOnHomeFeed = this.page.getByRole('tab', { name: 'Home feed' });
    this.emailNotificationHeading = this.page.getByRole('heading', { name: 'Email notifications' });
  }
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify email notifications page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.emailNotificationHeading, {
        assertionMessage: 'Email notifications screen is visible',
      });
    });
  }

  async clickOnHomeFeed(): Promise<void> {
    await test.step('Clicking on home feed', async () => {
      await this.clickOnElement(this.clickingOnHomeFeed);
    });
  }
}
