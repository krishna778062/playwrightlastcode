import { Page, test } from '@playwright/test';

import { BasePage } from '@/src/core/pages/basePage';
import { SiteCreationPayload } from '@/src/core/types/siteManagement.types';
import { SiteCeationFormComponent } from '@/src/modules/content/components/siteCreatePageComponents/siteCreationFormComponent';
import { SiteType } from '@/src/modules/content/constants/siteTypeAbac';

export class SiteCreationPage extends BasePage {
  readonly form: SiteCeationFormComponent;

  constructor(page: Page) {
    super(page);
    this.form = new SiteCeationFormComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.form.verifyTheSiteCreationFormIsVisible();
  }

  /**
   * Verifies the site creation form structure by verifying the access, target audience, and subscriptions sections
   */
  async verifySiteCreationFormStructure(): Promise<void> {
    await test.step('Verify site creation form structure', async () => {
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

  /**
   * Creates a site based on the type
   * @param options - The options for the site creation
   * @param options.name - The name of the site
   * @param options.category - The category of the site
   * @param options.type - The type of the site
   */
  async createSite(options: {
    name: string;
    category: string;
    type: SiteType;
    stepInfo?: string;
    apiPayload?: Partial<SiteCreationPayload>;
  }): Promise<void> {
    await test.step(options.stepInfo || `Create ${options.type} site: ${options.name}`, async () => {
      if (options.type === SiteType.PUBLIC) {
        await this.createPublicSite({ name: options.name, category: options.category });
      } else {
        await this.createPrivateSite({ name: options.name, category: options.category });
      }
    });
  }

  /**
   * Verifies the site was created successfully
   * @param siteName - The name of the site
   * @param options - The options for the verification
   * @param options.stepInfo - The step info for the verification
   */
  async verifySiteCreatedSuccessfully(siteName: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verify site "${siteName}" created successfully`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.form.successMessage, {
        assertionMessage: `Site creation success message should be visible for ${siteName}`,
      });
    });
  }
}
