import { Locator, Page, test } from '@playwright/test';
import { BaseComponent } from '../../../core/components/baseComponent';

export class ChatMentionsListSection extends BaseComponent {
  private readonly mentionList: Locator;
  private readonly mentionListItems: Locator;
  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.mentionList = this.page.locator('#mentionListItemId');
    this.mentionListItems = this.mentionList.getByRole('menuitem');
  }

  async verifyMentionListIsVisible(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo ?? 'Verify that mention list component is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.mentionList, {
        assertionMessage: 'Verify that mention list component is visible',
        timeout: options?.timeout,
      });
    });
  }

  async verifyMentionListIsNotVisible() {
    await test.step('Verify that mention list component is not visible', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.mentionList, {
        assertionMessage: 'Verify that mention list component is not visible',
      });
    });
  }

  async verifyMentionListContainsItemWithText(text: string) {
    await test.step('Verify that mention list component contains item with text', async () => {
      const menuItemToLookFor = this.getMentionItem(text);
      await this.verifier.verifyTheElementIsVisible(menuItemToLookFor, {
        assertionMessage: `Verify that mention list component contains item with text: ${text}`,
      });
    });
  }

  getMentionItem(text: string) {
    return this.mentionListItems.getByText(text).first();
  }

  async selectMentionItem(text: string) {
    await test.step('Select mention item', async () => {
      const menuItemToLookFor = this.getMentionItem(text);
      await menuItemToLookFor.click();
    });
  }
}
