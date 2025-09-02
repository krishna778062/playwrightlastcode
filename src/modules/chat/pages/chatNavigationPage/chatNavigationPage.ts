import { expect, Locator, Page, test } from '@playwright/test';

import { ChatNavigationComponent } from '../../components/chatNavigationComponent';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { ChatPageBase } from '@/src/modules/chat/pages/chatPage/chatPageBase';

export interface IChatActions {
  clickOnTheChatButton: (options?: { stepInfo?: string }) => Promise<void>;
  clickOnTheSeeAllMessagesButton: (options?: { stepInfo?: string }) => Promise<void>;
  clickOnTheCreateNewButton: (options?: { stepInfo?: string }) => Promise<void>;
}

export interface IChatAssertions {
  verifyTheChatPageIsLoaded: (options?: { stepInfo?: string }) => Promise<void>;
  verifyTheCreateNewMessageButton: (options?: { stepInfo?: string }) => Promise<void>;
  verifyTheCreateNewGroupButton: (options?: { stepInfo?: string }) => Promise<void>;
}

export class ChatNavigationPage extends ChatPageBase implements IChatActions, IChatAssertions {
  chatNavigationComponent: any;

  get actions(): IChatActions {
    return this as IChatActions;
  }
  get assertions(): IChatAssertions {
    return this as IChatAssertions;
  }

  constructor(page: Page) {
    super(page);
    this.chatNavigationComponent = new ChatNavigationComponent(page);
  }

  async clickOnTheChatButton(options?: { stepInfo?: string }): Promise<void> {
    await this.chatNavigationComponent.clickOnTheChatButton(options);
  }

  async clickOnTheSeeAllMessagesButton(options?: { stepInfo?: string }): Promise<void> {
    await this.chatNavigationComponent.clickOnTheSeeAllMessagesButton(options);
  }

  async verifyTheChatPageIsLoaded(options?: { stepInfo?: string }): Promise<void> {
    await this.verifyThePageIsLoaded();
  }

  async clickOnTheCreateNewButton(options?: { stepInfo?: string }): Promise<void> {
    await this.chatNavigationComponent.clickOnTheCreateNewButton(options);
  }

  async verifyTheCreateNewMessageButton(options?: { stepInfo?: string }): Promise<void> {
    await this.chatNavigationComponent.verifyTheCreateNewMessageButton(options);
  }

  async verifyTheCreateNewGroupButton(options?: { stepInfo?: string }): Promise<void> {
    await this.chatNavigationComponent.verifyTheCreateNewGroupButton(options);
  }
}
