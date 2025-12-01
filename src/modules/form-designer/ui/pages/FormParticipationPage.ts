import { formCreationConstants } from '@form-designer-constants/formCreation';
import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { FileUtil } from '@/src/core/utils/fileUtil';

export class FormParticipationPage extends BasePage {
  readonly threeDotsIcon: Locator;
  readonly copyLink: Locator;
  readonly shortTextResponse: Locator;
  readonly longTextResponse: Locator;
  readonly numberResponse: Locator;
  readonly emailResponse: Locator;
  readonly fileUploadResponse: Locator;
  readonly imageResponse: Locator;
  readonly multiSelectResponse: (multiSelectValue: string) => Locator;
  readonly singleSelectResponse: (singleSelectValue: string) => Locator;
  readonly dropdownResponse: (dropdownValue: string) => Locator;
  readonly dropdownComponent: Locator;
  //readonly actionLocator: (formName: string) => Locator = (formName: string) => this.page.getByRole('button', { name: `${formName}` }).locator("../../../..").getByRole('button', { name: 'Show more button' }).nth(1);
  readonly actionLocator: (formName: string) => Locator;
  readonly ratingResponse: (ratingValue: string) => Locator;
  readonly opinionResponse: (opinionValue: string) => Locator;
  readonly legalResponse: (legalValue: string) => Locator;
  readonly dateResponse: (dateValue: string) => Locator;
  readonly timeResponse: (timeValue: string) => Locator;
  readonly datecomponent: Locator;
  readonly timecomponent: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.FORM_CREATION_PAGE);
    this.threeDotsIcon = this.page.getByRole('button', { name: 'Show more button' }).nth(1);
    this.copyLink = this.page.getByText('Copy link');
    this.shortTextResponse = this.page.getByRole('textbox', { name: 'Short text' });
    this.longTextResponse = this.page.getByRole('textbox', { name: 'Long text' });
    this.numberResponse = this.page.getByRole('spinbutton', { name: 'Enter number for the property' });
    this.emailResponse = this.page.getByRole('textbox', { name: 'Email' });
    // this.actionLocator = (formName: string) => this.page.getByRole('button', { name: `${formName}` }).locator("../../../..").getByRole('button', { name: 'Show more button' }).nth(1);
    this.actionLocator = (formName: string) =>
      this.page.locator(`(//button[text()='${formName}']/../../../..//button[@aria-label='Show more button'])[2]`);
    this.ratingResponse = (ratingValue: string) =>
      this.page.getByRole('button', { name: `Rating field input selected icon ${ratingValue}` });
    this.opinionResponse = (opinionValue: string) => this.page.getByRole('button', { name: `Rate ${opinionValue}` });
    this.fileUploadResponse = this.page.locator('input[type="file"]').first();
    this.imageResponse = this.page.locator('input[type="file"]').nth(1);
    this.multiSelectResponse = (multiSelectValue: string) =>
      this.page.getByRole('checkbox', { name: `${multiSelectValue}`, exact: true });
    this.singleSelectResponse = (singleSelectValue: string) =>
      this.page.getByRole('radio', { name: `${singleSelectValue}`, exact: true });
    this.dropdownResponse = (dropdownValue: string) => this.page.getByRole('menu').getByText(`${dropdownValue}`);
    // this.dropdownResponse = (dropdownValue: string) => this.page.locator(`('span').filter({ hasText: '${dropdownValue}' }).first()`);
    this.dropdownComponent = this.page.getByRole('button', { name: 'Dropdown field input label' });
    this.legalResponse = (legalValue: string) =>
      this.page.getByRole('checkbox', { name: `${legalValue}`, exact: true });
    this.dateResponse = (dateValue: string) => this.page.getByRole('button', { name: `Today, ${dateValue}` });
    this.timeResponse = (timeValue: string) => this.page.getByRole('option', { name: `${timeValue}` });
    this.datecomponent = this.page.getByRole('button', { name: 'Select date and time Date' });
    this.timecomponent = this.page.getByRole('combobox', { name: 'hh:mm' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Form participation page is loaded', async () => {
      const url = this.page.url();
      test.expect(url, 'URL should contain form creation page endpoint').toContain(PAGE_ENDPOINTS.FORM_CREATION_PAGE);
      await this.page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.MEDIUM });
    });
  }

  async verifyPublishedFormToastMessage(): Promise<void> {
    await test.step('Verify published form toast message is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.toastMessages.filter({ hasText: 'Form published' }), {
        timeout: TIMEOUTS.MEDIUM,
      });
      test
        .expect(
          await this.toastMessages.filter({ hasText: 'Form published' }).isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Form published toast message should be visible'
        )
        .toBe(true);
    });
  }
  async clickOnThreeDotsIcon(): Promise<void> {
    await test.step('Click on three dots icon', async () => {
      // await this.verifier.verifyTheElementIsVisible(this.actionLocator(formCreationConstants.FORM_NAME), { timeout: TIMEOUTS.MEDIUM });

      await this.verifier.verifyTheElementIsVisible(this.actionLocator(formCreationConstants.FORM_NAME), {
        timeout: TIMEOUTS.MEDIUM,
      });
      //await this.verifier.verifyTheElementIsVisible(this.threeDotsIcon, { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.actionLocator(formCreationConstants.FORM_NAME));
    });
  }
  async clickOnCopyLink(): Promise<void> {
    await test.step('Click on copy link', async () => {
      await this.verifier.verifyTheElementIsVisible(this.copyLink, { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.copyLink);
    });
  }
  async waitForFormToBePublished(): Promise<void> {
    await test.step('Wait for form to be published', async () => {
      await this.page.waitForTimeout(TIMEOUTS.SHORT);
    });
  }

  async openCopiedFormLink(): Promise<void> {
    await test.step('Open copied form link from clipboard', async () => {
      try {
        const origin = new URL(this.page.url()).origin;
        await this.page.context().grantPermissions?.(['clipboard-read', 'clipboard-write'], { origin });
      } catch {
        // ignore if not supported
      }
      const url = await this.readClipboardText().catch(() => '');
      if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
        throw new Error(`Copied content is not a valid URL: ${url ?? '<empty>'}`);
      }
      await this.goToUrl(url, { waitUntil: 'load', timeout: TIMEOUTS.MEDIUM });
    });
  }
  async fillResponseIntoShortTextField(response: string): Promise<void> {
    await test.step('Fill response into short text field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.shortTextResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.shortTextResponse, response);
    });
  }

  async fillResponseIntoLongTextField(response: string): Promise<void> {
    await test.step('Fill response into long text field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.longTextResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.longTextResponse, response);
    });
  }

  async fillResponseIntoNumberField(response: string): Promise<void> {
    await test.step('Fill response into number field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.numberResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.numberResponse, response);
    });
  }

  async fillResponseIntoEmailField(response: string): Promise<void> {
    await test.step('Fill response into email field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.emailResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.emailResponse, response);
    });
  }
  async fillResponseIntoRatingField(response: string): Promise<void> {
    await test.step('Fill response into rating field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.ratingResponse(response), { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.ratingResponse(response));
    });
  }
  async fillResponseIntoOpinionField(response: string): Promise<void> {
    await test.step('Fill response into opinion field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.opinionResponse(response), { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.opinionResponse(response));
    });
  }
  async fillResponseIntoFileUploadField(response: string): Promise<void> {
    await test.step('Fill response into file upload field', async () => {
      console.log('File uploaded successfully ::: ' + this.getFileToUpload(response));
      await this.fileUploadResponse.waitFor({ state: 'attached', timeout: TIMEOUTS.MEDIUM });
      await this.fileUploadResponse.setInputFiles(this.getFileToUpload(response));
    });
  }
  async fillResponseIntoImageField(response: string): Promise<void> {
    await test.step('Fill response into image field', async () => {
      await this.imageResponse.waitFor({ state: 'attached', timeout: TIMEOUTS.MEDIUM });
      await this.imageResponse.setInputFiles(this.getFileToUpload(response));
    });
  }
  async fillResponseIntoMultiSelectField(response: string): Promise<void> {
    await test.step('Fill response into multi select field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.multiSelectResponse(response), { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.multiSelectResponse(response));
    });
  }
  async fillResponseIntoSingleSelectField(response: string): Promise<void> {
    await test.step('Fill response into single select field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.singleSelectResponse(response), { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.singleSelectResponse(response));
    });
  }
  async fillResponseIntoDropdownField(response: string): Promise<void> {
    await test.step('Fill response into dropdown field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.dropdownComponent, { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.dropdownComponent);
      await this.clickOnElement(this.dropdownResponse(response));
    });
  }
  async fillResponseIntoLegalField(): Promise<void> {
    await test.step('Fill response into legal field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.legalResponse(formCreationConstants.LEGAL_QUESTION), {
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.clickOnElement(this.legalResponse(formCreationConstants.LEGAL_QUESTION));
    });
  }

  async fillResponseIntoDateField(response: string): Promise<void> {
    await test.step('Fill response into date field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.datecomponent, { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.datecomponent);
      await this.clickOnElement(this.dateResponse(response));
    });
  }
  async fillResponseIntoTimeField(response: string): Promise<void> {
    await test.step('Fill response into time field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.timecomponent, { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.timecomponent);
      await this.clickOnElement(this.timeResponse(response));
    });
  }
  async verifyFormSubmittedMessage(message: string): Promise<void> {
    await test.step('Verify form submitted message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.page.getByText(message), { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.page.getByText(message).isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Form submitted message should be visible'
        )
        .toBe(true);
    });
  }
  async verifyFormDeletedMessage(message: string): Promise<void> {
    await test.step('Verify form deleted message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.page.getByText(message), { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.page.getByText(message).isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Form deleted message should be visible'
        )
        .toBe(true);
    });
  }

  getFileToUpload(response: string): string {
    return FileUtil.getFilePath('./src/modules/form-designer/test-data', `${response}`);
  }
}
