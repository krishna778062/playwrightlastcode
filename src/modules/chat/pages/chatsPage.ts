import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from './basePage';
import { Locator, Page, expect } from '@playwright/test';
import { ChatInboxSideBarComponent } from './components/chatInboxSideBarComponent';
import { GroupChatWindowComponent } from './components/groupChatWindowComponent';

export class ChatAppPage extends BasePage {
  protected readonly chatAppContainer: Locator;
  protected readonly inboxSideBarContainer: Locator;
  protected readonly groupChatWindowContainer: Locator;
  //components
  protected readonly inboxSideBarComponent: ChatInboxSideBarComponent;
  protected readonly focusedChatComponent: GroupChatWindowComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CHATS_PAGE);
    this.chatAppContainer = this.page.locator("[class='data-chat-app-wrapper']");
    this.inboxSideBarContainer = this.chatAppContainer.locator(
      "[data-variant='sidebar'][class*='styles_root_']"
    );
    this.groupChatWindowContainer = this.chatAppContainer.locator(
      "[data-variant='chat'][class*='styles_root_']"
    );
    //components initalisation
    this.inboxSideBarComponent = new ChatInboxSideBarComponent(page, this.inboxSideBarContainer);
    this.focusedChatComponent = new GroupChatWindowComponent(page, this.groupChatWindowContainer);
  }

  public getInboxSideBarComponent(): ChatInboxSideBarComponent {
    return this.inboxSideBarComponent;
  }

  public getFocusedChatComponent(): GroupChatWindowComponent {
    return this.focusedChatComponent;
  }

  public async verifyThePageIsLoaded(): Promise<void> {
    await expect(
      this.getInboxSideBarComponent().inboxHeader,
      `expecting inbox header to be visible`
    ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  }
}
