import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';
import { AddContentTileComponent } from '@/src/modules/content/ui/components/addContentTileComponent';
import { AddTileComponent } from '@/src/modules/content/ui/components/addTileComponent';
import { PageTileSectionComponent } from '@/src/modules/content/ui/components/pageTileSectionComponent';
import { dragAndDrop } from '@/src/modules/form-designer/utils/dragAndDropUtil';

export interface IHomeDashboardPageActions {
  clickOnEditDashboardButton: () => Promise<void>;
  clickOnAddTileButton: () => Promise<void>;
  clickOnAddContentTileOption: () => Promise<void>;
  selectingPagesAsContentType: () => Promise<void>;
  namingTheTile: (tileName: string) => Promise<void>;
  clickingOnAddToHomeButton: () => Promise<void>;
  clickingOnDoneButton: () => Promise<void>;
  openingCreatedPageInTile: (pageName: string) => Promise<void>;
  clickingOnEditTileButton: (tileName: string) => Promise<void>;
  selectingSiteRadioButton: (siteName: string) => Promise<void>;
  selectingShowcaseRadioButton: () => Promise<void>;
  clickingOnSaveButton: () => Promise<void>;
  clickingOnRemoveTileButton: (tileName: string) => Promise<void>;
  addTextHtmlLinksTile: (description: string, tileTitle: string) => Promise<void>;
  addSitesCategoryTile: (siteName: string, tileTitle: string) => Promise<void>;
  reorderTiles: (sourceTileTitle: string, targetTileTitle: string) => Promise<void>;
  clickThreeDotsOnTile: (tileTitle: string) => Promise<void>;
}

export interface IHomeDashboardPageAssertions {
  verifyToastMessage: (toastMessage: string) => Promise<void>;
  verifyingThePageTileSectionIsVisible: (tileName: string) => Promise<void>;
  verifyingCreatedPageIsVisibleInTile: (pageName: string) => Promise<void>;
  verifyingCreatedPageIsNotVisibleInTile: (pageName: string) => Promise<void>;
  verifyingThePageTileSectionIsNotVisible: (tileName: string) => Promise<void>;
  verifyTileOrder: (tileTitles: string[]) => Promise<void>;
}
export class HomeDashboardPage extends BasePage implements IHomeDashboardPageActions, IHomeDashboardPageAssertions {
  addTileComponent: AddTileComponent;
  addContentTileComponent: AddContentTileComponent;
  baseActionUtil: BaseActionUtil;
  pageTileSectionComponent: PageTileSectionComponent;

