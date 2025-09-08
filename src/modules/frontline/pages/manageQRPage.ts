import { Locator, Page } from '@playwright/test';
import { addDays, format } from 'date-fns';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '../../../core/constants/pageEndpoints';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';

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
  async clickOnAddQRAndGetQRId(QRType: 'AppPromotion' | 'Content'): Promise<string> {
    const qrCodeResponse = await this.performActionAndWaitForResponse(
      () => this.clickOnAddQR(QRType),
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

  async clickOnAddQR(QRType: 'AppPromotion' | 'Content') {
    await this.clickOnElement(this.addQRButton, {
      stepInfo: 'Click on Add QR button',
    });
    if (QRType === 'AppPromotion') {
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

  async verifyPopupDisplayedByHeader(popupTitle: string) {
    if (popupTitle.includes('Promote')) {
      await this.appPreviewQRPopupHeader.waitFor();
      await this.verifier.verifyTheElementIsVisible(this.appPreviewQRPopupHeader, {
        assertionMessage: `App preview popup header should be visible: ${popupTitle}`,
      });
    } else if (popupTitle.includes('Preview')) {
      await this.contentPreviewQRPopupHeader.waitFor();
      await this.verifier.verifyTheElementIsVisible(this.contentPreviewQRPopupHeader, {
        assertionMessage: `Content preview popup header should be visible: ${popupTitle}`,
      });
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

  async deleteAppQRByName(QRType: 'AppPromotion' | 'Content', qrName: string) {
    await this.clickOnThreeDots(qrName);
    await this.clickOnDelete();
    if (QRType === 'AppPromotion') {
      await this.clickOnDeleteButton();
    }
  }

  async verifySuccessMessage() {
    await this.verifier.verifyTheElementIsVisible(this.successMessage, {
      assertionMessage: 'Success message should be displayed',
    });
  }

  async deleteQRWithSuccess(qrName: string) {
    await this.clickOnThreeDots(qrName);
    await this.clickOnDelete();
    await this.clickOnDeleteButton();
    await this.verifySuccessMessage();
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
  async clickOnContent() {
    await this.clickOnElement(this.contentMenuOption, {
      stepInfo: 'Click on Content menu option',
    });
  }
  async enterAndSelectContent() {
    await this.enterContent.fill('page');
    await this.selectFirstContent.click();
    const selectedPages = this.listOfPagesSelected;
    const selectedPageText = await selectedPages.allTextContents();
    console.log('Pages selected after entry:', selectedPageText);
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
  async selectDate(number: number) {
    await this.clickOnElement(this.page.getByLabel('Valid till'), {
      stepInfo: 'Click on Valid till date picker',
    });
    const twoDaysFromToday = addDays(new Date(), number);
    console.log(twoDaysFromToday);
    const day = format(twoDaysFromToday, 'd');
    console.log(day);
    await this.clickOnElement(this.page.getByText(day), {
      stepInfo: `Select date: ${day}`,
    });
  }
  async clickOnNextButton() {
    await this.clickOnElement(this.nextButton, {
      stepInfo: 'Click on Next button',
    });
  }
}
