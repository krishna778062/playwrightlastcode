import { SiteCreationFormComponent } from '@content-abac/components/createSite/siteCreationFormComponent';
import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class CreateComponent extends BaseComponent {
  readonly createComponentContainer: Locator;
  readonly siteOption: Locator;

  constructor(page: Page) {
    super(page);
    this.createComponentContainer = this.page.locator("[data-slot='dialog-content']");
    this.siteOption = this.page.getByRole('link', { name: 'Site' });
  }

  async verifyTheCreateComponentIsVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify Create modal dialog is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.createComponentContainer);
      await this.verifier.verifyTheElementIsVisible(this.siteOption);
    });
  }

  async selectSiteOptionAndOpenModal(options?: { stepInfo?: string }): Promise<SiteCreationFormComponent> {
    return await test.step(options?.stepInfo || 'Select Site option and open site creation form', async () => {
      await this.clickOnElement(this.siteOption);
      const siteCreationModal = new SiteCreationFormComponent(this.page);
      await siteCreationModal.verifyTheSiteCreationFormIsVisible();
      return siteCreationModal;
    });
  }
}
