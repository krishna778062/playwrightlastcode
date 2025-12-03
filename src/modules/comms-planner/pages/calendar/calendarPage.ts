import test, { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';

export class CalendarPage extends BasePage {
  /**
   * Calendar page
   */
  readonly titleCalendar: Locator;
  readonly addActivityButton: Locator;

  /**
   * Create activity modal
   */
  readonly createActivityModalTitle: Locator;
  readonly customFieldsCreateActivityModalTitle: Locator;
  readonly createActivityModalName: Locator;
  readonly createActivityModalDescription: Locator;
  readonly createActivityModalCancelButton: Locator;
  readonly createActivityModalCreateButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.COMMS_PLANNER_PLANNER);

    /**
     * Customization page
     */
    this.titleCalendar = this.page.getByRole('heading', { name: 'Calendar' });
    this.addActivityButton = this.page.getByTestId('add-activity-button');

    /**
     * Create activity modal
     */
    this.createActivityModalTitle = this.page.getByRole('heading', { name: 'Create new activity' });
    this.customFieldsCreateActivityModalTitle = this.page.getByRole('heading', { name: 'Custom fields' });
    this.createActivityModalName = this.page.locator('input[name="title"]');
    this.createActivityModalDescription = this.page.locator('textarea[placeholder="Add context or internal notes"]');
    this.createActivityModalCancelButton = this.page.getByRole('button', { name: 'Cancel' });
    this.createActivityModalCreateButton = this.page.getByRole('button', { name: 'Create new activity' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify | Calendar page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.titleCalendar, {
        assertionMessage: 'Calendar title should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async clickAddActivityButton(): Promise<void> {
    await test.step('Click on "Add" activity button', async () => {
      await this.clickOnElement(this.addActivityButton, {
        stepInfo: 'Click "Add" button to create activity',
      });
    });
  }

  async addActivityName(name: string): Promise<void> {
    await test.step('Add activity name', async () => {
      await this.fillInElement(this.createActivityModalName, name, {
        stepInfo: `Fill in activity name "${name}"`,
      });
    });
  }

  async addActivityDescription(description: string): Promise<void> {
    await test.step('Add activity description', async () => {
      await this.fillInElement(this.createActivityModalDescription, description, {
        stepInfo: `Fill in activity description "${description}"`,
      });
    });
  }

  async clickCancelActivityModalButton(): Promise<void> {
    await test.step('Click on "Cancel" button of activity modal', async () => {
      await this.clickOnElement(this.createActivityModalCancelButton, {
        stepInfo: 'Click "Cancel" button of create activity modal',
      });
    });
  }

  async verifyOpenedActivityModal(): Promise<void> {
    await test.step('Verify | Create activity modal is open', async () => {
      await this.verifier.verifyTheElementIsVisible(this.createActivityModalTitle, {
        assertionMessage: 'Create new activity modal title should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.verifier.verifyTheElementIsVisible(this.createActivityModalName, {
        assertionMessage: 'Create new activity input should be visible in create activity modal',
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.verifier.verifyTheElementIsVisible(this.createActivityModalCancelButton, {
        assertionMessage: 'Create new activity button should be visible in create activity modal',
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.verifier.verifyTheElementIsVisible(this.createActivityModalCreateButton, {
        assertionMessage: "Create new activity's cancel button should be visible in create activity modal",
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyCustomFields(): Promise<void> {
    await test.step('Verify | Custom fields', async () => {
      await this.verifier.verifyTheElementIsVisible(this.customFieldsCreateActivityModalTitle, {
        assertionMessage: 'Custom fields title should be visible in create activity modal',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }
}
