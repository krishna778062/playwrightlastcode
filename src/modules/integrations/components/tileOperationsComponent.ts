import { DASHBOARD_BUTTONS } from '@integrations/constants/common';
import { BaseAppTileComponent } from '@integrations-components/baseAppTileComponent';
import { expect, Locator, Page, test } from '@playwright/test';

export class TileOperationsComponent extends BaseAppTileComponent {
  readonly tagElement: Locator;
  readonly button: (name: string) => Locator;
  readonly heading: (level: number) => Locator;
  readonly dialog: Locator;
  readonly combobox: (name: string) => Locator;
  readonly menuitem: (name: string) => Locator;
  readonly group: (name: string) => Locator;
  readonly radio: (name: string) => Locator;

  constructor(page: Page) {
    super(page);
    this.tagElement = page.locator('[data-testid="tag"]');
    this.button = (name: string) => page.getByRole('button', { name });
    this.heading = (level: number) => page.getByRole('heading', { level });
    this.dialog = page.getByRole('dialog');
    this.combobox = (name: string) => page.getByRole('combobox', { name });
    this.menuitem = (name: string) => page.getByRole('menuitem', { name });
    this.group = (name: string) => page.getByRole('group', { name });
    this.radio = (name: string) => page.getByRole('radio', { name });
  }

  /**
   * Personalize tile with field selection
   */
  async personalizeTile(tileTitle: string, fieldName: string, fieldValue: string): Promise<void> {
    await test.step(`Personalize tile: ${tileTitle}`, async () => {
      await this.openPersonalizeOptions(tileTitle);
      await this.selectFromDropdown(fieldName, fieldValue);
      await this.clickButton(DASHBOARD_BUTTONS.SAVE);
    });
  }

