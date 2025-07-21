import { BasePage } from '@core/pages/basePage';
import { Locator, Page,expect } from '@playwright/test';
import { DirectMessageSectionInInbox } from '@/src/modules/chat/components/directMessageSectionInChatInbox';
import { ImageAttachementPreviewModal } from '@/src/modules/chat/components/imageAttachementPreviewModal';
import { ConversationWindowComponent } from '@/src/modules/chat/components/conversationWindowComponent';
import { ChatInboxSideBarComponent } from '@/src/modules/chat/components/chatInboxSideBarComponent';
import { UnsupportedFileMessageDialogBox } from '@/src/modules/chat/components/unsupportedFileMessageDialogBox';
import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export interface ChatPageComponents {
    inboxSideBarComponent: ChatInboxSideBarComponent;
    conversationWindow: ConversationWindowComponent;
    directMessageSectionInInbox: DirectMessageSectionInInbox;
    imageAttachementPreviewModal: ImageAttachementPreviewModal;
    unsupportedFileMessageDialogBoxComponent: UnsupportedFileMessageDialogBox;
}

    
export abstract class ChatPageBase extends BasePage implements ChatPageComponents {
  //page elements
  readonly chatAppContainer: Locator;
  readonly inboxSideBarContainer: Locator;
  readonly groupChatWindowContainer: Locator;
  readonly unsupportedFileMessageDialogBox: Locator;

  //components
  readonly inboxSideBarComponent: ChatInboxSideBarComponent;
  readonly conversationWindow: ConversationWindowComponent;
  readonly directMessageSectionInInbox: DirectMessageSectionInInbox;
  readonly imageAttachementPreviewModal: ImageAttachementPreviewModal;
  readonly unsupportedFileMessageDialogBoxComponent: UnsupportedFileMessageDialogBox;
  //components
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CHATS_PAGE);
    this.chatAppContainer = this.page.locator("[class='data-chat-app-wrapper']");
    this.inboxSideBarContainer = this.chatAppContainer.locator("[data-variant='sidebar'][class*='styles_root_']");
    this.groupChatWindowContainer = this.chatAppContainer.locator("[data-variant='chat'][class*='styles_root_']");
    this.unsupportedFileMessageDialogBox = this.page.getByRole('dialog', { name: 'File unsupported' });
    //components initalisation
    this.unsupportedFileMessageDialogBoxComponent = new UnsupportedFileMessageDialogBox(
      page,
      this.unsupportedFileMessageDialogBox
    );
    this.inboxSideBarComponent = new ChatInboxSideBarComponent(page, this.inboxSideBarContainer);
    this.conversationWindow = new ConversationWindowComponent(page, this.groupChatWindowContainer);
    this.imageAttachementPreviewModal = new ImageAttachementPreviewModal(
      page,
      this.page.getByTestId('attachmentPreviewModal')
    );
    this.directMessageSectionInInbox = new DirectMessageSectionInInbox(page);
  }

  public getInboxSideBarComponent(): ChatInboxSideBarComponent {
    return this.inboxSideBarComponent;
  }

  public getConversationWindowComponent(): ConversationWindowComponent {
    return this.conversationWindow;
  }

  public getDirectMessageSectionInInbox(): DirectMessageSectionInInbox {
    return this.directMessageSectionInInbox;
  }

  public getUnsupportedFileMessageDialogBoxComponent(): UnsupportedFileMessageDialogBox {
    return this.unsupportedFileMessageDialogBoxComponent;
  }

  public getImageAttachementPreviewModalComponent(): ImageAttachementPreviewModal {
    return this.imageAttachementPreviewModal;
  }

  public async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.getInboxSideBarComponent().inboxHeader, `expecting inbox header to be visible`).toBeVisible({
      timeout: 50_000,
    });
  }
}