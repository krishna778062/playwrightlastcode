import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
export class AddToCampaignComponent extends BaseComponent {
  readonly addToCampaignControl: Locator;
  readonly addToCampaignInput: Locator;
  readonly saveButton: Locator;
  constructor(page: Page) {
    super(page);
    // Target the control div to click and focus
    this.addToCampaignControl = page.locator('.css-19bb58m').first();
    // Target the actual input element inside the control div
    this.addToCampaignInput = page.locator('.css-19bb58m input[type="text"]').first();
    this.saveButton = page.getByTestId('overlay').getByRole('button', { name: 'Add' });
  }

  async clickOnAddToCampaignInput(): Promise<void> {
    await test.step(`Clicking on the add to campaign input`, async () => {
      await this.clickOnElement(this.addToCampaignControl);
    });
  }

  getListItem(text: string): Locator {
    return this.page.getByRole('menuitem', { name: text });
  }
  async typeInAddToCampaignInput(campaignName: string): Promise<void> {
    await test.step(`Typing in the add to campaign input`, async () => {
      // Type into the actual input element (React Select needs typing for search/filter)
      await this.typeInElement(this.addToCampaignInput, campaignName);
      // Wait a bit for React Select to filter and show results
      await this.page.waitForTimeout(500);
      // Wait for and click the list item - use a more flexible locator that matches partial text
      const listItem = this.getListItem(campaignName);
      await listItem.waitFor({ state: 'visible', timeout: 10000 });
      await this.clickOnElement(listItem);
    });
  }
  async clickOnSaveButton(): Promise<void> {
    await test.step(`Clicking on the save button`, async () => {
      await this.clickOnElement(this.saveButton);
    });
  }
  /**
   * Verifies the add content modal is visible
   * It will use the recently used sites list to verify the modal is visible
   */
}
