import { Locator, Page, test, expect } from '@playwright/test';
import { BaseComponent } from '@core/components/baseComponent';
import { SiteCreationPayload } from '@core/types/siteManagement.types';
import { SiteType } from '../../constants/siteTypeAbac';
import { SiteCreationUI } from '@/src/modules/content/constants/siteCreation.ui';
import { AccessSectionComponent } from './accessSectionComponent';
import { TargetAudienceSectionComponent } from './targetAudienceSectionComponent';
import { SubscriptionsSectionComponent } from './subscriptionsSectionComponent';

/**
 * SiteCreationModalComponent
 *
 * This component represents the modal that appears when you click "Create" > "Site"
 * It handles all interactions with form fields, buttons, and validation of the site creation flow
 */
export class SiteCreationModalComponent extends BaseComponent {
  // =============================================================================
  // LOCATORS - All the UI elements we need to interact with
  // =============================================================================

  // MODAL STRUCTURE - Main modal elements
  readonly modalContainer: Locator;
  readonly addSiteHeading: Locator;
  readonly cancelButton: Locator;
  readonly addSiteButton: Locator;
  readonly successMessage: Locator;

  // BASIC SITE DETAILS - Name and category section
  readonly siteNameInput: Locator;
  readonly categoryInput: Locator;

  // Section components
  readonly accessSection: AccessSectionComponent;
  readonly targetAudienceSection: TargetAudienceSectionComponent;
  readonly subscriptionsSection: SubscriptionsSectionComponent;

  constructor(page: Page) {
    super(page);

    // Initialize modal structure locators
    this.modalContainer = page
      .locator('div[role="dialog"]').filter({ hasText: SiteCreationUI.HEADINGS.ADD_SITE });
    this.addSiteHeading = page.getByRole('heading', { name: SiteCreationUI.HEADINGS.ADD_SITE });
    this.cancelButton = page.locator(`text=${SiteCreationUI.BUTTONS.CANCEL}`);
    this.addSiteButton = page.getByRole('button', { name: SiteCreationUI.BUTTONS.ADD_SITE });
    this.successMessage = page.getByText(SiteCreationUI.MESSAGES.SITE_CREATED);

    // Initialize basic site details locators
    this.siteNameInput = page.getByRole('textbox', { name: 'Site name' });
    this.categoryInput = page.getByRole('combobox', { name: 'Category: This is a required' });

    // Compose sections
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
        await this.clickOnElement(this.page.getByText(options.category, { exact: true }));
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

  async createSite(options: {
    name: string;
    category?: string;
    type: SiteType;
    stepInfo?: string;
    apiPayload?: Partial<SiteCreationPayload>;
  }): Promise<void> {
    await test.step(options.stepInfo || `Create ${options.type} site: ${options.name}`, async () => {
      await this.fillSiteDetails({
        name: options.name,
        category: options.category,
        isPrivate: options.type === SiteType.PRIVATE,
      });

      await this.setupTargetAudience();

      const isPrivate = options.type === SiteType.PRIVATE;
      await this.setMembershipApproval('manual', isPrivate);

      await this.clickOnElement(this.addSiteButton);
    });
  }

  async cancelSiteCreation(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Cancel site creation', async () => {
      await this.clickOnElement(this.cancelButton);
    });
  }

  async verifySiteCreatedSuccessfully(siteName: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verify site "${siteName}" created successfully`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.successMessage, {
        assertionMessage: `Site creation success message should be visible for ${siteName}`,
      });
    });
  }
} 