import { Page, test } from '@playwright/test';
import { BasePage } from '@/src/core/pages/basePage';
import { SiteCreationModalComponent } from '@/src/modules/content/components/SiteComponents/siteCreationComponent';
import { SiteType } from '@/src/modules/content/constants/siteTypeAbac';

export class SiteCreationPage extends BasePage {
  readonly form: SiteCreationModalComponent;

  constructor(page: Page) {
    super(page);
    this.form = new SiteCreationModalComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.form.verifyTheSiteCreationFormIsVisible();
  }

  async verifyFormBasics(): Promise<void> {
    await test.step('Verify site creation form basics', async () => {
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
} 