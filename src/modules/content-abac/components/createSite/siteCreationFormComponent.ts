import { expect, Locator, Page, test } from '@playwright/test';

import { AccessSectionComponent } from './accessSectionComponent';
import { SubscriptionsSectionComponent } from './subscriptionsSectionComponent';
import { TargetAudienceSectionComponent } from './targetAudienceSectionComponent';

import { BaseComponent } from '@/src/core/components/baseComponent';
import { SiteCreationUI } from '@/src/modules/content-abac/constants/siteCreation';

export class SiteCreationFormComponent extends BaseComponent {
  readonly modalContainer: Locator;
  readonly addSiteHeading: Locator;
  readonly cancelButton: Locator;
  readonly addSiteButton: Locator;
  readonly successMessage: Locator;

  readonly siteNameInput: Locator;
  readonly categoryInput: Locator;

  readonly manageSiteLink: Locator;
  readonly deactivateButton: Locator;
  readonly confirmDeactivateButton: Locator;
  readonly deactivatedToast: Locator;

  readonly accessSection: AccessSectionComponent;
  readonly targetAudienceSection: TargetAudienceSectionComponent;
  readonly subscriptionsSection: SubscriptionsSectionComponent;

  constructor(page: Page) {
    super(page);

    this.modalContainer = page.locator('div[role="dialog"]').filter({ hasText: SiteCreationUI.HEADINGS.ADD_SITE });
    this.addSiteHeading = page.getByRole('heading', { name: SiteCreationUI.HEADINGS.ADD_SITE });
    this.cancelButton = page.locator(`text=${SiteCreationUI.BUTTONS.CANCEL}`);
    this.addSiteButton = page.getByRole('button', { name: SiteCreationUI.BUTTONS.ADD_SITE });
    this.successMessage = page.getByText(SiteCreationUI.MESSAGES.SITE_CREATED);

    this.siteNameInput = page.getByRole('textbox', { name: 'Site name' });
    this.categoryInput = page.getByRole('combobox', { name: 'Category: This is a required' });

    this.manageSiteLink = page.getByRole('link', { name: 'Manage site' });
    this.deactivateButton = page.getByRole('button', { name: 'Deactivate' });
    this.confirmDeactivateButton = page.getByRole('button', { name: 'Deactivate' });
    this.deactivatedToast = page.getByText('Deactivated site successfully');

    this.accessSection = new AccessSectionComponent(page);
    this.targetAudienceSection = new TargetAudienceSectionComponent(page);
    this.subscriptionsSection = new SubscriptionsSectionComponent(page);
  }

  async verifyTheSiteCreationFormIsVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify site creation form is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addSiteHeading, {
        assertionMessage: 'Site creation form should be visible with "Add site" heading',
      });
    });
  }

  async verifyAccessSectionIsVisible(options?: { stepInfo?: string }): Promise<void> {
    await this.accessSection.verifyAccessSectionIsVisible(options);
  }

  async verifyTargetAudienceSection(options?: { stepInfo?: string }): Promise<void> {
    await this.targetAudienceSection.verifySection(options);
  }

  async verifySubscriptionsSection(options?: { stepInfo?: string }): Promise<void> {
    await this.subscriptionsSection.verifySection(options);
  }

  async fillSiteDetails(options: {
    name: string;
    category?: string;
    isPrivate?: boolean;
    stepInfo?: string;
  }): Promise<void> {
    await test.step(options.stepInfo || `Fill site details: ${options.name}`, async () => {
      await this.fillInElement(this.siteNameInput, options.name);

      if (options.category) {
        await this.clickOnElement(this.categoryInput);
        // Use more specific locator to avoid multiple matches
        await this.clickOnElement(this.page.locator('#category-list').getByText(options.category, { exact: true }));
      }

      if (options.isPrivate !== undefined) {
        await this.togglePrivateAccess(options.isPrivate);
      }
    });
  }

  async togglePrivateAccess(shouldBePrivate: boolean, options?: { stepInfo?: string }): Promise<void> {
    await this.accessSection.togglePrivateAccess(shouldBePrivate, options);
  }

  async setupTargetAudience(options?: { stepInfo?: string }): Promise<void> {
    await this.targetAudienceSection.setupAllOrganization(options);
  }

  async setupSpecificAudience(audienceName: string, options?: { stepInfo?: string }): Promise<void> {
    await this.targetAudienceSection.setupSpecificAudienceViaPicker(audienceName, options);
  }

  async setMembershipApproval(
    approval: 'manual' | 'automatic',
    isPrivateSite: boolean = false,
    options?: { stepInfo?: string }
  ): Promise<void> {
    await test.step(options?.stepInfo || `Set membership approval to ${approval}`, async () => {
      if (isPrivateSite) {
        return;
      }
      if (approval === 'manual') {
        await this.clickOnElement(this.page.getByText('Manually approve membership requests', { exact: true }));
      } else {
        await this.clickOnElement(this.page.getByText('Automatically approve membership requests'));
      }
    });
  }

  async cancelSiteCreation(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Cancel site creation', async () => {
      await this.clickOnElement(this.cancelButton);
    });
  }

  async openManageSite(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Open Manage site', async () => {
      await this.clickOnElement(this.manageSiteLink);
    });
  }

  async deactivateSiteViaUI(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Deactivate site via UI', async () => {
      await this.clickOnElement(this.deactivateButton);
      await this.clickOnElement(this.confirmDeactivateButton);
    });
  }

  async verifySiteDeactivated(): Promise<void> {
    await test.step('Verify deactivated toast', async () => {
      await expect(this.deactivatedToast, 'Deactivated toast should be visible').toBeVisible();
    });
  }
}
