import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class TagComponent extends BaseComponent {
  readonly page: Page;
  readonly tagTextField: Locator;
  readonly tooltipTextField: Locator;
  readonly tagTextHelperText: Locator;
  readonly tooltipTextHelperText: Locator;
  readonly tagStylingField: Locator;
  readonly tagTextDisplay: Locator;
  private readonly fieldSelector: string;
  readonly dialog: Locator;
  readonly dialogTitle: Locator;
  readonly dialogTagStyleLabel: Locator;
  readonly dialogHelperText: Locator;
  readonly dialogStatusRadio: Locator;
  readonly dialogIconRadio: Locator;
  readonly dialogTextRadio: Locator;
  readonly dialogCancelButton: Locator;
  readonly dialogSaveButton: Locator;
  readonly dialogRadioButtons: Locator;
  readonly dialogErrorMessage: Locator;
  readonly dialogErrorAlert: Locator;
  readonly dialogMappingRulesHeading: Locator;
  readonly dialogMappingRulesDescription: Locator;
  readonly dialogAddMappingRuleButton: Locator;
  readonly dialogFallbackHeading: Locator;
  readonly dialogFallbackDescription: Locator;
  readonly dialogDefaultColorField: Locator;
  readonly dialogMappingRuleTextError: Locator;
  readonly dialogMappingRuleColorError: Locator;
  readonly dialogDefaultColorError: Locator;
  readonly dialogListbox: Locator;
  readonly dialogListboxMenuItems: Locator;
  readonly dialogMappingRuleTextInput: Locator;
  readonly dialogMappingRuleColorField: Locator;
  readonly dialogSelectIconButton: Locator;
  readonly dialogIconSourceField: Locator;
  readonly dialogIconUrlInput: Locator;
  readonly iconDialogTitle: Locator;
  readonly iconDialogDoneButton: Locator;
  readonly iconPreviewImage: Locator;
  readonly iconUrlLink: Locator;
  readonly iconPreviewContainer: Locator;
  readonly iconPreviewFileName: Locator;
  readonly iconPreviewFileSize: Locator;
  readonly iconPreviewDeleteButton: Locator;
  private readonly dialogRadios: Record<string, Locator>;
  readonly colorPickerDialog: Locator;
  readonly colorPickerHexInput: Locator;
  readonly colorPickerOkButton: Locator;
  readonly dialogDefaultLightThemeField: Locator;
  readonly dialogDefaultDarkThemeField: Locator;
  readonly backButton: Locator;
  readonly tagContainer: Locator;

  constructor(page: Page, fieldSelector: string = '[data-testid="field-{fieldName}"]') {
    super(page);
    this.page = page;
    this.fieldSelector = fieldSelector;
    this.tagTextField = page.getByPlaceholder('Tag text…');
    this.tooltipTextField = page.getByPlaceholder('Tooltip text…');
    this.tagTextHelperText = page.getByText('Longer text will be cut off to fit one line');
    this.tooltipTextHelperText = page.getByText('Appears on hover. Text over 150 chars will be cut off.');
    this.tagStylingField = page.locator(fieldSelector.replace('{fieldName}', 'Tag styling'));
    this.tagTextDisplay = page.locator('span._contentEditableText_6ubwg_36');
    this.dialog = page.getByRole('dialog');
    this.dialogTitle = this.dialog.getByRole('heading', { name: 'Add custom settings' });
    this.dialogTagStyleLabel = this.dialog.getByRole('heading', { name: /Tag style/ });
    this.dialogHelperText = this.dialog.getByText("Customize the tag's appearance to convey additional meaning");
    this.dialogStatusRadio = this.dialog.locator('input[type="radio"][value="status"]');
    this.dialogIconRadio = this.dialog.locator('input[type="radio"][value="icon"]');
    this.dialogTextRadio = this.dialog.locator('input[type="radio"][value="text"]');
    this.dialogCancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.dialogSaveButton = this.dialog.getByRole('button', { name: 'Save' });
    this.dialogRadioButtons = this.dialog.locator('input[type="radio"][name="customSettings.activeType"]');
    this.dialogErrorMessage = this.dialog.getByText('Pill type is a required field');
    this.dialogErrorAlert = this.dialog.locator('p[role="alert"]').filter({ hasText: 'Pill type is a required field' });
    this.dialogMappingRulesHeading = this.dialog.getByRole('heading', { name: 'Mapping rules' });
    this.dialogMappingRulesDescription = this.dialog.getByText(
      'Map text values to statuses, entering each value as plain text or a regular expression'
    );
    this.dialogAddMappingRuleButton = this.dialog.getByRole('button', { name: 'Add mapping rule' });
    this.dialogFallbackHeading = this.dialog.getByRole('heading', { name: 'Fallback' });
    this.dialogFallbackDescription = this.dialog.getByText(
      'Display this status when no matching text is available or if an error occurs'
    );
    this.dialogDefaultColorField = this.dialog.locator('[data-testid="field-Default color"]').getByRole('combobox');
    this.dialogMappingRuleTextError = this.dialog.getByText('Text is a required field');
    this.dialogMappingRuleColorError = this.dialog.getByText('Color is a required field');
    this.dialogDefaultColorError = this.dialog.getByText('Default color is a required field');
    this.dialogListbox = this.dialog.getByRole('listbox');
    this.dialogListboxMenuItems = this.dialogListbox.getByRole('menuitem');
    this.dialogMappingRuleTextInput = this.dialog
      .locator('[data-testid="field-Text"]')
      .getByPlaceholder('Enter text or regex…')
      .first();
    this.dialogMappingRuleColorField = this.dialog.locator('[data-testid="field-Color"]').getByRole('combobox').first();
    this.dialogSelectIconButton = this.dialog.getByRole('button', { name: 'Select icon' });
    this.iconDialogTitle = this.page.getByRole('heading', { name: 'Select icon' });
    this.dialogIconSourceField = this.page.locator('[data-testid="field-Icon source"]');
    this.dialogIconUrlInput = this.page.locator('[data-testid="field-Icon URL"]').getByPlaceholder('Icon URL…');
    this.iconDialogDoneButton = this.page.getByRole('button', { name: 'Done' });
    this.iconPreviewImage = this.page.locator('img._previewImage_198co_16[alt="Icon preview"]');
    this.iconUrlLink = this.page.locator('a._urlLink_198co_24');
    this.iconPreviewContainer = this.page.locator('div._previewContainer_198co_1');
    this.iconPreviewFileName = this.iconPreviewContainer
      .locator('div.Spacing-module__column__bvKBb')
      .locator('p.Typography-module__paragraph__OGpiQ')
      .first();
    this.iconPreviewFileSize = this.iconPreviewContainer
      .locator('p.Typography-module__secondary__OGpiQ')
      .filter({ hasText: /kb|KB|mb|MB/ })
      .first();
    this.iconPreviewDeleteButton = this.iconPreviewContainer.getByRole('button', { name: 'Delete image' });
    this.colorPickerDialog = this.page.getByRole('dialog', { name: 'Hex color picker' });
    this.colorPickerHexInput = this.colorPickerDialog
      .locator('[data-testid="hex-color-picker"]')
      .locator('input[id^="rc-editable-input-"]')
      .first();
    this.colorPickerOkButton = this.colorPickerDialog.getByRole('button', { name: 'OK' });
    this.dialogDefaultLightThemeField = this.dialog.locator('[data-testid="field-Light theme"]');
    this.dialogDefaultDarkThemeField = this.dialog.locator('[data-testid="field-Dark theme (mobile app only)"]');
    this.backButton = this.page.getByRole('button', { name: 'Back' });
    this.tagContainer = this.page.locator('[data-testid="tag"]');
    this.dialogRadios = {
      status: this.dialogStatusRadio,
      icon: this.dialogIconRadio,
      text: this.dialogTextRadio,
    };
  }

  /**
   * Get a specific field locator by field name
   * @param fieldName - The name of the field (e.g., 'Tag styling')
   * @returns Locator for the field
   */
  private getFieldLocator(fieldName: string): Locator {
    const selector = this.fieldSelector.replace('{fieldName}', fieldName);
    return this.page.locator(selector);
  }

  /**
   * Enter text in the Tag text field
   * @param text - The text to enter
   */
  async enterTagText(text: string): Promise<void> {
    await test.step(`Enter "${text}" in Tag text field`, async () => {
      await this.tagTextField.fill(text);
    });
  }

  /**
   * Verify Tag text field is visible and has expected properties
   * @param expectedValue - Optional expected value in the field
   */
  async verifyTagTextField(expectedValue?: string): Promise<void> {
    await test.step('Verify Tag text field is visible', async () => {
      await expect(this.tagTextField, 'Tag text field should be visible').toBeVisible();

      if (expectedValue !== undefined) {
        await expect(this.tagTextField, `Tag text field should have value "${expectedValue}"`).toHaveValue(
          expectedValue
        );
      }
      await expect(this.tagTextHelperText, 'Tag text helper text should be visible').toBeVisible();
    });
  }

  /**
   * Verify Tooltip text field is visible and has expected properties
   * @param expectedValue - Optional expected value in the field
   */
  async verifyTooltipTextField(expectedValue?: string): Promise<void> {
    await test.step('Verify Tooltip text field is visible', async () => {
      await expect(this.tooltipTextField, 'Tooltip text field should be visible').toBeVisible();

      if (expectedValue !== undefined) {
        await expect(this.tooltipTextField, `Tooltip text field should have value "${expectedValue}"`).toHaveValue(
          expectedValue
        );
      }
      await expect(this.tooltipTextHelperText, 'Tooltip text helper text should be visible').toBeVisible();
    });
  }

  /**
   * Verify both Tag text and Tooltip text fields are visible
   * @param tagTextValue - Optional expected value for Tag text field
   * @param tooltipTextValue - Optional expected value for Tooltip text field
   */
  async verifyTagComponentFields(tagTextValue?: string, tooltipTextValue?: string): Promise<void> {
    await test.step('Verify Tag component fields', async () => {
      await this.verifyTagTextField(tagTextValue);
      await this.verifyTooltipTextField(tooltipTextValue);
    });
  }

  /**
   * Verify styling radio button is selected
   * @param expectedValue - The expected selected value ('default' or 'custom')
   */
  async verifyStylingRadioSelected(expectedValue: 'default' | 'custom' = 'default'): Promise<void> {
    await test.step(`Verify styling "${expectedValue}" radio button is selected`, async () => {
      const radioButton = this.tagStylingField.locator(`input[type="radio"][value="${expectedValue}"]`);
      await expect(radioButton, `Styling "${expectedValue}" radio button should be checked`).toBeChecked();
      // Also verify the label has the checked class
      const radioLabel = this.tagStylingField.locator(`label:has(input[value="${expectedValue}"])`);
      await expect(radioLabel, `Styling "${expectedValue}" label should have checked class`).toHaveClass(
        /RadioListInput-module__isChecked__/
      );
    });
  }

  /**
   * Select radio button by value or label
   * @param option - The option value or label to select
   * @param fieldName - Optional field name. If not provided, defaults to 'Tag styling' for backward compatibility. Use 'dialog' for dialog radio buttons.
   */
  async selectRadio(option: string, fieldName?: string): Promise<void> {
    await test.step(`Select "${option}" radio button${fieldName ? ` in "${fieldName}"` : ''}`, async () => {
      let radioButton: Locator | undefined;

      if (fieldName === 'dialog') {
        const lowerOption = option.toLowerCase();
        if (!(lowerOption in this.dialogRadios)) {
          throw new Error(`Invalid dialog radio button option: ${option}. Expected 'status', 'icon', or 'text'.`);
        }
        radioButton = this.dialogRadios[lowerOption];
      } else {
        const field = fieldName ? this.getFieldLocator(fieldName) : this.tagStylingField;
        for (const strategy of [
          field.locator(`input[type="radio"][value="${option}"]`),
          field.getByRole('radio', { name: option }),
          field.locator('label').filter({ hasText: option }).locator('input[type="radio"]'),
        ]) {
          if ((await strategy.count()) > 0) {
            radioButton = strategy.first();
            break;
          }
        }
        if (!radioButton) {
          throw new Error(`Radio button "${option}" not found in field "${fieldName || 'Tag styling'}".`);
        }
      }
      await this.clickOnElement(radioButton);
    });
  }

  /**
   * Select styling radio button (backward compatibility method)
   * @param value - The value to select
   * @param fieldName - Optional field name
   * @deprecated Use selectRadio instead
   */
  async selectStylingRadio(value: string, fieldName?: string): Promise<void> {
    await this.selectRadio(value, fieldName);
  }

  /**
   * Verify dialog fields are visible
   */
  async verifyDialogFields(): Promise<void> {
    await test.step('Verify dialog fields are visible', async () => {
      await expect(this.dialogTitle, 'Dialog title should be visible').toBeVisible();
      await expect(this.dialogTagStyleLabel, 'Tag style label should be visible').toBeVisible();
      await expect(this.dialogHelperText, 'Helper text should be visible').toBeVisible();
      await expect(this.dialogStatusRadio, 'Status radio button should be visible').toBeVisible();
      await expect(this.dialogIconRadio, 'Icon radio button should be visible').toBeVisible();
      await expect(this.dialogTextRadio, 'Text radio button should be visible').toBeVisible();
      await expect(this.dialogCancelButton, 'Cancel button should be visible').toBeVisible();
      await expect(this.dialogSaveButton, 'Save button should be visible').toBeVisible();
    });
  }

  /**
   * Verify no radio button is pre-selected in the dialog
   */
  async verifyNoRadioButtonSelected(): Promise<void> {
    await test.step('Verify no radio button is pre-selected in dialog', async () => {
      const count = await this.dialogRadioButtons.count();
      for (let i = 0; i < count; i++) {
        const radioButton = this.dialogRadioButtons.nth(i);
        await expect(radioButton, `Radio button at index ${i} should not be checked`).not.toBeChecked();
      }
    });
  }

  /**
   * Verify required field error message appears
   */
  async verifyRequiredFieldError(): Promise<void> {
    await test.step('Verify required field error message', async () => {
      await expect(this.dialogErrorMessage, 'Required field error message should be visible').toBeVisible();
      await expect(this.dialogErrorAlert, 'Error message should have alert role').toBeVisible();
    });
  }

  /**
   * Verify text-specific dialog fields are visible (Mapping rules and Fallback sections)
   */
  async verifyTextDialogFields(): Promise<void> {
    await test.step('Verify text-specific dialog fields are visible', async () => {
      await expect(this.dialogMappingRulesHeading, 'Mapping rules heading should be visible').toBeVisible();
      await expect(this.dialogMappingRulesDescription, 'Mapping rules description should be visible').toBeVisible();
      await expect(this.dialogAddMappingRuleButton, 'Add mapping rule button should be visible').toBeVisible();
      await expect(this.dialogFallbackHeading, 'Fallback heading should be visible').toBeVisible();
      await expect(this.dialogFallbackDescription, 'Fallback description should be visible').toBeVisible();
      await expect(this.dialogDefaultColorField, 'Default color field should be visible').toBeVisible();
    });
  }

  /**
   * Format hex color to ensure it starts with #
   * @param hexColor - Hex color code (e.g., "#000000" or "000000")
   * @returns Formatted hex color with leading #
   */
  private formatHexColor(hexColor: string): string {
    return hexColor.startsWith('#') ? hexColor : `#${hexColor}`;
  }

  /**
   * Private helper method to interact with color picker dialog
   * @param colorButton - The color button locator to click
   * @param hexColor - Hex color code to enter
   * @param stepDescription - Description for the test step
   */
  private async enterColorInPicker(colorButton: Locator, hexColor: string, stepDescription: string): Promise<void> {
    await test.step(stepDescription, async () => {
      const formattedColor = this.formatHexColor(hexColor);
      await this.clickOnElement(colorButton);
      await expect(this.colorPickerDialog, 'Color picker dialog should be visible').toBeVisible();
      await this.colorPickerHexInput.clear();
      await this.colorPickerHexInput.fill(formattedColor);
      await this.clickOnElement(this.colorPickerOkButton);
      await expect(this.colorPickerDialog, 'Color picker dialog should be closed').not.toBeVisible();
    });
  }

  /**
   * Get mapping rule container by index
   * @param ruleIndex - Index of the mapping rule (default: 0 for first rule)
   * @returns Locator for the mapping rule container
   */
  private getMappingRuleContainer(ruleIndex: number = 0): Locator {
    const mappingRulesSection = this.getMappingRulesSection();
    const ruleContainers = mappingRulesSection.locator('div._ruleContainer_506t5_1');
    return ruleContainers.nth(ruleIndex);
  }

  /**
   * Private helper method to select an option from any color dropdown
   * @param combobox - The combobox locator to click
   * @param option - The option to select (e.g., 'None', 'Low', 'Medium', 'High', 'Highest', 'Custom')
   * @param stepDescription - Description for the test step
   */
  private async selectColorFromDropdown(combobox: Locator, option: string, stepDescription: string): Promise<void> {
    await test.step(stepDescription, async () => {
      await this.clickOnElement(combobox);

      // Wait for listbox to be visible and scope it to the dialog
      const listbox = this.dialog.getByRole('listbox');
      await expect(listbox, 'Listbox should be visible').toBeVisible();

      const menuItem = listbox.getByRole('menuitem').filter({ hasText: option }).first();
      await this.clickOnElement(menuItem);
    });
  }

  /**
   * Select option from Default color dropdown
   * @param option - The option to select (e.g., 'None', 'Low', 'Medium', 'High', 'Highest', 'Custom')
   */
  async selectDefaultColor(option: string): Promise<void> {
    await this.selectColorFromDropdown(
      this.dialogDefaultColorField,
      option,
      `Select "${option}" from Default color dropdown`
    );
  }

  /**
   * Enter custom hex color for default color light theme
   * @param hexColor - Hex color code (e.g., "#000000" or "000000")
   */
  async enterDefaultColorLightTheme(hexColor: string): Promise<void> {
    const colorButton = this.dialogDefaultLightThemeField.locator('button.InputButtonLauncher-module__launcher__kby5u');
    await this.enterColorInPicker(colorButton, hexColor, `Enter "${hexColor}" in Default color Light theme field`);
  }

  /**
   * Enter custom hex color for default color dark theme
   * @param hexColor - Hex color code (e.g., "#FFFFFF" or "FFFFFF")
   */
  async enterDefaultColorDarkTheme(hexColor: string): Promise<void> {
    const colorButton = this.dialogDefaultDarkThemeField.locator('button.InputButtonLauncher-module__launcher__kby5u');
    await this.enterColorInPicker(colorButton, hexColor, `Enter "${hexColor}" in Default color Dark theme field`);
  }

  /**
   * Enter text in the mapping rule Text input field
   * @param text - The text to enter
   * @param ruleIndex - Optional index of the mapping rule (default: 0 for first rule)
   */
  async enterMappingRuleText(text: string, ruleIndex: number = 0): Promise<void> {
    await test.step(`Enter "${text}" in mapping rule Text field at index ${ruleIndex}`, async () => {
      const mappingRulesSection = this.getMappingRulesSection();
      const textInputs = mappingRulesSection.locator('[data-testid="field-Text"]').locator('input[type="text"]');
      const textInput = textInputs.nth(ruleIndex);
      await textInput.fill(text);
    });
  }

  /**
   * Edit/update text in the mapping rule Text input field
   * @param newText - The new text to enter
   * @param ruleIndex - Optional index of the mapping rule (default: 0 for first rule)
   */
  async editMappingRuleText(newText: string, ruleIndex: number = 0): Promise<void> {
    await test.step(`Edit mapping rule text to "${newText}" at index ${ruleIndex}`, async () => {
      const mappingRulesSection = this.getMappingRulesSection();
      const textInputs = mappingRulesSection.locator('[data-testid="field-Text"]').locator('input[type="text"]');
      const textInput = textInputs.nth(ruleIndex);
      await textInput.clear();
      await textInput.fill(newText);
    });
  }

  /**
   * Toggle the "Parse as regex" switch for a mapping rule
   * @param ruleIndex - Optional index of the mapping rule (default: 0 for first rule)
   */
  async toggleParseAsRegex(ruleIndex: number = 0): Promise<void> {
    await test.step(`Toggle "Parse as regex" switch for mapping rule at index ${ruleIndex}`, async () => {
      const ruleContainer = this.getMappingRuleContainer(ruleIndex);
      const regexToggle = ruleContainer
        .locator('label')
        .filter({ hasText: 'Parse as regex' })
        .locator('button[role="switch"]')
        .first();
      await this.clickOnElement(regexToggle);
    });
  }

  /**
   * Select color option from the mapping rule Color dropdown
   * @param option - The color option to select (e.g., 'None', 'Low', 'Medium', 'High', 'Highest', 'Custom')
   * @param ruleIndex - Optional index of the mapping rule (default: 0 for first rule)
   */
  async selectMappingRuleColor(option: string, ruleIndex: number = 0): Promise<void> {
    await test.step(`Select "${option}" from mapping rule Color dropdown at index ${ruleIndex}`, async () => {
      const mappingRulesSection = this.getMappingRulesSection();
      const colorFields = mappingRulesSection.locator('[data-testid="field-Color"]').getByRole('combobox');
      const colorField = colorFields.nth(ruleIndex);
      await this.selectColorFromDropdown(
        colorField,
        option,
        `Select "${option}" from mapping rule Color dropdown at index ${ruleIndex}`
      );
    });
  }

  /**
   * Enter custom hex color for mapping rule light theme
   * @param hexColor - Hex color code (e.g., "#FF0000" or "FF0000")
   * @param ruleIndex - Optional index of the mapping rule (default: 0 for first rule)
   */
  async enterMappingRuleColorLightTheme(hexColor: string, ruleIndex: number = 0): Promise<void> {
    const ruleContainer = this.getMappingRuleContainer(ruleIndex);
    const lightThemeField = ruleContainer.locator('[data-testid="field-Light theme"]').first();
    const colorButton = lightThemeField.locator('button.InputButtonLauncher-module__launcher__kby5u');
    await this.enterColorInPicker(
      colorButton,
      hexColor,
      `Enter "${hexColor}" in mapping rule Light theme field at index ${ruleIndex}`
    );
  }

  /**
   * Enter custom hex color for mapping rule dark theme
   * @param hexColor - Hex color code (e.g., "#00FF00" or "00FF00")
   * @param ruleIndex - Optional index of the mapping rule (default: 0 for first rule)
   */
  async enterMappingRuleColorDarkTheme(hexColor: string, ruleIndex: number = 0): Promise<void> {
    const ruleContainer = this.getMappingRuleContainer(ruleIndex);
    const darkThemeField = ruleContainer.locator('[data-testid="field-Dark theme (mobile app only)"]').first();
    const colorButton = darkThemeField.locator('button.InputButtonLauncher-module__launcher__kby5u');
    await this.enterColorInPicker(
      colorButton,
      hexColor,
      `Enter "${hexColor}" in mapping rule Dark theme field at index ${ruleIndex}`
    );
  }

  /**
   * Verify mapping rule required field error messages appear
   */
  async verifyMappingRuleErrors(): Promise<void> {
    await test.step('Verify mapping rule required field error messages', async () => {
      await expect(this.dialogMappingRuleTextError, 'Text is a required field error should be visible').toBeVisible();
      await expect(this.dialogMappingRuleColorError, 'Color is a required field error should be visible').toBeVisible();
    });
  }

  /**
   * Verify Default color required field error message appears
   */
  async verifyDefaultColorError(): Promise<void> {
    await test.step('Verify Default color is a required field error message', async () => {
      await expect(
        this.dialogDefaultColorError,
        'Default color is a required field error should be visible'
      ).toBeVisible();
    });
  }

  /**
   * Verify duplicate text error message appears in mapping rules
   */
  async verifyDuplicateTextError(): Promise<void> {
    await test.step('Verify duplicate text error "Text is already in use" is visible', async () => {
      const duplicateTextError = this.dialog.getByText('Text is already in use', { exact: false });
      await expect(duplicateTextError, 'Duplicate text error "Text is already in use" should be visible').toBeVisible();
    });
  }

  /**
   * Verify icon required error message appears in mapping rules
   */
  async verifyIconRequiredError(): Promise<void> {
    await test.step('Verify icon required error is visible', async () => {
      // The error message might be "Icon is a required field" or "Icon required" depending on implementation
      const iconRequiredError = this.dialog.getByText(/Icon.*required|required.*Icon/i, { exact: false }).first();
      await expect(iconRequiredError, 'Icon required error should be visible').toBeVisible();
    });
  }

  /**
   * Click Back button in the icon selection dialog
   */
  async clickBackButton(): Promise<void> {
    await test.step('Click Back button in icon dialog', async () => {
      await this.clickOnElement(this.backButton);
    });
  }

  /**
   * Verify invalid regex pattern error appears (if validation is implemented)
   * This method attempts to find an error message for invalid regex patterns
   * @returns true if error is found, false otherwise
   */
  async verifyInvalidRegexError(): Promise<boolean> {
    return await test.step('Verify invalid regex error is visible', async () => {
      const regexError = this.dialog.getByText(/invalid.*regex|regex.*invalid|error/i, { exact: false }).first();
      try {
        await expect(regexError, 'Invalid regex error should be visible').toBeVisible({ timeout: 3000 });
        return true;
      } catch {
        // Error doesn't appear - return false
        return false;
      }
    });
  }

  /**
   * Verify the tag text displays with specified color
   * @param expectedText - The expected text to verify (default: "Text...")
   * @param expectedColor - The expected color in RGB format (e.g., 'rgb(252, 121, 59)')
   */
  async verifyTagTextColor(expectedText: string = 'Text...', expectedColor: string): Promise<void> {
    await test.step(`Verify tag text "${expectedText}" displays with color ${expectedColor}`, async () => {
      const tagTextElement = this.tagTextDisplay.filter({ hasText: expectedText }).first();
      await expect(tagTextElement, `Tag text "${expectedText}" should be visible`).toBeVisible();
      await expect(tagTextElement, `Tag text "${expectedText}" should have color ${expectedColor}`).toHaveCSS(
        'color',
        expectedColor
      );
    });
  }

  /**
   * Verify the tag status indicator displays with specified background color
   * @param expectedText - The expected text of the tag to locate it (default: "Text...")
   * @param expectedColor - The expected background color in RGB format (e.g., 'rgb(38, 89, 219)')
   */
  async verifyTagStatusColor(expectedText: string = 'Text...', expectedColor: string): Promise<void> {
    await test.step(`Verify tag status color for "${expectedText}" displays with background color ${expectedColor}`, async () => {
      const tagContainer = this.tagContainer.filter({ hasText: expectedText }).first();
      await expect(tagContainer, `Tag container for "${expectedText}" should be visible`).toBeVisible();

      const statusElement = tagContainer.locator('div._status_6ubwg_30').first();
      await expect(statusElement, `Status indicator for tag "${expectedText}" should be visible`).toBeVisible();
      await expect(
        statusElement,
        `Status indicator for tag "${expectedText}" should have background color ${expectedColor}`
      ).toHaveCSS('background-color', expectedColor);
    });
  }

  /**
   * Verify the tag icon is visible in the tag component
   * @param expectedText - The expected text of the tag to locate it (default: "Text...")
   * @param expectedUrlPattern - Optional URL pattern to verify (e.g., base domain). For dynamic URLs, use a pattern instead of exact match.
   */
  async verifyTagIconVisible(expectedText: string = 'Text...', expectedUrlPattern?: string): Promise<void> {
    await test.step(`Verify tag icon is visible for "${expectedText}"`, async () => {
      const tagContainer = this.tagContainer.filter({ hasText: expectedText }).first();
      await expect(tagContainer, `Tag container for "${expectedText}" should be visible`).toBeVisible();
      const iconElement = tagContainer.locator('img._iconImg_6ubwg_24').first();
      await expect(iconElement, `Icon for tag "${expectedText}" should be visible`).toBeVisible();
      await expect(iconElement, `Icon for tag "${expectedText}" should have a src attribute`).toHaveAttribute('src');
      if (expectedUrlPattern) {
        const actualSrc = await iconElement.getAttribute('src');
        if (actualSrc) {
          expect(
            actualSrc,
            `Icon for tag "${expectedText}" should have src containing "${expectedUrlPattern}"`
          ).toContain(expectedUrlPattern);
        }
      }
    });
  }

  /**
   * Select icon source radio button in the icon dialog
   * @param option - The icon source option to select ('URL', 'Library', or 'File upload')
   */
  async selectIconSourceRadio(option: string): Promise<void> {
    await test.step(`Select "${option}" icon source radio button`, async () => {
      // Map option names to values
      const optionMap: Record<string, string> = {
        url: 'externalUrl',
        library: 'externalLibrary',
        'file upload': 'localUpload',
      };

      const lowerOption = option.toLowerCase();
      const optionValue = optionMap[lowerOption] || option;

      const iconDialog = this.page.getByRole('dialog').filter({ has: this.iconDialogTitle });

      let radioButton: Locator | undefined;
      for (const strategy of [
        iconDialog.locator(`input[type="radio"][value="${optionValue}"]`),
        iconDialog.locator(`input[type="radio"][value="${option}"]`),
        this.dialogIconSourceField.getByRole('radio', { name: option }),
        this.dialogIconSourceField.locator('label').filter({ hasText: option }).locator('input[type="radio"]'),
      ]) {
        if ((await strategy.count()) > 0) {
          radioButton = strategy.first();
          break;
        }
      }
      if (!radioButton) {
        throw new Error(`Icon source radio button "${option}" not found.`);
      }
      await this.clickOnElement(radioButton);
    });
  }

  /**
   * Enter URL in the Icon URL input field
   * @param url - The icon URL to enter
   */
  async enterIconUrl(url: string): Promise<void> {
    await test.step(`Enter "${url}" in Icon URL field`, async () => {
      await this.dialogIconUrlInput.fill(url);
    });
  }

  /**
   * Clear/delete the icon image from the icon preview
   */
  async clearImage(): Promise<void> {
    await test.step('Clear/delete icon image', async () => {
      await this.clickOnElement(this.iconPreviewDeleteButton);
    });
  }

  /**
   * Verify icon preview image is visible with file details (for file upload)
   * @param expectedFileName - Expected file name (e.g., "Jira_Custom_App")
   * @param expectedFileSize - Expected file size (e.g., "JPG - 43.93kb")
   */
  async verifyIconPreviewImageVisible(expectedFileName?: string, expectedFileSize?: string): Promise<void> {
    await test.step('Verify icon preview image with file details is visible', async () => {
      await expect(this.iconPreviewContainer, 'Icon preview container should be visible').toBeVisible();
      await expect(this.iconPreviewImage, 'Icon preview image should be visible').toBeVisible();
      await expect(this.iconPreviewImage, 'Icon preview image should have a src attribute').toHaveAttribute('src');
      await expect(this.iconPreviewFileName, 'Icon preview file name should be visible').toBeVisible();

      if (expectedFileName) {
        await expect(this.iconPreviewFileName, `Icon preview file name should be "${expectedFileName}"`).toHaveText(
          expectedFileName
        );
      }

      await expect(this.iconPreviewFileSize, 'Icon preview file size should be visible').toBeVisible();

      if (expectedFileSize) {
        await expect(
          this.iconPreviewFileSize,
          `Icon preview file size should contain "${expectedFileSize}"`
        ).toContainText(expectedFileSize);
      }

      await expect(this.iconPreviewDeleteButton, 'Icon preview delete button should be visible').toBeVisible();
    });
  }

  /**
   * Verify icon preview and URL link are visible after entering URL
   * @param expectedUrl - Optional expected URL to verify in the link
   */
  async verifyIconPreviewAndUrlLink(expectedUrl?: string): Promise<void> {
    await test.step('Verify icon preview and URL link are visible', async () => {
      await expect(this.iconPreviewImage, 'Icon preview image should be visible').toBeVisible();
      if (expectedUrl) {
        await expect(this.iconPreviewImage, `Icon preview image should have src "${expectedUrl}"`).toHaveAttribute(
          'src',
          expectedUrl
        );
      } else {
        await expect(this.iconPreviewImage, 'Icon preview image should have a src attribute').toHaveAttribute('src');
      }
      await expect(this.iconUrlLink, 'Icon URL link should be visible').toBeVisible();
      if (expectedUrl) {
        await expect(this.iconUrlLink, `Icon URL link should contain "${expectedUrl}"`).toContainText(expectedUrl);
        await expect(this.iconUrlLink, `Icon URL link href should contain "${expectedUrl}"`).toHaveAttribute(
          'href',
          expectedUrl
        );
      }
    });
  }

  /**
   * Get the mapping rules section container
   * Finds the divider that contains the "Mapping rules" heading
   * @returns Locator for the mapping rules section divider
   */
  private getMappingRulesSection(): Locator {
    return this.dialog
      .getByRole('heading', { name: 'Mapping rules' })
      .locator('xpath=ancestor::div[contains(@class, "Spacing-module__divider")]')
      .first();
  }

  /**
   * Get the fallback section container
   * Finds the divider that contains the "Fallback" heading
   * @returns Locator for the fallback section divider
   */
  private getFallbackSection(): Locator {
    return this.dialog
      .getByRole('heading', { name: 'Fallback' })
      .locator('xpath=ancestor::div[contains(@class, "Spacing-module__divider")]')
      .first();
  }

  /**
   * Private helper method to verify icon preview with file details
   * @param container - Container locator (rule container or fallback section)
   * @param expectedFileName - Optional expected file name
   * @param expectedFileSize - Optional expected file size
   * @param context - Context for error messages (e.g., "Mapping rule icon" or "Fallback icon")
   * @param includeRemoveButton - Whether to verify remove button (default: false)
   */
  private async verifyIconPreviewWithFileDetails(
    container: Locator,
    expectedFileName: string | undefined,
    expectedFileSize: string | undefined,
    context: string,
    includeRemoveButton: boolean = false
  ): Promise<void> {
    const iconImage = container.locator('img._iconImg_6ubwg_24').first();
    const fileName = container
      .locator('div._contentWrapper_12l59_28')
      .locator('p.Typography-module__paragraph__OGpiQ')
      .first();
    const fileSize = container
      .locator('div._contentWrapper_12l59_28')
      .locator('p.Typography-module__secondary__OGpiQ')
      .filter({ hasText: /kb|KB|mb|MB/ })
      .first();
    const editButton = container.getByRole('button', { name: 'Edit icon' }).first();

    await expect(iconImage, `${context} image should be visible`).toBeVisible();
    await expect(iconImage, `${context} image should have a src attribute`).toHaveAttribute('src');
    await expect(fileName, `${context} file name should be visible`).toBeVisible();
    if (expectedFileName) {
      await expect(fileName, `${context} file name should be "${expectedFileName}"`).toHaveText(expectedFileName);
    }

    await expect(fileSize, `${context} file size should be visible`).toBeVisible();
    if (expectedFileSize) {
      await expect(fileSize, `${context} file size should contain "${expectedFileSize}"`).toContainText(
        expectedFileSize
      );
    }

    await expect(editButton, `${context} edit button should be visible`).toBeVisible();

    if (includeRemoveButton) {
      const removeButton = container.getByRole('button', { name: 'Remove mapping rule' }).first();
      await expect(removeButton, 'Mapping rule remove button should be visible').toBeVisible();
    }
  }

  /**
   * Verify mapping rule icon preview is visible with file details
   * @param expectedFileName - Optional expected file name (e.g., "expensify.jpg")
   * @param expectedFileSize - Optional expected file size (e.g., "JPEG - 42.5 KB")
   * @param ruleIndex - Optional index of the mapping rule (default: 0 for first rule)
   */
  async verifyMappingRuleIconPreview(
    expectedFileName?: string,
    expectedFileSize?: string,
    ruleIndex: number = 0
  ): Promise<void> {
    await test.step(`Verify mapping rule icon preview with file details is visible at index ${ruleIndex}`, async () => {
      const ruleContainer = this.getMappingRuleContainer(ruleIndex);
      await this.verifyIconPreviewWithFileDetails(
        ruleContainer,
        expectedFileName,
        expectedFileSize,
        'Mapping rule icon',
        true
      );
    });
  }

  /**
   * Private helper method to verify icon preview with URL
   * @param container - Container locator (rule container or fallback section)
   * @param expectedUrl - Expected URL to verify
   * @param context - Context for error messages (e.g., "Mapping rule icon" or "Fallback icon")
   */
  private async verifyIconPreviewWithUrl(container: Locator, expectedUrl: string, context: string): Promise<void> {
    const iconImage = container.locator('img._iconImg_6ubwg_24').first();
    const iconLink = container.locator('a._urlLink_12l59_9[target="_blank"]').first();

    await expect(iconImage, `${context} image should be visible`).toBeVisible();
    await expect(iconLink, `${context} URL link should be visible`).toBeVisible();
    await expect(iconImage, `${context} image should have src with URL "${expectedUrl}"`).toHaveAttribute(
      'src',
      expectedUrl
    );
    await expect(iconLink, `${context} URL link should contain "${expectedUrl}"`).toContainText(expectedUrl);
    await expect(iconLink, `${context} URL link href should match "${expectedUrl}"`).toHaveAttribute(
      'href',
      expectedUrl
    );
  }

  /**
   * Verify mapping rule icon preview with URL (for URL-based icons)
   * @param expectedUrl - Expected URL to verify in the icon link
   * @param ruleIndex - Optional index of the mapping rule (default: 0 for first rule)
   */
  async verifyMappingRuleIconPreviewWithUrl(expectedUrl: string, ruleIndex: number = 0): Promise<void> {
    await test.step(`Verify mapping rule icon preview with URL is visible at index ${ruleIndex}`, async () => {
      const ruleContainer = this.getMappingRuleContainer(ruleIndex);
      await this.verifyIconPreviewWithUrl(ruleContainer, expectedUrl, 'Mapping rule icon');
    });
  }

  /**
   * Verify fallback icon preview is visible with file details
   * @param expectedFileName - Optional expected file name (e.g., "Jira_Custom_App.jpg")
   * @param expectedFileSize - Optional expected file size (e.g., "JPEG - 43.9 KB")
   */
  async verifyFallbackIconPreview(expectedFileName?: string, expectedFileSize?: string): Promise<void> {
    await test.step('Verify fallback icon preview with file details is visible', async () => {
      const fallbackSection = this.getFallbackSection();
      await this.verifyIconPreviewWithFileDetails(
        fallbackSection,
        expectedFileName,
        expectedFileSize,
        'Fallback icon',
        false
      );
    });
  }

  /**
   * Click the remove mapping rule button for a specific mapping rule
   * @param ruleIndex - Optional index of the mapping rule to remove (default: 0 for first rule)
   */
  async clickRemoveMappingRule(ruleIndex: number = 0): Promise<void> {
    await test.step(`Click remove mapping rule button for rule at index ${ruleIndex}`, async () => {
      const ruleContainer = this.getMappingRuleContainer(ruleIndex);
      const removeButton = ruleContainer.getByRole('button', { name: 'Remove mapping rule' }).first();
      await this.clickOnElement(removeButton);
    });
  }

  /**
   * Click the edit icon button for a mapping rule
   * @param ruleIndex - Optional index of the mapping rule to edit (default: 0 for first rule)
   */
  async clickEditMappingRuleIcon(ruleIndex: number = 0): Promise<void> {
    await test.step(`Click edit icon button for mapping rule at index ${ruleIndex}`, async () => {
      const ruleContainer = this.getMappingRuleContainer(ruleIndex);
      const editButton = ruleContainer.getByRole('button', { name: 'Edit icon' }).first();
      await this.clickOnElement(editButton);
      await expect(this.iconDialogTitle, 'Icon dialog should be visible after clicking edit').toBeVisible();
    });
  }

  /**
   * Click the edit icon button for the fallback icon
   */
  async clickEditFallbackIcon(): Promise<void> {
    await test.step('Click edit icon button for fallback icon', async () => {
      const fallbackSection = this.getFallbackSection();
      const editButton = fallbackSection.getByRole('button', { name: 'Edit icon' }).first();
      await this.clickOnElement(editButton);
      await expect(this.iconDialogTitle, 'Icon dialog should be visible after clicking edit').toBeVisible();
    });
  }

  /**
   * Verify the number of mapping rules
   * @param expectedCount - Expected number of mapping rules
   */
  async verifyMappingRuleCount(expectedCount: number): Promise<void> {
    await test.step(`Verify there are ${expectedCount} mapping rule(s)`, async () => {
      const mappingRulesSection = this.getMappingRulesSection();
      const ruleContainers = mappingRulesSection.locator('div._ruleContainer_506t5_1');

      if (expectedCount > 0) {
        await expect(ruleContainers.first(), 'At least one mapping rule should be visible').toBeVisible({
          timeout: 10000,
        });
      }

      const actualCount = await ruleContainers.count();
      expect(actualCount, `Expected ${expectedCount} mapping rule(s), but found ${actualCount}`).toBe(expectedCount);
    });
  }

  /**
   * Verify both mapping rule icon preview and fallback icon preview are visible
   * @param mappingRuleUrl - Optional expected URL for the mapping rule icon
   * @param fallbackUrl - Optional expected URL for the fallback icon
   */
  async verifyBothIconPreviewsVisible(mappingRuleUrl?: string, fallbackUrl?: string): Promise<void> {
    await test.step('Verify both mapping rule and fallback icon previews are visible', async () => {
      const mappingRulesSection = this.getMappingRulesSection();
      const fallbackSection = this.getFallbackSection();

      // Use specific class names for better reliability: _iconImg_6ubwg_24 for images, _urlLink_12l59_9 for links
      const mappingRuleIconImage = mappingRulesSection.locator('img._iconImg_6ubwg_24[alt=""]').first();
      const mappingRuleIconLink = mappingRulesSection.locator('a._urlLink_12l59_9[target="_blank"]').first();
      const fallbackIconImage = fallbackSection.locator('img._iconImg_6ubwg_24[alt=""]').first();
      const fallbackIconLink = fallbackSection.locator('a._urlLink_12l59_9[target="_blank"]').first();

      await expect(mappingRuleIconImage, 'Mapping rule icon image should be visible').toBeVisible();
      await expect(mappingRuleIconLink, 'Mapping rule icon link should be visible').toBeVisible();

      if (mappingRuleUrl) {
        await expect(
          mappingRuleIconImage,
          `Mapping rule icon image should have src "${mappingRuleUrl}"`
        ).toHaveAttribute('src', mappingRuleUrl);
        await expect(mappingRuleIconLink, `Mapping rule icon link should contain "${mappingRuleUrl}"`).toContainText(
          mappingRuleUrl
        );
        await expect(mappingRuleIconLink, `Mapping rule icon link href should be "${mappingRuleUrl}"`).toHaveAttribute(
          'href',
          mappingRuleUrl
        );
      } else {
        await expect(mappingRuleIconImage, 'Mapping rule icon image should have a src attribute').toHaveAttribute(
          'src'
        );
      }

      await expect(fallbackIconImage, 'Fallback icon image should be visible').toBeVisible();
      await expect(fallbackIconLink, 'Fallback icon link should be visible').toBeVisible();

      if (fallbackUrl) {
        await expect(fallbackIconImage, `Fallback icon image should have src "${fallbackUrl}"`).toHaveAttribute(
          'src',
          fallbackUrl
        );
        await expect(fallbackIconLink, `Fallback icon link should contain "${fallbackUrl}"`).toContainText(fallbackUrl);
        await expect(fallbackIconLink, `Fallback icon link href should be "${fallbackUrl}"`).toHaveAttribute(
          'href',
          fallbackUrl
        );
      } else {
        await expect(fallbackIconImage, 'Fallback icon image should have a src attribute').toHaveAttribute('src');
      }
    });
  }

  /**
   * Verify the dialog is not visible
   * @param dialogTitle - The title/name of the dialog to verify (for step description)
   */
  async verifyDialogNotVisible(dialogTitle?: string): Promise<void> {
    const stepDescription = dialogTitle
      ? `Verify "${dialogTitle}" dialog is not visible`
      : 'Verify dialog is not visible';
    await test.step(stepDescription, async () => {
      const assertionMessage = dialogTitle
        ? `"${dialogTitle}" dialog should not be visible`
        : 'Dialog should not be visible';
      await expect(this.dialog, assertionMessage).not.toBeVisible();
    });
  }

  /**
   * Verify the dialog is still visible (for validation scenarios where save should be prevented)
   */
  async verifyDialogStillVisible(): Promise<void> {
    await test.step('Verify dialog is still visible', async () => {
      await expect(this.dialog, 'Dialog should still be visible').toBeVisible();
    });
  }

  /**
   * Click Done button and verify icon dialog does not close when file upload is empty
   * This method clicks Done without file upload and verifies the dialog stays open (expected behavior)
   * The test will FAIL if the  exists (dialog closes when it shouldn't)
   */
  async clickDoneAndVerifyIconDialogDoesNotClose(): Promise<void> {
    await test.step('Click Done button and verify icon dialog does not close without file upload', async () => {
      await expect(this.iconDialogTitle, 'Select icon dialog should be visible before clicking Done').toBeVisible();
      await this.iconDialogDoneButton.click();
      let dialogClosed = false;
      try {
        await this.iconDialogTitle.waitFor({ state: 'hidden', timeout: 1000 });
        dialogClosed = true;
      } catch {
        dialogClosed = false;
      }
      expect(
        dialogClosed,
        'Select icon dialog closed when Done was clicked without file upload. Dialog should remain open when no file is uploaded.'
      ).toBe(false);
    });
  }
}
