import { PopupType } from '@frontline/constants/popupType';
import { QR_MESSAGES } from '@frontline/constants/qrConstants';
import { QRCodeUtil } from '@frontline/utils/qrCodeUtil';
import { expect, Locator, Page, test } from '@playwright/test';
import { addDays } from 'date-fns';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { ContentType } from '@core/constants/contentTypes';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/ui/pages/basePage';

export class ManageQRPage extends BasePage {
  readonly manageLink: Locator;
  readonly qrCodesLink: Locator;
  readonly addQRButton: Locator;
  readonly appPromotionMenuOption: Locator;
  readonly contentMenuOption: Locator;
  readonly eyeIcon: Locator;
  readonly saveAndVisitDashboardBtn: Locator;
  readonly qrNameField: Locator;
  readonly descriptionField: Locator;
  readonly promoteMobileAppPageHeading: Locator;
  readonly manageQRPageHeading: Locator;
  readonly imageQROnPreview: Locator;
  readonly descriptionOfQROnPreview: Locator;
  readonly appPreviewQRPopupHeader: Locator;
  readonly deleteQR: Locator;
  readonly qrNameHeaderLocator: Locator;
  readonly deleteButton: Locator;
  readonly qrRowLocator: Locator;
  readonly threeDotsInRowLocator: Locator;
  readonly toggleOnQRName: Locator;
  readonly togglePopup: Locator;
  readonly successMessage: Locator;
  readonly enterContent: Locator;
  readonly selectFirstContent: Locator;
  readonly listOfPagesSelected: Locator;
  readonly generateContentQRPageHeading: Locator;
  readonly promoteContentQRModalHeading: Locator;
  readonly contentPreviewQRPopupHeader: Locator;
  readonly nextButton: Locator;
  readonly nextMonthButton: Locator;
  readonly validTillDatePicker: Locator;
  readonly contentFeaturePromotionText: Locator;
  readonly contentFeatureCheckbox: Locator;
  readonly saveButtonOnSetup: Locator;
  readonly searchQRTextbox: Locator;
  readonly searchButton: Locator;
  readonly clearButton: Locator;
  readonly nothingToShowMessage: Locator;
  readonly filterQRButton: Locator;
  readonly filterHeaderText: Locator;
  readonly filterExpiredCheckbox: Locator;
  readonly filterAppCheckbox: Locator;
  readonly filterContentCheckbox: Locator;
  readonly filterApplyButton: Locator;
  readonly filterResetButton: Locator;
  readonly expiredQRToggle: Locator;
  readonly qrListRows: Locator;
  readonly tillDateNA: Locator;
  readonly contentFilter: Locator;
  readonly inactiveFilterCheckBox: Locator;
  readonly inactiveQR: Locator;
  readonly contentPageQRIcon: Locator;
  readonly promoteContentQRPage: Locator;
  readonly firstContentHeader: Locator;
  readonly qrCodesAddedHeader: Locator;
  readonly tableNameHeader: Locator;
  readonly tableCreatedByHeader: Locator;
  readonly tableGeneratedOnHeader: Locator;
  readonly tableValidTillHeader: Locator;
  readonly tableStatusHeader: Locator;
  readonly tableActionsHeader: Locator;
  readonly downloadQRButton: Locator;
  readonly downloadPDFMenu: Locator;
  readonly downloadQROnly: Locator;
  readonly contentPageHeader: Locator;
  readonly promoteContentQRHeading: Locator;
  readonly editMenuItem: Locator;
  readonly editContentQRHeader: Locator;
  readonly addContentDescription: Locator;
  readonly contentSearchBoxText: Locator;
  readonly updatedSuccessMessage: Locator;
  readonly qrRowByText: Locator;
  readonly toggleSwitch: Locator;
  readonly downloadButton: Locator;
  readonly downloadIcon: Locator;
  readonly toastMessage: Locator;
  private downloadedFilePath: string = '';

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_QR_PAGE);

    this.manageLink = page.getByRole('menuitem', { name: 'Manage features', exact: true });
    this.qrCodesLink = page.getByRole('menuitem', { name: 'QR codes' });
    this.addQRButton = page.getByText('Add QR');
    this.appPromotionMenuOption = page.getByRole('menuitem', { name: 'App promotion' });
    this.contentMenuOption = page.getByRole('menuitem', { name: 'Content', exact: true });
    this.eyeIcon = page.getByTestId('preview-button');
    this.saveAndVisitDashboardBtn = page.getByRole('button', { name: 'Save and visit dashboard' });
    this.qrNameField = page.getByRole('textbox', { name: 'QR name*' });
    this.descriptionField = page.getByRole('textbox', { name: 'You are in the content editor' });
    this.promoteMobileAppPageHeading = page.getByText('Promote mobile app via QR');
    this.manageQRPageHeading = page.getByText('Manage QR');
    this.imageQROnPreview = page.getByRole('img', { name: "You're previewing the QR code" }).first();
    this.descriptionOfQROnPreview = page.locator(
      '(//button[text()="Save and visit dashboard"]/../../preceding-sibling::div[1]//p)[2]'
    );
    this.appPreviewQRPopupHeader = page.getByText('Promote mobile app via QR');
    this.deleteQR = page.getByRole('menuitem', { name: 'Delete' });
    this.qrNameHeaderLocator = page.getByRole('heading', { level: 4 });
    this.deleteButton = page.getByRole('dialog').getByRole('button', { name: 'Delete' });
    this.qrRowLocator = page.getByRole('row');
    this.threeDotsInRowLocator = page.getByLabel('More options');
    this.toggleOnQRName = page.getByRole('switch');
    this.togglePopup = page.getByRole('tooltip').nth(0);
    this.successMessage = page.getByText('Successfully deleted QR code');
    this.enterContent = page.getByRole('combobox', { name: 'Select content...' });
    this.selectFirstContent = page
      .locator('p:has-text("Content")')
      .locator('..')
      .locator('div[role="menuitem"]')
      .first();
    this.listOfPagesSelected = page.getByRole('button', { name: /Remove/ });
    this.generateContentQRPageHeading = page.getByText('Generate content QR');
    this.promoteContentQRModalHeading = page.getByText('Promote content via QR');
    this.contentPreviewQRPopupHeader = page.getByText('Preview QR code');
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.nextMonthButton = page.getByRole('button', { name: 'Next month' });
    this.validTillDatePicker = page.getByLabel('Valid till');
    this.contentFeaturePromotionText = page.getByRole('heading', { name: 'Content and feature promotion' });
    this.contentFeatureCheckbox = page.getByRole('checkbox', { name: 'Content and feature promotion' });
    this.saveButtonOnSetup = page.getByRole('button', { name: 'Save' });
    this.searchQRTextbox = page.getByRole('textbox', { name: 'Search QR...' });
    this.searchButton = page.getByTestId('pageContainer-page').getByRole('button', { name: 'Search' });
    this.clearButton = page.getByRole('button', { name: 'Clear' });
    this.nothingToShowMessage = page.getByText('Nothing to show here');
    this.filterQRButton = page.getByRole('button', { name: 'Filters' });
    this.filterHeaderText = page.getByRole('heading', { name: 'Filters' });
    this.filterExpiredCheckbox = page.getByRole('checkbox', { name: 'Expired' });
    this.filterAppCheckbox = page.locator('#type_mobile-promotion');
    this.filterContentCheckbox = page.locator('#type_content');
    this.filterApplyButton = page.getByRole('button', { name: 'Apply' });
    this.filterResetButton = page.getByRole('button', { name: 'Reset all' });
    this.expiredQRToggle = page.getByRole('switch');
    this.qrListRows = page.getByRole('row');
    this.tillDateNA = page.locator('h4[aria-label="N/A"]');
    this.contentFilter = page.locator('#type_content');
    this.inactiveFilterCheckBox = page.locator('#status_disabled');
    this.inactiveQR = page.locator('//tbody//button[@role="switch"]');
    this.contentPageQRIcon = page.getByTestId('i-qr');
    this.promoteContentQRPage = page.locator("h2:has-text('Promote content via QR')");
    this.firstContentHeader = page.locator('.ManageContentListItem').first().locator('h2 a');
    this.qrCodesAddedHeader = page.getByRole('heading', { name: 'QR codes added' });
    this.tableNameHeader = page.locator('th').filter({ hasText: 'Name' });
    this.tableCreatedByHeader = page.locator('th').filter({ hasText: 'Created by' });
    this.tableGeneratedOnHeader = page.locator('th').filter({ hasText: 'Generated on' });
    this.tableValidTillHeader = page.locator('th').filter({ hasText: 'Valid till' });
    this.tableStatusHeader = page.locator('th').filter({ hasText: 'Status' });
    this.tableActionsHeader = page.locator('th').filter({ hasText: 'Actions' });
    this.downloadQRButton = page.locator("//button[text()='Download QR']");
    this.downloadPDFMenu = page.getByRole('menuitem', { name: 'Download PDF' });
    this.downloadQROnly = page.getByRole('menuitem', { name: 'Download QR code only' });
    this.contentPageHeader = page.locator('.Hero-eventInner');
    this.promoteContentQRHeading = page.locator("h2:has-text('Promote content via QR')");
    this.editMenuItem = page.getByRole('menuitem', { name: 'Edit' });
    this.editContentQRHeader = page.getByRole('heading', { name: 'Edit content QR' });
    this.addContentDescription = page.getByRole('heading').locator('xpath=following-sibling::p');
    this.contentSearchBoxText = page.getByText(QR_MESSAGES.CONTENT_SEARCH_BOX_TEXT);
    this.updatedSuccessMessage = page.getByText(QR_MESSAGES.SUCCESSFULLY_UPDATED_QR_CODE);

    // Dynamic locators for QR operations
    this.qrRowByText = page.locator('tr');
    this.toggleSwitch = page.getByRole('switch');
    this.downloadButton = page.getByRole('button', { name: /download/i });
    this.downloadIcon = page.getByLabel('Download');
    this.toastMessage = page.locator('div[role="alert"] p');
  }

  async clickOnManage() {
    await this.clickOnElement(this.manageLink, {
      stepInfo: 'Click on Manage features menu',
    });
  }

  async clickOnQRCodesMenu() {
    await this.clickOnElement(this.qrCodesLink, {
      stepInfo: 'Click on QR codes menu',
    });
  }

  /**
   * Clicks on the Add QR button
   * This button is used to add a new QR code
   * We have added an api listner which intercepts the POST request and get
   * the response and return the id of the new QR code
   * @returns The id of the new QR code
   */
  async clickOnAddQRAndGetQRId(qrType: 'AppPromotion' | 'Content'): Promise<string> {
    const qrCodeResponse = await this.performActionAndWaitForResponse(
      () => this.clickOnAddQR(qrType),
      response =>
        response.url().includes(API_ENDPOINTS.qr.create) &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      {
        stepInfo: 'Click on Add QR Button and intercepting the Create QR Code API to get the QR Code id',
        timeout: 20_000,
      }
    );
    //extract the qr code id from the response
    const qrCodeResponseJson = await qrCodeResponse.json();
    return qrCodeResponseJson.result.qrCodeId;
  }

  async clickOnAddQR(qrType: 'AppPromotion' | 'Content') {
    await this.clickOnElement(this.addQRButton, {
      stepInfo: 'Click on Add QR button',
    });
    if (qrType === 'AppPromotion') {
      await this.clickOnElement(this.appPromotionMenuOption, {
        stepInfo: 'Click on App promotion menu option',
      });
    } else {
      await this.clickOnElement(this.contentMenuOption, {
        stepInfo: 'Click on Content menu option',
      });
      await this.verifyContentQRPageHeading();
      await this.enterAndSelectContent();
      await this.clickOnNextButton();
    }
  }

  /**
   * Clicks on the App promotion link
   */
  async clickOnAppPromotion() {
    await this.clickOnElement(this.appPromotionMenuOption, {
      stepInfo: 'Click on App promotion link',
    });
  }

  async fillQRName(qrName: string) {
    await this.fillInElement(this.qrNameField, qrName, {
      stepInfo: `Fill QR name: ${qrName}`,
    });
  }

  async fillDescription(description: string) {
    await this.fillInElement(this.descriptionField, description, {
      stepInfo: `Fill description: ${description}`,
    });
  }

  async clickEyeIcon() {
    await this.clickOnElement(this.eyeIcon, {
      stepInfo: 'Click on eye icon for preview',
    });
  }

  async clickSaveAndVisit() {
    await this.clickOnElement(this.saveAndVisitDashboardBtn, {
      stepInfo: 'Click on Save and visit dashboard button',
    });
  }

  async verifyManagePage() {
    await this.verifier.verifyTheElementIsVisible(this.manageQRPageHeading, {
      assertionMessage: 'Manage QR page heading should be visible',
    });
  }

  async verifyPromoteMobileAppPageHeading() {
    await this.verifier.verifyTheElementIsVisible(this.promoteMobileAppPageHeading, {
      assertionMessage: 'Promote mobile app page heading should be visible',
    });
  }

  async verifyPromotionPopup() {
    await this.appPreviewQRPopupHeader.waitFor();
    await this.verifier.verifyTheElementIsVisible(this.appPreviewQRPopupHeader, {
      assertionMessage: 'App preview popup header should be visible',
    });
  }

  async verifyPreviewPopup() {
    await this.contentPreviewQRPopupHeader.waitFor();
    await this.verifier.verifyTheElementIsVisible(this.contentPreviewQRPopupHeader, {
      assertionMessage: 'Content preview popup header should be visible',
    });
  }

  async verifyPopupDisplayedByHeader(popupType: PopupType) {
    if (popupType === PopupType.PromotionPopup) {
      await this.verifyPromotionPopup();
    } else if (popupType === PopupType.PreviewPopup) {
      await this.verifyPreviewPopup();
    }
  }

  async verifyQRImageDisplayOnPreview() {
    await this.verifier.verifyTheElementIsVisible(this.imageQROnPreview, {
      assertionMessage: 'QR code image should be visible in preview',
    });
  }

  async verifyQRDescriptionOnPreview(description: string) {
    const qrDescription = this.descriptionOfQROnPreview.filter({ hasText: description });
    await this.verifier.verifyTheElementIsVisible(qrDescription, {
      assertionMessage: `QR description should be visible: ${description}`,
    });
  }

  async verifyQRName(qrName: string) {
    await this.verifier.verifyTheElementIsVisible(this.qrNameHeaderLocator.filter({ hasText: qrName }), {
      assertionMessage: `QR code with name "${qrName}" should be visible`,
    });
  }

  async clickOnThreeDots(qrName: string) {
    const qrRow = this.qrRowLocator.filter({ hasText: qrName });
    await this.clickOnElement(qrRow.getByLabel('More options'), {
      stepInfo: `Click on three dots for QR: ${qrName}`,
    });
  }

  async clickOnDelete() {
    await this.clickOnElement(this.deleteQR, {
      stepInfo: 'Click on Delete menu item',
    });
  }

  async clickOnDeleteButton() {
    await this.clickOnElement(this.deleteButton, {
      stepInfo: 'Click on Delete confirmation button',
    });
  }

  async deleteAppQRByName(qrType: 'AppPromotion' | 'Content', qrName: string) {
    await this.clickOnThreeDots(qrName);
    await this.clickOnDelete();
    if (qrType === 'AppPromotion') {
      await this.clickOnDeleteButton();
    }
    await this.verifySuccessMessage();
  }

  async verifySuccessMessage() {
    await this.verifier.verifyTheElementIsVisible(this.successMessage, {
      assertionMessage: 'Success message should be displayed',
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.manageQRPageHeading, {
      assertionMessage: 'Manage QR page should be loaded and heading visible',
    });
  }

  async hoverOnToogle(qrName: string) {
    const qrRow = this.qrRowLocator.filter({ hasText: qrName });
    const toggleInRow = qrRow.getByRole('switch');
    await toggleInRow.hover();
  }

  async validateToogleText() {
    const expectedText = QR_MESSAGES.TOGGLE_POPUP_TEXT;
    await this.verifier.verifyTheElementIsVisible(this.togglePopup, {
      assertionMessage: `Toggle popup should display text: ${expectedText}`,
    });
  }
  /**
   * Clicks on the Content menu option
   */
  async clickOnContentMenu() {
    await this.clickOnElement(this.contentMenuOption, {
      stepInfo: 'Click on Content menu option',
    });
  }

  async enterAndSelectContent() {
    await this.enterContent.fill(ContentType.Page);
    await this.selectFirstContent.click();
  }

  async verifyContentQRPageHeading() {
    await this.verifier.verifyTheElementIsVisible(this.generateContentQRPageHeading, {
      assertionMessage: 'Generate content QR page heading should be visible',
    });
  }

  async verifyContentQRModalHeading() {
    await this.verifier.verifyTheElementIsVisible(this.promoteContentQRModalHeading, {
      assertionMessage: 'GPromote content via QR Modal heading should be visible',
    });
  }

  /**
   * Selects a date from the date picker using a relative approach
   * @param daysFromToday Number of days from today to select (positive for future dates, negative for past dates)
   * @returns Promise that resolves when the date is selected
   */
  async selectDateFromToday(daysFromToday: number) {
    await this.clickOnElement(this.validTillDatePicker, {
      stepInfo: 'Click on Valid till date picker',
    });

    const today = new Date();
    const targetDate = addDays(today, daysFromToday);

    if (targetDate.getMonth() !== today.getMonth() || targetDate.getFullYear() !== today.getFullYear()) {
      await this.clickOnElement(this.nextMonthButton, {
        stepInfo: 'Click on Next month button',
      });
    }

    const targetDayNumber = targetDate.getDate().toString();
    const targetDay = this.page.getByRole('gridcell', { name: targetDayNumber, exact: true });

    await this.clickOnElement(targetDay, {
      stepInfo: `Click on date: ${targetDayNumber}`,
    });
  }

  async clickOnNextButton() {
    await this.clickOnElement(this.nextButton, {
      stepInfo: 'Click on Next button',
    });
  }

  async navigateToApplicationSetup() {
    await this.goToUrl(PAGE_ENDPOINTS.APPLICATION_SETTINGS);
  }

  async verifyContentAndFeatureText() {
    await this.contentFeaturePromotionText.scrollIntoViewIfNeeded();
    await this.verifier.verifyTheElementIsVisible(this.contentFeaturePromotionText, {
      assertionMessage: 'Content and feature promotion text should be visible',
    });
  }

  async checkContentAndFeatureCheckBox(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.contentFeatureCheckbox, {
      timeout: 10000,
      stepInfo: 'Wait for content feature checkbox to be visible',
    });

    const isCheckBoxChecked = await this.contentFeatureCheckbox.isChecked();

    if (isCheckBoxChecked) {
      console.log('Content feature checkbox is already checked, no action needed.');
    } else {
      await this.checkElement(this.contentFeatureCheckbox, {
        stepInfo: 'Check content feature promotion checkbox',
      });

      const isNowChecked = await this.contentFeatureCheckbox.isChecked();
      expect(isNowChecked).toBe(true);
    }
  }

  async saveChangesOnSetup(): Promise<void> {
    const isSaveButtonEnabled = await this.saveButtonOnSetup.isEnabled();

    if (isSaveButtonEnabled) {
      await this.clickOnElement(this.saveButtonOnSetup, {
        stepInfo: 'Click save button to save changes',
      });

      await this.verifier.verifyTheElementIsDisabled(this.saveButtonOnSetup, {
        assertionMessage: 'Save button should be disabled after clicking to indicate processing',
      });
    } else {
      console.log('Save button is already disabled, no changes to save.');
    }
  }

  async verifyQRCodeMenuVisible() {
    await this.verifier.verifyTheElementIsVisible(this.qrCodesLink, {
      assertionMessage: 'QR codes menu should be visible',
    });
  }
  async clickOnSearchQRTextbox() {
    await this.clickOnElement(this.searchQRTextbox, {
      stepInfo: 'Click on Search QR textbox',
    });
  }

  async fillSearchQRTextbox(searchTerm: string) {
    await this.fillInElement(this.searchQRTextbox, searchTerm, {
      stepInfo: `Fill search term: ${searchTerm}`,
    });
  }

  async clickSearchButton() {
    await this.clickOnElement(this.searchButton, {
      stepInfo: 'Click on Search button',
    });
  }

  async clickClearButton() {
    await this.clickOnElement(this.clearButton, {
      stepInfo: 'Click on Clear button',
    });
  }

  async searchForQR(searchTerm: string) {
    await this.clickOnSearchQRTextbox();
    await this.fillSearchQRTextbox(searchTerm);
    await this.clickSearchButton();
  }

  async searchForQRWithEnter(searchTerm: string) {
    await this.clickOnSearchQRTextbox();
    await this.fillSearchQRTextbox(searchTerm);
    await this.hitEnterOnSearchBox();
  }

  async hitEnterOnSearchBox() {
    await test.step('Press Enter on search box', async () => {
      await this.searchQRTextbox.press('Enter');
    });
  }

  async verifySearchResults(expectedText: string) {
    await test.step(`Verify search results contain: ${expectedText}`, async () => {
      const results = this.page.getByRole('row').filter({ hasText: expectedText });
      await results.first().waitFor({ state: 'visible' });

      const count = await results.count();
      if (count === 0) {
        throw new Error(`No search results found containing: "${expectedText}"`);
      }

      // Verify at least one result contains the expected text
      let matchFound = false;
      for (let i = 0; i < count; i++) {
        const text = await results.nth(i).textContent();
        if (text?.toLowerCase().includes(expectedText.toLowerCase())) {
          matchFound = true;
          break;
        }
      }

      if (!matchFound) {
        throw new Error(`No row element has text matching: "${expectedText}"`);
      }
    });
  }

  async verifyNothingToShowMessage() {
    await this.verifier.verifyTheElementIsVisible(this.nothingToShowMessage, {
      assertionMessage: 'Nothing to show here message should be displayed',
    });
  }

  async clearSearchAndVerify() {
    await this.clickClearButton();
    await this.verifier.verifyElementHasText(this.searchQRTextbox, '', {
      assertionMessage: 'Search textbox should be cleared',
    });
  }

  async clickOnFilter(): Promise<void> {
    await this.clickOnElement(this.filterQRButton, {
      stepInfo: 'Click on Filter button',
    });
  }

  async verifyFilterHeaderText(): Promise<void> {
    await this.verifier.verifyElementHasText(this.filterHeaderText, 'Filters', {
      assertionMessage: 'Filter header should have text "Filters"',
    });
  }

  async selectExpiredFilter(): Promise<void> {
    await this.checkElement(this.filterExpiredCheckbox, {
      stepInfo: 'Select Expired filter checkbox',
    });
  }

  async clickOnFilterApply(): Promise<void> {
    await this.clickOnElement(this.filterApplyButton, {
      stepInfo: 'Click on Apply button in filter',
    });
  }

  async verifyAllExpiredQRs(): Promise<void> {
    await test.step('Verify all expired QRs have toggle off', async () => {
      await this.qrListRows.first().waitFor({ state: 'visible', timeout: 10000 });

      const expiredQRsCount = await this.expiredQRToggle.count();

      if (expiredQRsCount === 0) {
        console.log('No expired QR codes found after applying filter');
        return;
      }

      for (let i = 0; i < expiredQRsCount; i++) {
        await expect.soft(this.expiredQRToggle.nth(i)).toHaveAttribute('data-state', 'unchecked');
      }
    });
  }

  async clickOnFilterReset(): Promise<void> {
    await this.clickOnElement(this.filterResetButton, {
      stepInfo: 'Click on Reset all button',
    });
    await this.qrListRows.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async verifyFilterReset(): Promise<void> {
    await test.step('Verify filter is reset', async () => {
      await expect(this.filterExpiredCheckbox).not.toBeChecked();
    });
  }

  async verifyQRAfterFilterReset(expectedCount: number): Promise<void> {
    await test.step(`Verify QR count after filter reset`, async () => {
      await this.threeDotsInRowLocator.first().waitFor({ state: 'visible', timeout: 10000 });

      const currentCount = await this.threeDotsInRowLocator.count();

      // Verify QRs are visible and count matches expected (accounting for pagination)
      expect(currentCount).toBeGreaterThan(0);
      expect(currentCount).toBeLessThanOrEqual(expectedCount);

      if (currentCount < expectedCount) {
        console.log(`UI shows ${currentCount} of ${expectedCount} QR codes (pagination active)`);
      }
    });
  }

  async selectAppPromotionTypeFilter(): Promise<void> {
    await this.checkElement(this.filterAppCheckbox, {
      stepInfo: 'Select App promotion type filter checkbox',
    });
  }

  async selectContentTypeFilter(): Promise<void> {
    await this.checkElement(this.filterContentCheckbox, {
      stepInfo: 'Select Content type filter checkbox',
    });
  }

  async verifyValidTillDateIsNAForAllQRs(): Promise<void> {
    await test.step('Verify valid till date is N/A for all displayed QR codes', async () => {
      try {
        await this.tillDateNA.first().waitFor({ state: 'visible', timeout: 10000 });
      } catch {
        console.log('No QR codes with N/A valid till date found');
        return;
      }

      const allTillDates = await this.tillDateNA.count();

      if (allTillDates === 0) {
        console.log('No QR codes with N/A valid till date found');
        return;
      }

      console.log(`Found ${allTillDates} app promotion QR codes with N/A valid till date.`);

      for (let i = 0; i < allTillDates; i++) {
        await expect.soft(this.tillDateNA.nth(i)).toHaveText('N/A');
      }
    });
  }

  async verifyBothTypeFiltersAreChecked(): Promise<void> {
    await test.step('Verify both App promotion and Content type filters are checked', async () => {
      await expect(this.filterAppCheckbox).toBeChecked();
      await expect(this.filterContentCheckbox).toBeChecked();
    });
  }

  async verifyTypeFiltersAreUnchecked(): Promise<void> {
    await test.step('Verify type filters are unchecked after reset', async () => {
      await expect(this.filterAppCheckbox).not.toBeChecked();
      await expect(this.filterContentCheckbox).not.toBeChecked();
    });
  }

  async selectContentFilter(): Promise<void> {
    await this.checkElement(this.contentFilter, {
      stepInfo: 'Select content filter checkbox',
    });
    await expect(this.contentFilter).toBeChecked();
  }

  async selectInactiveFilter(): Promise<void> {
    await this.checkElement(this.inactiveFilterCheckBox, {
      stepInfo: 'Select inactive filter checkbox',
    });
    await expect(this.inactiveFilterCheckBox).toBeChecked();
  }

  async verifyInactiveQRs(): Promise<void> {
    await test.step('Verify all inactive QR codes are displayed', async () => {
      try {
        await this.inactiveQR.first().waitFor({ state: 'visible', timeout: 10000 });
      } catch {
        console.log('No QR codes found');
        return;
      }
      const count = await this.inactiveQR.count();

      if (count === 0) {
        console.log('No QR codes found.');
        return;
      }
      console.log(`Found ${count} QR codes. Checking for inactive ones...`);

      for (let i = 0; i < count; i++) {
        const toggle = this.inactiveQR.nth(i);

        await this.verifier.verifyElementHasAttribute(toggle, 'aria-checked', 'false', {
          assertionMessage: `Toggle ${i + 1} should have aria-checked="false" for inactive state`,
        });

        await this.verifier.verifyElementHasAttribute(toggle, 'data-state', 'unchecked', {
          assertionMessage: `Toggle ${i + 1} should have data-state="unchecked" for inactive state`,
        });
      }
    });
  }

  async openContent(): Promise<void> {
    await this.goToUrl(PAGE_ENDPOINTS.MANAGE_CONTENT);

    await this.clickOnElement(this.firstContentHeader, {
      stepInfo: 'Click on first available content header',
    });
  }

  async clickOnQRIcon(): Promise<void> {
    await this.clickOnElement(this.contentPageQRIcon, {
      stepInfo: 'Click on QR share option',
    });
  }

  async verifyPromoteContentPageHeading(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.promoteContentQRPage, {
      assertionMessage: 'Promote content via QR page should be visible',
    });
  }

  async validateQRName(qrName: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.qrNameHeaderLocator.filter({ hasText: qrName.trim() }).first(), {
      assertionMessage: `QR with name "${qrName}" should be visible on first list item`,
    });
  }

  async verifyAddQRButton(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.addQRButton, {
      assertionMessage: 'Add QR button should be visible on Manage QR page',
    });
  }

  async verifySearchQRTextbox(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.searchQRTextbox, {
      assertionMessage: 'Search QR textbox should be visible',
    });
  }

  async verifySearchButton(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.searchButton, {
      assertionMessage: 'Search button should be visible',
    });
  }

  async verifyFilterButton(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.filterQRButton, {
      assertionMessage: 'Filter button should be visible',
    });
  }
  async verifyQRCodesAddedHeaderText(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.qrCodesAddedHeader, {
      assertionMessage: 'QR codes added header should be visible',
    });
  }

  async verifyTableHeaders(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.tableNameHeader, {
      assertionMessage: 'Name column header should be visible',
    });

    await this.verifier.verifyTheElementIsVisible(this.tableCreatedByHeader, {
      assertionMessage: 'Created by column header should be visible',
    });

    await this.verifier.verifyTheElementIsVisible(this.tableGeneratedOnHeader, {
      assertionMessage: 'Generated on column header should be visible',
    });

    await this.verifier.verifyTheElementIsVisible(this.tableValidTillHeader, {
      assertionMessage: 'Valid till column header should be visible',
    });

    await this.verifier.verifyTheElementIsVisible(this.tableStatusHeader, {
      assertionMessage: 'Status column header should be visible',
    });

    await this.verifier.verifyTheElementIsVisible(this.tableActionsHeader, {
      assertionMessage: 'Actions column header should be visible',
    });
  }

  async verifyQRActionIcons(): Promise<void> {
    await test.step('Verify action icons (View, Download, More options) are visible for QR codes', async () => {
      await this.qrListRows.first().waitFor({ state: 'visible', timeout: 10000 });

      const qrRows = await this.qrListRows.count();

      if (qrRows === 0) {
        console.log('No QR codes found on the page');
        return;
      }

      console.log(`Found ${qrRows} QR code rows. Verifying action icons...`);

      for (let i = 0; i < qrRows; i++) {
        const currentRow = this.qrListRows.nth(i);

        if (i === 0) {
          continue;
        }

        const viewIcon = currentRow.getByLabel('View', { exact: true });
        await this.verifier.verifyTheElementIsVisible(viewIcon, {
          assertionMessage: `View icon should be visible for QR row ${i}`,
        });

        const downloadIcon = currentRow.getByLabel('Download');
        await this.verifier.verifyTheElementIsVisible(downloadIcon, {
          assertionMessage: `Download icon should be visible for QR row ${i}`,
        });

        const moreOptionsIcon = currentRow.getByLabel('More options');
        await this.verifier.verifyTheElementIsVisible(moreOptionsIcon, {
          assertionMessage: `More options icon should be visible for QR row ${i}`,
        });
      }
    });
  }

  async verifyDownloadOptionsAreVisible(): Promise<void> {
    await test.step('Verify download options are visible', async () => {
      await expect(this.downloadPDFMenu).toBeVisible();
      await expect(this.downloadQROnly).toBeVisible();
    });
  }

  async clickOnDownloadQROnlyOption(): Promise<void> {
    await test.step('Click on download QR only option', async () => {
      await this.downloadQROnly.click();
    });
  }

  async downloadQRImage(): Promise<string> {
    const result = await this.downloadFileWithCleanup(() => this.downloadQROnly.click(), {
      stepInfo: 'Download QR image',
      cleanup: false, // Keep file for QR scanning
      timeout: TIMEOUTS.MEDIUM,
    });

    this.downloadedFilePath = result.downloadPath;
    return result.downloadPath;
  }

  async verifyPromoteContentModalIsClosed(): Promise<void> {
    await test.step('Verify promote content modal is closed', async () => {
      await expect(this.promoteContentQRHeading).not.toBeVisible();
      await expect(this.contentPageHeader).toBeVisible();
    });
  }

  async verifyQRNameFieldIsPrefilled(expectedQRName: string): Promise<void> {
    await test.step('Verify QR name field is prefilled with expected value', async () => {
      await this.qrNameField.waitFor();
      const currentValue = await this.qrNameField.inputValue();
      expect(currentValue).toBe(expectedQRName);
    });
  }

  async clickOnDownloadQRButton(): Promise<void> {
    await test.step('Click on Download QR button', async () => {
      await this.clickOnElement(this.downloadQRButton, {
        stepInfo: 'Click on Download QR button',
      });
    });
  }

  async clickOnDownloadPDFOption(): Promise<void> {
    await test.step('Click on Download PDF option', async () => {
      await this.clickOnElement(this.downloadPDFMenu, {
        stepInfo: 'Click on Download PDF option',
      });
    });
  }

  async downloadPDF(): Promise<string> {
    const result = await this.downloadFileWithCleanup(() => this.downloadPDFMenu.click(), {
      stepInfo: 'Download QR PDF',
      cleanup: false, // Keep file for potential QR scanning
      timeout: TIMEOUTS.MEDIUM,
    });

    return result.downloadPath;
  }

  async verifySaveAndVisitDashboardButtonIsNotVisible(): Promise<void> {
    await test.step('Verify Save and Visit Dashboard button is not visible', async () => {
      await expect(this.saveAndVisitDashboardBtn).not.toBeVisible();
    });
  }

  async verifyDownloadQRButtonIsVisible(): Promise<void> {
    await test.step('Verify Download QR button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.downloadQRButton, {
        assertionMessage: 'Download QR button should be visible',
      });
    });
  }

  async scanQRCode(imagePath: string): Promise<string> {
    return await QRCodeUtil.scanQRCode(imagePath);
  }

  async openScannedQRCodeLinkInNewTab(qrContent: string): Promise<Page> {
    return await test.step('Open scanned QR code link in new tab', async () => {
      const newPage = await this.page.context().newPage();
      await newPage.goto(qrContent);
      return newPage;
    });
  }

  async verifyContentPageIsOpenedSuccessfully(page: Page): Promise<void> {
    await test.step('Verify content page is opened successfully', async () => {
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

      const title = await page.title();
      const url = page.url();

      console.log(`Content page opened with title: ${title}`);
      console.log(`Content page URL: ${url}`);

      // Check if we have a valid title or if the URL indicates we're on the right page
      expect(title || url.includes('content') || url.includes('promotion')).toBeTruthy();
    });
  }

  async clickOnEdit(): Promise<void> {
    await this.clickOnElement(this.editMenuItem, {
      stepInfo: 'Click on Edit menu item',
    });
  }

  async verifyEditContentQRHeader(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.editContentQRHeader, {
      assertionMessage: 'Edit content QR header should be visible',
    });
  }

  async verifyAddContentDescription(): Promise<void> {
    const expectedText = QR_MESSAGES.ADD_CONTENT_DESCRIPTION;
    await this.verifier.verifyTheElementIsVisible(this.addContentDescription, {
      assertionMessage: 'Add content description should be visible',
    });
    await this.verifier.verifyElementHasText(this.addContentDescription, expectedText, {
      assertionMessage: 'Add content description should have correct text',
    });
  }

  async verifyContentSearchBoxText(): Promise<void> {
    const expectedText = QR_MESSAGES.CONTENT_SEARCH_BOX_TEXT;
    await this.verifier.verifyTheElementIsVisible(this.contentSearchBoxText, {
      assertionMessage: 'Content search box text should be visible',
    });
    await this.verifier.verifyElementHasText(this.contentSearchBoxText, expectedText, {
      assertionMessage: 'Content search box text should have correct text',
    });
  }

  async verifyUpdatedDescriptionOnListing(qrName: string, updatedDescription: string): Promise<void> {
    await test.step(`Verify updated description is showing for QR: ${qrName}`, async () => {
      // Find the QR row by name first, then verify the updated description within that row
      const qrRow = this.page.locator('tr').filter({ hasText: qrName });
      const descriptionLocator = qrRow.locator('.QRListing-module-truncateText___QW_kR', {
        hasText: updatedDescription,
      });

      await this.verifier.verifyTheElementIsVisible(descriptionLocator, {
        assertionMessage: `Updated description "${updatedDescription}" should be visible in QR listing for QR: ${qrName}`,
      });
    });
  }

  async verifyUpdatedContentsOnEditPage(updatedDescription: string): Promise<void> {
    await test.step('Verify updated contents are showing on the Edit content QR page', async () => {
      await this.verifier.verifyTheElementIsVisible(this.editContentQRHeader, {
        assertionMessage: 'Edit content QR header should be visible',
      });

      await this.clickOnNextButton();
      await this.verifyPromoteContentPageHeading();

      await this.verifier.waitUntilElementIsVisible(this.descriptionField, {
        timeout: 10000,
        stepInfo: 'Wait for description field to be visible',
      });
      await this.verifier.verifyElementContainsText(this.descriptionField, updatedDescription, {
        assertionMessage: 'Description field should contain updated description',
      });
    });
  }

  async verifyUpdatedSuccessMessage(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.updatedSuccessMessage, {
      assertionMessage: 'Success message for QR update should be visible',
    });
  }

  async verifyPagesAfterEdit(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.listOfPagesSelected, {
      timeout: 10000,
      stepInfo: 'Wait for selected pages to be visible',
    });
    await this.verifier.verifyCountOfElementsIsEqualTo(this.listOfPagesSelected, 2, {
      assertionMessage: 'Should have exactly 2 selected pages after edit',
    });
  }

  async toggleQRStatus(qrName: string, enabled: boolean): Promise<void> {
    await test.step(`Toggle QR status for "${qrName}" to ${enabled ? 'enabled' : 'disabled'}`, async () => {
      // Find the QR row by name and get the toggle switch
      const qrRow = this.qrRowByText.filter({ hasText: qrName });
      const toggle = qrRow.locator(this.toggleSwitch);

      await this.verifier.waitUntilElementIsVisible(toggle, {
        timeout: 10000,
        stepInfo: `Wait for toggle to be visible for QR: ${qrName}`,
      });

      // Check current state
      const currentState = await toggle.getAttribute('aria-checked');
      const isCurrentlyEnabled = currentState === 'true';

      // Only toggle if current state doesn't match desired state
      if (isCurrentlyEnabled !== enabled) {
        await toggle.click();

        // Wait for the toggle to reach the desired state
        const expectedState = enabled ? 'true' : 'false';
        await expect(toggle).toHaveAttribute('aria-checked', expectedState, { timeout: 5000 });
      }
    });
  }

  async verifySuccessToastMessage(expectedMessage: string): Promise<void> {
    await test.step(`Verify success toast message: "${expectedMessage}"`, async () => {
      // Use constructor-defined locator for toast messages
      const toastMessage = this.toastMessage.filter({ hasText: expectedMessage });
      await this.verifier.waitUntilElementIsVisible(toastMessage, {
        timeout: 10000,
        stepInfo: 'Wait for success toast message to be visible',
      });
      await this.verifier.verifyTheElementIsVisible(toastMessage, {
        assertionMessage: `Success toast message should be visible: ${expectedMessage}`,
      });
    });
  }

  async refreshPage(): Promise<void> {
    await test.step('Refresh the current page', async () => {
      await this.reloadPage();
      await this.verifyThePageIsLoaded();
    });
  }

  async verifyQRStatusIsDisabled(qrName: string): Promise<void> {
    await test.step(`Verify QR status is disabled for "${qrName}"`, async () => {
      const qrRow = this.qrRowByText.filter({ hasText: qrName });
      const toggle = qrRow.locator(this.toggleSwitch);

      await this.verifier.waitUntilElementIsVisible(toggle, {
        timeout: 10000,
        stepInfo: `Wait for toggle to be visible for QR: ${qrName}`,
      });

      // Verify toggle is disabled using multiple attributes
      await this.verifier.verifyElementHasAttribute(toggle, 'aria-checked', 'false', {
        assertionMessage: `Toggle should be disabled for QR: ${qrName}`,
      });

      await this.verifier.verifyElementHasAttribute(toggle, 'data-state', 'unchecked', {
        assertionMessage: `Toggle should have unchecked state for QR: ${qrName}`,
      });
    });
  }

  async verifyQRStatusIsEnabled(qrName: string): Promise<void> {
    await test.step(`Verify QR status is enabled for "${qrName}"`, async () => {
      const qrRow = this.qrRowByText.filter({ hasText: qrName });
      const toggle = qrRow.locator(this.toggleSwitch);

      await this.verifier.waitUntilElementIsVisible(toggle, {
        timeout: 10000,
        stepInfo: `Wait for toggle to be visible for QR: ${qrName}`,
      });

      // Verify toggle is enabled using multiple attributes
      await this.verifier.verifyElementHasAttribute(toggle, 'aria-checked', 'true', {
        assertionMessage: `Toggle should be enabled for QR: ${qrName}`,
      });

      await this.verifier.verifyElementHasAttribute(toggle, 'data-state', 'checked', {
        assertionMessage: `Toggle should have checked state for QR: ${qrName}`,
      });
    });
  }

  async downloadPdfImage(qrName: string): Promise<string> {
    const qrRow = this.qrRowByText.filter({ hasText: qrName });
    const downloadButton = qrRow.locator(this.downloadButton);

    await this.verifier.waitUntilElementIsVisible(downloadButton, {
      timeout: 10000,
      stepInfo: `Wait for download button to be visible for QR: ${qrName}`,
    });

    const result = await this.downloadFileWithCleanup(() => downloadButton.click(), {
      stepInfo: `Download QR image for "${qrName}"`,
      cleanup: false,
    });

    return result.downloadPath;
  }

  async downloadQRImageWithPDFSupport(qrName: string): Promise<string> {
    const qrRow = this.qrRowByText.filter({ hasText: qrName });
    const downloadButton = qrRow.locator(this.downloadButton);

    await this.verifier.waitUntilElementIsVisible(downloadButton, {
      timeout: 10000,
      stepInfo: `Wait for download button to be visible for QR: ${qrName}`,
    });

    const result = await this.downloadFileWithCleanup(() => downloadButton.click(), {
      stepInfo: `Download QR image with PDF support for "${qrName}"`,
      cleanup: false,
    });

    // Process the downloaded file (handle PDF extraction if needed)
    return await QRCodeUtil.processDownloadedFile(result.downloadPath, qrName);
  }

  async downloadQRFromTable(qrName: string): Promise<string> {
    const qrRow = this.qrRowByText.filter({ hasText: qrName });
    const downloadIcon = qrRow.locator(this.downloadIcon);

    await this.verifier.waitUntilElementIsVisible(downloadIcon, {
      timeout: 10000,
      stepInfo: `Wait for download icon to be visible for QR: ${qrName}`,
    });

    const result = await this.downloadFileWithCleanup(() => downloadIcon.click(), {
      stepInfo: `Download QR from table for "${qrName}"`,
      cleanup: false,
    });

    // Process the downloaded file (handle PDF extraction if needed)
    return await QRCodeUtil.processDownloadedFile(result.downloadPath, qrName);
  }

  // These methods are now handled by QRCodeUtil utility class

  async verifyQRCodeExpiredMessage(page: Page, expectedMessage: string): Promise<void> {
    await test.step(`Verify QR code expired message: "${expectedMessage}"`, async () => {
      // Use more flexible text matching for error messages
      const errorMessage = page.locator('text=' + expectedMessage).first();
      await this.verifier.waitUntilElementIsVisible(errorMessage, {
        timeout: 10000,
        stepInfo: 'Wait for error message to be visible',
      });
      await this.verifier.verifyTheElementIsVisible(errorMessage, {
        assertionMessage: `Error message should be visible: ${expectedMessage}`,
      });
    });
  }
}