  /**
   * Generic method to verify GitHub tile data
   */
  async verifyGitHubTileData(tileTitle: string, statusPattern: RegExp): Promise<void> {
    await test.step(`Verify GitHub tile data for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();

      await expect(tile.getByText(/^#\d+/).first()).toBeVisible();
      await expect(tile.locator(this.heading(3)).first()).toBeVisible();
      await expect(tile.getByText(statusPattern).first()).toBeVisible();
      await expect(tile.getByText(/^Created\s+.*\s+ago$/).first()).toBeVisible();
    });
  }

  /**
   * Verify GitHub PR tile data
   */
  async verifyGitHubPRTileData(tileTitle: string): Promise<void> {
    await this.verifyGitHubTileData(tileTitle, /Pending review|Approved|Changes? requested|Draft|Open/i);
  }

  /**
   * Verify GitHub My Open PRs tile data
   */
  async verifyGitHubOpenPRs(tileTitle: string): Promise<void> {
    await this.verifyGitHubTileData(tileTitle, /Ready for review|Open|Draft/i);
  }

  /**
   * Generic method to select from dropdown
   */
  async selectFromDropdown(fieldName: string, option: string): Promise<void> {
    await test.step(`Select ${option} from ${fieldName}`, async () => {
      const dropdown = this.combobox(fieldName);
      await dropdown.click();
      const menuItem = this.page.getByRole('menuitem').filter({ hasText: option });
      await menuItem.click();
    });
  }

  /**
   * Select radio button option by field name and option text
   */
  async selectRadioOption(fieldName: string, option: string): Promise<void> {
    await test.step(`Select ${option} for ${fieldName}`, async () => {
      const field = this.group(fieldName);
      const radio = field.getByLabel(option);
      await radio.click();
    });
  }

  /**
   * Select any radio button option by label text (for unique labels)
   */
  async selectRadioOptionByLabel(option: string): Promise<void> {
    await test.step(`Select radio option: ${option}`, async () => {
      const radio = this.page.getByLabel(option);
      await radio.click();
    });
  }

  /**
   * Generic method to get tile container
   */
  private getTile(tileTitle: string) {
    return this.getTileContainers(tileTitle).first();
  }

  /**
   * Get tag element within a tile
   */
  private getTagElement(tile: any) {
    return tile.locator(this.tagElement);
  }

  /**
   * Verify status tag is shown in tile
   */
  async verifyStatusTag(tileTitle: string, status: string): Promise<void> {
    await test.step(`Verify ${status} status is shown for ${tileTitle}`, async () => {
      const tile = this.getTile(tileTitle);
      const statusTag = this.getTagElement(tile).filter({ hasText: status });
      await expect(statusTag).toBeVisible();
    });
  }

  /**
   * Verify tile shows "No results" state with settings button
   */
  async verifyNoResultsWithSettings(tileTitle: string): Promise<void> {
    await test.step(`Verify no results state for tile: ${tileTitle}`, async () => {
      const tile = this.getTile(tileTitle);
      await expect(tile.getByText('No results')).toBeVisible();
      await expect(tile.getByText('Try adjusting your')).toBeVisible();
      await expect(tile.locator(this.button('settings'))).toBeVisible();
    });
  }

  /**
   * Click settings button and verify personalize modal opens
   */
  async clickSettingsAndVerifyPersonalizeModal(tileTitle: string): Promise<void> {
    await test.step(`Click settings and verify personalize modal for tile: ${tileTitle}`, async () => {
      const tile = this.getTile(tileTitle);

      // Click the settings button
      await tile.locator(this.button('settings')).click();

      // Verify personalize modal opens
      await expect(this.dialog).toBeVisible();
      await expect(this.dialog.getByText(/Personalize.*tile/)).toBeVisible();
      await expect(this.page.getByLabel('Organization')).toBeVisible();
    });
  }

  /**
   * Generic method to verify tile redirects to any URL
   * @param tileTitle - The title of the tile
   * @param expectedUrl - The expected URL to redirect to
   * @param linkSelector - Optional custom link selector (defaults to 'a:has(h3)')
   */
  async verifyTileRedirects(tileTitle: string, expectedUrl: string, linkSelector?: string): Promise<void> {
    await test.step(`Verify tile '${tileTitle}' redirects to '${expectedUrl}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();
      const link = linkSelector ? tile.locator(linkSelector) : tile.locator('a:has(h3)');
      await link.first().click();
      const urlRegex = new RegExp(`^${expectedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*`);
      const popup = await this.page.waitForEvent('popup').catch(() => null);
      if (popup) {
        await expect(popup).toHaveURL(urlRegex);
        await popup.close();
      } else {
        await this.page.waitForURL(urlRegex);
        await this.page.goBack();
      }
    });
  }

  /**
   * Verify Expensify report tile data
   */
  async verifyExpensifyReportData(tileTitle: string): Promise<void> {
    await test.step(`Verify Expensify report tile data for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();

      // Verify report ID is visible (format: R followed by alphanumeric characters)
      await expect(tile.getByText(/^R[A-Za-z0-9]+$/).first()).toBeVisible();

      // Verify report title is visible (should be a heading3)
      await expect(tile.locator(this.heading(3)).first()).toBeVisible();

      // Verify amount is visible (format: $ followed by numbers and decimal)
      await expect(tile.getByText(/^\$\d+\.\d{2}$/).first()).toBeVisible();

      // Verify status is visible (should be in a tag with status indicator)
      await expect(this.getTagElement(tile).first()).toBeVisible();
      await expect(this.getTagElement(tile).locator('p').first()).toBeVisible();
      await expect(tile.locator('div:has-text("$")').locator('+ div').locator('p').first()).toBeVisible();

      // Verify last updated text is visible
      await expect(tile.getByText(/Last updated \d+ days? ago/).first()).toBeVisible();

      // Verify divider is present
      await expect(tile.locator('[data-testid="divider"]').first()).toBeVisible();
    });
  }

  /**
   * Verify Airtable tile content structure with task records
   * @param tileTitle - The title of the tile to verify
   */
  async verifyAirtableTileContentStructure(tileTitle: string): Promise<void> {
    await test.step(`Verify Airtable tile content structure for '${tileTitle}'`, async () => {
      const tile = this.page
        .locator('aside.Tile')
        .filter({ has: this.page.locator('img[src*="airtable"]') })
        .filter({ has: this.page.locator('h2.Tile-heading', { hasText: tileTitle }) });

      await expect(tile).toBeVisible({ timeout: 10_000 });

      // Verify main containers using data-testid
      await expect(tile.locator('[data-testid="container"]').first()).toBeVisible();

      // Get task records and verify at least one exists
      const containers = tile.locator('[data-testid="container"]');
      const count = await containers.count();
      await expect(count).toBeGreaterThan(0);

      // Verify first record has all required elements
      const firstRecord = containers.first();
      await expect(firstRecord.locator('img').first()).toBeVisible();
      await expect(firstRecord.locator('h3').first()).toBeVisible();
      await expect(firstRecord.locator('p').first()).toBeVisible();
      await expect(firstRecord.getByText(/Due/).first()).toBeVisible();
      await expect(this.getTagElement(firstRecord).first()).toBeVisible();
    });
  }
}
