import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';

export class PageTileSectionComponent extends BaseComponent {
  readonly ellipsisButton: Locator;
  readonly editTileButton: Locator;
  readonly baseActionUtil: BaseActionUtil;
  readonly removeTileButton: Locator;
  readonly removeTileConfirmationDialog: Locator;
  readonly removeTileConfirmationButton: Locator;
  readonly getThreeDotsButtonForTile: (tileTitle: string) => Locator;
  constructor(readonly page: Page) {
    super(page);
    this.baseActionUtil = new BaseActionUtil(page);
    this.ellipsisButton = page.locator('[type="button"][aria-label="Category option"]').first();
    this.editTileButton = page.getByRole('button', { name: 'Edit', exact: true });
    this.removeTileButton = page.getByRole('button', { name: 'Remove', exact: true });
    this.getThreeDotsButtonForTile = (tileTitle: string) =>
      this.page.locator(`div[class*="Tile-optionsContainer"]`).first();
    this.removeTileConfirmationDialog = page.getByRole('dialog', { name: 'Remove tile' });
    this.removeTileConfirmationButton = this.removeTileConfirmationDialog.getByRole('button', { name: 'Remove' });
  }

  async verifyingThePageTileSectionIsVisible(tileName: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.page.locator('header').filter({ hasText: tileName }), {
      assertionMessage: `Page tile section with title ${tileName} should be visible`,
    });
  }
  async verifyingThePageTileSectionIsNotVisible(tileName: string): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.page.locator('header').filter({ hasText: tileName }), {
      assertionMessage: `Page tile section with title ${tileName} should not be visible`,
    });
  }
  async verifyingCreatedPageIsVisibleInTile(pageName: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(
      this.page.locator('.type--title').filter({ hasText: pageName }).first(),
      {
        assertionMessage: `Created page ${pageName} should be visible in tile`,
        timeout: 15000,
      }
    );
  }
  async verifyingCreatedPageIsNotVisibleInTile(pageName: string): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(
      this.page.locator('.type--title').filter({ hasText: pageName }).first(),
      {
        assertionMessage: `Created page ${pageName} should not be visible in tile`,
        timeout: 15000,
      }
    );
  }
  async openingCreatedPageInTile(pageName: string): Promise<void> {
    await this.clickOnElement(this.page.locator('.type--title').filter({ hasText: pageName }).first());
  }
  async clickingOnEditTileButton(tileName: string): Promise<void> {
    await this.baseActionUtil.hoverOverElementInJavaScript(this.ellipsisButton);
    await this.clickOnElement(this.editTileButton);
  }
  async clickingOnRemoveTileButton(tileName: string): Promise<void> {
    await this.baseActionUtil.hoverOverElementInJavaScript(this.ellipsisButton);
    await this.clickOnElement(this.removeTileButton);
    await this.clickOnElement(this.removeTileButton);
  }

  async clickThreeDotsOnTile(tileTitle: string): Promise<void> {
    await test.step(`Click three dots menu on tile: ${tileTitle}`, async () => {
      const threeDotsButton = this.getThreeDotsButtonForTile(tileTitle);
      await this.verifier.verifyTheElementIsVisible(threeDotsButton, {
        assertionMessage: `Three dots button should be visible for tile "${tileTitle}"`,
      });
      await this.clickOnElement(threeDotsButton);
    });
  }

  async clickRemoveOptionFromMenu(): Promise<void> {
    await test.step('Click Remove option from menu', async () => {
      await this.verifier.verifyTheElementIsVisible(this.removeTileButton, {
        assertionMessage: 'Remove button should be visible in menu',
      });
      await this.clickOnElement(this.removeTileButton);
    });
  }

  async confirmRemoveTile(): Promise<void> {
    await test.step('Confirm remove tile', async () => {
      await this.verifier.verifyTheElementIsVisible(this.removeTileConfirmationDialog, {
        assertionMessage: 'Remove confirmation button should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.removeTileConfirmationButton, {
        assertionMessage: 'Remove confirmation button should be visible',
      });
      await this.clickOnElement(this.removeTileConfirmationButton);
    });
  }
}
