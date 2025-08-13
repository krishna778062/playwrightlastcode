import { Locator, Page, test, expect } from '@playwright/test';
import { BaseComponent } from '@/src/core/components/baseComponent';
import { SiteCreationUI } from '@/src/modules/content/constants/siteCreation.ui';

export class TargetAudienceSectionComponent extends BaseComponent {
  readonly targetAudienceHeading: Locator;
  readonly targetAudienceDropdown: Locator;
  readonly browseAudiencesButton: Locator;

  readonly audienceModalTitle: Locator;
  readonly allOrganizationOption: Locator;
  readonly allOrganizationSwitch: Locator;
  readonly audienceDoneButton: Locator;

  readonly selectedAudienceText: Locator;
  readonly everyoneInOrgText: Locator;
  readonly userCountText: Locator;
  readonly basedOnAudiencesText: Locator;

  readonly allOrgSelectionConfirmation: Locator;
  readonly allOrgDescription: Locator;

  constructor(page: Page) {
    super(page);
    this.targetAudienceHeading = page.getByRole('heading', { name: 'Target audience and' });
    this.targetAudienceDropdown = page.locator('div').filter({ hasText: /^Target audience\*$/ }).locator('span');
    this.browseAudiencesButton = page.getByRole('button', { name: SiteCreationUI.BUTTONS.BROWSE });

    this.audienceModalTitle = page.getByText('Audiences', { exact: true });
    this.allOrganizationOption = page.getByText('All organization');
    this.allOrganizationSwitch = page.getByRole('switch', { name: 'All organization' }).first();
    this.audienceDoneButton = page.getByRole('button', { name: SiteCreationUI.BUTTONS.DONE });

    this.selectedAudienceText = page.getByText('All organization');
    this.everyoneInOrgText = page.getByText('Everyone in organization');
    this.userCountText = page.locator('text=/\\d+ users/');
    this.basedOnAudiencesText = page.getByText('Based on the audiences');

    this.allOrgSelectionConfirmation = page.getByText("You've selected 'All");
    this.allOrgDescription = page.getByText('This will target everyone in');
  }

  async verifySection(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify Target audience section', async () => {
      await expect(this.targetAudienceHeading).toBeVisible();
      await expect(this.page.getByText(SiteCreationUI.LABELS.TARGET_AUDIENCE.replace(' *',''), { exact: true })).toBeVisible();
      await expect(this.page.getByText(SiteCreationUI.DESCRIPTIONS.TARGET_AUDIENCE_HELP)).toBeVisible();
      await expect(this.page.getByText(SiteCreationUI.PLACEHOLDERS.NO_AUDIENCES)).toBeVisible();
      await expect(this.browseAudiencesButton).toBeVisible();
    });
  }

  async setupAllOrganization(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Setup All organization audience', async () => {
      await this.clickOnElement(this.targetAudienceDropdown);
      await this.clickOnElement(this.browseAudiencesButton);
      await this.page.waitForTimeout(2000);
      await this.verifier.verifyTheElementIsVisible(this.audienceModalTitle, { assertionMessage: 'Audiences modal should be visible' });
      await this.clickOnElement(this.allOrganizationOption);
      await this.page.waitForTimeout(1000);
      const isToggleEnabled = await this.allOrganizationSwitch.isChecked();
      if (!isToggleEnabled) {
        await this.allOrganizationSwitch.click();
      }
      await this.page.waitForTimeout(1000);
      await this.clickOnElement(this.audienceDoneButton);
      await this.page.waitForTimeout(1000);
      await this.verifier.verifyTheElementIsVisible(this.selectedAudienceText);
      await this.verifier.verifyTheElementIsVisible(this.everyoneInOrgText);
      await this.verifier.verifyTheElementIsVisible(this.userCountText);
      await this.verifier.verifyTheElementIsVisible(this.basedOnAudiencesText);
    });
  }
} 