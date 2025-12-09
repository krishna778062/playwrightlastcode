import test, { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';

export class CampaignPage extends BasePage {
  /**
   * Campaigns page
   */
  readonly titleCampaigns: Locator;
  readonly addCampaignButton: Locator;

  /**
   * Create campaign modal
   */
  readonly createCampaignModalTitle: Locator;
  readonly createCampaignModalName: Locator;
  readonly createCampaignModalDescription: Locator;
  readonly createCampaignModalCancelButton: Locator;
  readonly createCampaignModalCreateButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.COMMS_PLANNER_CAMPAIGNS);

    /**
     * Campaigns page
     */
    this.titleCampaigns = this.page.getByRole('heading', { name: 'Campaigns' });
    this.addCampaignButton = this.page.getByRole('button', { name: 'Add' });

    /**
     * Create campaign modal
     */
    this.createCampaignModalTitle = this.page.getByRole('heading', { name: 'Create new campaign' });
    this.createCampaignModalName = this.page.locator('input[name="title"]');
    this.createCampaignModalDescription = this.page.locator('textarea[placeholder="Add context or internal notes"]');
    this.createCampaignModalCancelButton = this.page.getByRole('button', { name: 'Cancel' });
    this.createCampaignModalCreateButton = this.page.getByRole('button', { name: 'Create campaign' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify | Campaigns page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.titleCampaigns, {
        assertionMessage: 'Campaigns title should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async clickAddCampaignButton(): Promise<void> {
    await test.step('Click on "Add" campaign button', async () => {
      await this.clickOnElement(this.addCampaignButton, {
        stepInfo: 'Click "Add" button to create campaign',
      });
    });
  }

  async addCampaignName(name: string): Promise<void> {
    await test.step('Add campaign name', async () => {
      await this.fillInElement(this.createCampaignModalName, name, {
        stepInfo: `Fill in campaign name "${name}"`,
      });
    });
  }

  async addCampaignDescription(description: string): Promise<void> {
    await test.step('Add campaign description', async () => {
      await this.fillInElement(this.createCampaignModalDescription, description, {
        stepInfo: `Fill in campaign description "${description}"`,
      });
    });
  }

  async verifyOpenedCampaignModal(): Promise<void> {
    await test.step('Verify | Create campaign modal is open', async () => {
      await this.verifier.verifyTheElementIsVisible(this.createCampaignModalTitle, {
        assertionMessage: 'Create new campaign modal title should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.verifier.verifyTheElementIsVisible(this.createCampaignModalName, {
        assertionMessage: 'Create new campaign input should be visible in create campaign modal',
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.verifier.verifyTheElementIsVisible(this.createCampaignModalCancelButton, {
        assertionMessage: 'Create new campaign button should be visible in create campaign modal',
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.verifier.verifyTheElementIsVisible(this.createCampaignModalCreateButton, {
        assertionMessage: "Create new campaign's cancel button should be visible in create campaign modal",
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }
}
