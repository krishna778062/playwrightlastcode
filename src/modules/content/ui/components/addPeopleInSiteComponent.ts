import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class AddPeopleInSiteComponent extends BaseComponent {
  readonly addPeopleInput: Locator;
  constructor(readonly page: Page) {
    super(page);
    this.addPeopleInput = page.locator('div').filter({ hasText: /^Search…$/ });
  }
  async fillAddPeopleInput(peopleName: string): Promise<void> {
    await test.step('Filling add people input', async () => {
      await this.fillInElement(this.addPeopleInput, peopleName);
    });
  }
}
