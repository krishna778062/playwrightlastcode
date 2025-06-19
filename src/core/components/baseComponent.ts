import { Locator, Page } from '@playwright/test';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';
import { BaseVerificationUtil } from '../utils/baseVerificationUtil';
import { PageActions } from '@/src/core/utils/pageActions';

export class BaseComponent extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;
  readonly rootLocator: Locator; //this is the root locator of the component
  //if we want to use the root locator of the component, we can pass it to the constructor
  //if we don't pass anything, we will use the body locator as the root locator
  protected readonly pageActions: PageActions;

  constructor(page: Page, rootLocator?: Locator) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);
    this.pageActions = new PageActions(page);
    this.rootLocator = rootLocator ?? page.locator('body');
  }
}