  readonly editDashboardButton: Locator = this.page.getByRole('button', { name: 'Manage dashboard' });
  readonly addTileButton: Locator = this.page.getByRole('button', { name: 'Add tile' });
  readonly doneButton: Locator = this.page.getByRole('button', { name: 'Done' });
  readonly addContentTileDialog: Locator = this.page.getByRole('dialog', { name: 'Add content tile' });
  readonly tileDialog: (tileTitle: string) => Locator = (tileTitle: string) =>
    this.page.getByRole('dialog', { name: `${tileTitle}` });
  readonly addToHomeButton: Locator = this.page.getByRole('button', { name: 'Add to home' });
  readonly getTileLocator: (tileTitle: string) => Locator = (tileTitle: string) =>
    this.page.getByRole('heading', { name: tileTitle });

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.addTileComponent = new AddTileComponent(page);
    this.addContentTileComponent = new AddContentTileComponent(page);
    this.baseActionUtil = new BaseActionUtil(page);
    this.pageTileSectionComponent = new PageTileSectionComponent(page);
  }

  get actions(): IHomeDashboardPageActions {
    return this;
  }

  get assertions(): IHomeDashboardPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify topic details page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.page.getByText('Home'), {
        assertionMessage: 'Topic details page should be visible',
      });
    });
  }
  async clickOnEditDashboardButton(): Promise<void> {
    await this.clickOnElement(this.editDashboardButton);
  }
  async clickOnAddTileButton(): Promise<void> {
    await this.clickOnElement(this.addTileButton);
  }
  async clickOnAddContentTileOption(): Promise<void> {
    await this.addTileComponent.clickingOnAddContentTileOption();
  }
  async selectingPagesAsContentType(): Promise<void> {
    await this.addContentTileComponent.selectingPagesAsContentType();
  }
  async namingTheTile(tileName: string): Promise<void> {
    await this.addContentTileComponent.namingTheTile(tileName);
  }
  async clickingOnAddToHomeButton(): Promise<void> {
    await test.step('Click on Add to home button', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addToHomeButton);
      await this.clickOnElement(this.addToHomeButton);
    });
  }
  async verifyToastMessage(toastMessage: string): Promise<void> {
    await this.baseActionUtil.verifyToastMessageIsVisibleWithText(toastMessage);
  }
  async clickingOnDoneButton(): Promise<void> {
    await this.clickOnElement(this.doneButton);
  }
  async verifyingThePageTileSectionIsVisible(tileName: string): Promise<void> {
    await this.pageTileSectionComponent.verifyingThePageTileSectionIsVisible(tileName);
  }
  async verifyingThePageTileSectionIsNotVisible(tileName: string): Promise<void> {
    await this.pageTileSectionComponent.verifyingThePageTileSectionIsNotVisible(tileName);
  }
  async verifyingCreatedPageIsVisibleInTile(pageName: string): Promise<void> {
    await this.pageTileSectionComponent.verifyingCreatedPageIsVisibleInTile(pageName);
  }
  async verifyingCreatedPageIsNotVisibleInTile(pageName: string): Promise<void> {
    await this.pageTileSectionComponent.verifyingCreatedPageIsNotVisibleInTile(pageName);
  }
  async openingCreatedPageInTile(pageName: string): Promise<void> {
    await this.pageTileSectionComponent.openingCreatedPageInTile(pageName);
  }
  async clickingOnEditTileButton(tileName: string): Promise<void> {
    await this.pageTileSectionComponent.clickingOnEditTileButton(tileName);
  }
  async selectingSiteRadioButton(siteName: string): Promise<void> {
    await this.addContentTileComponent.selectingSiteRadioButton(siteName);
  }
  async selectingShowcaseRadioButton(): Promise<void> {
    await this.addContentTileComponent.selectingShowcaseRadioButton();
  }
  async clickingOnSaveButton(): Promise<void> {
    await this.addContentTileComponent.clickingOnSaveButton();
  }
  async clickingOnRemoveTileButton(tileName: string): Promise<void> {
    await this.pageTileSectionComponent.clickingOnRemoveTileButton(tileName);
  }

  async addTextHtmlLinksTile(description: string, tileTitle: string): Promise<void> {
    await test.step(`Add Text/HTML & Links tile: ${tileTitle}`, async () => {
      await this.clickOnAddTileButton();
      await this.addContentTileComponent.clickTextHtmlLinksTab();
      await this.addContentTileComponent.namingTheTile(tileTitle);
      await this.addContentTileComponent.enterTextTileDescription(description);
      await this.clickingOnAddToHomeButton();
    });
  }

  async addSitesCategoryTile(siteName: string, tileTitle: string): Promise<void> {
    await test.step(`Add Sites & Category tile: ${tileTitle}`, async () => {
      await this.clickOnAddTileButton();
      await this.addContentTileComponent.clickSitesCategoryTab();
      await this.addContentTileComponent.namingTheTile(tileTitle);
      await this.addContentTileComponent.searchAndSelectSite(siteName);
      await this.clickingOnAddToHomeButton();
    });
  }

  async reorderTiles(sourceTileTitle: string, targetTileTitle: string): Promise<void> {
    await test.step(`Reorder tiles: move ${sourceTileTitle} to position of ${targetTileTitle}`, async () => {
      const sourceTile = this.getTileLocator(sourceTileTitle);
      const targetTile = this.getTileLocator(targetTileTitle);

      await this.verifier.verifyTheElementIsVisible(sourceTile, {
        assertionMessage: `Source tile "${sourceTileTitle}" should be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(targetTile, {
        assertionMessage: `Target tile "${targetTileTitle}" should be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });

      // Use the drag and drop utility
      await dragAndDrop(this.page, sourceTile, targetTile);
    });
  }

  async clickThreeDotsOnTile(tileTitle: string): Promise<void> {
    await this.pageTileSectionComponent.clickThreeDotsOnTile(tileTitle);
  }

  async verifyTileOrder(tileTitles: string[]): Promise<void> {
    await test.step(`Verify tiles are in order: ${tileTitles.join(', ')}`, async () => {
      // Get all tile headers in DOM order
      const allTileHeaders = this.page.locator('header').filter({ hasText: new RegExp(tileTitles.join('|')) });
      const tileCount = await allTileHeaders.count();

      if (tileCount !== tileTitles.length) {
        throw new Error(`Expected ${tileTitles.length} tiles, but found ${tileCount} tiles matching the titles`);
      }

      // Verify each tile is in the expected position
      for (let i = 0; i < tileTitles.length; i++) {
        const expectedTitle = tileTitles[i];
        const tileAtPosition = allTileHeaders.nth(i);

        await this.verifier.verifyTheElementIsVisible(tileAtPosition, {
          assertionMessage: `Tile at position ${i + 1} should be visible`,
        });

        const tileText = await tileAtPosition.textContent();
        if (!tileText?.includes(expectedTitle)) {
          throw new Error(`Tile at position ${i + 1} should be "${expectedTitle}", but found "${tileText}"`);
        }
      }
    });
  }
}
