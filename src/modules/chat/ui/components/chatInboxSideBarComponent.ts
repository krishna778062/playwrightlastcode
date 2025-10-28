import { Locator, Page, test } from '@playwright/test';

import { GroupChatsSectionComponent } from '@chat/ui/components/groupChatsSectionComponent';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { DirectMessageSectionInInbox } from '@/src/modules/chat/ui/components/directMessageSectionInChatInbox';

export class ChatInboxSideBarComponent extends BaseComponent {
  readonly createNewMessageIcon: Locator;
  readonly messageOptionsDropDown: Locator;
  readonly dropDownOptionCreateNewMessage: Locator;
  readonly dropDownOptionCreateNewGroup: Locator;
  readonly createNewMessageForm: Locator;
  readonly inputBoxInCreateNewMessageForm: Locator;
  readonly startChatButton: Locator;
  readonly userSelectionDropdownOptions: Locator;

  // Group settings locators
  readonly moreOptionsButton: Locator;
  readonly manageGroupButton: Locator;
  readonly groupPermissionText: Locator;
  readonly openRadioButton: Locator;
  readonly announcementRadioButton: Locator;
  readonly groupSearchResult: Locator;
  readonly leftSideSearchbox: Locator;

  //locators
  readonly inboxHeader: Locator;

  constructor(
    page: Page,
    readonly inboxSideBarContainer: Locator
  ) {
    super(page);
    this.inboxSideBarContainer = inboxSideBarContainer;
    this.inboxHeader = this.inboxSideBarContainer.locator("[class*='Sidebar_inboxMenu']").first();
    this.createNewMessageIcon = this.inboxSideBarContainer.getByRole('button', {
      name: 'Create new message',
    });
    this.messageOptionsDropDown = this.inboxSideBarContainer.getByTestId('dropdown-menu');
    this.dropDownOptionCreateNewMessage = this.page.getByLabel('Create new message').locator('p');
    this.dropDownOptionCreateNewGroup = this.page.getByLabel('Create new group').locator('p');
    this.createNewMessageForm = this.page.getByTestId('message-form');
    this.inputBoxInCreateNewMessageForm = this.page
      .getByRole('combobox', { name: 'Select people' })
      .or(this.page.getByRole('combobox', { name: 'Select simpplers' }));
    this.startChatButton = this.page.getByTestId('dmStartChatButton');
    this.userSelectionDropdownOptions = this.page.locator("div[role='menuitem']");
    this.createNewMessageIcon = this.page.getByTestId('newMessageButton');
    this.leftSideSearchbox = this.page.getByRole('textbox', { name: 'Search...' });

    // Group settings locators
    this.moreOptionsButton = this.page.getByTestId('moreOptions');
    this.manageGroupButton = this.page.getByTestId('managegroup');
    this.groupPermissionText = this.page.getByText(
      /Open \(Everyone can post or comment\)Announcement only \(Only group admin\/s can/
    );
    this.openRadioButton = this.page.getByRole('radio', { name: 'Open (Everyone can post or comment)' });
    this.announcementRadioButton = this.page.getByRole('radio', {
      name: 'Announcement only (Only group admin/s can post)',
    });
    this.groupSearchResult = this.page
      .locator('div')
      .filter({ hasText: /^all-companyall-companyall-company1all-companyShow more$/ })
      .getByRole('paragraph')
      .nth(3);
  }

  // --- Actions ---

  async clickOnCreateNewMessageIcon(): Promise<void> {
    await this.clickOnElement(this.createNewMessageIcon, { stepInfo: 'Clicking on create new message icon' });
  }

  // drop-down clicked
  async clickOnCreateNewMessageButton(): Promise<void> {
    await this.clickOnElement(this.dropDownOptionCreateNewMessage, {
      stepInfo: 'Clicking on create new message button ',
    });
  }

  /**
   * Clicks on the create new message button and then selects the new message option
   */
  async clickCreateNewMessageButton(): Promise<void> {
    await test.step(`Clicking create new message button and then select new message option`, async () => {
      await this.clickOnElement(this.createNewMessageIcon);
      await this.clickByInjectingJavaScript(this.dropDownOptionCreateNewMessage);
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

  async searchAndSelectGroup(Name: string): Promise<void> {
    await this.clickOnElement(this.leftSideSearchbox);
    await this.fillInElement(this.leftSideSearchbox, Name);
    await this.verifier.verifyTheElementIsVisible(this.groupSearchResult, {
      assertionMessage: `expecting user ${Name} selection dropdown options to be visible to start direct message`,
      timeout: 20_000,
    });
    await this.clickOnElement(this.groupSearchResult, { stepInfo: 'Clicking on group search result' });
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

  async verifyCreateNewMessageDropDownOptionIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.dropDownOptionCreateNewMessage, {
      assertionMessage: 'expecting create new message drop down option to be visible',
    });
  }

  async verifyCreateNewGroupDropDownOptionIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.dropDownOptionCreateNewGroup, {
      assertionMessage: 'expecting create new group drop down option to be visible',
    });
  }

  // --- Group Settings Actions ---

  async clickMoreOptionsButton(): Promise<void> {
    await this.clickOnElement(this.moreOptionsButton, { stepInfo: 'Clicking on more options button' });
  }

  async clickManageGroupButton(): Promise<void> {
    await this.clickOnElement(this.manageGroupButton, { stepInfo: 'Clicking on manage group button' });
  }

  async clickOnGroupSearchResult(): Promise<void> {
    await this.clickOnElement(this.groupSearchResult, { stepInfo: 'Clicking on group search result' });
  }

  // --- Group Settings Verifications ---

  async verifyGroupPermissionTextIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.groupPermissionText, {
      assertionMessage: 'expecting group permission text to be visible',
    });
  }

  async verifyOpenRadioButtonIsNotChecked(): Promise<void> {
    await this.verifier.verifyTheElementIsNotChecked(this.openRadioButton, {
      assertionMessage: 'expecting open radio button to not be checked',
    });
  }

  async verifyAnnouncementRadioButtonIsChecked(): Promise<void> {
    await this.verifier.verifyTheElementIsChecked(this.announcementRadioButton, {
      assertionMessage: 'expecting announcement radio button to be checked',
    });
  }

  async verifyManageGroupButtonIsHidden(): Promise<void> {
    await this.clickOnElement(this.moreOptionsButton, { stepInfo: 'Clicking on more options button' });
    await this.verifier.verifyTheElementIsNotVisible(this.manageGroupButton, {
      assertionMessage: 'expecting manage group button to be hidden',
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
