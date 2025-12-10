import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';

export class PageTileSectionComponent extends BaseComponent {
  readonly ellipsisButton: Locator;
  readonly editTileButton: Locator;
  readonly baseActionUtil: BaseActionUtil;
  readonly removeTileButton: Locator;
  readonly getTileHeadingLocator: (tileName: string) => Locator;
  constructor(readonly page: Page) {
    super(page);
    this.baseActionUtil = new BaseActionUtil(page);
    this.ellipsisButton = page.locator('[type="button"][aria-label="Category option"]').first();
    this.editTileButton = page.getByRole('button', { name: 'Edit', exact: true });
    this.removeTileButton = page.getByRole('button', { name: 'Remove', exact: true });
    this.getTileHeadingLocator = (tileName: string) =>
      this.page.getByRole('heading', { name: new RegExp(tileName, 'i') }).first();
  }

  async verifyingThePageTileSectionIsVisible(tileName: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.getTileHeadingLocator(tileName), {
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
}
