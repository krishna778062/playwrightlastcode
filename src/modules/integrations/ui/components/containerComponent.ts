import { expect, Locator, Page, test } from '@playwright/test';

import { CUSTOM_APP_TILES_TEST_DATA } from '../../test-data/customAppTiles.test-data';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

const CONTAINER = CUSTOM_APP_TILES_TEST_DATA.CONTAINER;

export class ContainerComponent extends BaseComponent {
  readonly page: Page;

  // Appearance – Size
  readonly sizeRadioHugContents: Locator;
  readonly sizeRadioFillParent: Locator;
  readonly sizeRadioCustom: Locator;
  readonly sizeRegion: Locator;
  readonly widthTextbox: Locator;
  readonly heightTextbox: Locator;
  readonly percentageNote: Locator;

  // Appearance – Section buttons (accordions)
  readonly marginSectionButton: Locator;
  readonly directionSectionButton: Locator;
  readonly alignmentSectionButton: Locator;
  readonly spacingSectionButton: Locator;
  readonly overflowSectionButton: Locator;

  // Appearance – Margin (Equal / Unequal, comboboxes)
  readonly marginEqualButton: Locator;
  readonly marginUnequalButton: Locator;
  readonly marginCombobox: Locator;
  readonly marginLeftCombobox: Locator;
  readonly marginTopCombobox: Locator;
  readonly marginRightCombobox: Locator;
  readonly marginBottomCombobox: Locator;

  // Appearance – Direction
  readonly directionHorizontalButton: Locator;
  readonly directionVerticalButton: Locator;

  // Appearance – Alignment
  readonly alignLeftButton: Locator;
  readonly alignCenterButtons: Locator;
  readonly alignRightButton: Locator;
  readonly alignTopButton: Locator;
  readonly alignBottomButton: Locator;

  // Appearance – Spacing & Overflow
  readonly spacingCombobox: Locator;
  readonly overflowRegion: Locator;
  readonly overflowCombobox: Locator;

  // Data tab
  readonly loopDataLabel: Locator;
  readonly loopDataDescription: Locator;
  readonly loopDataSwitch: Locator;
  readonly advancedSettingsButton: Locator;
  readonly setVisibilityRuleButton: Locator;

  // Canvas toolbar (when container selected)
  readonly toolbarMoveButton: Locator;
  readonly toolbarDuplicateButton: Locator;
  readonly toolbarSelectParentButton: Locator;
  readonly toolbarRemoveButton: Locator;

  // Panel
  readonly appearanceTab: Locator;
  readonly containerPanelHeading: Locator;
  readonly panelCancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;

    this.sizeRadioHugContents = page.getByRole('radio', { name: CONTAINER.SIZE.HUG_CONTENTS });
    this.sizeRadioFillParent = page.getByRole('radio', { name: CONTAINER.SIZE.FILL_PARENT });
    this.sizeRadioCustom = page.getByRole('radio', { name: CONTAINER.SIZE.CUSTOM });
    this.sizeRegion = page.getByRole('region', { name: 'Size' });
    this.widthTextbox = page.getByRole('textbox', { name: CONTAINER.CUSTOM_SIZE.WIDTH_PLACEHOLDER });
    this.heightTextbox = page.getByRole('textbox', { name: CONTAINER.CUSTOM_SIZE.HEIGHT_PLACEHOLDER });
    this.percentageNote = page.getByText(CONTAINER.CUSTOM_SIZE.PERCENTAGE_NOTE, { exact: false });

    this.marginSectionButton = page.getByRole('button', { name: CONTAINER.SECTIONS.MARGIN });
    this.directionSectionButton = page.getByRole('button', { name: CONTAINER.SECTIONS.DIRECTION });
    this.alignmentSectionButton = page.getByRole('button', { name: CONTAINER.SECTIONS.ALIGNMENT });
    this.spacingSectionButton = page.getByRole('button', { name: CONTAINER.SECTIONS.SPACING });
    this.overflowSectionButton = page.getByRole('button', { name: CONTAINER.SECTIONS.OVERFLOW });

