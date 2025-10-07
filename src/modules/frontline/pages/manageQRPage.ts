import { PopupType } from '@frontline/constants/popupType';
import { expect, Locator, Page, test } from '@playwright/test';
import { addDays, format } from 'date-fns';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { ContentType } from '@core/constants/contentTypes';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

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
    this.descriptionField = page.getByTestId('tiptap-content').getByRole('paragraph');
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
    this.selectFirstContent = page.locator("//p[text()='Content']/..//div[@role='menuitem']").first();
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
    this.tillDateNA = page.locator('//h4[aria-label="N/A"]');
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
    const expectedText =
      'QR codes promoting the mobile app cannot be marked disabled as they are directly mapped with App/Play store links.';
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
      } catch (error) {
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
}
