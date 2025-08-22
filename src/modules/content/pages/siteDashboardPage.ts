import { Page, test } from '@playwright/test';

import { BasePage } from '@/src/core/pages/basePage';

export interface ISiteDashboardActions {
  navigateToMangeSite: () => Promise<void>;
}

export interface ISiteDashboardAssertions {
  // Add assertions as needed
}

export class SiteDashboardPage extends BasePage implements ISiteDashboardActions, ISiteDashboardAssertions {
  // Locators
  readonly manageSiteButton = this.page.locator('button:has-text("Manage Site"), a:has-text("Manage Site")');

  constructor(page: Page) {
    super(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.manageSiteButton, {
      assertionMessage: 'Manage site button should be visible on site dashboard page',
    });
  }

  get actions(): ISiteDashboardActions {
    return this;
  }

  get assertions(): ISiteDashboardAssertions {
    return this;
  }

  async navigateToMangeSite(): Promise<void> {
    await test.step('Navigate to manage site', async () => {
      await this.clickOnElement(this.manageSiteButton, {
        stepInfo: 'Click manage site button',
      });
    });
  }
}