    // Use exact: true so "Equal" does not match "Unequal" (strict mode)
    this.marginEqualButton = page.getByRole('button', { name: CONTAINER.MARGIN.EQUAL, exact: true });
    this.marginUnequalButton = page.getByRole('button', { name: CONTAINER.MARGIN.UNEQUAL, exact: true });
    this.marginCombobox = page.getByRole('combobox', { name: CONTAINER.MARGIN.COMBOBOX_NAME });
    this.marginLeftCombobox = page.getByRole('combobox', { name: CONTAINER.MARGIN.LEFT });
    this.marginTopCombobox = page.getByRole('combobox', { name: CONTAINER.MARGIN.TOP });
    this.marginRightCombobox = page.getByRole('combobox', { name: CONTAINER.MARGIN.RIGHT });
    this.marginBottomCombobox = page.getByRole('combobox', { name: CONTAINER.MARGIN.BOTTOM });

    this.directionHorizontalButton = page.getByRole('button', { name: CONTAINER.DIRECTION.HORIZONTAL });
    this.directionVerticalButton = page.getByRole('button', { name: CONTAINER.DIRECTION.VERTICAL });

    this.alignLeftButton = page.getByRole('button', { name: CONTAINER.ALIGNMENT.LEFT });
    this.alignCenterButtons = page.getByRole('button', { name: CONTAINER.ALIGNMENT.CENTER });
    this.alignRightButton = page.getByRole('button', { name: CONTAINER.ALIGNMENT.RIGHT });
    this.alignTopButton = page.getByRole('button', { name: CONTAINER.ALIGNMENT.TOP });
    this.alignBottomButton = page.getByRole('button', { name: CONTAINER.ALIGNMENT.BOTTOM });

    this.spacingCombobox = page.getByRole('combobox', { name: CONTAINER.SPACING_COMBOBOX });
    this.overflowRegion = page.getByRole('region', { name: CONTAINER.SECTIONS.OVERFLOW });
    this.overflowCombobox = this.overflowRegion.getByRole('combobox');

    this.loopDataLabel = page.getByText(CONTAINER.DATA_TAB.LOOP_DATA);
    this.loopDataDescription = page.getByText(CONTAINER.DATA_TAB.LOOP_DATA_DESCRIPTION);
    this.loopDataSwitch = page.getByRole('switch');
    this.advancedSettingsButton = page.getByRole('button', { name: CONTAINER.DATA_TAB.ADVANCED_SETTINGS });
    this.setVisibilityRuleButton = page.getByRole('button', { name: CONTAINER.DATA_TAB.SET_VISIBILITY_RULE });

    // Use exact: true so "Move" does not match "Remove" (strict mode)
    this.toolbarMoveButton = page.getByRole('button', { name: CONTAINER.TOOLBAR.MOVE, exact: true });
    this.toolbarDuplicateButton = page.getByRole('button', { name: CONTAINER.TOOLBAR.DUPLICATE });
    this.toolbarSelectParentButton = page.getByRole('button', { name: CONTAINER.TOOLBAR.SELECT_PARENT_CONTAINER });
    this.toolbarRemoveButton = page.getByRole('button', { name: CONTAINER.TOOLBAR.REMOVE, exact: true });

