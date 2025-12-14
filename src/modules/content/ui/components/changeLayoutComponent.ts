import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export interface IChangeLayoutActions {
  clickIncludeFeed: () => Promise<void>;
  clickExcludeFeed: () => Promise<void>;
  selectTileLayout: (layoutIndex: string) => Promise<void>;
}

export interface IChangeLayoutAssertions { }

export class ChangeLayoutComponent extends BaseComponent implements IChangeLayoutActions, IChangeLayoutAssertions {
  readonly includeFeed: Locator;
  readonly doneButton: Locator;
  readonly recommendationFeedButton: Locator;
  readonly recommendedFeedExcludeButton: Locator;
  readonly tileLayoutRadioButtons: (layoutSign: string) => Locator;

  constructor(page: Page) {
    super(page);
    this.includeFeed = this.page.getByRole('checkbox', { name: 'Checkbox' });
    this.doneButton = this.page.getByRole('dialog').getByRole('button', { name: 'Done' });
    this.recommendationFeedButton = this.page.getByRole('radio', { name: 'Recommended Feed' });
    this.recommendedFeedExcludeButton = this.page.getByRole('radio', { name: 'Recommended' });
    this.tileLayoutRadioButtons = (layoutSign: string) => this.page.locator(`#dashboard-layout-${layoutSign}`);
  }

  async clickIncludeFeed(): Promise<void> {
    await test.step('Click on include feed checkbox', async () => {
      const isChecked = await this.includeFeed.isChecked();
      if (!isChecked) {
        await this.clickOnElement(this.includeFeed);
        await this.recommendationFeedButton.check();
        await this.clickOnElement(this.doneButton);
      } else {
        await this.recommendationFeedButton.check();
        await this.clickOnElement(this.doneButton);
      }
    });
  }

  async clickExcludeFeed(): Promise<void> {
    await test.step('Click on exclude feed checkbox', async () => {
      const isChecked = await this.includeFeed.isChecked();
      if (isChecked) {
        await this.clickOnElement(this.includeFeed);
        await this.recommendedFeedExcludeButton.check();
        await this.clickOnElement(this.doneButton);
      } else {
        await this.clickOnElement(this.doneButton);
      }
    });
  }
  async checkIncludeFeed(): Promise<void> {
    await test.step('Check include feed checkbox', async () => {
      const isChecked = await this.includeFeed.isChecked();
      if (!isChecked) {
        await this.clickOnElement(this.includeFeed);
      }
    });
  }

  async selectTileLayout(layoutSign: string): Promise<void> {
    await test.step(`Select tile layout with sign ${layoutSign} and enable feed`, async () => {
      
      const tileLayoutRadioButton = this.tileLayoutRadioButtons(layoutSign);

      await this.verifier.verifyTheElementIsVisible(tileLayoutRadioButton, {
        assertionMessage: `Tile layout radio button with sign ${layoutSign} should be visible`,
      });

      await this.clickOnElement(tileLayoutRadioButton);

      await this.clickOnElement(this.doneButton);
    });
  }
}
