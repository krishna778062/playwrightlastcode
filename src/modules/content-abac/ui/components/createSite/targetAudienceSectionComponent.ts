import { SiteCreationUI } from '@content-abac/constants/siteCreation';
import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

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

  readonly selectedAudienceText: Locator;
  readonly everyoneInOrgText: Locator;
  readonly userCountText: Locator;
  readonly basedOnAudiencesText: Locator;
  readonly editIconWhenTAIsAllOrg: Locator;

  readonly allOrgSelectionConfirmation: Locator;
  readonly allOrgDescription: Locator;

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

    this.selectedAudienceText = page.locator('#page-content').getByText('All organization', { exact: true }).first();
    this.everyoneInOrgText = page.getByText('Everyone in organization');
    this.userCountText = page.locator('text=/\\d+ users/');
    this.basedOnAudiencesText = page.getByText('Based on the audiences');
    this.editIconWhenTAIsAllOrg = page
      .locator('#page-content')
      .getByText('Cannot edit while', { exact: false })
      .first();

    this.allOrgSelectionConfirmation = this.audiencePickerContainer.getByText("You've selected 'All", { exact: false });
    this.allOrgDescription = this.audiencePickerContainer.getByText('This will target everyone in', { exact: false });
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
   * This method is used to verify the default state of the audience picker.
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
   * This method is used to cancel the audience picker and verify the return.
   * @param options - optional step info to be used in the test report
   */
  async cancelAudiencePickerAndVerifyReturn(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Cancel Audience picker and verify return', async () => {
      await this.clickOnElement(this.cancelButton);
      await expect(this.targetAudienceModalTitle, 'Target audience modal title should be hidden').toBeHidden();
      await expect(this.browseAudiencesButton, 'Browse audiences button should be visible').toBeVisible();
    });
  }

  /**
   * This method is used to reopen the audience picker.
   * @param options - optional step info to be used in the test report
   */
  async reopenAudiencePicker(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Re-open Audience picker', async () => {
      await this.clickOnElement(this.targetAudienceDropdown);
      await this.clickOnElement(this.browseAudiencesButton);
      await expect(this.targetAudienceModalTitle, 'Target audience modal title should be visible').toBeVisible();
    });
  }

  /**
   * This method is used to select the All organization option.
   * @param options - optional step info to be used in the test report
   */
  async selectAllOrganizationOption(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Select All organization option', async () => {
      await this.clickOnElement(this.allOrganizationOption);
      await expect(this.allOrganizationSwitch, 'All organization switch should be enabled').toBeEnabled();
      await expect(
        this.allOrgSelectionConfirmation,
        'All organization selection confirmation should be visible'
      ).toBeVisible();
      await expect(this.allOrgDescription, 'All organization description should be visible').toBeVisible();
    });
  }

  /**
   * This method is used to enable the All organization toggle.
   * @param options - optional step info to be used in the test report
   */
  async enableAllOrganization(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Enable All organization toggle', async () => {
      await this.allOrganizationSwitch.scrollIntoViewIfNeeded();
      if (!(await this.allOrganizationSwitch.isChecked())) {
        await this.clickOnElement(this.allOrganizationSwitch);
      }
      await expect(this.allOrganizationSwitch, 'All Organization switch should be enabled').toBeChecked();
    });
  }

  /**
   * This method is used to submit the audience selection.
   * @param options - optional step info to be used in the test report
   */
  async submitAudienceSelection(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Submit Audience selection', async () => {
      await expect(this.audienceDoneButton, 'Audience done button should be enabled').toBeEnabled();
      await this.clickOnElement(this.audienceDoneButton);
      await this.audiencePickerContainer.waitFor({ state: 'detached', timeout: 10000 });
    });
  }

  /**
   * This method is used to verify the All organization selection summary.
   * @param options - optional step info to be used in the test report
   */
  async verifyAllOrgSelectionSummary(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify All organization selection summary on form', async () => {
      await this.verifier.verifyTheElementIsVisible(this.selectedAudienceText);
      await this.verifier.verifyTheElementIsVisible(this.everyoneInOrgText);
      await this.verifier.verifyTheElementIsVisible(this.userCountText);
      await this.verifier.verifyTheElementIsVisible(this.basedOnAudiencesText);
      await this.verifier.verifyTheElementIsVisible(this.editIconWhenTAIsAllOrg);
    });
  }

  /**
   * This method is used to setup the All organization audience.
   * @param options - optional step info to be used in the test report
   */
  async setupAllOrganization(options?: { verifyDefaults?: boolean; stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Setup All organization audience', async () => {
      await this.openAudiencePicker();

      if (options?.verifyDefaults !== false) {
        await this.verifyAudiencePickerDefaults();
      }

      await this.cancelAudiencePickerAndVerifyReturn();
      await this.reopenAudiencePicker();
      await this.selectAllOrganizationOption();
      await this.enableAllOrganization();
      await this.submitAudienceSelection();
      await this.verifyAllOrgSelectionSummary();
    });
  }
}
