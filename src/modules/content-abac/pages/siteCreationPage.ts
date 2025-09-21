import { expect, Page, test } from '@playwright/test';

import { IdentityService } from '@/src/core/api/services/IdentityService';
import { SiteAudienceHelper } from '@/src/core/helpers/siteAudienceHelper';
import { BasePage } from '@/src/core/pages/basePage';
import { SiteCreationPayload } from '@/src/core/types/siteManagement.types';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { SiteCreationFormComponent } from '@/src/modules/content-abac/components/createSite/siteCreationFormComponent';
import { SiteType } from '@/src/modules/content-abac/constants/siteType';

export interface ISiteCreationPageAssertions {
  verifySiteCreationFormStructure: () => Promise<void>;
  verifySiteCreatedSuccessfully: (siteName: string, options?: { stepInfo?: string }) => Promise<void>;
  verifySiteDeactivated: () => Promise<void>;
}

export interface ISiteCreationPageActions {
  createPublicSite: (options: { name: string; category: string }) => Promise<void>;
  createPrivateSite: (options: { name: string; category: string }) => Promise<void>;
  createSite: (options: {
    name: string;
    category: string;
    type: SiteType;
    stepInfo?: string;
    apiPayload?: Partial<SiteCreationPayload>;
  }) => Promise<string>;
  deactivateSiteViaUI: (options?: { stepInfo?: string }) => Promise<void>;
}

export class SiteCreationPage extends BasePage implements ISiteCreationPageAssertions, ISiteCreationPageActions {
  readonly form: SiteCreationFormComponent;
  private lastCreatedSiteId?: string;

  constructor(page: Page) {
    super(page);
    this.form = new SiteCreationFormComponent(page);
  }

  get assertions(): ISiteCreationPageAssertions {
    return this;
  }

  get actions(): ISiteCreationPageActions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.form.verifyTheSiteCreationFormIsVisible();
  }

  async verifySiteCreationFormStructure(): Promise<void> {
    await test.step('Verify site creation form structure', async () => {
      // Verify basic form elements
      await this.verifier.verifyTheElementIsVisible(this.form.siteNameInput, {
        assertionMessage: 'Site name input should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.form.categoryInput, {
        assertionMessage: 'Category input should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.form.addSiteButton, {
        assertionMessage: 'Add site button should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.form.cancelButton, {
        assertionMessage: 'Cancel button should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.form.targetAudienceSection.browseAudiencesButton, {
        assertionMessage: 'Browse audiences button should be visible',
      });

      // Verify form sections
      await this.form.verifyAccessSectionIsVisible();
      await this.form.verifyTargetAudienceSection();
      await this.form.verifySubscriptionsSection();
    });
  }

  async createPublicSite(options: { name: string; category: string }): Promise<void> {
    await test.step(`Create PUBLIC site: ${options.name}`, async () => {
      await this.form.fillSiteDetails({ name: options.name, category: options.category, isPrivate: false });
      await this.form.setupTargetAudience();
      await this.form.setMembershipApproval('manual', false);
      await this.form.clickOnElement(this.form.addSiteButton);
    });
  }

  async createPrivateSite(options: { name: string; category: string }): Promise<void> {
    await test.step(`Create PRIVATE site: ${options.name}`, async () => {
      await this.form.fillSiteDetails({ name: options.name, category: options.category, isPrivate: true });
      await this.form.setupTargetAudience();
      await this.form.setMembershipApproval('manual', true);
      await this.form.clickOnElement(this.form.addSiteButton);
    });
  }

  async createSite(options: {
    name: string;
    category: string;
    type: SiteType;
    audienceName?: string; // if provided, select specific audience; else All organization
    stepInfo?: string;
    apiPayload?: Partial<SiteCreationPayload>;
  }): Promise<string> {
    return await test.step(options.stepInfo || `Create ${options.type} site: ${options.name}`, async () => {
      // Fill basic details without submitting yet
      await this.form.fillSiteDetails({
        name: options.name,
        category: options.category,
        isPrivate: options.type === SiteType.PRIVATE,
      });

      // Target Audience selection prior to submission
      if (options.audienceName) {
        await this.form.setupSpecificAudience(options.audienceName);
      } else {
        await this.form.setupTargetAudience();
      }

      // Membership approval (public: manual by default; private: manual path retains existing behavior)
      await this.form.setMembershipApproval('manual', options.type === SiteType.PRIVATE);

      // Submit the form
      await this.form.clickOnElement(this.form.addSiteButton);

      // Wait for navigation to site dashboard and capture siteId
      await this.page.waitForURL(/dashboard/, { timeout: 30000 });
      const siteIdFromUrl = await this.getSiteIdFromUrl(this.page.url());
      expect(siteIdFromUrl, `Failed to extract siteId from URL: ${this.page.url()}`).toBeTruthy();
      this.lastCreatedSiteId = siteIdFromUrl as string;
      return this.lastCreatedSiteId;
    });
  }

  async getSiteIdFromUrl(url: string): Promise<string | undefined> {
    try {
      const parts = new URL(url).pathname.split('/');
      const siteIndex = parts.indexOf('site');
      if (siteIndex !== -1 && parts.length > siteIndex + 1) {
        return parts[siteIndex + 1];
      }
      return undefined;
    } catch {
      throw new Error(`Failed to extract siteId from URL: ${url}`);
    }
  }

  get createdSiteId(): string | undefined {
    return this.lastCreatedSiteId;
  }

  async verifySiteCreatedSuccessfully(siteName: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verify site "${siteName}" created successfully`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.form.successMessage, {
        assertionMessage: `Site creation success message should be visible for ${siteName}`,
      });
    });
  }

  async deactivateSiteViaUI(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Deactivate site via UI', async () => {
      await this.form.openManageSite();
      await this.form.deactivateSiteViaUI();
    });
  }

  async verifySiteDeactivated(): Promise<void> {
    await test.step('Verify site deactivated toast', async () => {
      await this.form.verifySiteDeactivated();
    });
  }

  /**
   * Get or create an audience name for site creation.
   * Business logic: Create audience when there are no audience, else use existing.
   */
  async getOrCreateAudienceName(identity: IdentityService): Promise<string> {
    try {
      // Use SiteAudienceHelper to find existing audience
      const audienceHelper = new SiteAudienceHelper(identity);

      const existingAudience = await audienceHelper.findFirstAvailableAudience();
      if (existingAudience) {
        return existingAudience;
      }

      // Create new audience if none exist
      const categoryName = `Category_${Date.now()}`;
      const audienceName = `Audience_${Date.now()}`;

      const categoryId = await identity.createCategory(categoryName);
      await identity.createAudience({
        audienceName,
        categoryId,
        attribute: 'first_name',
        operator: 'CONTAINS',
        value: 'e',
      });

      return audienceName;
    } catch (error) {
      throw new Error(`Failed to get or create audience: ${error}`);
    }
  }
}
