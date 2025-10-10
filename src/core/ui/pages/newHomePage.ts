import { expect, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/ui/pages/basePage';

import { FooterComponent } from '../components/footerComponent';

export class NewHomePage extends BasePage {
  readonly footerComponent: FooterComponent;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.footerComponent = new FooterComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the home page is loaded', async () => {
      await expect(this.page.locator('h1'), "Expected to find 'Home' in the page title").toContainText('Home', {
        timeout: 35_000,
      });
    });
  }

  get footer(): FooterComponent {
    return this.footerComponent;
  }
}
