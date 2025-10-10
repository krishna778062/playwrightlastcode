import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export interface IEditBarActions {
  clickEditCarousel: () => Promise<void>;
  clickOnAddTile: () => Promise<void>;
}

export interface IEditBarAssertions {}

export class EditBarComponent extends BaseComponent implements IEditBarActions, IEditBarAssertions {
  // Action buttons
  readonly editCarouselButton: Locator;
  readonly addTileButton: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators in constructor
    this.editCarouselButton = this.page.getByRole('button', { name: 'Edit carousel' });
    this.addTileButton = this.page.getByRole('button', { name: 'Add tile' });
  }

  // Actions
  get actions(): IEditBarActions {
    return this;
  }

  // Assertions
  get assertions(): IEditBarAssertions {
    return this;
  }

  async clickEditCarousel(): Promise<void> {
    await test.step('Click edit carousel', async () => {
      await this.clickOnElement(this.editCarouselButton);
    });
  }

  async clickOnAddTile(): Promise<void> {
    await test.step('Click add tile', async () => {
      await this.clickOnElement(this.addTileButton);
    });
  }
}
