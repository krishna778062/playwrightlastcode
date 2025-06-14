import { Locator } from '@playwright/test';

export enum PlaywrightAction {
  CLICK = 'click',
  FILL_IN = 'fill in',
  TYPE_IN = 'type in',
  GET_ATTRIBUTE = 'get attribute',
}

export class PlaywrightErrorHandler {
  static handle(error: any, action: PlaywrightAction, selector: string | Locator) {
    let reason = error?.message || String(error);

    // Add custom parsing for common Playwright error patterns
    if (reason.includes('not visible')) {
      reason = `Element is not visible.`;
    } else if (reason.includes('not attached to the DOM')) {
      reason = `Element is not attached to the DOM.`;
    } else if (reason.includes('not enabled')) {
      reason = `Element is not enabled.`;
    } else if (reason.includes('Timeout')) {
      reason = `Timeout while trying to ${action}.`;
    }
    // Add more patterns as needed
    return new Error(`Failed to ${action} on ${selector}: ${reason}`);
  }
}
