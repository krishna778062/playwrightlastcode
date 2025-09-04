import { Page, test } from '@playwright/test';

import { BasePage } from '@/src/core/pages/basePage';

export interface IManageSiteActions {
  navigateToContentTab: () => Promise<void>;
}

export interface IManageSiteAssertions {
  // Add assertions as needed
}

export class ManageSitePage extends BasePage implements IManageSiteActions, IManageSiteAssertions {
  // Locators
  readonly contentTab = this.page.locator(
    'a[href*="/content"], button:has-text("Content"), [data-testid="content-tab"]'
  );

  constructor(page: Page) {
    super(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.contentTab, {
      assertionMessage: 'Content tab should be visible on manage site page',
    });
  }

  get actions(): IManageSiteActions {
    return this;
  }

  get assertions(): IManageSiteAssertions {
    return this;
  }

  async navigateToContentTab(): Promise<void> {
    await test.step('Navigate to content tab', async () => {
      await this.clickOnElement(this.contentTab, {
        stepInfo: 'Click content tab',
      });
    });
  }
}
