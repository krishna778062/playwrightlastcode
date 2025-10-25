import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export interface ICarouselActions {}

export interface ICarouselAssertions {}

export class CarouselComponent extends BaseComponent implements ICarouselActions, ICarouselAssertions {
  // Carousel items
  readonly carouselItemLink: (text: string) => Locator;
  readonly selectSiteName: (text: string) => Locator;
  // Empty state
  readonly getSearchContentInput: Locator;
  readonly doneButton: Locator;

  constructor(page: Page) {
    super(page);

    this.carouselItemLink = (text: string) => page.locator('a').filter({ hasText: text });
    this.getSearchContentInput = page
      .locator(`div:has-text("Search content & social campaigns") + div >> input`)
      .first();
    this.doneButton = page.getByLabel('Edit site dashboard').getByRole('button', { name: 'Done' });
    this.selectSiteName = (text: string) =>
      page.locator('//div[@class="Mention-name"]/div').filter({ hasText: text }).first();
  }

  // Actions
  get actions(): ICarouselActions {
    return this;
  }

  // Assertions
  get assertions(): ICarouselAssertions {
    return this;
  }

  async getSearchCarouselInput(text: string): Promise<void> {
    await this.clickOnElement(this.getSearchContentInput);
    await this.fillInElement(this.getSearchContentInput, text);
  }

  async selectCarouselItem(text: string): Promise<void> {
    await this.clickOnElement(this.selectSiteName(text));
  }

  async clickDoneButton(): Promise<void> {
    await this.clickOnElement(this.doneButton);
  }

  async verifyCarouselItem(text: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.carouselItemLink(text));
  }
}
