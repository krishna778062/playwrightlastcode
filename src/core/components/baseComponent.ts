import { Locator, Page } from '@playwright/test';

import { BaseVerificationUtil } from '../utils/baseVerificationUtil';

import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';

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
}
