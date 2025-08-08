import { Locator, Page, Request, Response, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { FileUtil } from '@core/utils/fileUtil';
import { PlaywrightAction, PlaywrightErrorHandler } from '@core/utils/playwrightErrorHandler';

export type LocatorClickOptions = Parameters<Locator['click']>[0];
export type LocatorFillOptions = Parameters<Locator['fill']>[1];
export type LocatorGetAttributeOptions = Parameters<Locator['getAttribute']>[1];

export type CustomClickOptions = LocatorClickOptions & {
  selfHealing?: boolean;
};

export type CustomFillOptions = LocatorFillOptions & {
  selfHealing?: boolean;
};

export type CustomTypeOptions = Parameters<Locator['pressSequentially']>[1];

export class BaseActionUtil {
  constructor(readonly page: Page) {
    this.page = page;
  }

  /**
   * Gets a locator for a given selector
   * @param selector - The selector to get the locator for
   * @returns The locator
   */
  getLocator(selector: string) {
    return this.page.locator(selector);
  }

  /**
   * This is wrapper around the playwright page.goto method
   * It adds a step to the test.step method
   * It also adds a default waitUntil and timeout
   *
   * @example
   * ```ts
   * await this.goToUrl('https://www.google.com');
   * ```
   *
   * @description
   * Navigates to a given url
   * @param url - The url to navigate to
   * @param options - The options to pass to the goto method
   * @param options.waitUntil - The waitUntil option to pass to the goto method
   * @param options.timeout - The timeout option to pass to the goto method
   */
  async goToUrl(
    url: string,
    options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit'; timeout?: number }
  ) {
    await test.step(`Navigating to ${url}`, async () => {
      await this.page.goto(url, {
        waitUntil: options?.waitUntil || 'load',
        timeout: options?.timeout || TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Clicks on an element
   * @param selectorOrLocator - The selector or locator to click on
   * @param options - The options to pass to the click method
   */
  async clickOnElement(selectorOrLocator: string | Locator, options?: CustomClickOptions) {
    //we will use this option later in catch block
    const selfHealing = options?.selfHealing ?? false;
    const eleToClick = typeof selectorOrLocator === 'string' ? this.getLocator(selectorOrLocator) : selectorOrLocator;
    try {
      await eleToClick.click(options);
    } catch (error) {
      throw PlaywrightErrorHandler.handle(error, PlaywrightAction.CLICK, selectorOrLocator);
    }
  }

  /**
   * Fills in an element
   * @param selectorOrLocator - The selector or locator to fill in
   * @param value - The value to fill in
   * @param options - The options to pass to the fill method
   */
  async fillInElement(selectorOrLocator: string | Locator, value: string, options?: CustomFillOptions) {
    const selfHealing = options?.selfHealing ?? false;
    const eleToFill = typeof selectorOrLocator === 'string' ? this.getLocator(selectorOrLocator) : selectorOrLocator;
    try {
      await eleToFill.fill(value, options);
    } catch (error) {
      throw PlaywrightErrorHandler.handle(error, PlaywrightAction.FILL_IN, selectorOrLocator);
    }
  }

  /**
   * It simulates user typing behaviour key by key
   * @param selectorOrLocator - The selector or locator to type in
   * @param textToType - The text to type
   * @param options - The options to pass to the type method
   *
   */
  async typeInElement(selectorOrLocator: string | Locator, textToType: string, options?: CustomTypeOptions) {
    const eleToType = typeof selectorOrLocator === 'string' ? this.getLocator(selectorOrLocator) : selectorOrLocator;
    try {
      await eleToType.pressSequentially(textToType, options);
    } catch (error) {
      throw PlaywrightErrorHandler.handle(error, PlaywrightAction.TYPE_IN, selectorOrLocator);
    }
  }

  /**
   * Gets an element attribute
   * @param selectorOrLocator - The selector or locator to get the attribute from
   * @param attributeName - The name of the attribute to get
   */
  async getElementAttribute(
    selectorOrLocator: string | Locator,
    attributeName: string,
    options?: LocatorGetAttributeOptions
  ) {
    try {
      const ele = typeof selectorOrLocator === 'string' ? this.getLocator(selectorOrLocator) : selectorOrLocator;
      console.log(`Getting attribute ${attributeName} from element ${ele}`);
      return await ele.getAttribute(attributeName, options);
    } catch (error) {
      throw PlaywrightErrorHandler.handle(error, PlaywrightAction.GET_ATTRIBUTE, selectorOrLocator);
    }
  }

  /**
   * Clicks on an element and waits for a response
   * @param action - The action to perform
   * @param responsePredicate - The predicate to use to filter the response
   * @param options - The options to pass to the click method
   */
  async clickAndWaitForResponse(
    action: () => Promise<any>,
    responsePredicate: (response: Response) => boolean,
    options?: { timeout?: number; stepInfo?: string }
  ): Promise<Response> {
    const { timeout = 20000, stepInfo } = options || {};
    return await test.step(stepInfo || 'Click and wait for response', async () => {
      const responsePromise = this.page.waitForResponse(responsePredicate, { timeout });
      await action();
      return await responsePromise;
    });
  }

  /**
   * Performs an action and waits for a response
   * @param actionToPerform - The action to perform
   * @param responsePredicate - The predicate to use to filter the response
   * @param options - The options to pass to the action
   */
  async performActionAndWaitForResponse(
    actionToPerform: () => Promise<any>,
    responsePredicate: (response: Response) => boolean,
    options?: { timeout?: number; stepInfo?: string }
  ): Promise<Response> {
    const { timeout = 20000, stepInfo } = options || {};
    return await test.step(stepInfo || 'Click and wait for response', async () => {
      const responsePromise = this.page.waitForResponse(responsePredicate, { timeout });
      await actionToPerform();
      return await responsePromise;
    });
  }

  async performActionAndWaitForRequest(
    actionToPerform: () => Promise<any>,
    requestPredicate: (request: Request) => boolean,
    options?: { timeout?: number; stepInfo?: string }
  ): Promise<Request> {
    const { timeout = 20000, stepInfo } = options || {};
    return await test.step(stepInfo || 'Click and wait for response', async () => {
      const requestPromise = this.page.waitForRequest(requestPredicate, { timeout });
      await actionToPerform();
      return await requestPromise;
    });
  }

  /**
   * Clicks on an element and waits for a new page to open
   * @param actionToPerform - The action to perform
   * @param options - The options to pass to the click method
   * @returns The new page
   *
   * @example
   * ```ts
   * await this.clickAndWaitForNewPageToOpen(()=>this.clickOnElement(this.privacyPolicyLink), {
   *   timeout: TIMEOUTS.MEDIUM,
   *   stepInfo: 'Clicking on privacy policy link should redirect to privacy policy page',
   * });
   * ```
   */
  async clickAndWaitForNewPageToOpen(
    actionToPerform: () => Promise<any>,
    options?: { timeout?: number; stepInfo?: string }
  ): Promise<Page> {
    const { timeout = 30000, stepInfo } = options || {};
    return await test.step(stepInfo || 'Trigger action and wait for new page to open', async () => {
      const [newPage] = await Promise.all([this.page.context().waitForEvent('page', { timeout }), actionToPerform()]);
      return newPage;
    });
  }

  async performActionAndWaitForPageNavigation(
    actionToPerform: () => Promise<any>,
    expectedUrl: string | RegExp,
    options?: { timeout?: number; stepInfo?: string }
  ): Promise<Page> {
    const { timeout = 30000, stepInfo } = options || {};
    return await test.step(
      stepInfo || `Trigger action and wait for page navigation to url : ${expectedUrl}`,
      async () => {
        await actionToPerform();
        await this.page.waitForURL(expectedUrl, { timeout });
        return this.page;
      }
    );
  }
  /**
   * Sleeps for a given time
   * @param timeInMs - The time to sleep for in milliseconds
   */
  async sleep(timeInMs: number) {
    await test.step(`Sleeping/Waiting for ${timeInMs} milliseconds`, async () => {
      await this.page.waitForTimeout(timeInMs);
    });
  }

  /**
   * Adds input files to an element
   * @param selectorOrLocator - The selector or locator to add the input files to
   * @param filePath - The path to the file to add
   *
   */
  async addInputFiles(selectorOrLocator: string | Locator, filePath: string) {
    const eleToAdd = typeof selectorOrLocator === 'string' ? this.getLocator(selectorOrLocator) : selectorOrLocator;
    if (FileUtil.fileExists(filePath)) {
      await eleToAdd.setInputFiles(filePath);
    } else {
      throw new Error(`File does not exist at path: ${filePath}`);
    }
  }

  /**
   * Navigates back to the previous page
   * @param options - The options to pass to the goBack method
   * @returns The previous page
   */
  async goBackToPreviousPage(options?: { stepInfo?: string; timeout?: number }) {
    await this.page.goBack({ waitUntil: 'domcontentloaded', timeout: options?.timeout ?? 20_000 });
  }
}
