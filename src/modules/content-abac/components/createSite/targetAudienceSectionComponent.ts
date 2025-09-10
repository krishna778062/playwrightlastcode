import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';
import { SiteCreationUI } from '@/src/modules/content-abac/constants/siteCreation';

export class TargetAudienceSectionComponent extends BaseComponent {
  readonly targetAudienceHeading: Locator;
  readonly targetAudienceDropdown: Locator;
  readonly browseAudiencesButton: Locator;

  readonly targetAudienceModalTitle: Locator;
  readonly audiencePickerContainer: Locator;
  readonly allOrganizationOption: Locator;
  readonly allOrganizationSwitch: Locator;
  readonly audienceDoneButton: Locator;
  readonly cancelButton: Locator;
  readonly searchTextBox: Locator;

  // Audience selection verification locators for comprehensive UI testing
  readonly selectedAudienceText: Locator;
  readonly everyoneInOrgText: Locator;
  readonly userCountText: Locator;
  readonly basedOnAudiencesText: Locator;
  readonly editIconWhenTAIsAllOrg: Locator;

  constructor(page: Page) {
    super(page);
    this.targetAudienceHeading = page.getByRole('heading', { name: 'Target audience and' });
    this.targetAudienceDropdown = page
      .locator('div')
      .filter({ hasText: /^Target audience\*$/ })
      .locator('span');
    this.browseAudiencesButton = page.getByRole('button', { name: SiteCreationUI.BUTTONS.BROWSE });

    this.targetAudienceModalTitle = page.getByText('Audiences', { exact: true });
    this.audiencePickerContainer = page.getByLabel('Audiences');
    this.allOrganizationOption = this.audiencePickerContainer.getByText('All organization', { exact: true });
    this.allOrganizationSwitch = this.audiencePickerContainer.getByRole('switch', { name: 'All organization' }).first();
    this.audienceDoneButton = this.audiencePickerContainer.getByRole('button', { name: SiteCreationUI.BUTTONS.DONE });
    this.cancelButton = this.audiencePickerContainer.getByRole('button', { name: 'Cancel' });
    this.searchTextBox = this.audiencePickerContainer.getByRole('textbox', { name: 'Search…' });

    // Audience selection verification locators for comprehensive UI testing
    this.selectedAudienceText = page.locator('#page-content').getByText('All organization', { exact: true }).first();
    this.everyoneInOrgText = page.getByText('Everyone in the organization');
    this.userCountText = page.locator('text=/\\d+ users/');
    this.basedOnAudiencesText = page.getByText('Based on the audiences');
    this.editIconWhenTAIsAllOrg = page
      .locator('#page-content')
      .getByText('Cannot edit while', { exact: false })
      .first();
  }

