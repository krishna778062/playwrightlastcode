import { Locator, Page, test } from '@playwright/test';

import { BaseActionUtil } from '@core/utils/baseActionUtil';

import { BaseVerificationUtil } from '@/src/core/utils/baseVerificationUtil';

export class BaseComponent extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;
  readonly rootLocator: Locator; //this is the root locator of the component
  //if we want to use the root locator of the component, we can pass it to the constructor
  //if we don't pass anything, we will use the body locator as the root locator
  constructor(page: Page, rootLocator?: Locator) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);
    this.rootLocator = rootLocator ?? page.locator('body');
  }

  // Components don't have pages to load, so provide a no-op implementation
  async verifyThePageIsLoaded(): Promise<void> {
    // No-op for components - they don't have pages to verify
  }

  async scrollToComponent(): Promise<void> {
    await test.step('Scroll to component', async () => {
      await this.rootLocator.scrollIntoViewIfNeeded();
    });
  }
}
