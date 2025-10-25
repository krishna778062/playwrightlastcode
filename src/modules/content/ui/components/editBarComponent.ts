import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export interface IEditBarActions {
  clickEditCarousel: () => Promise<void>;
  clickOnAddTile: () => Promise<void>;
  clickChangeLayout: () => Promise<void>;
}

export interface IEditBarAssertions {}

export class EditBarComponent extends BaseComponent implements IEditBarActions, IEditBarAssertions {
  // Action buttons
  readonly editCarouselButton: Locator;
  readonly addTileButton: Locator;
  readonly changeLayoutButton: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators in constructor
    this.editCarouselButton = this.page.getByRole('button', { name: 'Edit carousel' });
    this.addTileButton = this.page.getByRole('button', { name: 'Add tile' });
    this.changeLayoutButton = this.page.getByRole('button', { name: 'Change layout' });
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

  async clickChangeLayout(): Promise<void> {
    await test.step('Click change layout', async () => {
      await this.clickOnElement(this.changeLayoutButton);
    });
  }
}
