import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class CarouselComponent extends BaseComponent {
  // Carousel items
  readonly carouselItemLink: (text: string) => Locator;
  readonly selectSiteName: (text: string) => Locator;
  // Empty state
  readonly getSearchContentInput: Locator;
  readonly siteDashboardDoneButton: Locator;
  readonly homeDashboardDoneButton: Locator;

  constructor(page: Page) {
    super(page);

    this.carouselItemLink = (text: string) => page.getByLabel('Edit site dashboard').getByRole('link', { name: text });
    this.getSearchContentInput = page
      .locator(`div:has-text("Search content & social campaigns") + div >> input`)
      .first();
    this.siteDashboardDoneButton = page.getByLabel('Edit site dashboard').getByRole('button', { name: 'Done' });
    this.homeDashboardDoneButton = page.getByLabel('Edit carousel').getByRole('button', { name: 'Done' });
    this.selectSiteName = (text: string) =>
      page.locator('//div[@class="Mention-name"]/div').filter({ hasText: text }).first();
  }

  async getSearchCarouselInput(text: string): Promise<void> {
    await this.clickOnElement(this.getSearchContentInput);
    await this.getSearchContentInput.clear();
    await this.fillInElement(this.getSearchContentInput, text);
  }

  async selectCarouselItem(text: string): Promise<void> {
    await this.clickOnElement(this.selectSiteName(text));
  }

  async clickDoneButton(): Promise<void> {
    await this.clickOnElement(this.siteDashboardDoneButton);
  }

  async clickHomeDashboardDoneButton(): Promise<void> {
    await this.clickOnElement(this.homeDashboardDoneButton);
  }

  async verifyCarouselItem(text: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.carouselItemLink(text));
  }
}
