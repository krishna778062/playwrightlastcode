import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';
import { SiteCreationUI } from '@/src/modules/content/constants/siteCreation.abac';

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

  async verifySection(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify Target audience section', async () => {
      await expect(this.targetAudienceHeading).toBeVisible();
      await expect(
        this.page.getByText(SiteCreationUI.LABELS.TARGET_AUDIENCE.replace(' *', ''), { exact: true })
      ).toBeVisible();
      await expect(this.page.getByText(SiteCreationUI.DESCRIPTIONS.TARGET_AUDIENCE_HELP)).toBeVisible();
      await expect(this.page.getByText(SiteCreationUI.PLACEHOLDERS.NO_AUDIENCES)).toBeVisible();
      await expect(this.browseAudiencesButton).toBeVisible();
    });
  }

  async setupAllOrganization(options?: { verifyDefaults?: boolean; stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Setup All organization audience', async () => {
      await this.clickOnElement(this.targetAudienceDropdown);
      await this.clickOnElement(this.browseAudiencesButton);

      if (options?.verifyDefaults !== false) {
        await expect(this.targetAudienceModalTitle).toBeVisible();
        await expect(this.allOrganizationOption).toBeVisible();
        await expect(this.allOrganizationSwitch).toBeVisible();
        await expect(this.allOrganizationSwitch).not.toBeChecked();
        await expect(this.searchTextBox).toBeVisible();
        await expect(this.cancelButton).toBeEnabled();
        await expect(this.audienceDoneButton).toBeDisabled();
      }

      await this.clickOnElement(this.cancelButton);
      await expect(this.targetAudienceModalTitle).toBeHidden();
      await expect(this.browseAudiencesButton).toBeVisible();

      await this.clickOnElement(this.targetAudienceDropdown);
      await this.clickOnElement(this.browseAudiencesButton);
      await expect(this.targetAudienceModalTitle).toBeVisible();

      await this.clickOnElement(this.allOrganizationOption);
      await expect(this.allOrganizationSwitch).toBeEnabled();
      // Verify selection helper messages in the modal
      await expect(this.allOrgSelectionConfirmation).toBeVisible();
      await expect(this.allOrgDescription).toBeVisible();

      await this.allOrganizationSwitch.scrollIntoViewIfNeeded();
      if (!(await this.allOrganizationSwitch.isChecked())) {
        await this.clickOnElement(this.allOrganizationSwitch);
      }
      await expect(this.allOrganizationSwitch).toBeChecked();

      await expect(this.audienceDoneButton).toBeEnabled();
      await this.clickOnElement(this.audienceDoneButton);
      await this.audiencePickerContainer.waitFor({ state: 'detached', timeout: 10000 }); // Ensure modal is gone before main-form checks

      await this.verifier.verifyTheElementIsVisible(this.selectedAudienceText);
      await this.verifier.verifyTheElementIsVisible(this.everyoneInOrgText);
      await this.verifier.verifyTheElementIsVisible(this.userCountText);
      await this.verifier.verifyTheElementIsVisible(this.basedOnAudiencesText);
      await this.verifier.verifyTheElementIsVisible(this.editIconWhenTAIsAllOrg);
    });
  }
}
