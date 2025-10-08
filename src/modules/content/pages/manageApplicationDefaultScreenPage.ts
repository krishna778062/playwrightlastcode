import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { HomeFeedComponent } from '@/src/modules/content/components/homeFeedComponent';

export interface IManageApplicationPageActions {
  clickOnHomeFeed: () => Promise<void>;
}

export interface IManageApplicationPageAssertions {}
export class DefaultScreenPage extends BasePage {
  private homeFeedComponent: HomeFeedComponent;
  readonly clickingOnHomeFeed = this.page.getByRole('tab', { name: 'Home feed' });
  readonly emailNotificationHeading = this.page.getByRole('heading', { name: 'Email notifications' });

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.DEFAULT_SCREEN);
    this.homeFeedComponent = new HomeFeedComponent(page);
  }

  get actions(): IManageApplicationPageActions {
    return this;
  }

  get assertions(): IManageApplicationPageAssertions {
    return this;
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
