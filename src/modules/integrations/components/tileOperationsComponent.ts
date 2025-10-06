import { DASHBOARD_BUTTONS } from '@integrations/constants/common';
import { BaseAppTileComponent } from '@integrations-components/baseAppTileComponent';
import { expect, Locator, Page, test } from '@playwright/test';
const DEFAULT_EVENT_TITLE = /^[\p{L}\p{N}\p{P}\p{S} ]{1,100}$/u;
const DEFAULT_EVENT_DATE =
  /(?!^)(?:[A-Z][a-z]{2},\s[A-Z][a-z]{2}\s(?:[1-9]|[12]\d|3[01]),\s\d{4}\sat\s(?:1[0-2]|0?\d):[0-5]\d(?:AM|PM)|Today\sat\s(?:1[0-2]|0?\d):[0-5]\d(?:AM|PM))/;

export class TileOperationsComponent extends BaseAppTileComponent {
  readonly tagElement: Locator;
  readonly button: (name: string) => Locator;
  readonly heading: (level: number) => Locator;
  readonly dialog: Locator;
  readonly combobox: (name: string) => Locator;
  readonly menuitem: (name: string) => Locator;
  readonly group: (name: string) => Locator;
  readonly radio: (name: string) => Locator;
  readonly airtableTile: Locator;
  readonly airtableImage: Locator;
  readonly tileHeading: Locator;
  readonly container: Locator;
  readonly divider: Locator;
  readonly noResultsText: Locator;
  readonly tryAdjustingText: Locator;
  readonly settingsButton: Locator;
  readonly personalizeText: Locator;
  readonly organizationLabel: Locator;
  readonly linkWithH3: Locator;
  readonly showMoreButton: Locator;
  readonly visibleRowsContainer: Locator;
  readonly menuitemFilter: Locator;
  readonly prNumberPattern: RegExp;
  readonly createdAgoPattern: RegExp;
  readonly reportIdPattern: RegExp;
  readonly amountPattern: RegExp;
  readonly lastUpdatedPattern: RegExp;
  readonly duePattern: RegExp;
  readonly ukgProPaystubLinks: Locator;
  readonly ukgProReceivedDateParagraph: Locator;
  readonly tileByTitle: (title: string) => Locator;
  readonly ukgTimeOffVacftHeading: Locator;
  readonly ukgTimeOffSickftHeading: Locator;
  readonly ukgTimeOffDivider: Locator;
  readonly usedText: Locator;
  readonly balanceText: Locator;
  readonly docuSignImage: Locator;
  readonly fromPattern: RegExp;
  readonly sentPattern: RegExp;
  readonly scheduleContainer: Locator;
  readonly scheduleShowAllLink: Locator;
  readonly dateEmblemContainer: Locator;
  readonly scheduleHeading: Locator;
  readonly scheduleTimeRange: Locator;
  readonly scheduleDuration: Locator;
  readonly canvasContainer: Locator;
  readonly loopWrapper: Locator;
  readonly loopContainer: Locator;
  readonly taskLink: Locator;
  readonly taskTitle: Locator;
  readonly statusTag: Locator;
  readonly MondayLastUpdatedPattern: RegExp;

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
    this.airtableTile = page.locator('aside.Tile');
    this.airtableImage = page.locator('img[src*="airtable"]');
    this.tileHeading = page.locator('h2.Tile-heading');
    this.container = page.locator('[data-testid="container"]');
    this.divider = page.locator('[data-testid="divider"]');
    this.noResultsText = page.getByText('No results');
    this.tryAdjustingText = page.getByText('Try adjusting your');
    this.settingsButton = page.getByRole('button', { name: 'settings' });
    this.personalizeText = page.getByText(/Personalize.*tile/);
    this.organizationLabel = page.getByLabel('Organization');
    this.linkWithH3 = page.locator('a:has(h3)');
    this.menuitemFilter = page.getByRole('menuitem');
    this.showMoreButton = page.getByRole('button', { name: 'Show more' });
    this.visibleRowsContainer = page.locator('[data-testid="container"][aria-hidden="false"]');
    this.docuSignImage = page.locator('img[src*="docusign"]');
    // Regex patterns for text matching
    this.prNumberPattern = /^#\d+/;
    this.createdAgoPattern = /^Created\s+.*\s+ago$/;
    this.reportIdPattern = /^R[A-Za-z0-9]+$/;
    this.amountPattern = /^\$\d+\.\d{2}$/;
    this.lastUpdatedPattern = /Last updated \d+ days? ago/;
    this.duePattern = /Due/;
    this.ukgProPaystubLinks = page.getByRole('link', { name: /ultipro\.com/ });
    this.ukgProReceivedDateParagraph = page.getByText(/Received on/);
    this.tileByTitle = (title: string) => page.getByRole('heading', { name: title }).locator('..');
    this.ukgTimeOffVacftHeading = page.getByRole('heading', { name: 'VACFT', level: 3 });
    this.ukgTimeOffSickftHeading = page.getByRole('heading', { name: 'SICKFT', level: 3 });
    this.ukgTimeOffDivider = page.getByTestId('divider');
    this.usedText = page.getByText(/Used: \d+(\.\d+)? hours/).first();
    this.balanceText = page.getByText(/Balance: \d+(\.\d+)? hours/).first();
    this.fromPattern = /From/;
    this.sentPattern = /Sent \d+ days? ago/;
    // Schedule tile locators
    this.scheduleContainer = page
      .locator('[data-testid="container"]')
      .filter({ has: page.locator('[data-testid="date-emblem-container"]') });
    this.scheduleShowAllLink = page.getByRole('link', { name: /Show all in.*WFM/i });
    this.dateEmblemContainer = page.getByTestId('date-emblem-container');
    this.scheduleHeading = page.getByRole('heading', { level: 3 });
    this.scheduleTimeRange = page.getByText(/^\d{1,2}:\d{2}\s+(am|pm)\s+-\s+\d{1,2}:\d{2}\s+(am|pm)$/);
    this.scheduleDuration = page.getByText(/\d+\s+hrs?\s+\d+\s+mins?/);
    this.canvasContainer = page.locator('#canvasContainer');
    this.loopWrapper = page.locator('div[class*="loopWrapper"]');
    this.loopContainer = page.locator('div[class*="loopContainer"]');
    this.taskLink = page.getByRole('link').filter({ has: page.getByRole('heading', { level: 3 }) });
    this.taskTitle = page.getByRole('heading', { level: 3 });
    this.statusTag = page.getByTestId('tag');
    this.MondayLastUpdatedPattern = /Last updated on/;
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

