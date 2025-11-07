import { faker } from '@faker-js/faker';
import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { dragAndDrop } from '@/src/modules/form-designer/utils';

declare global {
  // Stores the most recently entered form name for cross-test access

  var FORM_NAME: string | undefined;
  var FORM_HEADING: string | undefined;
  var FORM_DESCRIPTION: string | undefined;
}

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
  readonly heading_titleAnddescription: Locator;
  readonly description_titleAnddescription: Locator;
  readonly copy_icon: Locator;
  readonly delete_icon: Locator;
  readonly settings_icon: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.FORM_CREATION_PAGE);
    this.createFormButton = this.page.getByRole('link', { name: 'Create form' });
    this.dragAndDropArea = this.page.getByTestId('drag-placeholder-container');
    this.titleAndDescriptionArea = this.page.getByRole('button', { name: /Title & description/i });
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
    this.heading_titleAnddescription = this.page.getByText('Add your form heading here');
    this.description_titleAnddescription = this.page.getByText('Add your form description here');
    this.copy_icon = this.page.getByRole('button', { name: 'Copy icon' });
    this.delete_icon = this.page.getByRole('button', { name: 'Delete icon' });
    this.settings_icon = this.page.getByRole('button', { name: 'Default Properties icon' });
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
      await this.createFormButton.click();
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
    const key = componentName.trim().toLowerCase();
    switch (key) {
      case 'tile&description':
      case 'tile & description':
      case 'title&description':
      case 'title and description':
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
      case 'multi select':
      case 'multiselect':
        return this.multiSelect;
      case 'single select':
      case 'singleselect':
        return this.singleSelect;
      case 'drop down':
      case 'dropdown':
      case 'drop-down':
        return this.dropDown;
      case 'file upload':
      case 'fileupload':
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
    const key = targetArea.trim().toLowerCase();
    switch (key) {
      case 'dragarea':
      case 'canvas':
      case 'dropzone':
      case 'main':
        return this.dragAndDropArea;
      default:
        return this.page.locator(targetArea);
    }
  }

  async enterFormName(namePrefix = 'Automation Form '): Promise<void> {
    const name = `${namePrefix}${faker.string.alphanumeric({ length: 6 })}`;
    await test.step('Enter form name', async () => {
      await this.formNameInput.fill(name);
      globalThis.FORM_NAME = name;
    });
  }

  async clickOnSaveDraftButton(): Promise<void> {
    await test.step('Click on Save draft button', async () => {
      await this.draftButton.click();
    });
  }

  async clickOnSaveButton(): Promise<void> {
    await test.step('Click on Save button', async () => {
      await this.saveButton.click();
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
      await this.formsTab.click();
    });
  }
  async verifyTabOnFormDashboard(tabName: string): Promise<void> {
    await test.step('Verify tab on Form dashboard', async () => {
      await this.page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.MEDIUM });
      // ensure we are on Forms dashboard
      await this.formsTab.click({ trial: true }).catch(() => {});
      await this.formsTab.click().catch(() => {});
      switch (tabName) {
        case 'Draft': {
          let draftsTab = this.draftsTab.first();
          if (!(await this.draftsTab.count())) {
            const btn = this.page.getByRole('button', { name: /Drafts?/i });
            if (await btn.count()) {
              draftsTab = btn.first();
            } else {
              draftsTab = this.page.getByText(/^Drafts?$/i).first();
            }
          }
          await this.verifier.verifyTheElementIsVisible(draftsTab, { timeout: TIMEOUTS.MEDIUM });
          test
            .expect(await draftsTab.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Drafts tab should be visible')
            .toBe(true);
          break;
        }
        case 'Published': {
          let publishedTab = this.publishedTab.first();
          if (!(await this.publishedTab.count())) {
            const btn = this.page.getByRole('button', { name: /Published/i });
            if (await btn.count()) {
              publishedTab = btn.first();
            } else {
              publishedTab = this.page.getByText(/^Published$/i).first();
            }
          }
          await this.verifier.verifyTheElementIsVisible(publishedTab, { timeout: TIMEOUTS.MEDIUM });
          test
            .expect(await publishedTab.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Published tab should be visible')
            .toBe(true);
          break;
        }
        case 'Archived': {
          let archivedTab = this.archivedTab.first();
          if (!(await this.archivedTab.count())) {
            const btn = this.page.getByRole('button', { name: /Archived/i });
            if (await btn.count()) {
              archivedTab = btn.first();
            } else {
              archivedTab = this.page.getByText(/^Archived$/i).first();
            }
          }
          await this.verifier.verifyTheElementIsVisible(archivedTab, { timeout: TIMEOUTS.MEDIUM });
          test
            .expect(await archivedTab.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Archived tab should be visible')
            .toBe(true);
          break;
        }
        case 'All': {
          let allTab = this.allTab.first();
          if (!(await this.allTab.count())) {
            const btn = this.page.getByRole('button', { name: /^All$/i });
            if (await btn.count()) {
              allTab = btn.first();
            } else {
              allTab = this.page.getByText(/^All$/i).first();
            }
          }
          await this.verifier.verifyTheElementIsVisible(allTab, { timeout: TIMEOUTS.MEDIUM });
          test.expect(await allTab.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'All tab should be visible').toBe(true);
          break;
        }
      }
    });
  }
  async verfiyBlockSectionIsVisible(): Promise<void> {
    await test.step('Verify block section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.blockSection, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await this.blockSection.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Block section should be visible')
        .toBe(true);
    });
  }
  async veriftTitleAndDescriptionSectionIsVisible(): Promise<void> {
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
      const key = component.trim().toLowerCase();
      switch (key) {
        case 'tile&description':
        case 'tile & description':
        case 'title&description':
        case 'title and description':
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
        case 'multi select':
        case 'multiselect':
          componentLocator = this.multiSelect;
          break;
        case 'single select':
        case 'singleselect':
          componentLocator = this.singleSelect;
          break;
        case 'drop down':
        case 'dropdown':
        case 'drop-down':
          componentLocator = this.dropDown;
          break;
        case 'file upload':
        case 'fileupload':
          componentLocator = this.fileUpload;
          break;
        case 'image':
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
      await componentLocator.click();
      await this.page.getByRole('textbox', { name: /^Heading$/ }).fill(headingText);
    });
  }
  async addHeadingIntoTitleAndDescription(headingText: string): Promise<void> {
    await test.step('Add heading into title and description', async () => {
      await this.verifier.verifyTheElementIsVisible(this.heading_titleAnddescription, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.heading_titleAnddescription.isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Heading in title and description section should be visible'
        )
        .toBe(true);
      await this.heading_titleAnddescription.click();
      await this.heading_titleAnddescription.fill(headingText);
      globalThis.FORM_HEADING = headingText;
    });
  }
  async addHeadingIntoComponent(componentName: string, headingText: string): Promise<void> {
    await test.step('Add heading into : ${componentName} component', async () => {
      const component_heading = this.page.locator('span').filter({ hasText: componentName });
      await this.verifier.verifyTheElementIsVisible(component_heading, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await component_heading.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Heading section should be visible')
        .toBe(true);
      await component_heading.click();
      await component_heading.fill(headingText);
      globalThis.FORM_HEADING = headingText;
    });
  }
  async addDescriptionIntoTitleAndDescription(descriptionText: string): Promise<void> {
    await test.step('Add description into title and description', async () => {
      await this.verifier.verifyTheElementIsVisible(this.description_titleAnddescription, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await this.description_titleAnddescription.isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Description in title and description section should be visible'
        )
        .toBe(true);
      await this.description_titleAnddescription.click();
      await this.description_titleAnddescription.fill(descriptionText);
      globalThis.FORM_DESCRIPTION = descriptionText;
    });
  }

  async clickOnCopyIcon(): Promise<void> {
    await test.step('Click on copy icon', async () => {
      await this.verifier.verifyTheElementIsVisible(this.copy_icon, { timeout: TIMEOUTS.MEDIUM });
      await this.copy_icon.click();
    });
  }
  async clickOnDeleteIcon(): Promise<void> {
    await test.step('Click on delete icon', async () => {
      await this.verifier.verifyTheElementIsVisible(this.delete_icon, { timeout: TIMEOUTS.MEDIUM });
      await this.delete_icon.click();
    });
  }
  async clickOnSettingsIcon(): Promise<void> {
    await test.step('Click on settings icon', async () => {
      await this.verifier.verifyTheElementIsVisible(this.settings_icon, { timeout: TIMEOUTS.MEDIUM });
      await this.settings_icon.click();
    });
  }
  async verfiyCopiedTitleAndDescriptionIsVisible(): Promise<void> {
    await test.step('Verify copied component is visible', async () => {
      const heading = globalThis.FORM_HEADING;
      const description = globalThis.FORM_DESCRIPTION;
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
      const secondHeading = this.heading_titleAnddescription.nth(1);
      await this.verifier.verifyTheElementIsNotVisible(secondHeading, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(
          await secondHeading.isVisible({ timeout: TIMEOUTS.MEDIUM }),
          'Heading in title and description section should not be visible'
        )
        .toBe(false);
    });
    const secondDescription = this.description_titleAnddescription.nth(1);
    await this.verifier.verifyTheElementIsNotVisible(secondDescription, { timeout: TIMEOUTS.MEDIUM });
    test
      .expect(
        await secondDescription.isVisible({ timeout: TIMEOUTS.MEDIUM }),
        'Description in title and description section should not be visible'
      )
      .toBe(false);
  }

  async verifyComponentIsDeleted(componentName: string): Promise<void> {
    const heading = globalThis.FORM_HEADING;
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

  async verfiyCopiedComponentIsVisible(componentName: string): Promise<void> {
    const heading = globalThis.FORM_HEADING;
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
      const component_name = this.page.locator('span').filter({ hasText: componentName });
      await this.verifier.verifyTheElementIsVisible(component_name, { timeout: TIMEOUTS.MEDIUM });
      test
        .expect(await component_name.isVisible({ timeout: TIMEOUTS.MEDIUM }), 'Description section should be visible')
        .toBe(true);
      await component_name.click();
      await component_name.fill(descriptionText);
      globalThis.FORM_DESCRIPTION = descriptionText;
    });
  }
}
