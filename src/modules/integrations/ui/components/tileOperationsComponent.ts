import { DASHBOARD_BUTTONS } from '@integrations/constants/common';
import { BaseAppTileComponent } from '@integrations-components/baseAppTileComponent';
import { expect, Locator, Page, test } from '@playwright/test';
const DEFAULT_EVENT_TITLE = /^[\p{L}\p{N}\p{P}\p{S} ]{1,100}$/u;
const DEFAULT_EVENT_DATE =
  /(?:(?:[A-Z][a-z]{2},?\s)?[A-Z][a-z]{2}\s(?:[1-9]|[12]\d|3[01])(?:,\s\d{4})?(?:\s(?:at|to)\s(?:1[0-2]|0?\d):[0-5]\d(?:AM|PM))?(?:\s-\s[A-Z][a-z]{2}\s(?:[1-9]|[12]\d|3[01])(?:,\s\d{4})?)?)|(?:Today(?:\s(?:at|to)\s(?:1[0-2]|0?\d):[0-5]\d(?:AM|PM))?(?:\s-\s[A-Z][a-z]{2}\s(?:[1-9]|[12]\d|3[01])(?:,\s\d{4})?)?)/;

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
  readonly doceboImage: Locator;
  readonly courseId: RegExp;
  readonly courseStatus: Locator;
  readonly courseType: Locator;
  readonly comboboxLocator: Locator;
  readonly fieldDropdownLocator: (fieldName: string) => Locator;
  readonly completedStatusLocator: Locator;
  readonly labelLocator: (labelText: string) => Locator;
  readonly taskContainers: Locator;
  readonly markCompleteButtons: Locator;
  readonly completedStatus: Locator;
  readonly taskTitles: Locator;
  readonly dueDates: Locator;
  readonly goalTitles: Locator;
  readonly goalQuarters: Locator;
  readonly goalAssignees: Locator;
  readonly goalStatuses: Locator;
  readonly goalProgress: Locator;
  readonly expensifyReportContainers: Locator;
  readonly expensifyStatusTag: Locator;
  readonly expensifyApproverTag: Locator;
  readonly expensifyLastUpdatedText: Locator;
  readonly greenhouseImage: Locator;
  readonly jobId: RegExp;
  readonly Published: RegExp;
  readonly lessonsPattern: RegExp;
  readonly registeredOnPattern: RegExp;

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
    this.doceboImage = page.locator('img[src*="docebo"]');
    this.courseStatus = page.locator('span', { hasText: /In progress|Completed|Enrolled/ });
    this.courseType = page.locator('span', { hasText: /E-learning|Classroom/ });
    this.greenhouseImage = page.locator('img[src*="greenhouse"]');
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
    this.sentPattern = /Sent \d+ (days?|hours?|minutes?|weeks?|months?|years?) ago/;
    this.courseId = /^[A-Z]-/;
    this.jobId = /Job ID:\s*\d+/;
    this.Published = /Published.*ago/;

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
    this.comboboxLocator = page.locator('[role="combobox"]');
    this.fieldDropdownLocator = (fieldName: string) =>
      page.locator(`//fieldset[@aria-label="${fieldName}"]//following-sibling::div//input[@role="combobox"]`);
    this.fieldDropdownLocator = (fieldName: string) =>
      page.locator(`//fieldset[@aria-label="${fieldName}"]//following-sibling::div//input[@role="combobox"]`);
    this.completedStatusLocator = page.locator('p', { hasText: 'Completed' });
    this.labelLocator = (labelText: string) => page.getByText(labelText);
    this.taskContainers = page.locator('[data-testid="container"]');
    this.markCompleteButtons = page.getByRole('button', { name: 'Mark complete' });
    this.completedStatus = page.getByText('Completed');
    this.taskTitles = page.locator('h3');
    this.dueDates = page.locator('[data-testid="tag"] p');
    this.goalTitles = page.locator('h3');
    this.goalQuarters = page.locator('p.Typography-module__secondary__OGpiQ');
    this.goalAssignees = page.locator('[data-testid="tag"] p');
    this.goalStatuses = page.locator('[data-testid="tag"] p');
    this.goalProgress = page.locator('p.Typography-module__secondary__OGpiQ');
    this.expensifyReportContainers = page.locator('[data-testid="container"]._loopContainer_tek69_21');
    this.expensifyStatusTag = page.locator('[data-testid="tag"] p');
    this.expensifyApproverTag = page.locator('div:has-text("$")').locator('+ div').locator('+ div p');
    this.expensifyLastUpdatedText = page.locator('p:has-text("Last updated")');

    // Workday: patterns for lessons count and registered date line
    this.lessonsPattern = /^\d+\s+Lessons?$/;
    this.registeredOnPattern =
      /^Registered on\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(?:[1-9]|[12]\d|3[01]),\s+\d{4}$/;
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
    await test.step(`Verify ${status} for ${tileTitle}`, async () => {
      const tile = this.getTile(tileTitle);
      await expect(tile).toBeVisible({ timeout: 5_000 });
      const tags = this.getTagElement(tile).getByText(status, { exact: true });
      await expect(tags.first(), `Status "${status}" should be visible for "${tileTitle}"`).toBeVisible({
        timeout: 5_000,
      });
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
      const popup = await this.page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
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
   * Verify personalized Expensify report tile data with specific filters
   * @param tileTitle - The title of the tile to verify
   * @param expectedStatus - Expected status value (e.g., 'Processing')
   * @param expectedApprover - Expected approver name (e.g., 'Srikant G')
   * @param maxDaysAgo - Maximum days for last updated (e.g., 30)
   */
  async verifyPersonalizedExpensifyReportData(
    tileTitle: string,
    expectedStatus: string,
    expectedApprover: string,
    maxDaysAgo: number = 30
  ): Promise<void> {
    await test.step(`Verify personalized Expensify report tile data for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();

      // Get all report containers within the tile
      const reportContainers = tile.locator(this.expensifyReportContainers);

      // Verify at least one report is present
      await expect(reportContainers.first()).toBeVisible();

      // Verify each report meets the personalized criteria
      const reportCount = await reportContainers.count();
      for (let i = 0; i < reportCount; i++) {
        const report = reportContainers.nth(i);

        // Verify status is exactly the expected status
        const statusTag = report.locator(this.expensifyStatusTag);
        await expect(statusTag).toHaveText(expectedStatus);

        // Verify approver is exactly the expected approver
        const approverTag = report.locator(this.expensifyApproverTag);
        await expect(approverTag).toHaveText(expectedApprover);

        // Verify last updated is within the specified days
        const lastUpdatedText = await report.locator(this.expensifyLastUpdatedText).textContent();
        if (lastUpdatedText) {
          const daysMatch = lastUpdatedText.match(/(\d+)\s+day/i);
          if (daysMatch) {
            const daysAgo = parseInt(daysMatch[1]);
            expect(daysAgo).toBeLessThanOrEqual(maxDaysAgo);
          }
        }
      }
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
      expect(count, 'At least one container should be present in Airtable tile').toBeGreaterThan(0);

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
      expect(initialVisible).toBeGreaterThanOrEqual(4);

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
      expect(count, 'At least one container should be present in DocuSign tile').toBeGreaterThan(0);
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
      await expect(tile, `Tile '${tileTitle}' should be visible`).toBeVisible({ timeout: 10_000 });

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
      const count = await taskContainers.count();
      expect(count, 'At least one task should be present').toBeGreaterThan(0);
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
  /**
   * Verify DocuSign tile content structure
   * @param tileTitle - The title of the tile to verify
   */
  async verifyDoceboTileContentStructure(tileTitle: string): Promise<void> {
    await test.step(`Verify Docebo tile content structure for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();
      await expect(tile, `Docebo tile '${tileTitle}' should be visible`).toBeVisible({ timeout: 10_000 });
      // Verify added Tile data
      await expect(tile.locator(this.doceboImage), 'Docebo image should be visible in tile').toBeVisible();
      // Get task records and verify at least one exists
      const containers = tile.locator(this.container);
      const count = await containers.count();
      expect(count, 'At least one container should be present in Docebo tile').toBeGreaterThan(0);
      // Verify first record has all required elements
      const firstRecord = containers.first();
      await expect(
        firstRecord.getByText(this.courseId).first(),
        'CourseId should be visible in the first record'
      ).toBeVisible();
      await expect(
        firstRecord.locator(this.courseStatus).first(),
        'Course Status should be visible in tile'
      ).toBeVisible();
      await expect(firstRecord.locator(this.courseType).first(), 'Course Type should be visible in tile').toBeVisible();
    });
  }

  async verifyButtonStatus(status: string, buttonName: string): Promise<void> {
    await test.step(`Verify ${buttonName} button is ${status}`, async () => {
      const locator = this.button(buttonName);
      await expect(locator).toBeVisible();
      status.toLowerCase() === 'enabled' ? await expect(locator).toBeEnabled() : await expect(locator).toBeDisabled();
    });
  }
  /**
   * Verify Docebo report data shown in tile
   */
  async verifyDoceboReportData(tileTitle: string, EnrollmentStatus: string, CourseType: string): Promise<void> {
    await test.step(`Verify ${EnrollmentStatus} and ${CourseType} for ${tileTitle}`, async () => {
      const tile = this.getTile(tileTitle);
      await expect(tile).toBeVisible({ timeout: 5_000 });
      const tags = this.getTagElement(tile).getByText(EnrollmentStatus, { exact: true });
      await expect(tags.first(), `Status "${EnrollmentStatus}" should be visible for "${tileTitle}"`).toBeVisible({
        timeout: 5_000,
      });
      const tags2 = this.getTagElement(tile).getByText(CourseType, { exact: true });
      await expect(tags2.first(), `Status "${CourseType}" should be visible for "${tileTitle}"`).toBeVisible({
        timeout: 5_000,
      });
    });
  }
  async selectRadioOptionandValue(fieldName: string, radioOption: string, dropdownValue: string): Promise<void> {
    await test.step(`Select ${radioOption} for ${fieldName} and choose ${dropdownValue}`, async () => {
      // Select radio option
      const field = this.group(fieldName);
      const radio = field.getByLabel(radioOption);
      await this.clickOnElement(radio);
      // Click on the dropdown to open
      const dropdown = this.fieldDropdownLocator(fieldName);
      await this.clickOnElement(dropdown);
      // Select the value from dropdown
      const menuItem = this.menuitem(dropdownValue);
      await this.clickOnElement(menuItem);
    });
  }
  /**
   * Verify label is visible
   * @param labelText - The text of the label to verify
   */
  async verifyLabel(labelText: string): Promise<void> {
    await test.step(`Verify label '${labelText}' is visible`, async () => {
      const label = this.labelLocator(labelText);
      await expect(label.first(), `Label '${labelText}' should be visible`).toBeVisible();
    });
  }

  /**
   * Verify tasks with specific status are showing (at least one)
   * @param tileTitle - The title of the tile to verify
   * @param status - The status to verify
   */
  async verifyTasksWithStatusShowing(tileTitle: string, status: string): Promise<void> {
    await test.step(`Verify ${status} tasks are showing in ${tileTitle}`, async () => {
      const tile = this.getTile(tileTitle);
      await expect(tile).toBeVisible();

      // Verify at least one task has the specified status
      const statusElements = tile.getByText(status);
      await expect(statusElements.first()).toBeVisible();
    });
  }

  /**
   * Verify tile has task data (any combination of Mark complete/Completed)
   * @param tileTitle - The title of the tile to verify
   * @param status - The status to verify
   * @param hasMarkComplete - Whether the tile should have a Mark complete button
   * @param hasCompleted - Whether the tile should have a Completed status
   */
  async verifyTileHasTaskData(tileTitle: string): Promise<void> {
    await test.step(`Verify ${tileTitle} has task data`, async () => {
      const tile = this.getTile(tileTitle);
      await expect(tile).toBeVisible();

      // Verify at least one task container exists
      const taskContainers = tile.locator(this.taskContainers);
      await expect(taskContainers.first()).toBeVisible();

      // Verify task titles are present
      const taskTitles = tile.locator(this.taskTitles);
      await expect(taskTitles.first()).toBeVisible();

      // Verify due dates are present
      const dueDates = tile.locator(this.dueDates);
      await expect(dueDates.first()).toBeVisible();

      // Verify either "Mark complete" buttons OR "Completed" status exists
      const markCompleteButtons = tile.locator(this.markCompleteButtons);
      const completedStatus = tile.locator(this.completedStatus);

      const hasMarkComplete = (await markCompleteButtons.count()) > 0;
      const hasCompleted = (await completedStatus.count()) > 0;

      expect(
        hasMarkComplete || hasCompleted,
        'Tile should have either Mark complete buttons or Completed status'
      ).toBeTruthy();
    });
  }

  /**
   * Verify team goals metadata is showing
   * @param tileTitle - The title of the tile to verify
   * @param status - The status to verify
   * @param hasMarkComplete - Whether the tile should have a Mark complete button
   * @param hasCompleted - Whether the tile should have a Completed status
   */
  async verifyTeamGoalsMetadata(tileTitle: string): Promise<void> {
    await test.step(`Verify ${tileTitle} shows team goals metadata`, async () => {
      const tile = this.getTile(tileTitle);
      await expect(tile).toBeVisible();

      // Verify goal containers exist
      const goalContainers = tile.locator(this.taskContainers);
      await expect(goalContainers.first()).toBeVisible();

      // Verify goal titles are present
      const goalTitles = tile.locator(this.goalTitles);
      await expect(goalTitles.first()).toBeVisible();

      // Verify quarters are present (Q1 FY25, Q2 FY25, etc.)
      const quarters = tile.locator(this.goalQuarters);
      await expect(quarters.first()).toBeVisible();

      // Verify assignees are present
      const assignees = tile.locator(this.goalAssignees);
      await expect(assignees.first()).toBeVisible();

      // Verify statuses are present (On track, Off track, At risk, No status)
      const statuses = tile.locator(this.goalStatuses);
      await expect(statuses.first()).toBeVisible();

      // Verify progress percentages are present
      const progress = tile.locator(this.goalProgress);
      await expect(progress.first()).toBeVisible();
    });
  }
  /**
   * Verify Greenhouse tile content structure
   * @param tileTitle - The title of the tile to verify
   */
  async verifyGreenhouseTileContentStructure(tileTitle: string): Promise<void> {
    await test.step(`Verify Greenhouse tile content structure for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();
      await expect(tile, `Greenhouse tile '${tileTitle}' should be visible`).toBeVisible({ timeout: 10_000 });
      // Verify added Tile data
      await expect(tile.locator(this.greenhouseImage), 'Greenhouse image should be visible in tile').toBeVisible();
      // Get task records and verify at least one exists
      const containers = tile.locator(this.container);
      const count = await containers.count();
      expect(count, 'At least one container should be present in Greenhouse tile').toBeGreaterThan(0);
      // Verify first record has all required elements
      const firstRecord = containers.first();
      await expect(
        firstRecord.getByText(this.jobId).first(),
        'Job ID should be visible in the first record'
      ).toBeVisible();
      await expect(
        firstRecord.getByText(this.Published).first(),
        'Published text should be visible in the first record'
      ).toBeVisible();
    });
  }

  /**
   * Verify Workday pending learning courses tile shows course title, lessons count, and registered date
   */
  async verifyPendingLearningCoursesTileData(tileTitle: string): Promise<void> {
    await test.step(`Verify pending learning courses tile data for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();
      await expect(tile, `Tile '${tileTitle}' should be visible`).toBeVisible({ timeout: 10_000 });

      // Pick any visible course row (container) that has a heading and supporting paragraphs
      const row = tile
        .locator('[data-testid="container"]')
        .filter({ has: this.page.locator('h3') })
        .first();
      await expect(row, 'A course row should be visible').toBeVisible();

      // Course name as heading level 3
      await expect(row.getByRole('heading', { level: 3 }).first(), 'Course name should be visible').toBeVisible();

      // Verify lessons count like "7 Lessons" and the Registered on line
      await expect(row.getByText(this.lessonsPattern).first(), 'Lessons count should be visible').toBeVisible();
      await expect(
        row.getByText(this.registeredOnPattern).first(),
        'Registered on date should be visible'
      ).toBeVisible();
    });
  }

  /**
   * Verify "View all courses in Workday" link is visible AND clickable
   */
  async verifyViewAllCoursesInWorkdayLink(tileTitle: string, expectedUrl: string): Promise<void> {
    await test.step(`Verify 'View all courses in Workday' link is visible and redirects for '${tileTitle}'`, async () => {
      const tile = this.getTileContainers(tileTitle).first();
      await expect(tile).toBeVisible({ timeout: 10_000 });

      const viewAllLink = tile.getByRole('link', { name: 'View all courses in Workday' }).first();
      const showMore = tile.locator(this.showMoreButton).first();

      // Reveal the link by clicking Show more up to 3 times if needed
      for (let i = 0; i < 3 && !(await viewAllLink.isVisible().catch(() => false)); i++) {
        await this.clickOnElement(showMore);
        await viewAllLink.waitFor({ state: 'visible', timeout: 2500 }).catch(() => {});
      }
      await expect(viewAllLink, `'View all courses in Workday' link should be visible before clicking`).toBeVisible({
        timeout: 5_000,
      });
      // Must open in a new tab and match expected URL
      const urlRegex = new RegExp(`^${expectedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*`);
      const [popup] = await Promise.all([this.page.waitForEvent('popup', { timeout: 5000 }), viewAllLink.click()]);
      await expect(popup, `URL should start with '${expectedUrl}'`).toHaveURL(urlRegex);
      await popup.close();
    });
  }
}
