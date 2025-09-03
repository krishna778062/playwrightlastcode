import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '../../../core/constants/pageEndpoints';

export class ManageQRPage extends BasePage {
  readonly manageLink: Locator;
  readonly qrCodesLink: Locator;
  readonly addQRButton: Locator;
  readonly appPromotionLink: Locator;
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

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_QR_PAGE);

    this.manageLink = page.getByRole('menuitem', { name: 'Manage features', exact: true });
    this.qrCodesLink = page.getByRole('menuitem', { name: 'QR codes' });
    this.addQRButton = page.getByText('Add QR');
    this.appPromotionLink = page.getByText('App promotionActive');
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
    this.qrNameHeaderLocator = page.locator('h4');
    this.deleteButton = page.locator('[role="dialog"]').getByRole('button', { name: 'Delete' });
    this.qrRowLocator = page.locator('tr');
    this.threeDotsInRowLocator = page.locator('button[aria-label="More options"]');
  }

  async clickOnManage() {
    await this.manageLink.click();
  }

  async clickOnQRCodesMenu() {
    await this.qrCodesLink.click();
  }

  async clickOnAddQR() {
    await this.addQRButton.click();
  }

  async clickOnAppPromotion() {
    await this.appPromotionLink.click();
  }

  async fillQRName(qrName: string) {
    await this.qrNameField.fill(qrName);
  }

  async fillDescription(description: string) {
    await this.descriptionField.fill(description);
  }

  async clickEyeIcon() {
    await this.eyeIcon.click();
  }

  async clickSaveAndVisit() {
    await this.saveAndVisitDashboardBtn.click();
  }

  async verifyManagePage() {
    await expect(this.manageQRPageHeading).toBeVisible();
  }

  async verifyPromoteMobileAppPageHeading() {
    await expect(this.promoteMobileAppPageHeading).toBeVisible();
  }

  async verifyPopupDisplayedByHeader(expectedText: string) {
    await expect(this.appPreviewQRPopupHeader).toHaveText(expectedText);
  }

  async verifyQRImageDisplayOnPreview() {
    await expect(this.imageQROnPreview).toBeVisible();
  }

  async verifyQRDescriptionOnPreview(description: string) {
    const qrDescription = this.descriptionOfQROnPreview.filter({ hasText: description });
    await expect(qrDescription).toBeVisible();
  }

  async verifyQRName(qrName: string) {
    const qrNameLocator = this.qrNameHeaderLocator.filter({ hasText: qrName });
    await expect(qrNameLocator).toBeVisible();
  }

  async clickOnThreeDots(qrName: string) {
    const qrRow = this.qrRowLocator.filter({ hasText: qrName });
    const threeDotsInRow = qrRow.locator('button[aria-label="More options"]');
    await threeDotsInRow.click();
  }

  async clickOnDelete() {
    await this.deleteQR.click();
  }

  async clickOnDeleteButton() {
    await this.deleteButton.click();
  }

  async deleteAppQR(qrName: string) {
    await this.clickOnThreeDots(qrName);
    await this.clickOnDelete();
    await this.clickOnDeleteButton();
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.manageQRPageHeading).toBeVisible();
  }
}
