import { faker } from '@faker-js/faker';
import { formCreationConstants } from '@form-designer-constants/formCreation';
import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { dragAndDrop } from '@/src/modules/form-designer/utils';

export class FormCreationPage extends BasePage {
  readonly createFormButton: Locator;
  readonly dragAndDropArea: Locator;
  readonly titleAndDescriptionArea: Locator;
  readonly shortText: Locator;
  readonly draftButton: Locator;
  readonly formNameInput: Locator;
  readonly saveButton: Locator;
  readonly formsTab: Locator;
  readonly draftsTab: Locator;
  readonly publishedTab: Locator;
  readonly archivedTab: Locator;
  readonly allTab: Locator;
  readonly heading: Locator;
  readonly paragraph: Locator;
  readonly longText: Locator;
  readonly number: Locator;
  readonly email: Locator;
  readonly dateAndTime: Locator;
  readonly address: Locator;
  readonly legal: Locator;
  readonly multiSelect: Locator;
  readonly singleSelect: Locator;
  readonly dropDown: Locator;
  readonly fileUpload: Locator;
  readonly image: Locator;
  readonly rating: Locator;
  readonly opinion: Locator;
  readonly blockSection: Locator;
  readonly headingTitleAndDescription: Locator;
  readonly descriptionTitleAndDescription: Locator;
  readonly copyIcon: Locator;
  readonly deleteIcon: Locator;
  readonly settingsIcon: Locator;
  readonly getDashboardLocator: (value: string) => Locator = (value: string) =>
    this.page.locator(`//h3[text()='${value}']`).locator('..');

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.FORM_CREATION_PAGE);
    this.createFormButton = this.page.getByRole('link', { name: 'Create form' });
    this.dragAndDropArea = this.page.getByTestId('drag-placeholder-container');
    this.titleAndDescriptionArea = this.page.getByRole('button', { name: 'Title & description' });
    this.shortText = this.page.getByRole('button', { name: 'Short text' });
    this.draftButton = this.page.getByRole('button', { name: 'Save draft' });
    this.formNameInput = this.page.getByRole('textbox', { name: 'Form name*' });
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
    this.formsTab = this.page.getByRole('menuitem', { name: /Forms/i });
    this.draftsTab = this.page.getByRole('tab', { name: /Drafts?/i });
    this.publishedTab = this.page.getByRole('tab', { name: /Published/i });
    this.archivedTab = this.page.getByRole('tab', { name: /Archived/i });
    this.allTab = this.page.getByRole('tab', { name: /^All\b/i });
    this.heading = this.page.getByRole('button', { name: 'Heading' });
    this.paragraph = this.page.getByRole('button', { name: 'Paragraph' });
    this.longText = this.page.getByRole('button', { name: 'Long text' });
    this.number = this.page.getByRole('button', { name: 'Number' });
    this.email = this.page.getByRole('button', { name: 'Email' });
    this.dateAndTime = this.page.getByRole('button', { name: 'Date and time' });
    this.address = this.page.getByRole('button', { name: 'Address' });
    this.legal = this.page.getByRole('button', { name: 'Legal' });
    this.multiSelect = this.page.getByRole('button', { name: 'Multi select' });
    this.singleSelect = this.page.getByRole('button', { name: 'Single select' });
    this.dropDown = this.page.getByRole('button', { name: 'Dropdown' });
    this.fileUpload = this.page.getByRole('button', { name: 'File upload' });
    this.image = this.page.getByRole('button', { name: 'Image' });
    this.rating = this.page.getByRole('button', { name: 'Rating' });
    this.opinion = this.page.getByRole('button', { name: 'Opinion' });
    this.blockSection = this.page.getByRole('tab', { name: 'Blocks' });
    this.headingTitleAndDescription = this.page.getByText('Add your form heading here');
    this.descriptionTitleAndDescription = this.page.getByText('Add your form description here');
    this.copyIcon = this.page.getByRole('button', { name: 'Copy icon' });
    this.deleteIcon = this.page.getByRole('button', { name: 'Delete icon' });
    this.settingsIcon = this.page.getByRole('button', { name: 'Default Properties icon' });
    this.getDashboardLocator = (value: string) => this.page.locator(`//h3[text()='${value}']`).locator('..');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Form creation page is loaded', async () => {
      const url = this.page.url();
      test.expect(url, 'URL should contain form creation page endpoint').toContain(PAGE_ENDPOINTS.FORM_CREATION_PAGE);
      await this.page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.MEDIUM });
    });
  }
  async clickOnCreateFormButton(): Promise<void> {
    await test.step('Click on Create form button', async () => {
      await this.clickOnElement(this.createFormButton);
    });
  }

  async dragAndDropElement(source: string | Locator, target: string | Locator = this.dragAndDropArea): Promise<void> {
    const srcLocator = typeof source === 'string' ? this.resolveComponentLocator(source) : source;
    const tgtLocator = typeof target === 'string' ? this.resolveTargetLocator(target) : target;
    await test.step('Drag and drop element on Form creation page', async () => {
      await dragAndDrop(this.page, srcLocator, tgtLocator);
    });
  }

  private resolveComponentLocator(componentName: string): Locator {
    let key = componentName.trim().toLowerCase();
    switch (key) {
      case (key = 'title&description') ||
        (key = 'title & description') ||
        (key = 'title&description') ||
        (key = 'title and description'):
        return this.titleAndDescriptionArea;
      case 'heading':
        return this.heading;
      case 'paragraph':
        return this.paragraph;
      case 'short text':
        return this.shortText;
      case 'long text':
        return this.longText;
      case 'number':
        return this.number;
      case 'email':
        return this.email;
      case 'date and time':
        return this.dateAndTime;
      case 'address':
        return this.address;
      case 'legal':
        return this.legal;
      case (key = 'multi select') || (key = 'multiselect'):
        return this.multiSelect;
      case (key = 'single select') || (key = 'singleselect'):
        return this.singleSelect;
      case (key = 'drop down') || (key = 'dropdown') || (key = 'drop-down'):
        return this.dropDown;
      case (key = 'file upload') || (key = 'fileupload'):
        return this.fileUpload;
      case 'image':
        return this.image;
      case 'rating':
        return this.rating;
      case 'opinion':
        return this.opinion;
      default: {
        const escaped = componentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return this.page.getByRole('button', { name: new RegExp(escaped, 'i') });
      }
    }
  }

  private resolveTargetLocator(targetArea: string): Locator {
    let key = targetArea.trim().toLowerCase();
    switch (key) {
      case (key = 'dragarea') || (key = 'canvas') || (key = 'dropzone') || (key = 'main'):
        return this.dragAndDropArea;
      default:
        return this.page.locator(targetArea);
    }
  }

  async enterFormName(namePrefix = 'Automation Form '): Promise<void> {
    const name = `${namePrefix}${faker.string.alphanumeric({ length: 6 })}`;
    await test.step('Enter form name', async () => {
      await this.fillInElement(this.formNameInput, name);
      formCreationConstants.FORM_NAME = name;
    });
  }

  async clickOnSaveDraftButton(): Promise<void> {
    await test.step('Click on Save draft button', async () => {
      await this.clickOnElement(this.draftButton);
    });
  }

  async clickOnSaveButton(): Promise<void> {
    await test.step('Click on Save button', async () => {
      await this.clickOnElement(this.saveButton);
    });
  }

  async verifyDraftToastMessageIsVisible(): Promise<void> {
    await test.step('Verify draft saved toast message is visible', async () => {
      const toast = this.toastMessages.first();
      await this.verifier.verifyTheElementIsVisible(toast, { timeout: TIMEOUTS.MEDIUM });
      const message = await toast.innerText();
      this.expect(message).toMatch('Form drafted');
    });
  }
  async clickOnFormsTab(): Promise<void> {
    await test.step('Click on Forms tab', async () => {
      await this.clickOnElement(this.formsTab);
    });
  }
  async verifyTabOnFormDashboard(tabName: string): Promise<void> {
    await test.step('Verify tab on Form dashboard', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getDashboardLocator(tabName), { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.getDashboardLocator(tabName).isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Tab should be visible'
        )
        .toBe(true);
    });
  }
  async verifyBlockSectionIsVisible(): Promise<void> {
    await test.step('Verify block section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.blockSection, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.blockSection.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Block section should be visible')
        .toBe(true);
    });
  }
  async verifyTitleAndDescriptionSectionIsVisible(): Promise<void> {
    await test.step('Verify title and description section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.titleAndDescriptionArea, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.titleAndDescriptionArea.isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Title and description section should be visible'
        )
        .toBe(true);
    });
  }
  async verifyHeadingSectionIsVisible(): Promise<void> {
    await test.step('Verify heading section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.heading, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.heading.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Heading section should be visible')
        .toBe(true);
    });
  }
  async verifyParagraphSectionIsVisible(): Promise<void> {
    await test.step('Verify paragraph section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.paragraph, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.paragraph.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Paragraph section should be visible')
        .toBe(true);
    });
  }
  async verifyShortTextSectionIsVisible(): Promise<void> {
    await test.step('Verify short text section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.shortText, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.shortText.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Short text section should be visible')
        .toBe(true);
    });
  }
  async verifyLongTextSectionIsVisible(): Promise<void> {
    await test.step('Verify long text section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.longText, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.longText.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Long text section should be visible')
        .toBe(true);
    });
  }
  async verifyNumberSectionIsVisible(): Promise<void> {
    await test.step('Verify number section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.number, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.number.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Number section should be visible')
        .toBe(true);
    });
  }
  async verifyEmailSectionIsVisible(): Promise<void> {
    await test.step('Verify email section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.email, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.email.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Email section should be visible')
        .toBe(true);
    });
  }
  async verifyDateAndTimeSectionIsVisible(): Promise<void> {
    await test.step('Verify date and time section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.dateAndTime, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.dateAndTime.isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Date and time section should be visible'
        )
        .toBe(true);
    });
  }
  async verifyAddressSectionIsVisible(): Promise<void> {
    await test.step('Verify address section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.address, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.address.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Address section should be visible')
        .toBe(true);
    });
  }
  async verifyLegalSectionIsVisible(): Promise<void> {
    await test.step('Verify legal section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.legal, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.legal.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Legal section should be visible')
        .toBe(true);
    });
  }
  async verifyMultiSelectSectionIsVisible(): Promise<void> {
    await test.step('Verify multi select section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.multiSelect, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.multiSelect.isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Multi select section should be visible'
        )
        .toBe(true);
    });
  }
  async verifySingleSelectSectionIsVisible(): Promise<void> {
    await test.step('Verify single select section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.singleSelect, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.singleSelect.isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Single select section should be visible'
        )
        .toBe(true);
    });
  }
  async verifyDropDownSectionIsVisible(): Promise<void> {
    await test.step('Verify drop down section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.dropDown, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.dropDown.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Drop down section should be visible')
        .toBe(true);
    });
  }
  async verifyFileUploadSectionIsVisible(): Promise<void> {
    await test.step('Verify file upload section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.fileUpload, { timeout: TIMEOUTS.MEDIUM });

      test
        .expect(await this.fileUpload.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'File upload section should be visible')
        .toBe(true);
    });
  }
  async verifyImageSectionIsVisible(): Promise<void> {
    await test.step('Verify image section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.image, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.image.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Image section should be visible')
        .toBe(true);
    });
  }
  async verifyRatingSectionIsVisible(): Promise<void> {
    await test.step('Verify rating section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.rating, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.rating.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Rating section should be visible')
        .toBe(true);
    });
  }
  async verifyOpinionSectionIsVisible(): Promise<void> {
    await test.step('Verify opinion section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.opinion, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.opinion.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Opinion section should be visible')
        .toBe(true);
    });
  }
  async addHeading(headingText: string, component: string | Locator): Promise<void> {
    let componentLocator: Locator;
    if (typeof component === 'string') {
      let key = component.trim().toLowerCase();
      switch (key) {
        case (key = 'title & description') || (key = 'title and description'):
          componentLocator = this.titleAndDescriptionArea;
          break;
        case 'heading':
          componentLocator = this.heading;
          break;
        case 'paragraph':
          componentLocator = this.paragraph;
          break;
        case 'short text':
          componentLocator = this.shortText;
          break;
        case 'long text':
          componentLocator = this.longText;
          break;
        case 'number':
          componentLocator = this.number;
          break;
        case 'email':
          componentLocator = this.email;
          break;
        case 'date and time':
          componentLocator = this.dateAndTime;
          break;
        case 'address':
          componentLocator = this.address;
          break;
        case 'legal':
          componentLocator = this.legal;
          break;

        case (key = 'multi select') || (key = 'multiselect'):
          componentLocator = this.multiSelect;
          break;
        case (key = 'single select') || (key = 'singleselect'):
          componentLocator = this.singleSelect;
          break;
        case (key = 'drop down') || (key = 'dropdown') || (key = 'drop-down'):
          componentLocator = this.dropDown;
          break;
        case (key = 'file upload') || (key = 'fileupload'):
          componentLocator = this.fileUpload;
          break;
        case (key = 'image'):
          componentLocator = this.image;
          break;
        case 'rating':
          componentLocator = this.rating;
          break;
        case 'opinion':
          componentLocator = this.opinion;
          break;
        default:
          componentLocator = this.resolveComponentLocator(component);
      }
    } else {
      componentLocator = component;
    }

    await test.step(`Add heading: ${headingText} to component: ${component}`, async () => {
      await this.verifier.verifyTheElementIsVisible(componentLocator, { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(componentLocator);
      await this.page.getByRole('textbox', { name: /^Heading$/ }).fill(headingText);
    });
  }
  async addHeadingIntoTitleAndDescription(headingText: string): Promise<void> {
    await test.step('Add heading into title and description', async () => {
      await this.verifier.verifyTheElementIsVisible(this.headingTitleAndDescription, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.headingTitleAndDescription.isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Heading in title and description section should be visible'
        )
        .toBe(true);
      await this.clickOnElement(this.headingTitleAndDescription);
      await this.fillInElement(this.headingTitleAndDescription, headingText);
      formCreationConstants.FORM_HEADING = headingText;
    });
  }
  async addHeadingIntoComponent(componentName: string, headingText: string): Promise<void> {
    await test.step('Add heading into : ${componentName} component', async () => {
      const componentHeadingLocator = this.page.locator('span').filter({ hasText: componentName });
      await this.verifier.verifyTheElementIsVisible(componentHeadingLocator, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await componentHeadingLocator.isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Heading section should be visible'
        )
        .toBe(true);
      await this.clickOnElement(componentHeadingLocator);
      await this.fillInElement(componentHeadingLocator, headingText);
      formCreationConstants.FORM_HEADING = headingText;
    });
  }
  async addDescriptionIntoTitleAndDescription(descriptionText: string): Promise<void> {
    await test.step('Add description into title and description', async () => {
      await this.verifier.verifyTheElementIsVisible(this.descriptionTitleAndDescription, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.descriptionTitleAndDescription.isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Description in title and description section should be visible'
        )
        .toBe(true);
      await this.clickOnElement(this.descriptionTitleAndDescription);
      await this.fillInElement(this.descriptionTitleAndDescription, descriptionText);
      formCreationConstants.FORM_DESCRIPTION = descriptionText;
    });
  }

  async clickOnCopyIcon(): Promise<void> {
    await test.step('Click on copy icon', async () => {
      await this.verifier.verifyTheElementIsVisible(this.copyIcon, { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.copyIcon);
    });
  }
  async clickOnDeleteIcon(): Promise<void> {
    await test.step('Click on delete icon', async () => {
      await this.verifier.verifyTheElementIsVisible(this.deleteIcon, { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.deleteIcon);
    });
  }
  async clickOnSettingsIcon(): Promise<void> {
    await test.step('Click on settings icon', async () => {
      await this.verifier.verifyTheElementIsVisible(this.settingsIcon, { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.settingsIcon);
    });
  }
  async verifyCopiedTitleAndDescriptionIsVisible(): Promise<void> {
    await test.step('Verify copied component is visible', async () => {
      const heading = formCreationConstants.FORM_HEADING;
      const description = formCreationConstants.FORM_DESCRIPTION;
      if (!heading) {
        throw new Error('FORM_HEADING is not set');
      }
      const secondHeading = this.page.getByText(heading).nth(1);
      await this.verifier.verifyTheElementIsVisible(secondHeading, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await secondHeading.isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Heading in title and description section should be visible into copied component'
        )
        .toBe(true);
      if (!description) {
        throw new Error('FORM_DESCRIPTION is not set');
      }
      const secondDescription = this.page.getByText(description).nth(1);
      await this.verifier.verifyTheElementIsVisible(secondDescription, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await secondDescription.isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Description in title and description section should be visible into copied component'
        )
        .toBe(true);
    });
  }

  async verifyTitleAndDescriptionComponentIsDeleted(): Promise<void> {
    await test.step('Verify component is deleted', async () => {
      const secondHeading = this.headingTitleAndDescription.nth(1);
      await this.verifier.verifyTheElementIsNotVisible(secondHeading, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await secondHeading.isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Heading in title and description section should not be visible'
        )
        .toBe(false);
    });
    const secondDescription = this.descriptionTitleAndDescription.nth(1);
    await this.verifier.verifyTheElementIsNotVisible(secondDescription, { timeout: TIMEOUTS.MEDIUM });
    test
      .expect(
        await secondDescription.isVisible({ timeout: TIMEOUTS.MEDIUM }),
        'Description in title and description section should not be visible'
      )
      .toBe(false);
  }

  async verifyComponentIsDeleted(componentName: string): Promise<void> {
    const heading = formCreationConstants.FORM_HEADING;
    if (!heading) {
      throw new Error('FORM_HEADING is not set');
    }
    const secondInstance = this.page.getByText(heading).nth(1);
    await test.step(`Verify deleted: ${componentName}`, async () => {
      await this.verifier.verifyTheElementIsNotVisible(secondInstance, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await secondInstance.isVisible({ timeout: TIMEOUTS.MEDIUM }), `${componentName} should not be visible`)
        .toBe(false);
    });
  }

  async verifyCopiedComponentIsVisible(componentName: string): Promise<void> {
    const heading = formCreationConstants.FORM_HEADING;
    if (!heading) {
      throw new Error('FORM_HEADING is not set');
    }
    const secondInstance = this.page.getByText(heading).nth(1);
    await test.step(`Verify copied: ${componentName} is visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(secondInstance, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await secondInstance.isVisible({ timeout: TIMEOUTS.MEDIUM }), `${componentName} should be visible`)
        .toBe(true);
    });
  }

  async addDescriptionIntoComponent(componentName: string, descriptionText: string): Promise<void> {
    await test.step('Add description into : ${componentName} component', async () => {
      const componentNameLocator = this.page.locator('span').filter({ hasText: componentName });
      await this.verifier.verifyTheElementIsVisible(componentNameLocator, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await componentNameLocator.isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Description section should be visible'
        )
        .toBe(true);
      await this.clickOnElement(componentNameLocator);
      await this.fillInElement(componentNameLocator, descriptionText);
      formCreationConstants.FORM_DESCRIPTION = descriptionText;
    });
  }
}
