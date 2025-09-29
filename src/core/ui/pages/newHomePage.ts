import { expect, Page } from '@playwright/test';

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
    await expect(this.page.locator('h1')).toHaveText('Home');
  }

  get footer(): FooterComponent {
    return this.footerComponent;
  }
}