      await expect(tile.getByText(this.prNumberPattern).first()).toBeVisible();
      await expect(tile.locator(this.heading(3)).first()).toBeVisible();
      await expect(tile.getByText(statusPattern).first()).toBeVisible();
      await expect(tile.getByText(this.createdAgoPattern).first()).toBeVisible();
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
      await this.clickOnElement(dropdown);
      const menuItem = this.menuitemFilter.filter({ hasText: option });
      await this.clickOnElement(menuItem);
    });
  }

  /**
   * Select radio button option by field name and option text
   */
  async selectRadioOption(fieldName: string, option: string): Promise<void> {
    await test.step(`Select ${option} for ${fieldName}`, async () => {
      const field = this.group(fieldName);
      const radio = field.getByLabel(option);
      await this.clickOnElement(radio);
    });
  }

  /**
   * Select any radio button option by label text (for unique labels)
   */
  async selectRadioOptionByLabel(option: string): Promise<void> {
    await test.step(`Select radio option: ${option}`, async () => {
      const radio = this.page.getByLabel(option);
      await this.clickOnElement(radio);
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
      await expect(tile.locator(this.noResultsText)).toBeVisible();
      await expect(tile.locator(this.tryAdjustingText)).toBeVisible();
      await expect(tile.locator(this.settingsButton)).toBeVisible();
    });
  }

  /**
   * Click settings button and verify personalize modal opens
   */
  async clickSettingsAndVerifyPersonalizeModal(tileTitle: string): Promise<void> {
    await test.step(`Click settings and verify personalize modal for tile: ${tileTitle}`, async () => {
      const tile = this.getTile(tileTitle);

      // Click the settings button
      await this.clickOnElement(tile.locator(this.settingsButton));

      // Verify personalize modal opens
      await expect(this.dialog).toBeVisible();
      await expect(this.dialog.locator(this.personalizeText)).toBeVisible();
      await expect(this.organizationLabel).toBeVisible();
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
      const link = linkSelector ? tile.locator(linkSelector) : tile.locator(this.linkWithH3);
      await this.clickOnElement(link.first());
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
      await expect(tile.getByText(this.reportIdPattern).first()).toBeVisible();

      // Verify report title is visible (should be a heading3)
      await expect(tile.locator(this.heading(3)).first()).toBeVisible();

      // Verify amount is visible (format: $ followed by numbers and decimal)
      await expect(tile.getByText(this.amountPattern).first()).toBeVisible();

      // Verify status is visible (should be in a tag with status indicator)
      await expect(this.getTagElement(tile).first()).toBeVisible();
      await expect(this.getTagElement(tile).locator('p').first()).toBeVisible();
      await expect(tile.locator('div:has-text("$")').locator('+ div').locator('p').first()).toBeVisible();

      // Verify last updated text is visible
      await expect(tile.getByText(this.lastUpdatedPattern).first()).toBeVisible();

      // Verify divider is present
      await expect(tile.locator(this.divider).first()).toBeVisible();
    });
  }

  /**
   * Verify Airtable tile content structure with task records
   * @param tileTitle - The title of the tile to verify
   */
  async verifyAirtableTileContentStructure(tileTitle: string): Promise<void> {
    await test.step(`Verify Airtable tile content structure for '${tileTitle}'`, async () => {
      const tile = this.airtableTile
        .filter({ has: this.airtableImage })
        .filter({ has: this.tileHeading.filter({ hasText: tileTitle }) });

      await expect(tile).toBeVisible({ timeout: 10_000 });

      // Verify main containers using data-testid
      await expect(tile.locator(this.container).first()).toBeVisible();

      // Get task records and verify at least one exists
      const containers = tile.locator(this.container);
      const count = await containers.count();
      await expect(count).toBeGreaterThan(0);

      // Verify first record has all required elements
      const firstRecord = containers.first();
      await expect(firstRecord.locator('img').first()).toBeVisible();
      await expect(firstRecord.locator('h3').first()).toBeVisible();
      await expect(firstRecord.locator('p').first()).toBeVisible();
      await expect(firstRecord.getByText(this.duePattern).first()).toBeVisible();
      await expect(this.getTagElement(firstRecord).first()).toBeVisible();
    });
  }
  /**
   * Verify UKG Pro tile metadata including pay periods, received dates, and links
   * @param tileTitle - The title of the tile to verify
   */
  async verifyUKGProTileMetadata(tileTitle: string): Promise<void> {
    await test.step(`Verify UKG Pro tile metadata for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();
      await expect(tile, `UKG Pro tile '${tileTitle}' should be visible`).toBeVisible({ timeout: 10_000 });
      const paystubLinks = tile.locator(this.ukgProPaystubLinks);
      const linkCount = await paystubLinks.count();
      if (linkCount > 0) {
        const firstEntry = paystubLinks.first();
        const payPeriodHeading = firstEntry.locator('h3');
        await expect(payPeriodHeading, 'Pay period heading should be visible').toBeVisible();
        const payPeriodText = await payPeriodHeading.textContent();
        expect(payPeriodText, 'Pay period text should match expected format').toMatch(
          /\w{3}\s+\d{1,2}\s+-\s+\w{3}\s+\d{1,2},\s+\d{4}/
        );
        const linkHref = await firstEntry.getAttribute('href');
        expect(linkHref, 'Paystub link should contain ultipro.com').toContain('ultipro.com');
        // Verify received date
        const receivedDateParagraph = tile.locator(this.ukgProReceivedDateParagraph);
        await expect(receivedDateParagraph, 'Received date paragraph should be visible').toBeVisible();
        const receivedDateText = await receivedDateParagraph.textContent();
        expect(receivedDateText, 'Received date text should match expected format').toMatch(
          /Received on \w{3}\s+\d{1,2},\s+\d{4}/
        );
      }
    });
  }
  /**
   * Verify Calendar upcoming events tile data
   */
  async verifyUpcomingEventsTileData(
    tileTitle: string,
    eventTitle: RegExp = DEFAULT_EVENT_TITLE,
    calDate: RegExp = DEFAULT_EVENT_DATE
  ): Promise<void> {
    await test.step(`Verify Calendar upcoming events tile data for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();
      const rows = tile.locator(this.container);
      const row = rows
        .filter({ has: this.page.getByText(eventTitle) })
        .filter({ has: this.page.getByText(calDate) })
        .first();
      await expect(row).toBeVisible();
    });
  }

  /**
   * Verify Display Time Off tile metadata including VACFT and SICKFT sections
   * @param tileTitle - The title of the tile to verify
   */
  async verifyDisplayTimeOffMetadata(tileTitle: string): Promise<void> {
    await test.step(`Verify Display Time Off tile metadata for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();
      await expect(tile, `Display Time Off tile '${tileTitle}' should be visible`).toBeVisible({ timeout: 10_000 });

      // Verify VACFT section
      await expect(tile.locator(this.ukgTimeOffVacftHeading), 'VACFT heading should be visible').toBeVisible();
      await expect(tile.locator(this.usedText), 'Used text should be visible in VACFT section').toBeVisible();
      await expect(tile.locator(this.balanceText), 'Balance text should be visible in VACFT section').toBeVisible();

      // Verify divider
      await expect(
        tile.locator(this.ukgTimeOffDivider).first(),
        'Divider should be visible between sections'
      ).toBeVisible();

      // Verify SICKFT section
      await expect(tile.locator(this.ukgTimeOffSickftHeading), 'SICKFT heading should be visible').toBeVisible();
      await expect(tile.locator(this.usedText), 'Used text should be visible in SICKFT section').toBeVisible();
      await expect(tile.locator(this.balanceText), 'Balance text should be visible in SICKFT section').toBeVisible();
    });
  }
  /**
   * Verify 'Show more' behavior
   */
  async verifyShowMoreBehavior(tileTitle: string): Promise<void> {
    await test.step(`Verify 'Show more' behavior for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();
      const rowsVisible = tile.locator(this.visibleRowsContainer);
      const showMoreButton = tile.locator(this.showMoreButton);

      await expect(showMoreButton, 'Show More button should be visible').toBeVisible();
      const initialVisible = await rowsVisible.count();
      await expect(initialVisible).toBeGreaterThanOrEqual(4);

      await this.clickOnElement(showMoreButton);
      await expect.poll(async () => rowsVisible.count(), { timeout: 10_000 }).toBeGreaterThan(initialVisible);
    });
  }
  /**
   * Verify DocuSign tile content structure
   * @param tileTitle - The title of the tile to verify
   */
  async verifyDocuSignTileContentStructure(tileTitle: string): Promise<void> {
    await test.step(`Verify DocuSign tile content structure for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();
      await expect(tile, `DocuSign tile '${tileTitle}' should be visible`).toBeVisible({ timeout: 10_000 });
      // Verify added Tile data
      await expect(tile.locator(this.docuSignImage), 'DocuSign image should be visible in tile').toBeVisible();
      // Get task records and verify at least one exists
      const containers = tile.locator(this.container);
      const count = await containers.count();
      await expect(count, 'At least one container should be present in DocuSign tile').toBeGreaterThan(0);
      // Verify first record has all required elements
      const firstRecord = containers.first();
      await expect(
        firstRecord.getByText(this.duePattern).first(),
        'Due date should be visible in the first record'
      ).toBeVisible();
      await expect(
        firstRecord.getByText(this.fromPattern).first(),
        'From field should be visible in the first record'
      ).toBeVisible();
      await expect(
        firstRecord.getByText(this.sentPattern).first(),
        'Sent field should be visible in the first record'
      ).toBeVisible();
    });
  }

  /**
   * Verify schedule tile metadata
   * @param tileTitle - The title of the tile to verify
   */
  async verifyScheduleTileMetadata(tileTitle: string): Promise<void> {
    await test.step(`Verify schedule tile metadata for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();
      await expect(tile).toBeVisible({ timeout: 10_000 });

      // Verify schedule entries exist
      const schedules = tile.locator(this.scheduleContainer);
      await expect(schedules.first()).toBeVisible();

      // Verify key elements in first schedule entry
      const firstSchedule = schedules.first();
      await expect(firstSchedule.locator(this.dateEmblemContainer).first()).toBeVisible();
      await expect(firstSchedule.locator(this.scheduleHeading).first()).toBeVisible();
      await expect(firstSchedule.locator(this.scheduleTimeRange).first()).toBeVisible();
      await expect(firstSchedule.locator(this.scheduleDuration).first()).toBeVisible();

      // Verify show all link if present
      const showAllLink = tile.locator(this.scheduleShowAllLink);
      if ((await showAllLink.count()) > 0) {
        await expect(showAllLink.first()).toBeVisible();
      }
    });
  }

  /**
   * Click "Show all in UKG Pro WFM" link and verify redirect URL
   * @param tileTitle - The title of the tile containing the link
   * @param expectedUrl - The expected URL to redirect to
   */
  async clickShowAllAndVerifyRedirect(tileTitle: string, expectedUrl: string): Promise<void> {
    await test.step(`Click 'Show all' link and verify redirect for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();
      const showAllLink = tile.locator(this.scheduleShowAllLink);
      await this.clickOnElement(showAllLink.first());
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
   * Verify Monday.com tile content structure
   * @param tileTitle - The title of the tile to verify
   */
  async verifyMondayDotComTileContentStructure(tileTitle: string): Promise<void> {
    await test.step(`Verify Monday.com tile content structure for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();
      await expect(tile, `Monday.com tile '${tileTitle}' should be visible`).toBeVisible({ timeout: 10_000 });

      // Verify main canvas and task containers
      await expect(tile.locator(this.canvasContainer), 'Canvas container should be visible').toBeVisible();
      await expect(tile.locator(this.loopWrapper), 'Loop wrapper should be visible').toBeVisible();

      // Check at least one task exists
      const taskContainers = tile.locator(this.loopContainer);
      await expect(await taskContainers.count(), 'At least one task should be present').toBeGreaterThan(0);

      // Verify first task structure
      const firstTask = taskContainers.first();
      const taskLink = firstTask
        .getByRole('link')
        .filter({ has: this.page.getByRole('heading', { level: 3 }) })
        .first();

      await expect(taskLink, 'Task link should be visible').toBeVisible();
      await expect(taskLink.getByRole('heading', { level: 3 }), 'Task title should be visible').toBeVisible();
      await expect(firstTask.getByTestId('tag'), 'Status tag should be visible').toBeVisible();
      await expect(firstTask.getByTestId('tag').getByRole('paragraph'), 'Status text should be visible').toBeVisible();
      await expect(
        firstTask.getByText(this.MondayLastUpdatedPattern),
        'Last updated text should be visible'
      ).toBeVisible();
      await expect(firstTask.getByTestId('divider'), 'Divider should be visible').toBeVisible();
    });
  }
}
