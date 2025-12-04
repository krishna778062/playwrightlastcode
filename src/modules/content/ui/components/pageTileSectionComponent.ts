import { Locator, Page, test } from '@playwright/test';

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

  async verifyingSiteIsVisibleInSitesTile(siteName: string, tileName: string): Promise<void> {
    await test.step(`Verify site "${siteName}" is visible in Sites tile "${tileName}"`, async () => {
      // Find the tile by header text, then find the site link within that tile
      const tileSection = this.page
        .locator('aside.Tile')
        .filter({ has: this.page.locator('header h2').filter({ hasText: tileName }) });
      const siteLink = tileSection.locator('a.type--title').filter({ hasText: siteName }).first();
      await this.verifier.verifyTheElementIsVisible(siteLink, {
        assertionMessage: `Site "${siteName}" should be visible in Sites tile "${tileName}"`,
      });
    });
  }

  async verifyingSiteIsNotVisibleInSitesTile(siteName: string, tileName: string): Promise<void> {
    await test.step(`Verify site "${siteName}" is NOT visible in Sites tile "${tileName}"`, async () => {
      // Find the tile by header text, then verify the site link is not visible within that tile
      const tileSection = this.page
        .locator('aside.Tile')
        .filter({ has: this.page.locator('header h2').filter({ hasText: tileName }) });
      const siteLink = tileSection.locator('a.type--title').filter({ hasText: siteName }).first();
      await this.verifier.verifyTheElementIsNotVisible(siteLink, {
        assertionMessage: `Site "${siteName}" should NOT be visible in Sites tile "${tileName}"`,
      });
    });
  }

  async verifyingMemberIconIsNotVisibleForSite(siteName: string, tileName: string): Promise<void> {
    await test.step(`Verify member icon is NOT visible for site "${siteName}" in Sites tile "${tileName}"`, async () => {
      // Find the tile by header text
      const tileSection = this.page
        .locator('aside.Tile')
        .filter({ has: this.page.locator('header h2').filter({ hasText: tileName }) });
      // Find the site item (li.ListingItem) that contains the site name
      const siteItem = tileSection
        .locator('li.ListingItem')
        .filter({ has: this.page.locator('a.type--title').filter({ hasText: siteName }) });
      // Look for the member icon button with aria-label containing "members"
      const memberIconButton = siteItem.locator('button[aria-label*="members"]').first();
      await this.verifier.verifyTheElementIsNotVisible(memberIconButton, {
        assertionMessage: `Member icon should NOT be visible for site "${siteName}" in Sites tile "${tileName}"`,
      });
    });
  }
}
