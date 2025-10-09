import { Page, test } from '@playwright/test';

import { BasePage } from '@/src/core/ui/pages/basePage';
import { EditPageComponent } from '@/src/modules/content/ui/components/editPageComponent';

export class EditPagePage extends BasePage {
  private editPageComponent: EditPageComponent;
  actions: any;

  constructor(page: Page) {
    super(page);
    this.editPageComponent = new EditPageComponent(page);
    this.actions = {
      clickOnCancel: this.clickOnCancel.bind(this),
    };
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify edit page page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.editPageComponent.pageHeading, {
        assertionMessage: 'Edit page page should be visible',
      });
    });
  }

  async clickOnCancel(): Promise<void> {
    await test.step('Changing Public to Private', async () => {
      await this.editPageComponent.clickOnCancelButton();
    });
  }
}