    this.appearanceTab = page.getByRole('tab', { name: CONTAINER.TABS.APPEARANCE });
    this.containerPanelHeading = page.getByRole('heading', { name: CONTAINER.PANEL_HEADING });
    this.panelCancelButton = this.containerPanelHeading
      .locator('..')
      .getByRole('button', { name: CONTAINER.PANEL_CANCEL });
  }

  private async expandSectionIfCollapsed(button: Locator): Promise<void> {
    const expanded = await button.getAttribute('aria-expanded');
    if (expanded !== 'true') await button.click();
  }

  async verifyAllAppearanceSections(): Promise<void> {
    await test.step('Verify all Container Appearance tab sections and controls', async () => {
      await expect(this.sizeRadioHugContents).toBeVisible();
      await expect(this.sizeRadioFillParent).toBeVisible();
      await expect(this.sizeRadioCustom).toBeVisible();
      await expect(this.marginSectionButton).toBeVisible();
      await expect(this.directionSectionButton).toBeVisible();
      await expect(this.alignmentSectionButton).toBeVisible();
      await expect(this.spacingSectionButton).toBeVisible();
      // Overflow section may not exist in all app versions; only expand and verify if visible
      if ((await this.overflowSectionButton.count()) > 0 && (await this.overflowSectionButton.isVisible())) {
        await this.expandSectionIfCollapsed(this.overflowSectionButton);
        await this.overflowCombobox.click();
        await expect(this.page.getByRole('option', { name: /Visible/ })).toBeVisible();
        await expect(this.page.getByRole('option', { name: /Auto/ })).toBeVisible();
      }

      await this.expandSectionIfCollapsed(this.marginSectionButton);
      await expect(this.marginEqualButton).toBeVisible();
      await expect(this.marginUnequalButton).toBeVisible();
      await expect(this.marginCombobox).toBeVisible();
      await this.marginUnequalButton.click({ force: true });
      await expect(this.marginLeftCombobox).toBeVisible();
      await expect(this.marginTopCombobox).toBeVisible();
      await expect(this.marginRightCombobox).toBeVisible();
      await expect(this.marginBottomCombobox).toBeVisible();

      await this.expandSectionIfCollapsed(this.directionSectionButton);
      await expect(this.directionHorizontalButton).toBeVisible();
      await expect(this.directionVerticalButton).toBeVisible();

      await this.expandSectionIfCollapsed(this.alignmentSectionButton);
      await expect(this.alignLeftButton).toBeVisible();
      await expect(this.alignCenterButtons.first()).toBeVisible();
      await expect(this.alignRightButton).toBeVisible();
      await expect(this.alignTopButton).toBeVisible();
      await expect(this.alignBottomButton).toBeVisible();

      await this.expandSectionIfCollapsed(this.spacingSectionButton);
      await expect(this.spacingCombobox).toBeVisible();
    });
  }

  async verifySizeOptionsAndCustomInputs(): Promise<void> {
    await test.step('Verify Container Size options and Custom Width/Height', async () => {
      await this.sizeRadioHugContents.click({ force: true });
      await expect(this.sizeRadioHugContents).toBeChecked();
      await this.sizeRadioFillParent.click({ force: true });
      await expect(this.sizeRadioFillParent).toBeChecked();
      await this.sizeRadioCustom.click({ force: true });
      await expect(this.sizeRadioCustom).toBeChecked();
      await expect(this.widthTextbox).toBeVisible();
      await expect(this.heightTextbox).toBeVisible();
      await expect(this.widthTextbox).toHaveValue(CONTAINER.CUSTOM_SIZE.DEFAULT_WIDTH);
      await expect(this.heightTextbox).toHaveValue(CONTAINER.CUSTOM_SIZE.DEFAULT_HEIGHT);
      await expect(this.percentageNote).toBeVisible();
      await expect(this.sizeRegion.getByRole('combobox')).toHaveCount(2);
    });
  }

  async verifyDataTabContent(): Promise<void> {
    await test.step('Verify Container Data tab content', async () => {
      await expect(this.loopDataLabel).toBeVisible();
      await expect(this.loopDataDescription).toBeVisible();
      await expect(this.loopDataSwitch).toBeVisible();
      await expect(this.advancedSettingsButton).toBeVisible();
      await this.advancedSettingsButton.click();
      await expect(this.setVisibilityRuleButton).toBeVisible();
    });
  }

  async verifyCanvasToolbar(): Promise<void> {
    await test.step('Verify Container canvas toolbar', async () => {
      await expect(this.toolbarMoveButton).toBeVisible();
      await expect(this.toolbarDuplicateButton).toBeVisible();
      await expect(this.toolbarSelectParentButton).toBeVisible();
      await expect(this.toolbarRemoveButton).toBeVisible();
    });
  }

  async clickPanelCancelAndVerifyPanelClosed(): Promise<void> {
    await test.step('Click Container panel Cancel and verify panel closed', async () => {
      await expect(this.appearanceTab).toBeVisible();
      await this.panelCancelButton.click();
      await expect(this.appearanceTab).not.toBeVisible();
    });
  }

  async applyAppearanceOptions(options: {
    margin?: string;
    direction?: 'Horizontal' | 'Vertical';
    alignH?: 'Align left' | 'Align center' | 'Align right';
    alignV?: 'Align top' | 'Align center' | 'Align bottom';
    spacing?: string;
  }): Promise<void> {
    await test.step('Apply Container Appearance options', async () => {
      if (options.margin !== undefined) {
        await this.expandSectionIfCollapsed(this.marginSectionButton);
        await this.marginCombobox.selectOption(options.margin);
      }
      if (options.direction !== undefined) {
        await this.expandSectionIfCollapsed(this.directionSectionButton);
        const btn = options.direction === 'Horizontal' ? this.directionHorizontalButton : this.directionVerticalButton;
        await btn.click({ force: true });
      }
      if (options.alignH !== undefined || options.alignV !== undefined) {
        await this.expandSectionIfCollapsed(this.alignmentSectionButton);
        if (options.alignH !== undefined) {
          const alignHBtn =
            options.alignH === 'Align left'
              ? this.alignLeftButton
              : options.alignH === 'Align center'
                ? this.alignCenterButtons.first()
                : this.alignRightButton;
          await alignHBtn.click({ force: true });
        }
        if (options.alignV !== undefined) {
          const alignVBtn =
            options.alignV === 'Align top'
              ? this.alignTopButton
              : options.alignV === 'Align center'
                ? this.alignCenterButtons.nth(1)
                : this.alignBottomButton;
          await alignVBtn.click({ force: true });
        }
      }
      if (options.spacing !== undefined) {
        await this.expandSectionIfCollapsed(this.spacingSectionButton);
        await this.spacingCombobox.selectOption(options.spacing);
      }
    });
  }

  async applyAppearanceCombination(combo: {
    size: 'Hug contents' | 'Fill parent container' | 'Custom';
    direction: 'Horizontal' | 'Vertical';
    alignH: 'Align left' | 'Align center' | 'Align right';
    alignV: 'Align top' | 'Align center' | 'Align bottom';
    margin: string;
    spacing: string;
    label?: string;
  }): Promise<void> {
    await test.step(`Apply Container combination: ${combo.label ?? 'combo'}`, async () => {
      const sizeRadio =
        combo.size === CONTAINER.SIZE.HUG_CONTENTS
          ? this.sizeRadioHugContents
          : combo.size === CONTAINER.SIZE.FILL_PARENT
            ? this.sizeRadioFillParent
            : this.sizeRadioCustom;
      await sizeRadio.click({ force: true });
      if (combo.size === CONTAINER.SIZE.CUSTOM) {
        await expect(this.widthTextbox).toBeVisible();
      }
      await this.expandSectionIfCollapsed(this.directionSectionButton);
      await (combo.direction === 'Horizontal' ? this.directionHorizontalButton : this.directionVerticalButton).click({
        force: true,
      });
      await this.expandSectionIfCollapsed(this.alignmentSectionButton);
      const alignHBtn =
        combo.alignH === 'Align left'
          ? this.alignLeftButton
          : combo.alignH === 'Align center'
            ? this.alignCenterButtons.first()
            : this.alignRightButton;
      const alignVBtn =
        combo.alignV === 'Align top'
          ? this.alignTopButton
          : combo.alignV === 'Align center'
            ? this.alignCenterButtons.nth(1)
            : this.alignBottomButton;
      await alignHBtn.click({ force: true });
      await alignVBtn.click({ force: true });
      await this.expandSectionIfCollapsed(this.marginSectionButton);
      await this.marginCombobox.selectOption(combo.margin);
      await this.expandSectionIfCollapsed(this.spacingSectionButton);
      await this.spacingCombobox.selectOption(combo.spacing);
    });
  }

  async verifyAppearanceTabAndCanvasVisible(canvasPlaceholderLocator: Locator): Promise<void> {
    await expect(this.appearanceTab).toBeVisible();
    await expect(canvasPlaceholderLocator).toBeVisible();
  }
}
