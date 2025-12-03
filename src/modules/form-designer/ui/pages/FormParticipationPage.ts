import { formCreationConstants } from '@form-designer-constants/formCreation';
import { Locator, Page, test } from '@playwright/test';
import path from 'path';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { FileUtil } from '@/src/core/utils/fileUtil';

const TEST_DATA_FILES_PATH = path.join(FileUtil.getProjectRoot(), 'src', 'modules', 'form-designer', 'test-data');

export class FormParticipationPage extends BasePage {
  readonly threeDotsIcon: Locator;
  readonly copyLink: Locator;
  readonly shortTextResponse: Locator;
  readonly longTextResponse: Locator;
  readonly numberResponse: Locator;
  readonly emailResponse: Locator;
  readonly fileUploadResponse: Locator;
  // fileUploadResponsePreview declared below as a function returning Locator
  readonly imageResponse: Locator;
  readonly multiSelectResponse: (multiSelectValue: string) => Locator;
  readonly singleSelectResponse: (singleSelectValue: string) => Locator;
  readonly dropdownResponse: (dropdownValue: string) => Locator;
  readonly dropdownComponent: Locator;
  //readonly actionLocator: (formName: string) => Locator = (formName: string) => this.page.getByRole('button', { name: `${formName}` }).locator("../../../..").getByRole('button', { name: 'Show more button' }).nth(1);
  readonly actionLocator: (formName: string) => Locator;
  readonly ratingResponse: (ratingValue: string) => Locator;
  readonly ratingResponseNew: (ratingValue: string) => Locator;

  readonly opinionResponse: (opinionValue: string) => Locator;
  readonly legalResponse: (legalValue: string) => Locator;
  readonly dateResponse: (dateValue: string) => Locator;
  readonly timeResponse: (timeValue: string) => Locator;
  readonly datecomponent: Locator;
  readonly timecomponent: Locator;
  readonly mandatoryFieldError: (heading: string) => Locator;
  readonly mandatoryFieldErrorNew: (heading: string) => Locator;
  readonly mandatoryFieldErrorAddress: (heading: string, message: string) => Locator;
  readonly previewForm: Locator;
  readonly addressLine1Response: Locator;
  readonly addressLine2Response: Locator;
  readonly cityTownResponse: Locator;
  readonly stateRegionProvinceResponse: Locator;
  readonly zipPostCodeResponse: Locator;
  readonly countryResponse: Locator;
  readonly fileUploadResponsePreview: (fileName: string) => Locator;

  readonly submitButton: Locator;

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
      this.page.getByRole('button', { name: `Rating field input selected icon ${ratingValue}`, exact: true });
    this.opinionResponse = (opinionValue: string) =>
      this.page.getByRole('button', { name: `Rate ${opinionValue}`, exact: true });
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
    this.mandatoryFieldError = (heading: string) =>
      this.page.locator(
        `//span[normalize-space()='${heading}']/../../following::div[text()='This is a required field']`
      );
    this.mandatoryFieldErrorNew = (heading: string) =>
      this.page.locator(`//span[normalize-space()='${heading}']/../../following::p[text()='This is a required field']`);
    this.submitButton = this.page.getByRole('button', { name: 'Submit' });
    this.previewForm = this.page.getByRole('group', { name: 'Preview' });
    this.ratingResponseNew = (ratingValue: string) =>
      this.page.getByRole('button', { name: `Rating field input selected icon ${ratingValue}`, exact: true });
    this.mandatoryFieldErrorAddress = (heading: string, message: string) =>
      this.page.locator(`//span[normalize-space()='${heading}']/../../following::div[text()='${message}']`);
    this.addressLine1Response = this.page.getByRole('textbox', { name: 'Address line 1 ' });
    this.addressLine2Response = this.page.getByRole('textbox', { name: 'Address line 2 *', exact: true });
    this.cityTownResponse = this.page.getByRole('textbox', { name: 'City/Town *', exact: true });
    this.stateRegionProvinceResponse = this.page.getByRole('textbox', { name: 'State/Region/Province *', exact: true });
    this.zipPostCodeResponse = this.page.getByRole('textbox', { name: 'Zip/Postal code *', exact: true });
    this.countryResponse = this.page.getByRole('textbox', { name: 'Country *', exact: true });
    this.fileUploadResponsePreview = (fileName: string) => this.page.getByText(fileName);
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

