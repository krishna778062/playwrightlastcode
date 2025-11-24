import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class LinkComponent extends BaseComponent {
  readonly page: Page;
  readonly linkTextField: Locator;
  readonly urlField: Locator;
  readonly linkTextHelperText: Locator;
  readonly urlHelperText: Locator;
  readonly textStyleField: Locator;
  readonly textStyleDropdown: Locator;
  readonly colorField: Locator;
  readonly colorDropdown: Locator;
  readonly alignmentField: Locator;
  readonly maxLineCountField: Locator;
  readonly maxLineCountDropdown: Locator;
  readonly advancedDialog: Locator;
  readonly advancedDialogTitle: Locator;
  readonly advancedColorField: Locator;
  readonly advancedColorDropdown: Locator;
  readonly advancedSaveButton: Locator;
  readonly advancedCancelButton: Locator;
  readonly colorPickerDialog: Locator;
  readonly colorPickerHexInput: Locator;
  readonly colorPickerOkButton: Locator;
  readonly lightThemeField: Locator;
  readonly darkThemeField: Locator;
  readonly warningMessage: Locator;
  readonly visibilityDialog: Locator;
  readonly visibilityDialogTitle: Locator;
  readonly visibilityCodeEditor: Locator;
  readonly visibilityFunctionInput: Locator;
  readonly visibilityDoneButton: Locator;
  readonly visibilityCancelButton: Locator;
  readonly advancedSettingsAccordion: Locator;
  readonly setVisibilityRuleButton: Locator;
  readonly addDynamicValueButton: Locator;
  readonly dataTab: Locator;
  readonly dataTextBindingField: Locator;
  readonly urlAccordion: Locator;
  readonly textAccordion: Locator;
  readonly appearanceTab: Locator;
  readonly textStyleAccordion: Locator;
  readonly colorAccordion: Locator;
  readonly alignmentAccordion: Locator;
  readonly maxLineCountAccordion: Locator;
  readonly advancedColorListbox: Locator;
  readonly lightThemeColorButton: Locator;
  readonly darkThemeColorButton: Locator;
  readonly alignmentButtons: Locator;
  readonly textFieldError: Locator;
  readonly urlFieldError: Locator;
  readonly canvasContainer: Locator;
  readonly advancedButton: Locator;
  readonly textErrorLocator: Locator;
  readonly urlErrorLocator: Locator;
  readonly reactSelectContainer: Locator;
  readonly advancedColorListboxFirstItem: Locator;
  readonly textStyleOption: Locator;
  readonly textStyleSelectedValue: Locator;
  readonly accordionContent: Locator;
  readonly alignmentFirstButton: Locator;
  readonly alignmentRadioInput: Locator;
  readonly linkTextElement: Locator;
  readonly tile: Locator;
  readonly tileLink: Locator;
  readonly lightThemeReactSelectContainer: Locator;
  readonly lightThemeListbox: Locator;
  readonly lightThemeListboxFirstItem: Locator;
  readonly lightThemeBrandOption: Locator;
  readonly darkThemeReactSelectContainer: Locator;
  readonly darkThemeListbox: Locator;
  readonly darkThemeListboxFirstItem: Locator;
  readonly darkThemeBrandOption: Locator;
  readonly lightThemeError: Locator;
  readonly darkThemeError: Locator;
  readonly canvasEditableElement: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;

    this.canvasContainer = page.getByTestId('canvasContainer').or(page.locator('#canvasContainer'));

    this.linkTextField = this.canvasContainer
      .getByRole('textbox')
      .or(this.canvasContainer.locator('[contenteditable="true"]').first());
    this.linkTextHelperText = page.getByText('Longer text will be cut off to fit one line');
    this.urlHelperText = page.getByText('Add a URL');

    this.dataTab = page.getByRole('tab', { name: 'Data' });
    this.appearanceTab = page.getByRole('tab', { name: 'Appearance' });

    this.urlAccordion = page
      .getByRole('button', { name: /^URL$/ })
      .or(page.locator('button[class*="AccordionTrigger"]').filter({ has: page.getByText('URL', { exact: true }) }));
    this.textAccordion = page
      .getByRole('button', { name: /^Text$/ })
      .or(page.locator('button[class*="AccordionTrigger"]').filter({ has: page.getByText('Text', { exact: true }) }));

    this.urlField = page.getByRole('textbox', { name: /url/i }).or(page.locator('textarea[name*="dataBindUrlArr"]'));
    this.dataTextBindingField = page.locator('textarea[name*="dataBindTextArr"]');

    this.textStyleAccordion = page
      .locator('button[class*="AccordionTrigger"]')
      .filter({ has: page.getByText('Text style', { exact: true }) });
    this.textStyleField = page.getByTestId('field-undefined').first();
    this.textStyleDropdown = this.textStyleField.getByRole('combobox');

    this.colorAccordion = page
      .locator('button[class*="AccordionTrigger"]')
      .filter({ has: page.getByText('Color', { exact: true }) });
    this.colorField = page.getByTestId('field-Color');
    this.colorDropdown = this.colorField.getByRole('combobox');
    this.advancedButton = page.getByRole('button', { name: 'Advanced' });

    this.alignmentAccordion = page
      .locator('button[class*="AccordionTrigger"]')
      .filter({ has: page.getByText('Alignment', { exact: true }) });
    this.alignmentField = page
      .getByTestId('field-undefined')
      .filter({ has: page.getByRole('button', { name: /^Align (left|center|right)$/ }) })
      .first();
    this.alignmentButtons = page.getByRole('button', { name: /^Align (left|center|right)$/ });

    this.maxLineCountAccordion = page
      .locator('button[class*="AccordionTrigger"]')
      .filter({ has: page.getByText('Maximum line count', { exact: true }) });
    this.maxLineCountField = page
      .getByTestId('field-undefined')
      .filter({ has: page.getByTestId('SelectInput') })
      .first();
    this.maxLineCountDropdown = this.maxLineCountField.getByTestId('SelectInput');

    this.advancedDialog = page.getByRole('dialog', { name: 'Advanced settings' });
    this.advancedDialogTitle = this.advancedDialog.getByRole('heading', { name: 'Advanced settings' });
    this.advancedColorField = this.advancedDialog.getByTestId('field-Color');
    this.advancedColorDropdown = this.advancedColorField.getByRole('combobox');
    this.advancedColorListbox = this.advancedDialog.getByRole('listbox');
    this.advancedSaveButton = this.advancedDialog.getByRole('button', { name: 'Save' });
    this.advancedCancelButton = this.advancedDialog.getByRole('button', { name: 'Cancel' });

    this.colorPickerDialog = page.getByRole('dialog', { name: 'Hex color picker' });
    this.colorPickerHexInput = this.colorPickerDialog
      .getByTestId('hex-color-picker')
      .locator('input[id^="rc-editable-input-"]')
      .first();
    this.colorPickerOkButton = this.colorPickerDialog.getByRole('button', { name: 'OK' });

    this.lightThemeField = this.advancedDialog.getByTestId('field-Light theme');
    this.darkThemeField = this.advancedDialog.getByTestId('field-Dark theme (mobile app only)');
    this.lightThemeColorButton = this.lightThemeField.getByRole('button').first();
    this.darkThemeColorButton = this.darkThemeField.getByRole('button').first();

    this.warningMessage = this.advancedDialog.getByText(/Non-system colors.*may reduce visual consistency/i);

    this.visibilityDialog = page.getByRole('dialog', { name: 'Set visibility rule' });
    this.visibilityDialogTitle = this.visibilityDialog.getByRole('heading', { name: 'Set visibility rule' });
    this.visibilityCodeEditor = this.visibilityDialog
      .getByRole('textbox')
      .or(this.visibilityDialog.locator('[contenteditable="true"]').first());
    this.visibilityFunctionInput = this.visibilityDialog.getByRole('textbox').first();
    this.visibilityDoneButton = this.visibilityDialog.getByRole('button', { name: 'Done' });
    this.visibilityCancelButton = this.visibilityDialog.getByRole('button', { name: 'Cancel' });

    this.advancedSettingsAccordion = page.getByRole('button', { name: 'Advanced Settings' });
    this.setVisibilityRuleButton = page.getByRole('button', { name: 'Set visibility rule' });
    this.addDynamicValueButton = page.getByRole('button', { name: 'Add dynamic value' });

    this.textFieldError = page
      .getByText(/required/i)
      .filter({ has: page.locator('textarea[name*="dataBindTextArr"]') });
    this.urlFieldError = page.getByText(/required/i).filter({ has: page.locator('textarea[name*="dataBindUrlArr"]') });

    this.textErrorLocator = page
      .getByTestId('field-undefined')
      .filter({ has: page.locator('textarea[name*="dataBindTextArr"]') })
      .locator('.Field-module__error__SJr6u')
      .filter({ hasText: /required/i })
      .first();

    this.urlErrorLocator = page
      .getByTestId('field-undefined')
      .filter({ has: page.locator('textarea[name*="dataBindUrlArr"]') })
      .locator('.Field-module__error__SJr6u')
      .filter({ hasText: /required/i })
      .first();

    this.reactSelectContainer = this.advancedColorField.locator('div[class*="css-"][class*="container"]').first();
    this.advancedColorListboxFirstItem = this.advancedColorListbox
      .locator('[role="menuitem"], [role="option"], div')
      .first();
    this.textStyleOption = page.getByRole('option');
    this.textStyleSelectedValue = page.locator('.css-910r8z-singleValue').first();
    this.accordionContent = page.locator('[id]');
    this.alignmentFirstButton = page.getByRole('button', { name: 'Align left' });
    this.alignmentRadioInput = page.locator('input[type="radio"]');
    this.linkTextElement = page.locator('span[contenteditable="true"], h3').first();
    this.tile = page.getByTestId('tile').or(page.locator('.tile, [class*="tile"]'));
    this.tileLink = page.getByRole('link').first();
    this.lightThemeReactSelectContainer = this.lightThemeField
      .locator('div[class*="css-"][class*="container"]')
      .first();
    this.lightThemeListbox = this.advancedDialog.getByRole('listbox').first();
    this.lightThemeListboxFirstItem = this.lightThemeListbox.locator('[role="menuitem"], [role="option"], div').first();
    this.lightThemeBrandOption = this.lightThemeListbox.getByText(/^Brand/i).first();
    this.darkThemeReactSelectContainer = this.darkThemeField.locator('div[class*="css-"][class*="container"]').first();
    this.darkThemeListbox = this.advancedDialog.getByRole('listbox').first();
    this.darkThemeListboxFirstItem = this.darkThemeListbox.locator('[role="menuitem"], [role="option"], div').first();
    this.darkThemeBrandOption = this.darkThemeListbox.getByText(/^Brand/i).first();
    this.lightThemeError = this.lightThemeField.locator('..').locator('div[class*="error"]');
    this.darkThemeError = this.darkThemeField.locator('..').locator('div[class*="error"]');
    this.canvasEditableElement = page.locator('[contenteditable="true"]').first();
  }

  async enterLinkText(text: string, canvasContainer?: Locator): Promise<void> {
    await test.step(`Enter "${text}" in Link text field`, async () => {
      if (canvasContainer) {
        const linkElement = this.getLinkElement('Link…', canvasContainer);
        await expect(linkElement, 'Link element should be visible in canvas').toBeVisible();
        await linkElement.click();
        await this.linkTextField.waitFor({ state: 'visible', timeout: 5000 });
      }

      await expect(this.linkTextField, 'Link text field should be visible').toBeVisible();
      await this.linkTextField.click({ timeout: 10000 });
      await this.linkTextField.press('Control+A');
      await this.linkTextField.fill(text);
    });
  }

  async expandUrlAccordion(): Promise<void> {
    await test.step('Expand URL accordion', async () => {
      if (await this.dataTab.isVisible()) {
        await this.dataTab.click();
      }

      const isExpanded = await this.urlAccordion.getAttribute('aria-expanded');
      if (isExpanded !== 'true') {
        await this.clickOnElement(this.urlAccordion);
        await this.urlField.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      }
    });
  }

  async enterUrl(url: string): Promise<void> {
    await test.step(`Enter "${url}" in URL field`, async () => {
      await this.expandUrlAccordion();
      await this.urlField.fill(url);
    });
  }

  async clearLinkText(canvasContainer?: Locator): Promise<void> {
    await test.step('Clear link text field', async () => {
      if (canvasContainer) {
        const linkElement = canvasContainer.getByRole('textbox').first();
        await linkElement.click({ timeout: 10000 });
        await linkElement.press('Control+A');
        await linkElement.press('Backspace');
      } else {
        await this.linkTextField.click({ timeout: 10000 });
        await this.linkTextField.press('Control+A');
        await this.linkTextField.press('Backspace');
      }
    });
  }

  async clearUrl(): Promise<void> {
    await test.step('Clear URL field', async () => {
      await this.expandUrlAccordion();
      await this.urlField.clear();
    });
  }

  async enterDataTextBinding(text: string): Promise<void> {
    await test.step(`Enter "${text}" in Data tab text binding field`, async () => {
      await this.ensureDataTabActive();
      await this.dataTextBindingField.fill(text);
    });
  }

  async expandTextAccordion(): Promise<void> {
    await test.step('Expand Text accordion', async () => {
      await this.ensureDataTabActive();

      const isExpanded = await this.textAccordion.getAttribute('aria-expanded');
      if (isExpanded !== 'true') {
        await this.clickOnElement(this.textAccordion);
        await this.dataTextBindingField.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      }
    });
  }

  async clearDataTextBinding(): Promise<void> {
    await test.step('Clear Data tab text binding field', async () => {
      await this.expandTextAccordion();
      await this.dataTextBindingField.clear();
    });
  }

  async verifyDataTextBindingField(expectedValue?: string): Promise<void> {
    await test.step('Verify Data tab text binding field is visible', async () => {
      await this.ensureDataTabActive();
      await expect(this.dataTextBindingField, 'Data tab text binding field should be visible').toBeVisible();

      if (expectedValue !== undefined) {
        await expect(
          this.dataTextBindingField,
          `Data tab text binding field should have value "${expectedValue}"`
        ).toHaveValue(expectedValue);
      }
    });
  }

  async verifyLinkTextField(expectedValue?: string, canvasContainer?: Locator): Promise<void> {
    await test.step('Verify Link text field is visible', async () => {
      if (canvasContainer) {
        const linkTextToFind = expectedValue || 'Link…';
        const linkElement = this.getLinkElement(linkTextToFind, canvasContainer);
        await expect(linkElement, 'Link element should be visible in canvas').toBeVisible();
        await linkElement.click();
        await this.linkTextField.waitFor({ state: 'visible', timeout: 5000 });
      }

      await expect(this.linkTextField, 'Link text field should be visible').toBeVisible();

      if (expectedValue !== undefined) {
        await expect(this.linkTextField, `Link text field should have text "${expectedValue}"`).toHaveText(
          expectedValue
        );
      }
    });
  }

  async verifyUrlField(expectedValue?: string): Promise<void> {
    await test.step('Verify URL field is visible', async () => {
      await this.expandUrlAccordion();
      await expect(this.urlField, 'URL field should be visible').toBeVisible();

      if (expectedValue !== undefined) {
        await expect(this.urlField, `URL field should have value "${expectedValue}"`).toHaveValue(expectedValue);
      }
    });
  }

  async verifyLinkComponentFields(linkTextValue?: string, urlValue?: string): Promise<void> {
    await test.step('Verify Link component fields', async () => {
      await this.verifyLinkTextField(linkTextValue);
      await this.ensureDataTabActive();
      await this.verifyUrlField(urlValue);
    });
  }

  async selectTextStyle(style: string): Promise<void> {
    await test.step(`Select text style: ${style}`, async () => {
      await this.expandTextStyleAccordion();

      const accordionContentId = await this.textStyleAccordion.getAttribute('aria-controls');
      const textStyleDropdown = accordionContentId
        ? this.page.locator(`[id="${accordionContentId}"]`).getByRole('combobox').first()
        : this.textStyleDropdown;

      await this.clickOnElement(textStyleDropdown);
      const styleOption = this.textStyleOption.filter({ hasText: style });
      await this.clickOnElement(styleOption);

      // Wait for dropdown to close and verify selected value
      if (accordionContentId) {
        const accordionContent = this.page.locator(`[id="${accordionContentId}"]`);
        const selectedValueDisplay = accordionContent.locator('.css-910r8z-singleValue').first();
        await expect(selectedValueDisplay, `Text style should be set to "${style}"`).toContainText(style);
      } else {
        await expect(this.textStyleSelectedValue, `Text style should be set to "${style}"`).toContainText(style);
      }
    });
  }

  async expandTextStyleAccordion(): Promise<void> {
    await test.step('Expand Text style accordion', async () => {
      await this.ensureAppearanceTabActive();

      const isExpanded = await this.textStyleAccordion.getAttribute('aria-expanded');
      if (isExpanded !== 'true') {
        await this.clickOnElement(this.textStyleAccordion);
        const accordionContentId = await this.textStyleAccordion.getAttribute('aria-controls');
        if (accordionContentId) {
          await this.page.locator(`[id="${accordionContentId}"]`).waitFor({ state: 'visible' });
        }
      }
    });
  }

  async verifyTextStyleField(): Promise<void> {
    await test.step('Verify text style field is visible', async () => {
      await this.expandTextStyleAccordion();
      const accordionContentId = await this.textStyleAccordion.getAttribute('aria-controls');
      const textStyleField = accordionContentId
        ? this.page.locator(`[id="${accordionContentId}"]`).getByTestId('field-undefined').first()
        : this.textStyleField;
      await expect(textStyleField, 'Text style field should be visible').toBeVisible();
    });
  }

  async expandColorAccordion(): Promise<void> {
    await test.step('Expand Color accordion', async () => {
      await this.ensureAppearanceTabActive();

      const isExpanded = await this.colorAccordion.getAttribute('aria-expanded');
      if (isExpanded !== 'true') {
        await this.clickOnElement(this.colorAccordion);
        const accordionContentId = await this.colorAccordion.getAttribute('aria-controls');
        if (accordionContentId) {
          await this.page.locator(`[id="${accordionContentId}"]`).waitFor({ state: 'visible' });
        }
      }
    });
  }

  async openAdvancedColorSettings(): Promise<void> {
    await test.step('Open advanced color settings', async () => {
      await this.expandColorAccordion();

      const accordionContentId = await this.colorAccordion.getAttribute('aria-controls');
      const advancedButton = accordionContentId
        ? this.page.locator(`[id="${accordionContentId}"]`).getByRole('button', { name: 'Advanced' }).first()
        : this.advancedButton;

      await this.clickOnElement(advancedButton);
      await expect(this.advancedDialog, 'Advanced settings dialog should be visible').toBeVisible();
    });
  }

  async selectAdvancedColor(color: string): Promise<void> {
    await test.step(`Select "${color}" in advanced color settings`, async () => {
      await expect(this.advancedDialog, 'Advanced settings dialog should be visible').toBeVisible();
      await expect(this.advancedColorField, 'Color field should be visible in advanced dialog').toBeVisible();

      const isContainerVisible = await this.reactSelectContainer.isVisible().catch(() => false);

      if (isContainerVisible) {
        await this.clickOnElement(this.reactSelectContainer);
      } else {
        await expect(this.advancedColorDropdown, 'Color dropdown combobox should be visible').toBeVisible();
        await this.clickOnElement(this.advancedColorDropdown);
      }

      await expect(this.advancedColorListbox, 'Color dropdown listbox should be visible').toBeVisible();
      await this.advancedColorListboxFirstItem.waitFor({ state: 'visible' });

      const colorOption = this.advancedColorListbox.getByText(new RegExp(`^${color}`, 'i')).first();
      await expect(colorOption, `${color} option should be visible`).toBeVisible();
      await this.clickOnElement(colorOption);
    });
  }

  async verifySelectedAdvancedColor(expectedColor: string): Promise<void> {
    await test.step(`Verify selected color is "${expectedColor}"`, async () => {
      await expect(this.advancedDialog, 'Advanced settings dialog should be visible').toBeVisible();
      await expect(this.advancedColorField, 'Color field should be visible in advanced dialog').toBeVisible();

      await expect(this.reactSelectContainer, `Color field should show "${expectedColor}"`).toContainText(
        new RegExp(expectedColor, 'i')
      );
    });
  }

  async verifySystemColorOptions(
    expectedColors: string[] = ['System darkest', 'System dark', 'System light', 'Brand', 'Custom']
  ): Promise<void> {
    await test.step('Verify all system color options are available', async () => {
      await expect(this.advancedDialog, 'Advanced settings dialog should be visible').toBeVisible();
      await expect(this.advancedColorField, 'Color field should be visible in advanced dialog').toBeVisible();

      const isContainerVisible = await this.reactSelectContainer.isVisible().catch(() => false);

      if (isContainerVisible) {
        await this.clickOnElement(this.reactSelectContainer);
      } else {
        await expect(this.advancedColorDropdown, 'Color dropdown combobox should be visible').toBeVisible();
        await this.clickOnElement(this.advancedColorDropdown);
      }

      await expect(this.advancedColorListbox, 'Color dropdown listbox should be visible').toBeVisible();
      await this.advancedColorListboxFirstItem.waitFor({ state: 'visible' });

      for (const color of expectedColors) {
        const colorOption = this.advancedColorListbox.getByText(new RegExp(`^${color}`, 'i')).first();
        await expect(colorOption, `${color} option should be visible`).toBeVisible();
      }

      await this.advancedDialogTitle.click();
      await expect(this.advancedColorListbox, 'Color dropdown should be closed').not.toBeVisible({ timeout: 2000 });
      await expect(this.advancedDialog, 'Advanced settings dialog should still be open').toBeVisible();
    });
  }

  private formatHexColor(hexColor: string): string {
    return hexColor.startsWith('#') ? hexColor : `#${hexColor}`;
  }

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

  async enterCustomColorLightTheme(hexColor: string): Promise<void> {
    await this.enterColorInPicker(this.lightThemeColorButton, hexColor, `Enter "${hexColor}" in Light theme field`);
  }

  async enterCustomColorDarkTheme(hexColor: string): Promise<void> {
    await this.enterColorInPicker(this.darkThemeColorButton, hexColor, `Enter "${hexColor}" in Dark theme field`);
  }

  async saveAdvancedSettings(): Promise<void> {
    await test.step('Save advanced settings', async () => {
      await this.clickOnElement(this.advancedSaveButton);
      await expect(this.advancedDialog, 'Advanced settings dialog should be closed').not.toBeVisible();
    });
  }

  async cancelAdvancedSettings(): Promise<void> {
    await test.step('Cancel advanced settings', async () => {
      await this.clickOnElement(this.advancedCancelButton);
      await expect(this.advancedDialog, 'Advanced settings dialog should be closed after cancel').not.toBeVisible();
    });
  }

  async verifyNonSystemColorWarning(): Promise<void> {
    await test.step('Verify non-system color warning message', async () => {
      await expect(this.warningMessage, 'Warning message should be visible for non-system colors').toBeVisible();
    });
  }

  async expandAlignmentAccordion(): Promise<void> {
    await test.step('Expand Alignment accordion', async () => {
      await this.ensureAppearanceTabActive();

      const isExpanded = await this.alignmentAccordion.getAttribute('aria-expanded');
      if (isExpanded !== 'true') {
        await this.clickOnElement(this.alignmentAccordion);
        const accordionContentId = await this.alignmentAccordion.getAttribute('aria-controls');
        if (accordionContentId) {
          await this.page.locator(`[id="${accordionContentId}"]`).waitFor({ state: 'visible' });
        }
      }
    });
  }

  async verifyAlignmentField(): Promise<void> {
    await test.step('Verify alignment field is visible', async () => {
      await this.expandAlignmentAccordion();

      const accordionContentId = await this.alignmentAccordion.getAttribute('aria-controls');
      const alignmentField = accordionContentId
        ? this.page
            .locator(`[id="${accordionContentId}"]`)
            .getByTestId('field-undefined')
            .filter({ has: this.alignmentButtons })
            .first()
        : this.alignmentField;

      await expect(alignmentField, 'Alignment field should be visible').toBeVisible();
    });
  }

  async verifyAlignmentButtonsCount(expectedCount: number = 3): Promise<void> {
    await test.step(`Verify there are ${expectedCount} alignment buttons`, async () => {
      await this.expandAlignmentAccordion();

      const accordionContentId = await this.alignmentAccordion.getAttribute('aria-controls');
      const accordionContent = accordionContentId ? this.page.locator(`[id="${accordionContentId}"]`) : this.page;

      const firstButton = accordionContent.getByRole('button', { name: 'Align left' });
      await expect(firstButton, 'First alignment button should be visible').toBeVisible();

      const alignmentButtons = accordionContent.getByRole('button', { name: /^Align (left|center|right)$/ });
      await expect(alignmentButtons, `There should be ${expectedCount} alignment buttons`).toHaveCount(expectedCount);
    });
  }

  async testAllAlignmentButtons(linkElement: Locator, linkText: string): Promise<void> {
    await test.step('Test all alignment buttons and verify alignment changes in canvas', async () => {
      await this.expandAlignmentAccordion();

      const accordionContentId = await this.alignmentAccordion.getAttribute('aria-controls');
      const accordionContent = accordionContentId ? this.page.locator(`[id="${accordionContentId}"]`) : this.page;

      const firstButton = accordionContent.getByRole('button', { name: 'Align left' });
      await expect(firstButton, 'First alignment button should be visible').toBeVisible();

      const alignmentButtons = accordionContent.getByRole('button', { name: /^Align (left|center|right)$/ });
      const buttonCount = await alignmentButtons.count();

      const buttonLabels = ['Align left', 'Align center', 'Align right'];
      const expectedAlignments = ['left', 'center', 'right'];

      for (let i = 0; i < buttonCount && i < buttonLabels.length; i++) {
        const buttonLabel = buttonLabels[i];
        const expectedAlignment = expectedAlignments[i];

        const currentAccordionContentId = await this.alignmentAccordion.getAttribute('aria-controls');
        const currentAccordionContent = currentAccordionContentId
          ? this.page.locator(`[id="${currentAccordionContentId}"]`)
          : this.page;

        const button = currentAccordionContent.getByRole('button', { name: buttonLabel });

        await expect(button, `Alignment button "${buttonLabel}" should be visible`).toBeVisible();
        await expect(button, `Alignment button "${buttonLabel}" should be enabled`).toBeEnabled();

        const radioInput = currentAccordionContent.getByRole('radio', { name: buttonLabel });

        await button.click({ force: true });
        await expect(radioInput, `Alignment button "${buttonLabel}" should be checked`).toBeChecked();

        await linkElement.evaluate((el, expectedAlign) => {
          return new Promise<void>(resolve => {
            const checkAlignment = () => {
              let align: string = '';

              if (el instanceof HTMLElement) {
                if (
                  el.classList.contains('Typography-module__centerAlign__OGpiQ') ||
                  el.classList.contains('centerAlign')
                ) {
                  align = 'center';
                } else if (
                  el.classList.contains('Typography-module__leftAlign__OGpiQ') ||
                  el.classList.contains('leftAlign')
                ) {
                  align = 'left';
                } else if (
                  el.classList.contains('Typography-module__rightAlign__OGpiQ') ||
                  el.classList.contains('rightAlign')
                ) {
                  align = 'right';
                } else {
                  const style = window.getComputedStyle(el);
                  const styleAlign = style.textAlign;
                  if (styleAlign && styleAlign !== 'start' && styleAlign !== 'end' && styleAlign !== '') {
                    align = styleAlign;
                  }
                }

                if (!align) {
                  const h3Element = el.querySelector('h3');
                  if (h3Element instanceof HTMLElement) {
                    if (
                      h3Element.classList.contains('Typography-module__centerAlign__OGpiQ') ||
                      h3Element.classList.contains('centerAlign')
                    ) {
                      align = 'center';
                    } else if (
                      h3Element.classList.contains('Typography-module__leftAlign__OGpiQ') ||
                      h3Element.classList.contains('leftAlign')
                    ) {
                      align = 'left';
                    } else if (
                      h3Element.classList.contains('Typography-module__rightAlign__OGpiQ') ||
                      h3Element.classList.contains('rightAlign')
                    ) {
                      align = 'right';
                    } else {
                      const h3Style = window.getComputedStyle(h3Element);
                      const h3Align = h3Style.textAlign;
                      if (h3Align && h3Align !== 'start' && h3Align !== 'end' && h3Align !== '') {
                        align = h3Align;
                      }
                    }
                  }
                }
              }

              if (!align) {
                let current: Element | null = el.parentElement;
                for (let i = 0; i < 5 && current; i++) {
                  if (!(current instanceof HTMLElement)) {
                    current = current.parentElement;
                    continue;
                  }

                  if (
                    current.classList.contains('Typography-module__centerAlign__OGpiQ') ||
                    current.classList.contains('centerAlign')
                  ) {
                    align = 'center';
                    break;
                  }
                  if (
                    current.classList.contains('Typography-module__leftAlign__OGpiQ') ||
                    current.classList.contains('leftAlign')
                  ) {
                    align = 'left';
                    break;
                  }
                  if (
                    current.classList.contains('Typography-module__rightAlign__OGpiQ') ||
                    current.classList.contains('rightAlign')
                  ) {
                    align = 'right';
                    break;
                  }

                  const style = window.getComputedStyle(current);
                  const styleAlign = style.textAlign;
                  if (styleAlign && styleAlign !== 'start' && styleAlign !== 'end' && styleAlign !== '') {
                    align = styleAlign;
                    break;
                  }

                  current = current.parentElement;
                }
              }

              if (align === 'start') align = 'left';
              if (align === 'end') align = 'right';
              if (!align) align = 'left';

              if (align === expectedAlign) {
                resolve();
              } else {
                setTimeout(checkAlignment, 100);
              }
            };
            checkAlignment();
            setTimeout(() => resolve(), 5000);
          });
        }, expectedAlignment);

        for (let j = 0; j < buttonLabels.length; j++) {
          const otherRadio = currentAccordionContent.getByRole('radio', { name: buttonLabels[j] });
          if (j === i) {
            await expect(otherRadio, `Radio for "${buttonLabels[j]}" should be checked`).toBeChecked();
          } else {
            await expect(otherRadio, `Radio for "${buttonLabels[j]}" should be unchecked`).not.toBeChecked();
          }
        }

        await this.verifyLinkAlignment(linkElement, linkText, expectedAlignment);

        if (i < buttonCount - 1) {
          const isExpanded = await this.alignmentAccordion.getAttribute('aria-expanded');
          if (isExpanded !== 'true') {
            await this.expandAlignmentAccordion();
          }
          await expect(button, `Alignment button "${buttonLabel}" should remain visible after click`).toBeVisible();
        }
      }
    });
  }

  async expandMaxLineCountAccordion(): Promise<void> {
    await test.step('Expand maximum line count accordion', async () => {
      await this.ensureAppearanceTabActive();

      const isExpanded = await this.maxLineCountAccordion.getAttribute('aria-expanded');
      if (isExpanded !== 'true') {
        await this.clickOnElement(this.maxLineCountAccordion);
        const accordionContentId = await this.maxLineCountAccordion.getAttribute('aria-controls');
        if (accordionContentId) {
          await this.page.locator(`[id="${accordionContentId}"]`).waitFor({ state: 'visible' });
        }
      }
    });
  }

  async selectMaxLineCount(option: string): Promise<void> {
    await test.step(`Select maximum line count: ${option}`, async () => {
      await this.expandMaxLineCountAccordion();
      await this.maxLineCountDropdown.selectOption({ label: option });
      await expect(this.maxLineCountDropdown, `Maximum line count should be set to "${option}"`).toHaveValue(
        option === 'None' ? '0' : option
      );
    });
  }

  async verifyMaxLineCountOptions(expectedOptions: string[] = ['None', '1', '2', '3']): Promise<void> {
    await test.step('Verify all maximum line count options are available', async () => {
      await this.expandMaxLineCountAccordion();
      const options = await this.maxLineCountDropdown.getByRole('option').allTextContents();

      for (const option of expectedOptions) {
        expect(options, `Option "${option}" should be available in maximum line count dropdown`).toContain(option);
      }
    });
  }

  async verifyMaxLineCountApplied(linkElement: Locator, linkText: string, expectedLineCount: string): Promise<void> {
    await test.step(`Verify maximum line count "${expectedLineCount}" is applied for "${linkText}"`, async () => {
      await expect(linkElement, `Link element "${linkText}" should be visible`).toBeVisible();

      const textElement = linkElement
        .getByRole('textbox')
        .or(linkElement.getByRole('heading', { level: 3 }))
        .first();
      await expect(textElement, `Text element for "${linkText}" should be visible`).toBeVisible();

      const lineClampInfo = await textElement.evaluate(el => {
        if (!(el instanceof HTMLElement)) {
          return { lineClamp: null, approximateLines: 0 };
        }

        const style = window.getComputedStyle(el);
        const webkitLineClamp = (style as any).webkitLineClamp || (style as any).lineClamp || 'none';
        const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
        const maxHeight = style.maxHeight ? parseFloat(style.maxHeight) : null;
        const height = el.offsetHeight;
        const approximateLines = maxHeight ? Math.floor(maxHeight / lineHeight) : Math.ceil(height / lineHeight);

        return {
          lineClamp: webkitLineClamp === 'none' ? null : parseInt(webkitLineClamp, 10),
          approximateLines,
        };
      });

      if (expectedLineCount === 'None') {
        expect(
          lineClampInfo.lineClamp,
          `Line clamp should not be set when "None" is selected, but got ${lineClampInfo.lineClamp}`
        ).toBeNull();
      } else {
        const expectedLines = parseInt(expectedLineCount, 10);
        expect(
          lineClampInfo.lineClamp,
          `Line clamp should be set to ${expectedLines}, but got ${lineClampInfo.lineClamp}`
        ).toBe(expectedLines);
        expect(
          lineClampInfo.approximateLines,
          `Approximate visible lines should be around ${expectedLines}, but got ${lineClampInfo.approximateLines}`
        ).toBeLessThanOrEqual(expectedLines + 1);
      }
    });
  }

  async openVisibilityRuleDialog(): Promise<void> {
    await test.step('Open visibility rule dialog', async () => {
      const isExpanded = await this.advancedSettingsAccordion.getAttribute('aria-expanded');
      if (isExpanded !== 'true') {
        await this.clickOnElement(this.advancedSettingsAccordion);
      }

      await this.clickOnElement(this.setVisibilityRuleButton);
      await expect(this.visibilityDialog, 'Set visibility rule dialog should be visible').toBeVisible();
    });
  }

  async enterVisibilityRule(ruleFunction: string): Promise<void> {
    await test.step(`Enter visibility rule: ${ruleFunction}`, async () => {
      await this.visibilityFunctionInput.fill(ruleFunction);
    });
  }

  async saveVisibilityRule(): Promise<void> {
    await test.step('Save visibility rule', async () => {
      await this.clickOnElement(this.visibilityDoneButton);
      await expect(this.visibilityDialog, 'Visibility rule dialog should be closed').not.toBeVisible();
    });
  }

  async verifyVisibilityRuleSaved(expectedRule: string): Promise<void> {
    await test.step(`Verify visibility rule "${expectedRule}" was saved`, async () => {
      await this.openVisibilityRuleDialog();
      await expect(this.visibilityFunctionInput, `Visibility rule should contain "${expectedRule}"`).toHaveValue(
        expectedRule
      );
      await this.clickOnElement(this.visibilityDoneButton);
      await expect(this.visibilityDialog, 'Visibility rule dialog should be closed').not.toBeVisible();
    });
  }

  async verifyVisibilityRuleDialog(): Promise<void> {
    await test.step('Verify visibility rule dialog elements', async () => {
      await expect(this.visibilityDialog, 'Visibility rule dialog should be visible').toBeVisible();
      await expect(this.visibilityDialogTitle, 'Dialog should have title "Set visibility rule"').toHaveText(
        'Set visibility rule'
      );
      await expect(this.visibilityCodeEditor, 'Code editor should be visible in visibility rule dialog').toBeVisible();
      await expect(this.visibilityFunctionInput, 'Function input field should be visible').toBeVisible();
      await expect(this.visibilityDoneButton, 'Done button should be visible').toBeVisible();
    });
  }

  async verifyAtLeastOneRequiredFieldError(): Promise<void> {
    await test.step('Verify at least one required field error is visible', async () => {
      await this.ensureDataTabActive();

      await this.expandTextAccordion();
      await this.expandUrlAccordion();

      const textErrorVisible = await this.textErrorLocator.isVisible({ timeout: 5000 }).catch(() => false);
      const urlErrorVisible = await this.urlErrorLocator.isVisible({ timeout: 5000 }).catch(() => false);

      expect(
        textErrorVisible || urlErrorVisible,
        'At least one required field error (Text or URL) should be visible'
      ).toBeTruthy();
    });
  }

  async verifyTransformedTextInCanvas(expectedText: string, canvasContainer: Locator): Promise<void> {
    await test.step(`Verify transformed text "${expectedText}" in canvas`, async () => {
      const linkElement = this.getLinkElement(expectedText, canvasContainer);
      await expect(linkElement, `Link element should display transformed text "${expectedText}"`).toBeVisible();
      await expect(linkElement, `Link text should be "${expectedText}"`).toHaveText(expectedText);
    });
  }

  getLinkElement(text: string, canvasContainer: Locator): Locator {
    return canvasContainer.getByRole('link').filter({ hasText: text }).first();
  }

  async verifyRedirectUrl(tileTitle: string, expectedUrl: string): Promise<void> {
    await test.step(`Verify link in tile "${tileTitle}" redirects to "${expectedUrl}"`, async () => {
      const tile = this.tile.filter({ hasText: tileTitle }).first();
      await expect(tile, `Tile "${tileTitle}" should be visible`).toBeVisible();

      const link = tile.getByRole('link').first();
      await expect(link, `Link in tile "${tileTitle}" should be visible`).toBeVisible();

      const [newPage] = await Promise.all([this.page.context().waitForEvent('page', { timeout: 10000 }), link.click()]);

      const urlRegex = new RegExp(`^${expectedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*`);
      await expect(newPage, `New page should have URL matching "${expectedUrl}"`).toHaveURL(urlRegex);
      await newPage.close();
    });
  }

  async verifyLinkColorApplied(linkElement: Locator, linkText: string, expectedColor: string): Promise<void> {
    await test.step(`Verify link color is "${expectedColor}" for "${linkText}"`, async () => {
      await expect(linkElement, `Link element "${linkText}" should be visible`).toBeVisible();
      await linkElement.waitFor({ state: 'visible' });
      await expect(linkElement, `Link "${linkText}" should have color "${expectedColor}"`).toHaveCSS(
        'color',
        expectedColor
      );
    });
  }

  async verifyLinkAlignment(linkElement: Locator, linkText: string, expectedAlignment: string): Promise<void> {
    await test.step(`Verify link alignment is "${expectedAlignment}" for "${linkText}"`, async () => {
      await expect(linkElement, `Link element "${linkText}" should be visible`).toBeVisible();
      await linkElement.waitFor({ state: 'visible' });

      const textAlign = await linkElement.evaluate(el => {
        if (el instanceof HTMLElement) {
          if (el.classList.contains('Typography-module__centerAlign__OGpiQ') || el.classList.contains('centerAlign')) {
            return 'center';
          }
          if (el.classList.contains('Typography-module__leftAlign__OGpiQ') || el.classList.contains('leftAlign')) {
            return 'left';
          }
          if (el.classList.contains('Typography-module__rightAlign__OGpiQ') || el.classList.contains('rightAlign')) {
            return 'right';
          }

          const style = window.getComputedStyle(el);
          const styleAlign = style.textAlign;
          if (styleAlign && styleAlign !== 'start' && styleAlign !== 'end' && styleAlign !== '') {
            return styleAlign === 'start' ? 'left' : styleAlign === 'end' ? 'right' : styleAlign;
          }

          // Check for h2 or h3 elements (different text styles use different heading levels)
          const headingElement = el.querySelector('h2, h3');
          if (headingElement instanceof HTMLElement) {
            if (
              headingElement.classList.contains('Typography-module__centerAlign__OGpiQ') ||
              headingElement.classList.contains('centerAlign')
            ) {
              return 'center';
            }
            if (
              headingElement.classList.contains('Typography-module__leftAlign__OGpiQ') ||
              headingElement.classList.contains('leftAlign')
            ) {
              return 'left';
            }
            if (
              headingElement.classList.contains('Typography-module__rightAlign__OGpiQ') ||
              headingElement.classList.contains('rightAlign')
            ) {
              return 'right';
            }

            const headingStyle = window.getComputedStyle(headingElement);
            const headingAlign = headingStyle.textAlign;
            if (headingAlign && headingAlign !== 'start' && headingAlign !== 'end' && headingAlign !== '') {
              return headingAlign === 'start' ? 'left' : headingAlign === 'end' ? 'right' : headingAlign;
            }
          }
        }

        let current: Element | null = el.parentElement;
        let align: string = '';

        for (let i = 0; i < 5 && current; i++) {
          if (!(current instanceof HTMLElement)) {
            current = current.parentElement;
            continue;
          }

          if (
            current.classList.contains('Typography-module__centerAlign__OGpiQ') ||
            current.classList.contains('centerAlign')
          ) {
            align = 'center';
            break;
          }
          if (
            current.classList.contains('Typography-module__leftAlign__OGpiQ') ||
            current.classList.contains('leftAlign')
          ) {
            align = 'left';
            break;
          }
          if (
            current.classList.contains('Typography-module__rightAlign__OGpiQ') ||
            current.classList.contains('rightAlign')
          ) {
            align = 'right';
            break;
          }

          const style = window.getComputedStyle(current);
          const styleAlign = style.textAlign;
          if (styleAlign && styleAlign !== 'start' && styleAlign !== 'end' && styleAlign !== '') {
            align = styleAlign;
            break;
          }

          current = current.parentElement;
        }

        if (align === 'start') return 'left';
        if (align === 'end') return 'right';
        return align || 'left';
      });

      expect(
        textAlign,
        `Link "${linkText}" should have text-align "${expectedAlignment}", but got "${textAlign}"`
      ).toBe(expectedAlignment);
    });
  }

  async verifyLinkHeight(linkElement: Locator, minHeight: number, styleName: string): Promise<void> {
    await test.step(`Verify link height for ${styleName}`, async () => {
      await expect(linkElement, `Link element should be visible for ${styleName}`).toBeVisible();
      await linkElement.waitFor({ state: 'visible' });

      const boundingBox = await linkElement.boundingBox();
      if (boundingBox) {
        expect(
          boundingBox.height,
          `Height for ${styleName} should be at least ${minHeight}px, but got ${boundingBox.height}px`
        ).toBeGreaterThanOrEqual(minHeight);
      } else {
        throw new Error(`Could not get bounding box for link element with ${styleName}`);
      }
    });
  }

  async verifyAdvancedDialogVisible(): Promise<void> {
    await test.step('Verify advanced settings dialog is visible', async () => {
      await expect(this.advancedDialog, 'Advanced settings dialog should be visible').toBeVisible();
    });
  }

  async verifyAdvancedDialogClosed(): Promise<void> {
    await test.step('Verify advanced settings dialog is closed', async () => {
      await expect(this.advancedDialog, 'Advanced settings dialog should be closed').not.toBeVisible();
    });
  }

  async selectLightThemeBrand(): Promise<void> {
    await test.step('Select Brand color in light theme dropdown', async () => {
      await this.lightThemeReactSelectContainer.click();
      await expect(this.lightThemeListbox, 'Light theme color listbox should be visible').toBeVisible();

      await this.lightThemeListboxFirstItem.waitFor({ state: 'visible' });

      await expect(this.lightThemeBrandOption, 'Brand option should be visible in light theme dropdown').toBeVisible();
      await this.clickOnElement(this.lightThemeBrandOption);
    });
  }

  async selectDarkThemeBrand(): Promise<void> {
    await test.step('Select Brand color in dark theme dropdown', async () => {
      await this.darkThemeReactSelectContainer.click();
      await expect(this.darkThemeListbox, 'Dark theme color listbox should be visible').toBeVisible();

      await this.darkThemeListboxFirstItem.waitFor({ state: 'visible' });

      await expect(this.darkThemeBrandOption, 'Brand option should be visible in dark theme dropdown').toBeVisible();
      await this.clickOnElement(this.darkThemeBrandOption);
    });
  }

  async verifyThemeFieldsRequiredErrors(): Promise<void> {
    await test.step('Verify required field errors for light and dark theme fields', async () => {
      await expect(this.lightThemeError, 'Light theme field should show required error').toBeVisible({ timeout: 5000 });
      await expect(this.darkThemeError, 'Dark theme field should show required error').toBeVisible({ timeout: 5000 });
    });
  }

  async clickVisibilityRuleCancel(): Promise<void> {
    await test.step('Click Cancel button in visibility rule dialog', async () => {
      await this.visibilityCancelButton.click();
    });
  }

  async verifyVisibilityRuleDialogClosed(): Promise<void> {
    await test.step('Verify visibility rule dialog is closed', async () => {
      await expect(this.visibilityDialog, 'Visibility rule dialog should be closed').not.toBeVisible();
    });
  }

  async verifyVisibilityRuleInputEmpty(): Promise<void> {
    await test.step('Verify visibility rule input is empty', async () => {
      await expect(this.visibilityFunctionInput, 'Visibility rule input should be empty').toHaveValue('');
    });
  }

  async verifyLinkElementVisible(linkElement: Locator, description: string): Promise<void> {
    await test.step(`Verify link element is visible: ${description}`, async () => {
      await expect(linkElement, `Link element should be visible: ${description}`).toBeVisible();
    });
  }

  async verifyLinkTextHelperText(): Promise<void> {
    await test.step('Verify link text helper text is visible', async () => {
      await expect(this.linkTextHelperText, 'Link text helper text should be visible').toBeVisible();
    });
  }

  async verifyUrlHelperText(): Promise<void> {
    await test.step('Verify URL helper text is visible', async () => {
      await this.expandUrlAccordion();
      await expect(this.urlHelperText, 'URL helper text should be visible').toBeVisible();
    });
  }

  private async ensureDataTabActive(): Promise<void> {
    if (await this.dataTab.isVisible()) {
      const isActive = await this.dataTab.getAttribute('aria-selected');
      if (isActive !== 'true') {
        await this.dataTab.click();
      }
    }
  }

  private async ensureAppearanceTabActive(): Promise<void> {
    if (await this.appearanceTab.isVisible()) {
      const isActive = await this.appearanceTab.getAttribute('aria-selected');
      if (isActive !== 'true') {
        await this.appearanceTab.click();
      }
    }
  }

  private async expandAccordion(accordion: Locator, contentLocator?: Locator): Promise<void> {
    const isExpanded = await accordion.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await this.clickOnElement(accordion);
      const accordionContentId = await accordion.getAttribute('aria-controls');
      if (accordionContentId) {
        await this.page.locator(`[id="${accordionContentId}"]`).waitFor({ state: 'visible' });
      }
      if (contentLocator) {
        await contentLocator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      }
    }
  }
}
