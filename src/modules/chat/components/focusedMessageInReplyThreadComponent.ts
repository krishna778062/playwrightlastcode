import { Locator, Page } from '@playwright/test';

import { MessageBaseComponent } from '@chat/components/messageBaseComponent';

export class FocusedMessageInReplyThreadComponent extends MessageBaseComponent {
  constructor(page: Page, focusedMessageInReplyThreadContainer: Locator) {
    super(page, focusedMessageInReplyThreadContainer);
  }
}
