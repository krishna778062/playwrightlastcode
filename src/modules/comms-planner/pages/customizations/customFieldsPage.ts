import test, { expect, Locator, Page } from '@playwright/test';

import { DEFAULT_LOCATIONS } from '@modules/comms-planner/constants/constant';

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
   * Customization page - Table
   */
  readonly customFieldTableStatus: (customFieldRowIndex: number) => Locator;
  readonly customFieldTableRow: (customFieldName: string) => Locator;
  readonly customFieldTableAction: (customFieldRowIndex: number) => Locator;
  readonly customFieldTableActionMenu: (id: string) => Locator;
  readonly customFieldTableStatusToggle: (customFieldRowIndex: number) => Locator;
  readonly customFieldDeleteConfirmationTooltip: Locator;
  readonly customFieldStatusToggleConfirmationTooltip: Locator;

  /**
   * Customization page - Custom field deletion confirmation tooltip
   */
  readonly customFieldDeleteConfirmationModalTitle: Locator;
  readonly customFieldDeleteConfirmationModalDescription: Locator;
  readonly customFieldDeleteConfirmationModalDeleteButton: Locator;

  /**
   * Custom field modal
   */
  readonly customFieldModalTitle: Locator;
  readonly customFieldModalDescription: Locator;
  readonly customFieldModalButtonCreate: Locator;
  readonly customFieldModalButtonCancel: Locator;

  readonly customFieldNameInput: Locator;
  readonly customFieldType: Locator;
  readonly customFieldLocation: Locator;
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

  /**
   * Custom field modal - People
   */
  readonly customFieldModalPeopleHelper: Locator;

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
     * Customization page - Table
     */
    this.customFieldTableRow = (customFieldName: string) =>
      this.page
        .locator('div[data-testid^="custom-field-table-row-"][data-testid$="-cell-fieldName"]')
        .filter({ hasText: customFieldName });

    this.customFieldTableStatus = (customFieldRowIndex: number) =>
      this.page.getByTestId(`custom-field-table-row-${customFieldRowIndex}-cell-isEnable`);
    this.customFieldTableAction = (customFieldRowIndex: number) =>
      this.page.locator(`div[data-testid="custom-field-table-row-${customFieldRowIndex}-cell-actions"] button`);
    this.customFieldTableActionMenu = (buttonId: string) =>
      this.page.locator(`div[role="menu"][aria-labelledby="${buttonId}"]`);
    this.customFieldTableStatusToggle = (customFieldRowIndex: number) =>
      this.page.getByTestId(`custom-field-table-row-${customFieldRowIndex}-cell-isEnable`);

    this.customFieldDeleteConfirmationTooltip = this.page.getByText('Custom field definition deleted successfully');
    this.customFieldStatusToggleConfirmationTooltip = this.page.getByText(
      'Custom field status has been updated successfully'
    );

    /**
     * Customization page - Custom field deletion confirmation tooltip
     */
    this.customFieldDeleteConfirmationModalTitle = this.page.getByText('Delete custom field?');
    this.customFieldDeleteConfirmationModalDescription = this.page.getByText(
      'This custom field will be removed from all new campaigns and activities, but it will remain visible in existing records where it has already been used.'
    );
    this.customFieldDeleteConfirmationModalDeleteButton = this.page.getByRole('button', { name: 'Delete' });

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
    this.customFieldLocation = this.page.getByRole('button', { name: 'Add Field To Location' });
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
     * Custom field - People
     */
    this.customFieldModalPeopleHelper = this.page.getByText('Assign owners, contributors, or key contacts.');

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

  async selectCustomFieldLocation(locations: string[] = DEFAULT_LOCATIONS): Promise<void> {
    await test.step('Select custom field locations', async () => {
      await this.clickOnElement(this.customFieldLocation, {
        stepInfo: 'Select custom field locations',
      });

      for (const location of locations) {
        await this.page.getByRole('checkbox', { name: location, exact: true }).click();
      }

      await this.page.keyboard.press('Escape');
    });
  }

  async filterCustomFieldListingByFieldType(type: string): Promise<void> {
    await test.step('Filter custom field listing by field type', async () => {
      await this.clickOnElement(this.customFieldListFieldTypeFilter, {
        stepInfo: 'Select custom field type to filter custom field listing',
      });

      let name: string = type;

      switch (type) {
        case 'Label':
          name = 'Labels';
      }

      await this.page.getByRole('checkbox', { name, exact: true }).click();
      await this.page.mouse.click(0, 0);
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

  async selectCustomFieldTypePeople(): Promise<void> {
    await test.step('Select custom field type: People', async () => {
      await this.selectCustomFieldType(`People`);

      await this.verifier.verifyTheElementIsVisible(this.customFieldModalPeopleHelper, {
        assertionMessage: `Custom field type 'People' helper text should be visible`,
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

  async verifyCreatedCustomField(name: string): Promise<void> {
    await test.step('Verify | Newly created custom field', async () => {
      const { customFieldTableRows } = await this.findCustomFieldInTable(name);

      await this.verifier.verifyTheElementIsVisible(customFieldTableRows, {
        assertionMessage: 'Newly created custom field should be visible in the table',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async toggleAndVerifyCreatedCustomFieldStatus(name: string, enable: boolean): Promise<void> {
    await test.step('Verify | Toggle created custom field status', async () => {
      const { index } = await this.findCustomFieldInTable(name);

      await this.customFieldTableStatusToggle(index).getByRole('switch').click();
      await this.verifier.verifyTheElementIsVisible(this.customFieldStatusToggleConfirmationTooltip, {
        assertionMessage: 'After custom field status change confirmation tooltip should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });

      await expect(this.customFieldTableStatus(index)).toContainText(enable ? 'Active' : 'Inactive');
    });
  }

  async findCustomFieldInTable(name: string) {
    const customFieldTableRows = this.customFieldTableRow(name);

    const count = await customFieldTableRows.count();
    let matchedIndex = -1;

    for (let rowIndex = 0; rowIndex < count; rowIndex++) {
      const text = await customFieldTableRows.nth(rowIndex).innerText();
      if (text === name) {
        matchedIndex = rowIndex;
        break;
      }
    }

    return {
      customFieldTableRows,
      index: matchedIndex,
    };
  }

  async clickCustomFieldTableAction(action: string, name: string): Promise<void> {
    await test.step('Verify | Newly created custom field', async () => {
      const { index } = await this.findCustomFieldInTable(name);

      const actionButton = this.customFieldTableAction(index);
      await this.page.waitForTimeout(1000);
      await actionButton.click();

      const actionButtonIdAttribute = await actionButton.getAttribute('id');
      const customFieldActionMenu = this.customFieldTableActionMenu(actionButtonIdAttribute || '');
      await this.verifier.verifyTheElementIsVisible(customFieldActionMenu, {
        assertionMessage: 'Menu should be shown when custom field action button is clicked',
        timeout: TIMEOUTS.MEDIUM,
      });

      const customFieldActionMenuEditItem = customFieldActionMenu.getByRole('menuitem', { name: action });
      await customFieldActionMenuEditItem.click();
    });
  }

  async verifyDeleteConfirmationModal(): Promise<void> {
    await test.step('Verify | Delete confirmation modal', async () => {
      await this.verifier.verifyTheElementIsVisible(this.customFieldDeleteConfirmationModalTitle, {
        assertionMessage: 'Delete confirmation modal title should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(this.customFieldDeleteConfirmationModalDescription, {
        assertionMessage: 'Delete confirmation modal description should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async clickDeleteConfirmationModalPrimaryButton(): Promise<void> {
    await test.step('Verify | Click on "Delete" button on delete confirmation modal', async () => {
      await this.customFieldDeleteConfirmationModalDeleteButton.click();

      await this.verifier.verifyTheElementIsVisible(this.customFieldDeleteConfirmationTooltip, {
        assertionMessage: 'After custom field deletion confirmation tooltip should be visible',
        timeout: TIMEOUTS.MEDIUM,
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
