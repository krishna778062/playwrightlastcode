import { BaseComponent } from '@/src/core/components/baseComponent';
import { expect, Locator, Page, test } from '@playwright/test';
import { GroupChatsSectionComponent } from '@chat/components/groupChatsSectionComponent';
import { DirectMessageComponent } from '@chat/components/directMessageComponent';

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

  async clickCreateNewMessageButton(): Promise<void> {
    await this.clickOnElement(this.createNewMessageOrGroupButton);
    await this.clickOnElement(this.dropDownOptionCreateNewMessage);
  }

  async searchAndSelectUser(userName: string): Promise<void> {
    await this.clickOnElement(this.inputBoxInCreateNewMessageForm);
    await this.fillInElement(this.inputBoxInCreateNewMessageForm, userName);
    await this.verifier.verifyTheElementIsVisible(this.userSelectionDropdownOptions.first());
    await this.clickOnElement(this.userSelectionDropdownOptions.filter({ hasText: userName }).first());
  }

  async clickStartChatButton(): Promise<void> {
    await this.clickAndWaitForResponse(
      () => this.startChatButton.click({ delay: 1_000 }),
      response => response.url().includes('chat/conversations') && response.status() === 201,
      { timeout: 20000, stepInfo: 'Creating chat' }
    );
    await this.verifier.verifyTheElementIsNotVisible(this.createNewMessageForm);
  }

  // --- Verifications ---

  async verifyCreateNewMessageFormIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.createNewMessageForm, {
      assertionMessage: 'expecting create new message form to be visible',
    });
  }

  getGroupChatsSection(): GroupChatsSectionComponent {
    return new GroupChatsSectionComponent(this.page);
  }

  getDirectMessageComponent(): DirectMessageComponent {
    return new DirectMessageComponent(this.page);
  }
}
