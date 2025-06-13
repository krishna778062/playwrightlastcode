import { expect, Locator, Page, test } from '@playwright/test';
import { BaseComponent } from '@/src/core/components/baseComponent';
import { ChatEditorComponent } from '@chat/components/chatEditorComponent';
import { FocusedMessageInReplyThreadComponent } from '@chat/components/focusedMessageInReplyThreadComponent';
import { TIMEOUTS } from '@core/constants/timeouts';

export class MessageReplyThreadComponent extends BaseComponent {
  //locators
  readonly replyThreadComponentContainer: Locator;
  readonly chatEditorComponentContainer: Locator;
  readonly messageListInReplyThreadContainer: Locator;
  readonly focusedMessageInReplyThreadContainer: Locator;

  //components
  protected readonly chatEditorComponent: ChatEditorComponent;

  constructor(page: Page, replyThreadComponentContainer: Locator) {
    super(page);
    this.replyThreadComponentContainer = replyThreadComponentContainer;
    this.chatEditorComponentContainer =
      this.replyThreadComponentContainer.locator("[class*='Editor_root_']");
    this.messageListInReplyThreadContainer = this.replyThreadComponentContainer.locator(
      "[class*='List_messageListWrapper']"
    );
    this.focusedMessageInReplyThreadContainer =
      this.messageListInReplyThreadContainer.locator('article[data-index]'); //data-index separates replies from the parent message

    //components initalisation
    this.chatEditorComponent = new ChatEditorComponent(page, this.chatEditorComponentContainer);
  }

  getChatEditorComponent(): ChatEditorComponent {
    return this.chatEditorComponent;
  }

  /**
   * Verifies that the reply thread component is visible
   */
  async verifyIsComponentVisible(): Promise<void> {
    await test.step(`Verifying that the reply thread component is visible`, async () => {
      await expect(
        this.replyThreadComponentContainer,
        `expected reply thread component to be visible`
      ).toBeVisible();
    });
  }

  /**
   * @param message - the message to be added in the reply thread
   */
  async addNewMessageInReplyThread(message: string): Promise<void> {
    await test.step(`Adding new message : ${message} in reply thread`, async () => {
      await this.getChatEditorComponent().sendMessage(message);
    });
  }

  /**
   * @param byMessageTextOrByIndex - either the index of the message in the reply thread or the message text
   * @returns the focused message in reply thread component
   */
  async getFocusedMessageInReplyThread(
    byMessageTextOrByIndex?: string | number,
    options?: {
      timeout?: number;
      stepInfo?: string;
    }
  ): Promise<FocusedMessageInReplyThreadComponent> {
    let focusedMessageInReplyThreadComponent: FocusedMessageInReplyThreadComponent | undefined;
    await test.step(
      options?.stepInfo ??
        `Getting the focused message in reply thread either by index or by message text : ${byMessageTextOrByIndex}`,
      async () => {
        if (typeof byMessageTextOrByIndex === 'number') {
          const focusedMessageLocator =
            this.focusedMessageInReplyThreadContainer.nth(byMessageTextOrByIndex);
          focusedMessageInReplyThreadComponent = new FocusedMessageInReplyThreadComponent(
            this.page,
            focusedMessageLocator
          );
        } else if (typeof byMessageTextOrByIndex === 'string') {
          const replyThreadMessage = await this.waitForMessageToBePresentInReplyThread(
            byMessageTextOrByIndex,
            {
              stepInfo: `Waiting until user starts seeing the message in reply thread: ${byMessageTextOrByIndex}`,
              timeout: options?.timeout ?? TIMEOUTS.MEDIUM,
            }
          );
          focusedMessageInReplyThreadComponent = new FocusedMessageInReplyThreadComponent(
            this.page,
            replyThreadMessage
          );
        }
      }
    );
    if (!focusedMessageInReplyThreadComponent) {
      throw new Error(
        `Focused message in reply thread component not found for the message: ${byMessageTextOrByIndex}`
      );
    }
    return focusedMessageInReplyThreadComponent;
  }

  /**
   * Waits for the message to be present in the reply thread
   * @param message - the message to wait for
   * @param options - optional parameters
   * @param options.timeout - the timeout for the wait
   * @param options.stepInfo - the step info for the wait
   */
  async waitForMessageToBePresentInReplyThread(
    message: string,
    options?: {
      timeout?: number;
      stepInfo?: string;
    }
  ): Promise<Locator> {
    let replyThreadMessage: Locator | undefined;
    await test.step(
      options?.stepInfo ?? `Waiting for message to be present in reply thread: ${message}`,
      async () => {
        await expect(
          this.focusedMessageInReplyThreadContainer,
          `expected message to be present in reply thread`
        ).toBeVisible({
          timeout: options?.timeout ?? TIMEOUTS.MEDIUM,
        });
        replyThreadMessage = this.focusedMessageInReplyThreadContainer
          // .locator('section')
          // .locator('p')
          .filter({ hasText: message });
        await expect(
          replyThreadMessage,
          `expected message to be present in reply thread`
        ).toBeVisible({
          timeout: options?.timeout ?? TIMEOUTS.MEDIUM,
        });
      }
    );
    if (!replyThreadMessage) {
      throw new Error(`Message: ${message} not found in reply thread`);
    }
    return replyThreadMessage;
  }
}
