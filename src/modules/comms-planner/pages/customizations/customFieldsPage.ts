import test, { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';

export class CustomFieldsPage extends BasePage {
  /**
   * Customization page
   */
  readonly titleCustomization: Locator;
  readonly tabCustomFields: Locator;
  readonly addCustomFieldButton: Locator;

  /**
   * Customization page - Filters
   */
  readonly customFieldListFieldTypeFilter: Locator;

  /**
   * Custom field modal
   */
  readonly customFieldModalTitle: Locator;
  readonly customFieldModalDescription: Locator;
  readonly customFieldModalButtonCreate: Locator;
  readonly customFieldModalButtonCancel: Locator;

  readonly customFieldNameInput: Locator;
  readonly customFieldType: Locator;
  readonly customFieldTypeOptions: Locator;

  /**
   * Custom field modal - label
   */
  readonly customFieldModalLabelHelper: Locator;
  readonly customFieldModalLabelOptionsTitle: Locator;
  readonly customFieldModalLabelOptionsContainer: Locator;

  readonly customFieldModalLabelOptionsInput: Locator;
  readonly customFieldModalLabelOptionsAddButton: Locator;

  /**
   * Custom field modal - label
   */
  readonly customFieldModalDDHelper: Locator;
  readonly customFieldModalDDOptionsTitle: Locator;
  readonly customFieldModalDDOptionsContainer: Locator;

  readonly customFieldModalDDOptionsInput: Locator;
  readonly customFieldModalDDOptionsAddButton: Locator;

  /**
   * Custom field modal - Text
   */
  readonly customFieldModalTextHelper: Locator;

  /**
   * Custom field modal - Text area
   */
  readonly customFieldModalTextAreaHelper: Locator;

  /**
   * Custom field modal - Number
   */
  readonly customFieldModalNumberHelper: Locator;

  /**
   * Custom field modal - Date
   */
  readonly customFieldModalDateHelper: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.COMMS_PLANNER_CUSTOMIZATION);

    /**
     * Customization page
     */
    this.titleCustomization = this.page.getByRole('heading', { name: 'Customization' });
    this.tabCustomFields = this.page.getByRole('tab', { name: 'Custom fields' });
    this.addCustomFieldButton = this.page.getByRole('button', { name: 'Add' });

    /**
     * Customization page - Filters
     */
    this.customFieldListFieldTypeFilter = this.page.getByRole('button', { name: 'Field type' });

    /**
     * Custom field modal
     */
    this.customFieldModalTitle = this.page.getByRole('heading', { name: 'Create a custom field' });
    this.customFieldModalDescription = this.page.getByText(
      'Define a custom field to organize your content more effectively.'
    );
    this.customFieldModalButtonCreate = this.page.getByRole('button', { name: 'Create' });
    this.customFieldModalButtonCancel = this.page.getByRole('button', { name: 'Cancel' });

    this.customFieldNameInput = this.page.locator('input[name="fieldName"]');
    this.customFieldType = this.page.getByRole('button', { name: 'Select type' });
    this.customFieldTypeOptions = this.page.getByRole('menu');

    /**
     * Custom field - label
     */
    this.customFieldModalLabelHelper = this.page.getByText('Add multiple labels to organize campaigns or activities.');
    this.customFieldModalLabelOptionsTitle = this.page.locator('label', { hasText: 'Options' });
    this.customFieldModalLabelOptionsContainer = this.page.locator(
      "//span[contains(text(), 'Add multiple labels to organize campaigns or activities.')]/following-sibling::div"
    );
    this.customFieldModalLabelOptionsInput = this.customFieldModalLabelOptionsContainer.locator(
      'input[placeholder="Add new label..."]'
    );
    this.customFieldModalLabelOptionsAddButton = this.customFieldModalLabelOptionsContainer.getByRole('button', {
      name: 'Add',
    });

    /**
     * Custom field - Text
     */
    this.customFieldModalTextHelper = this.page.getByText('Use for short notes, summaries, or highlights.');

    /**
     * Custom field - Text
     */
    this.customFieldModalTextAreaHelper = this.page.getByText('Use for detailed descriptions or extended messages.');

    /**
     * Custom field - Number
     */
    this.customFieldModalNumberHelper = this.page.getByText('Enter values like budget, headcount, or targets.');

    /**
     * Custom field - Date
     */
    this.customFieldModalDateHelper = this.page.getByText('Pick a date for launches, deadlines, or milestones.');

    /**
     * Custom field - Dropdown
     */
    this.customFieldModalDDHelper = this.page.getByText('Select one option from predefined list of values.');
    this.customFieldModalDDOptionsTitle = this.page.locator('label', { hasText: 'Options' });
    this.customFieldModalDDOptionsContainer = this.page.locator(
      "//span[contains(text(), 'Select one option from predefined list of values.')]/following-sibling::div"
    );
    this.customFieldModalDDOptionsInput = this.customFieldModalDDOptionsContainer.locator(
      'input[placeholder="Type new option..."]'
    );
    this.customFieldModalDDOptionsAddButton = this.customFieldModalDDOptionsContainer.getByRole('button', {
      name: 'Add',
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify | Customization page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.titleCustomization, {
        assertionMessage: 'Customization title should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(this.tabCustomFields, {
        assertionMessage: 'Custom fields tab should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async addCustomFieldName(name: string): Promise<void> {
    await test.step('Add custom field name', async () => {
      await this.fillInElement(this.customFieldNameInput, name, {
        stepInfo: `Fill in custom field name "${name}"`,
      });
    });
  }

  async selectCustomFieldType(type: string): Promise<void> {
    await test.step('Select custom field type', async () => {
      await this.clickOnElement(this.customFieldType, {
        stepInfo: 'Select custom field type',
      });

      await this.page.getByRole('menuitem', { name: type, exact: true }).click();
    });
  }

  async filterCustomFieldListingByFieldType(type: string): Promise<void> {
    await test.step('Filter custom field listing by field type', async () => {
      await this.clickOnElement(this.customFieldListFieldTypeFilter, {
        stepInfo: 'Select custom field type to filter custom field listing',
      });

      await this.page.getByRole('option', { name: type }).click();
    });
  }

  async selectCustomFieldTypeLabel(options: string[]): Promise<void> {
    await test.step('Select custom field type: Labels', async () => {
      await this.selectCustomFieldType(`Labels`);

      await this.verifier.verifyTheElementIsVisible(this.customFieldModalLabelHelper, {
        assertionMessage: `Custom field type 'Labels' helper text should be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(this.customFieldModalLabelOptionsTitle, {
        assertionMessage: `Custom field type 'Labels' options text should be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });

      for (const option of options) {
        await this.fillInElement(this.customFieldModalLabelOptionsInput, option, {
          stepInfo: `Fill in label custom field's option '${option}'`,
        });
        await this.clickOnElement(this.customFieldModalLabelOptionsAddButton, {
          stepInfo: 'Add options to label custom field',
        });
      }
    });
  }

  async selectCustomFieldTypeDD(options: string[]): Promise<void> {
    await test.step('Select custom field type: Dropdown', async () => {
      await this.selectCustomFieldType(`Dropdown`);

      await this.verifier.verifyTheElementIsVisible(this.customFieldModalDDHelper, {
        assertionMessage: `Custom field type 'Dropdown' helper text should be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(this.customFieldModalDDOptionsTitle, {
        assertionMessage: `Custom field type 'Dropdown' options text should be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });

      for (const option of options) {
        await this.fillInElement(this.customFieldModalDDOptionsInput, option, {
          stepInfo: `Fill in Dropdown custom field's option '${option}'`,
        });
        await this.clickOnElement(this.customFieldModalDDOptionsAddButton, {
          stepInfo: 'Add options to Dropdown custom field',
        });
      }
    });
  }

  async selectCustomFieldTypeText(): Promise<void> {
    await test.step('Select custom field type: Text', async () => {
      await this.selectCustomFieldType(`Text`);

      await this.verifier.verifyTheElementIsVisible(this.customFieldModalTextHelper, {
        assertionMessage: `Custom field type 'Text' helper text should be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async selectCustomFieldTypeTextArea(): Promise<void> {
    await test.step('Select custom field type: Text area', async () => {
      await this.selectCustomFieldType(`Text area (Long text)`);

      await this.verifier.verifyTheElementIsVisible(this.customFieldModalTextAreaHelper, {
        assertionMessage: `Custom field type 'Text area' helper text should be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async selectCustomFieldTypeNumber(): Promise<void> {
    await test.step('Select custom field type: Number', async () => {
      await this.selectCustomFieldType(`Number`);

      await this.verifier.verifyTheElementIsVisible(this.customFieldModalNumberHelper, {
        assertionMessage: `Custom field type 'Number' helper text should be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async selectCustomFieldTypeDate(): Promise<void> {
    await test.step('Select custom field type: Date', async () => {
      await this.selectCustomFieldType(`Date`);

      await this.verifier.verifyTheElementIsVisible(this.customFieldModalDateHelper, {
        assertionMessage: `Custom field type 'Date' helper text should be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async clickCreateCustomFieldModalButton(): Promise<void> {
    await test.step('Click on "Create" custom field button', async () => {
      await this.clickOnElement(this.customFieldModalButtonCreate, {
        stepInfo: 'Click "Create" custom field button to create custom fields',
      });
    });
  }

  async clickAddCustomFieldButton(): Promise<void> {
    await test.step('Click on "Add" custom field button', async () => {
      await this.clickOnElement(this.addCustomFieldButton, {
        stepInfo: 'Click "Add" custom field button to create custom fields',
      });
    });
  }

  async verifyOpenedCustomFieldModal(): Promise<void> {
    await test.step('Verify | Create custom field modal is open', async () => {
      await this.verifier.verifyTheElementIsVisible(this.customFieldModalTitle, {
        assertionMessage: 'Custom field modal title should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(this.customFieldModalDescription, {
        assertionMessage: 'Custom field modal description should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(this.customFieldModalButtonCreate, {
        assertionMessage: 'Create custom field modal button should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(this.customFieldModalButtonCancel, {
        assertionMessage: 'Cancel custom field modal button should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }
}
