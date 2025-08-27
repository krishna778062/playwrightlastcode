import { Locator, Page } from '@playwright/test';

import { BasePage } from '../pages/basePage';
import { BaseVerificationUtil } from '../utils/baseVerificationUtil';

export class BaseComponent extends BasePage {
  readonly verifier: BaseVerificationUtil;
  readonly rootLocator: Locator; //this is the root locator of the component
  //if we want to use the root locator of the component, we can pass it to the constructor
  //if we don't pass anything, we will use the body locator as the root locator
  constructor(page: Page, rootLocator?: Locator) {
    super(page, ''); // Components don't have URLs, so pass empty string
    this.verifier = new BaseVerificationUtil(page);
    this.rootLocator = rootLocator ?? page.locator('body');
  }

  // Components don't have pages to load, so provide a no-op implementation
  async verifyThePageIsLoaded(): Promise<void> {
    // No-op for components - they don't have pages to verify
  }
}
