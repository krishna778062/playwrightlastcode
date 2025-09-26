import { expect, Page, test } from '@playwright/test';

import { SiteCreationPayload } from '@/src/core/types/siteManagement.types';
import { BasePage } from '@/src/core/ui/pages/basePage';
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
    stepInfo?: string;
    apiPayload?: Partial<SiteCreationPayload>;
  }): Promise<string> {
    return await test.step(options.stepInfo || `Create ${options.type} site: ${options.name}`, async () => {
      if (options.type === SiteType.PUBLIC) {
        await this.createPublicSite({ name: options.name, category: options.category });
      } else {
        await this.createPrivateSite({ name: options.name, category: options.category });
      }

      //after creation , we will wait until the page navigates to site dashboard
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
}