  /**
   * This method is used to verify that the target audience section is visible.
   * @param options - optional step info to be used in the test report
   */
  async verifySection(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify Target audience section', async () => {
      await expect(this.targetAudienceHeading, 'Target audience heading should be visible').toBeVisible();
      await expect(
        this.page.getByText(SiteCreationUI.LABELS.TARGET_AUDIENCE.replace(' *', ''), { exact: true }),
        'Target audience label should be visible'
      ).toBeVisible();
      await expect(
        this.page.getByText(SiteCreationUI.DESCRIPTIONS.TARGET_AUDIENCE_HELP),
        'Target audience help text should be visible'
      ).toBeVisible();
      await expect(
        this.page.getByText(SiteCreationUI.PLACEHOLDERS.NO_AUDIENCES),
        'No audiences placeholder should be visible'
      ).toBeVisible();
      await expect(this.browseAudiencesButton, 'Browse audiences button should be visible').toBeVisible();
    });
  }

  /**
   * This method is used to open the audience picker.
   * @param options - optional step info to be used in the test report
   */
  async openAudiencePicker(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Open Audience picker', async () => {
      await this.clickOnElement(this.targetAudienceDropdown);
      await this.clickOnElement(this.browseAudiencesButton);
      await expect(this.targetAudienceModalTitle, 'Target audience modal title should be visible').toBeVisible();
    });
  }

  /**
   * This method is used to verify the audience picker defaults.
   * @param options - optional step info to be used in the test report
   */
  async verifyAudiencePickerDefaults(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify Audience picker defaults', async () => {
      await expect(this.allOrganizationOption, 'All organization option should be visible').toBeVisible();
      await expect(this.allOrganizationSwitch, 'All organization switch should be visible').toBeVisible();
      await expect(this.allOrganizationSwitch, 'All organization switch should not be checked').not.toBeChecked();
      await expect(this.searchTextBox, 'Search text box should be visible').toBeVisible();
      await expect(this.cancelButton, 'Cancel button should be enabled').toBeEnabled();
      await expect(this.audienceDoneButton, 'Audience done button should be disabled').toBeDisabled();
    });
  }

  /**
   * Setup All organization audience selection
   */
  async setupAllOrganization(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Setup All organization audience', async () => {
      await this.openAudiencePickerAndVerifyDefaults();
      await this.selectAllOrganizationAndConfirm();
    });
  }

  /**
   * Open audience picker and verify defaults
   */
  private async openAudiencePickerAndVerifyDefaults(): Promise<void> {
    await this.openAudiencePicker();
    await this.verifyAudiencePickerDefaults();
  }

  /**
   * Select all organization option and confirm selection
   */
  private async selectAllOrganizationAndConfirm(): Promise<void> {
    await this.clickOnElement(this.allOrganizationOption);
    await this.allOrganizationSwitch.check();
    await this.clickOnElement(this.audienceDoneButton);
  }

  /**
   * Select a specific audience by name using category expansion approach.
   * This method works across all environments by expanding categories to find audiences.
   */
  async setupSpecificAudienceViaPicker(audienceName: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Setup Specific audience: ${audienceName}`, async () => {
      await this.openAudiencePicker();

      // Wait for picker to load
      await this.page.waitForTimeout(2000);

      let audienceFound = false;

      // Strategy 1: Try to find audience directly (for already loaded trees)
      audienceFound = await this.tryFindAudienceDirectly(audienceName);

      // Strategy 2: Try expanding categories/tree items
      if (!audienceFound) {
        audienceFound = await this.tryFindAudienceViaCategoryExpansion(audienceName);
      }

      if (!audienceFound) {
        await this.page.getByRole('button', { name: 'Cancel' }).click();
        throw new Error(`Audience ${audienceName} not found in any expanded category`);
      }
    });
  }

  /**
   * Verify specific audience selection with comprehensive UI checks
   */
  async verifySpecificAudienceSelectionSummary(audienceName: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verify specific audience selection: ${audienceName}`, async () => {
      await expect(this.page.getByText(audienceName), `Audience ${audienceName} should be selected`).toBeVisible();
      await expect(this.basedOnAudiencesText, 'Based on audiences text should be visible').toBeVisible();
    });
  }

  /**
   * Verify audience selection count in UI
   */
  async verifyAudienceCount(expectedCount: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verify audience count: ${expectedCount}`, async () => {
      await expect(this.userCountText, `User count should show ${expectedCount}`).toContainText(expectedCount);
    });
  }

  /**
   * Verify selected audience text in UI
   */
  async verifySelectedAudienceText(audienceName: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verify selected audience text: ${audienceName}`, async () => {
      await expect(this.selectedAudienceText, `Selected audience should show ${audienceName}`).toContainText(
        audienceName
      );
    });
  }

  /**
   * Verify edit icon state when All organization is selected
   */
  async verifyEditIconState(isEditable: boolean, options?: { stepInfo?: string }): Promise<void> {
    await test.step(
      options?.stepInfo || `Verify edit icon state: ${isEditable ? 'editable' : 'not editable'}`,
      async () => {
        if (isEditable) {
          await expect(this.editIconWhenTAIsAllOrg, 'Edit icon should be available').toBeVisible();
        } else {
          await expect(this.editIconWhenTAIsAllOrg, 'Edit should be disabled message should be visible').toBeVisible();
        }
      }
    );
  }

  /**
   * Try to find audience directly without any expansion or search
   */
  private async tryFindAudienceDirectly(audienceName: string): Promise<boolean> {
    const patterns = [
      () => this.audiencePickerContainer.locator(`text=${audienceName}`).locator('..').getByRole('checkbox'),
      () =>
        this.audiencePickerContainer.locator(`text=${audienceName}`).locator('..').locator('input[type="checkbox"]'),
      () => this.audiencePickerContainer.getByLabel(audienceName).getByRole('checkbox'),
      () => this.audiencePickerContainer.locator(`[aria-label="${audienceName}"]`).getByRole('checkbox'),
    ];

    for (const pattern of patterns) {
      try {
        const checkbox = pattern();
        if (await checkbox.isVisible().catch(() => false)) {
          await expect(checkbox, `Audience ${audienceName} should be visible and selectable`).toBeVisible();
          await checkbox.check();
          await this.page.getByRole('button', { name: 'Done' }).click();
          return true;
        }
      } catch (error) {
        continue;
      }
    }

    return false;
  }

  /**
   * Try to find audience by expanding categories/tree items
   */
  private async tryFindAudienceViaCategoryExpansion(audienceName: string): Promise<boolean> {
    const expandablePatterns = [
      () => this.audiencePickerContainer.locator('[role="treeitem"]'),
      () => this.audiencePickerContainer.locator('[aria-expanded]'),
      () => this.audiencePickerContainer.locator('button[aria-expanded]'),
      () => this.audiencePickerContainer.locator('li'),
      () => this.audiencePickerContainer.locator('div').filter({ hasText: /^\d+$/ }),
      () => this.audiencePickerContainer.locator('div').filter({ hasText: /category/i }),
    ];

    for (const pattern of expandablePatterns) {
      try {
        const items = await pattern().all();
        if (items.length === 0) continue;

        for (const item of items) {
          try {
            const itemText = await item.textContent();
            if (!itemText) continue;

            // Skip "All organization" items
            if (itemText.toLowerCase().includes('all organization')) {
              continue;
            }

            // Try to find and click expand button
            const expandButton = item.locator('button').first();
            if (await expandButton.isVisible().catch(() => false)) {
              await expandButton.click();
              await this.page.waitForTimeout(1000);

              // Look for audience after expansion
              if (await this.tryFindAudienceDirectly(audienceName)) {
                return true;
              }
            }
          } catch (error) {
            continue;
          }
        }
      } catch (error) {
        continue;
      }
    }

    return false;
  }
}
