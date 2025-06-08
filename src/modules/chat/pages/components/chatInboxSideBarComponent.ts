import { BaseComponent } from './baseComponent';
import { expect, Locator, Page, test } from '@playwright/test';
import { GroupChatsSectionComponent } from './groupChatsSectionComponent';
import { DirectMessageComponent } from './directMessageComponent';

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

  getGroupChatsSection(): GroupChatsSectionComponent {
    return new GroupChatsSectionComponent(this.page);
  }

  getDirectMessageComponent(): DirectMessageComponent {
    return new DirectMessageComponent(this.page);
  }

  async openDirectMessageWithUser(
    userName: string,
    options?: {
      stepInfo?: string;
    }
  ) {
    await test.step(options?.stepInfo ?? `Opening direct message with ${userName}`, async () => {
      await this.createNewMessageOrGroupButton.click();
      //this will open a dropdown with options to create new message or group [NOTE: depends on configuration]
      await this.dropDownOptionCreateNewMessage.click();
      //expecting create new message form to be visible
      await expect(
        this.createNewMessageForm,
        `expecting create new message form to be visible`
      ).toBeVisible();
      //select the user from the input box
      await this.inputBoxInCreateNewMessageForm.click();
      await this.inputBoxInCreateNewMessageForm.fill(userName);
      //atleast 1 dropdwon option is visible for user search result
      await expect(
        this.userSelectionDropdownOptions.first(),
        `expecting user selection dropdown to be visible`
      ).toBeVisible();

      //select the user from the dropdown
      await this.userSelectionDropdownOptions.filter({ hasText: userName }).first().click();
      //start the chart
      /**
       * when we create start chat button , there is an API call happens behind the scene
       * we should wait until that call is successfull to proceed ahead in the flow
       */
      const createChatPromise = this.page.waitForResponse(
        response => response.url().includes('chat/conversations') && response.status() === 201,
        { timeout: 20_000 }
      );
      await this.startChatButton.click({ delay: 1_000 });
      await createChatPromise;

      //now wait until the create message form is disappeared
      await expect(
        this.createNewMessageForm,
        `expecting create message form to be disappeared`
      ).not.toBeVisible();
    });
  }
}
