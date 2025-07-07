import { BaseComponent } from '@/src/core/components/baseComponent';
import { expect, Locator, Page, test } from '@playwright/test';
import { GroupChatsSectionComponent } from '@chat/components/groupChatsSectionComponent';
import { DirectMessageSectionInInbox } from '@/src/modules/chat/components/directMessageSectionInChatInbox';
import { ChatMentionsListSection } from './chatMentionsListSection';

export class ChatInboxSideBarComponent extends BaseComponent {
  readonly createNewMessageOrGroupButton: Locator;
  readonly dropDownOptionCreateNewMessage: Locator;
  readonly createNewMessageForm: Locator;
  readonly inputBoxInCreateNewMessageForm: Locator;
  readonly startChatButton: Locator;
  readonly userSelectionDropdownOptions: Locator;

  //locators
  readonly inboxHeader: Locator;

  constructor(
    page: Page,
    readonly inboxSideBarContainer: Locator
  ) {
    super(page);
    this.inboxSideBarContainer = inboxSideBarContainer;
    this.inboxHeader = this.inboxSideBarContainer.locator("[class*='Sidebar_inboxMenu']").first();
    this.createNewMessageOrGroupButton = this.inboxSideBarContainer.getByRole('button', {
      name: 'Create new message',
    });
    this.dropDownOptionCreateNewMessage = this.page.getByTestId('dropdown-create-message');
    this.createNewMessageForm = this.page.getByTestId('message-form');
    this.inputBoxInCreateNewMessageForm = this.page.locator("input[aria-label*='Select people']");
    this.startChatButton = this.page.getByTestId('dmStartChatButton');
    this.userSelectionDropdownOptions = this.page.locator("div[role='menuitem']");
  }

  // --- Actions ---

  /**
   * Clicks on the create new message button and then selects the new message option
   */
  async clickCreateNewMessageButton(): Promise<void> {
    await test.step(`Clicking create new message button and then select new message option`, async () => {
      await this.clickOnElement(this.createNewMessageOrGroupButton);
      await this.clickOnElement(this.dropDownOptionCreateNewMessage);
    });
  }

  /**
   * Searches for a user by name and selects them
   * @param userName - The name of the user to search for
   */
  async searchAndSelectUser(userName: string): Promise<void> {
    await this.clickOnElement(this.inputBoxInCreateNewMessageForm);
    await this.fillInElement(this.inputBoxInCreateNewMessageForm, userName);
    await this.verifier.verifyTheElementIsVisible(this.userSelectionDropdownOptions.first(), {
      assertionMessage: `expecting user ${userName} selection dropdown options to be visible to start direct message`,
      timeout: 20_000,
    });
    await this.clickOnElement(this.userSelectionDropdownOptions.filter({ hasText: userName }).first());
  }

  /**
   * Clicks on the start chat button and waits for the chat to be created
   */
  async clickStartChatButton(): Promise<void> {
    await this.clickAndWaitForResponse(
      () => this.startChatButton.click({ delay: 1_000 }),
      response => response.url().includes('chat/conversations') && response.status() === 201,
      { timeout: 20000, stepInfo: 'Creating chat' }
    );
    await this.verifier.verifyTheElementIsNotVisible(this.createNewMessageForm);
  }

  // --- Verifications ---

  /**
   * Verifies the create new message form is visible
   */
  async verifyCreateNewMessageFormIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.createNewMessageForm, {
      assertionMessage: 'expecting create new message form to be visible',
    });
  }

  /**
   * Gets the group chats section
   * @returns The group chats section
   */
  getGroupChatsSection(): GroupChatsSectionComponent {
    return new GroupChatsSectionComponent(this.page);
  }

  /**
   * Gets the direct message section in inbox
   * @returns The direct message section in inbox
   */
  getDirectMessageSectionInInbox(): DirectMessageSectionInInbox {
    return new DirectMessageSectionInInbox(this.page);
  }
}
