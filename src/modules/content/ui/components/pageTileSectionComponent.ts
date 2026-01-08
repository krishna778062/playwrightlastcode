import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';

export class PageTileSectionComponent extends BaseComponent {
  readonly ellipsisButton: Locator;
  readonly editTileButton: Locator;
  readonly baseActionUtil: BaseActionUtil;
  readonly tileSection: (tileName: string) => Locator;
  readonly getSiteLinkLocator: (siteName: string, tileName: string) => Locator;
  readonly removeTileButton: Locator;
  readonly removeTileConfirmationDialog: Locator;
  readonly removeTileConfirmationButton: Locator;
  readonly getThreeDotsButtonForTile: (tileTitle: string) => Locator;
  readonly getTileHeadingLocator: (tileName: string) => Locator;
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
    this.tileSection = (tileName: string) =>
      page.locator('aside.Tile').filter({ has: this.page.locator('header h2').filter({ hasText: tileName }) });
    this.getSiteLinkLocator = (siteName: string, tileName: string) =>
      this.tileSection(tileName).locator('a.type--title').filter({ hasText: siteName }).first();
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
    //verify dialog is visible
    await this.verifier.verifyTheElementIsVisible(this.removeTileConfirmationDialog, {
      assertionMessage: 'Remove tile confirmation dialog should be visible',
    });
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

  async verifyingSiteIsVisibleInSitesTile(siteName: string, tileName: string): Promise<void> {
    await test.step(`Verify site "${siteName}" is visible in Sites tile "${tileName}"`, async () => {
      // Find the tile by header text, then find the site link within that tile
      const siteLink = this.getSiteLinkLocator(siteName, tileName);
      await this.verifier.verifyTheElementIsVisible(siteLink, {
        assertionMessage: `Site "${siteName}" should be visible in Sites tile "${tileName}"`,
      });
    });
  }

  async verifyingSiteIsNotVisibleInSitesTile(siteName: string, tileName: string): Promise<void> {
    await test.step(`Verify site "${siteName}" is NOT visible in Sites tile "${tileName}"`, async () => {
      // Find the tile by header text, then verify the site link is not visible within that tile
      const siteLink = this.getSiteLinkLocator(siteName, tileName);
      await this.verifier.verifyTheElementIsNotVisible(siteLink, {
        assertionMessage: `Site "${siteName}" should NOT be visible in Sites tile "${tileName}"`,
      });
    });
  }

  async verifyingMemberIconIsNotVisibleForSite(siteName: string, tileName: string): Promise<void> {
    await test.step(`Verify member icon is NOT visible for site "${siteName}" in Sites tile "${tileName}"`, async () => {
      // Find the tile by header text
      const siteItem = this.getSiteLinkLocator(siteName, tileName).locator('li.ListingItem');
      const memberIconButton = siteItem.locator('button[aria-label*="members"]').first();
      await this.verifier.verifyTheElementIsNotVisible(memberIconButton, {
        assertionMessage: `Member icon should NOT be visible for site "${siteName}" in Sites tile "${tileName}"`,
      });
    });
  }
}