  async fillResponseIntoFileUploadField(fileName: string): Promise<void> {
    await test.step(`Upload file: ${fileName}`, async () => {
      const filePath = path.join(TEST_DATA_FILES_PATH, fileName);
      await this.fileUploadResponse.waitFor({ state: 'attached', timeout: TIMEOUTS.MEDIUM });
      await this.fileUploadResponse.setInputFiles(filePath);
    });
  }
  async fillResponseIntoImageField(fileName: string): Promise<void> {
    await test.step(`Upload image file: ${fileName}`, async () => {
      const filePath = path.join(TEST_DATA_FILES_PATH, fileName);
      await this.imageResponse.waitFor({ state: 'attached', timeout: TIMEOUTS.MEDIUM });
      await this.imageResponse.setInputFiles(filePath);
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

  async verifyShortTextFieldIsMandatory(heading: string): Promise<void> {
    await test.step('Verify short text field is mandatory', async () => {
      await this.verifier.verifyTheElementIsVisible(this.shortTextResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.shortTextResponse, 'Test_ST_mandatory');
      await this.fillInElement(this.shortTextResponse, '');
      await this.shortTextResponse.blur();
      await this.verifier.verifyTheElementIsVisible(this.mandatoryFieldError(heading), { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.mandatoryFieldError(heading).isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Mandatory field error should be visible'
        )
        .toBe(true);
    });
  }
  async verifyEmailFieldIsMandatory(heading: string): Promise<void> {
    await test.step('Verify email field is mandatory', async () => {
      await this.verifier.verifyTheElementIsVisible(this.emailResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.emailResponse, 'Test@automation.com');
      await this.fillInElement(this.emailResponse, '');
      await this.emailResponse.blur();
      await this.verifier.verifyTheElementIsVisible(this.mandatoryFieldError(heading), { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.mandatoryFieldError(heading).isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Mandatory field error should be visible'
        )
        .toBe(true);
    });
  }

  async verifyLongTextFieldIsMandatory(heading: string): Promise<void> {
    await test.step('Verify long text field is mandatory', async () => {
      await this.verifier.verifyTheElementIsVisible(this.longTextResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.longTextResponse, 'Test_LT_mandatory');
      await this.fillInElement(this.longTextResponse, '');
      await this.longTextResponse.blur();
      await this.verifier.verifyTheElementIsVisible(this.mandatoryFieldError(heading), { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.mandatoryFieldError(heading).isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Mandatory field error should be visible'
        )
        .toBe(true);
    });
  }
  async verifyNumberFieldIsMandatory(heading: string): Promise<void> {
    await test.step('Verify number field is mandatory', async () => {
      await this.verifier.verifyTheElementIsVisible(this.numberResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.numberResponse);
      await this.clickOnElement(this.previewForm);
      await this.numberResponse.blur();
      await this.verifier.verifyTheElementIsVisible(this.mandatoryFieldError(heading), { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.mandatoryFieldError(heading).isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Mandatory field error should be visible'
        )
        .toBe(true);
    });
  }
  async verifyRatingFieldIsMandatory(heading: string, response: string): Promise<void> {
    await test.step('Verify rating field is mandatory', async () => {
      await this.verifier.verifyTheElementIsVisible(this.ratingResponseNew(response), { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.ratingResponseNew(response));
      await this.clickOnElement(this.ratingResponseNew(response));
      await this.clickOnElement(this.previewForm);
      await this.verifier.verifyTheElementIsVisible(this.mandatoryFieldErrorNew(heading), { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.mandatoryFieldErrorNew(heading).isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Mandatory field error should be visible'
        )
        .toBe(true);
    });
  }
  async verifyOpinionFieldIsMandatory(heading: string, response: string): Promise<void> {
    await test.step('Verify opinion field is mandatory', async () => {
      await this.verifier.verifyTheElementIsVisible(this.opinionResponse(response), { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.opinionResponse(response));
      await this.clickOnElement(this.opinionResponse(response));
      await this.opinionResponse(response).blur();
      await this.clickOnElement(this.previewForm);
      await this.verifier.verifyTheElementIsVisible(this.mandatoryFieldErrorNew(heading), { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.mandatoryFieldErrorNew(heading).isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Mandatory field error should be visible'
        )
        .toBe(true);
    });
  }
  async verifyAddressField1IsMandatory(heading: string, message: string): Promise<void> {
    await test.step(`Verify ${message} field is mandatory`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.addressLine1Response, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.addressLine1Response, 'Automation-response-Address line 1');
      await this.fillInElement(this.addressLine1Response, '');
      await this.addressLine1Response.blur();
      await this.clickOnElement(this.previewForm);
      test
        .expect(
          await this.mandatoryFieldErrorAddress(heading, message).isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Mandatory field error should be visible'
        )
        .toBe(true);
    });
  }
  async verifyAddressField2IsMandatory(heading: string, message: string): Promise<void> {
    await test.step(`Verify ${message} field is mandatory`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.addressLine2Response, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.addressLine2Response, 'Automation-response-Address line 2');
      await this.fillInElement(this.addressLine2Response, '');
      await this.addressLine2Response.blur();
    });
    await this.clickOnElement(this.previewForm);
    test
      .expect(
        await this.mandatoryFieldErrorAddress(heading, message).isVisible({ timeout: TIMEOUTS.MEDIUM }),
        'Mandatory field error should be visible'
      )
      .toBe(true);
  }

  async verifyCityTownIsMandatory(heading: string, message: string): Promise<void> {
    await test.step(`Verify ${message} field is mandatory`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.cityTownResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.cityTownResponse, 'Automation-response-City/Town');
      await this.fillInElement(this.cityTownResponse, '');
      await this.cityTownResponse.blur();
    });
    await this.clickOnElement(this.previewForm);
  }
  async verifyStateRegionProvinceIsMandatory(heading: string, message: string): Promise<void> {
    await test.step(`Verify ${message} field is mandatory`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.stateRegionProvinceResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.stateRegionProvinceResponse, 'Automation-response-State/Region/Province');
      await this.fillInElement(this.stateRegionProvinceResponse, '');
      await this.stateRegionProvinceResponse.blur();
    });
    await this.clickOnElement(this.previewForm);
  }

  async verifyZipPostCodeIsMandatory(heading: string, message: string): Promise<void> {
    await test.step(`Verify ${message} field is mandatory`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.zipPostCodeResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.zipPostCodeResponse, 'Automation-response-Zip/Post code');
      await this.fillInElement(this.zipPostCodeResponse, '');
      await this.zipPostCodeResponse.blur();
    });
    await this.clickOnElement(this.previewForm);
  }
  async verifyCountryIsMandatory(heading: string, message: string): Promise<void> {
    await test.step(`Verify ${message} field is mandatory`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.countryResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.countryResponse, 'Automation-response-Country');
      await this.fillInElement(this.countryResponse, '');
      await this.countryResponse.blur();
    });
    await this.clickOnElement(this.previewForm);
  }

  async fillResponseIntoAddressLine1Field(response: string): Promise<void> {
    await test.step('Fill response into address line 1 field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addressLine1Response, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.addressLine1Response, response);
    });
  }
  async fillResponseIntoAddressLine2Field(response: string): Promise<void> {
    await test.step('Fill response into address line 2 field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addressLine2Response, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.addressLine2Response, response);
    });
  }
  async fillResponseIntoCityTownField(response: string): Promise<void> {
    await test.step('Fill response into city/town field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.cityTownResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.cityTownResponse, response);
    });
  }
  async fillResponseIntoStateRegionProvinceField(response: string): Promise<void> {
    await test.step('Fill response into state/region/province field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.stateRegionProvinceResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.stateRegionProvinceResponse, response);
    });
  }
  async fillResponseIntoZipPostCodeField(response: string): Promise<void> {
    await test.step('Fill response into zip/post code field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.zipPostCodeResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.zipPostCodeResponse, response);
    });
  }
  async fillResponseIntoCountryField(response: string): Promise<void> {
    await test.step('Fill response into country field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.countryResponse, { timeout: TIMEOUTS.MEDIUM });
      await this.fillInElement(this.countryResponse, response);
    });
  }
  async verifyFileUploadResponse(fileName: string): Promise<void> {
    await test.step(`Verify ${fileName} file upload response`, async () => {
      test
        .expect(
          await this.fileUploadResponsePreview(fileName).isVisible({ timeout: TIMEOUTS.MEDIUM }),
          `${fileName} file upload response should be visible`
        )
        .toBe(true);
    });
  }
  async verifyEmailValidationMessage(heading: string, message: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.emailResponse, { timeout: TIMEOUTS.MEDIUM });
    await this.clickOnElement(this.previewForm);
    await test.step('Verify email validation message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.mandatoryFieldErrorAddress(heading, message), {
        timeout: TIMEOUTS.MEDIUM,
      });
      test
        .expect(
          await this.mandatoryFieldErrorAddress(heading, message).isVisible({ timeout: TIMEOUTS.MEDIUM }),
          `${message} - Email validation message should be visible`
        )
        .toBe(true);
    });
  }

  async verifySubmitButtonIsDisabled(): Promise<void> {
    await test.step('Verify submit button is disabled', async () => {
      await this.verifier.verifyTheElementIsVisible(this.submitButton, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.submitButton.isDisabled({ timeout: TIMEOUTS.MEDIUM }), 'Submit button should be disabled')
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

  // getFileToUpload(response: string): string {
  //   const projectRoot = FileUtil.getProjectRoot();
  //   return FileUtil.getFilePath(projectRoot, 'src', 'modules', 'form-designer', 'test-data', `${response}`);
  // }
}
