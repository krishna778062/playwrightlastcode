import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';
import { Locator, Page, expect, test } from '@playwright/test';
import { ChatInboxSideBarComponent } from '@chat/components/chatInboxSideBarComponent';
import { ConversationWindowComponent } from '@/src/modules/chat/components/conversationWindowComponent';
import { UnsupportedFileMessageDialogBox } from '../components/unsupportedFileMessageDialogBox';
import { ImageAttachementPreviewModal } from '../components/imageAttachementPreviewModal';
import { DirectMessageSectionInInbox } from '../components/directMessageSectionInChatInbox';
import { ChatActionHelper } from '../helpers/chatActionHelper';
import { ChatAssertionHelper } from '../helpers/chatAssertionHelper';

export class ChatAppPage extends BasePage<ChatActionHelper, ChatAssertionHelper> {
  protected readonly chatAppContainer: Locator;
  protected readonly inboxSideBarContainer: Locator;
  protected readonly groupChatWindowContainer: Locator;
  protected readonly unsupportedFileMessageDialogBox: Locator;
  protected readonly imageAttachementPreviewModal: ImageAttachementPreviewModal;
  protected readonly directMessageSectionInInbox: DirectMessageSectionInInbox;
  //components
  protected readonly inboxSideBarComponent: ChatInboxSideBarComponent;
  protected readonly conversationWindow: ConversationWindowComponent;

  protected readonly unsupportedFileMessageDialogBoxComponent: UnsupportedFileMessageDialogBox;

  //actions
  protected readonly chatActionHelper: ChatActionHelper;

  //assertions
  protected readonly chatAssertionHelper: ChatAssertionHelper;

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

    //actions initalisation
    this.chatActionHelper = new ChatActionHelper(this);

    //assertions initalisation
    this.chatAssertionHelper = new ChatAssertionHelper(this);
  }

  public async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.getInboxSideBarComponent().inboxHeader, `expecting inbox header to be visible`).toBeVisible({
      timeout: 50_000,
    });
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

  public get actions(): ChatActionHelper {
    return this.chatActionHelper;
  }

  public get assertions(): ChatAssertionHelper {
    return this.chatAssertionHelper;
  }
}
