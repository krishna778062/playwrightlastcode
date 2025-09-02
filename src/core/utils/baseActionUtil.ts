import { expect, Locator, Page, Request, Response, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { FileUtil } from '@core/utils/fileUtil';
import { PlaywrightAction, PlaywrightErrorHandler } from '@core/utils/playwrightErrorHandler';

export type LocatorClickOptions = Parameters<Locator['click']>[0];
export type LocatorCheckOptions = Parameters<Locator['check']>[0];
export type LocatorFillOptions = Parameters<Locator['fill']>[1];
export type LocatorGetAttributeOptions = Parameters<Locator['getAttribute']>[1] & {
  stepInfo?: string;
};

export type CustomClickOptions = LocatorClickOptions & {
  selfHealing?: boolean;
  stepInfo?: string;
  timeout?: number;
};

export type CustomCheckOptions = LocatorCheckOptions & {
  selfHealing?: boolean;
  stepInfo?: string;
  timeout?: number;
};

export type CustomFillOptions = LocatorFillOptions & {
  selfHealing?: boolean;
  stepInfo?: string;
  timeout?: number;
};

export type CustomTypeOptions = Parameters<Locator['pressSequentially']>[1] & {
  stepInfo?: string;
};

export class BaseActionUtil {
  readonly toastMessages: Locator;
  readonly dismissToastMessage: Locator;

  constructor(readonly page: Page) {
    this.page = page;
    this.toastMessages = page.locator('[class*="Toast-module"] p');
    this.dismissToastMessage = page.locator('[aria-label="Dismiss"]');
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
    const eleToClick = typeof selectorOrLocator === 'string' ? this.page.locator(selectorOrLocator) : selectorOrLocator;
    await test.step(options?.stepInfo || `Click on ${selectorOrLocator}`, async () => {
      try {
        await eleToClick.click(options);
      } catch (error) {
        throw PlaywrightErrorHandler.handle(error, PlaywrightAction.CLICK, selectorOrLocator);
      }
    });
  }

  /**
   * Clicks on an element with coordinates
   * @param selectorOrLocator - The selector or locator to click on
   * @param options - The options to pass to the click method
   */
  async clickOnElementWithCoordinates(selectorOrLocator: string | Locator, options?: CustomClickOptions) {
    //we will use this option later in catch block
    const selfHealing = options?.selfHealing ?? false;
    const eleToClick = typeof selectorOrLocator === 'string' ? this.page.locator(selectorOrLocator) : selectorOrLocator;
    await test.step(options?.stepInfo || `Click on ${selectorOrLocator}`, async () => {
      try {
        const eleCoordinates = await eleToClick.boundingBox();
        const eleCentre = {
          x: (eleCoordinates?.x ?? 0) + (eleCoordinates?.width ?? 0) / 2,
          y: (eleCoordinates?.y ?? 0) + (eleCoordinates?.height ?? 0) / 2,
        };
        await this.page.mouse.move(eleCentre.x, eleCentre.y);
        await this.page.mouse.click(eleCentre.x, eleCentre.y);
      } catch (error) {
        throw PlaywrightErrorHandler.handle(error, PlaywrightAction.CLICK_WITH_COORDINATES, selectorOrLocator);
      }
    });
  }

  /**
   * Clicks on an element by injecting JavaScript
   * @param element - The locator to click on
   */
  async clickByInjectingJavaScript(element: Locator) {
    const elementHandle = await eleToClick.elementHandle();
    if (elementHandle) {
      await this.page.evaluate((el: HTMLElement | SVGElement | null) => {
        if (el) (el as HTMLElement).click();
      }, elementHandle);
    }
  }

  /**
   * Check an element
   * @param selectorOrLocator - The selector or locator to check on
   * @param options - The options to pass to the check method
   */
  async checkElement(selectorOrLocator: string | Locator, options?: CustomCheckOptions) {
    //we will use this option later in catch block
    const selfHealing = options?.selfHealing ?? false;
    const eleToCheck = typeof selectorOrLocator === 'string' ? this.page.locator(selectorOrLocator) : selectorOrLocator;
    await test.step(options?.stepInfo || `Check ${selectorOrLocator}`, async () => {
      try {
        await eleToCheck.check(options);
      } catch (error) {
        throw PlaywrightErrorHandler.handle(error, PlaywrightAction.CLICK, selectorOrLocator);
      }
    });
  }

  /**
   * Fills in an element
   * @param selectorOrLocator - The selector or locator to fill in
   * @param value - The value to fill in
   * @param options - The options to pass to the fill method
   */
  async fillInElement(selectorOrLocator: string | Locator, value: string, options?: CustomFillOptions) {
    const selfHealing = options?.selfHealing ?? false;
    const eleToFill = typeof selectorOrLocator === 'string' ? this.page.locator(selectorOrLocator) : selectorOrLocator;
    await test.step(options?.stepInfo || `Fill in ${selectorOrLocator}`, async () => {
      try {
        await eleToFill.fill(value, options);
      } catch (error) {
        throw PlaywrightErrorHandler.handle(error, PlaywrightAction.FILL_IN, selectorOrLocator);
      }
    });
  }

  /**
   * It simulates user typing behaviour key by key
   * @param selectorOrLocator - The selector or locator to type in
   * @param textToType - The text to type
   * @param options - The options to pass to the type method
   *
   */
  async typeInElement(selectorOrLocator: string | Locator, textToType: string, options?: CustomTypeOptions) {
    const eleToType = typeof selectorOrLocator === 'string' ? this.page.locator(selectorOrLocator) : selectorOrLocator;
    await test.step(options?.stepInfo || `Type ${textToType} in ${selectorOrLocator}`, async () => {
      try {
        await eleToType.pressSequentially(textToType, options);
      } catch (error) {
        throw PlaywrightErrorHandler.handle(error, PlaywrightAction.TYPE_IN, selectorOrLocator);
      }
    });
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
    const ele = typeof selectorOrLocator === 'string' ? this.page.locator(selectorOrLocator) : selectorOrLocator;
    return await test.step(
      options?.stepInfo || `Get attribute ${attributeName} from ${selectorOrLocator}`,
      async () => {
        try {
          return await ele.getAttribute(attributeName, options);
        } catch (error) {
          throw PlaywrightErrorHandler.handle(error, PlaywrightAction.GET_ATTRIBUTE, selectorOrLocator);
        }
      }
    );
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
    const eleToAdd = typeof selectorOrLocator === 'string' ? this.page.locator(selectorOrLocator) : selectorOrLocator;
    if (FileUtil.fileExists(filePath)) {
      await eleToAdd.setInputFiles(filePath);
    } else {
      throw new Error(`File does not exist at path: ${filePath}`);
    }
  }

  /**
   * Opens a file chooser by performing the provided action and sets given file(s).
   * Useful for generic file upload flows.
   */
  async openFileChooserAndSetFiles(
    actionToTriggerFileChooser: () => Promise<any>,
    files: string | string[],
    options?: { timeout?: number; stepInfo?: string }
  ) {
    const { timeout = 60_000, stepInfo } = options || {};
    return await test.step(stepInfo || 'Open file chooser and set files', async () => {
      const fileChooserPromise = this.page.waitForEvent('filechooser', { timeout });
      await actionToTriggerFileChooser();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(files);
    });
  }

  /**
   * Reads text from clipboard via the browser context.
   */
  async readClipboardText(): Promise<string> {
    return await this.page.evaluate(() => navigator.clipboard.readText());
  }

  /**
   * Navigates back to the previous page
   * @param options - The options to pass to the goBack method
   * @returns The previous page
   */
  async goBackToPreviousPage(options?: { stepInfo?: string; timeout?: number }) {
    await this.page.goBack({ waitUntil: 'domcontentloaded', timeout: options?.timeout ?? 20_000 });
  }

  /**
   * Clicks on button with given name
   * @param text - Name of the button
   * @param exactMatch - Whether to match the button name exactly  default is true
   */
  async clickOnButtonWithName(text: string, exactMatch: boolean = true): Promise<void> {
    await this.clickOnElement(this.page.getByRole('button', { name: text, exact: exactMatch }), {
      stepInfo: `Click on ${text} button`,
    });
  }

  /**
   * Waiting for ACG sync confirmation toast message takes like 10-120 seconds to appear after the ACG creation.
   * @param toastMessage - To verify that whether the contents of the toast message contains.
   * @param numberOfAttempts - To define number of tries incase the toast message is not found in first try
   * @param options - Optional parameters for the toast message verification.
   */
  async verifyToastMessage(toastMessage: string, options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Verifying ${toastMessage} toast message`, async () => {
      await expect(
        this.toastMessages.filter({ hasText: toastMessage }),
        `expecting ${toastMessage} toast message`
      ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Dismisses the toast message.
   */
  async dismissTheToastMessage(): Promise<void> {
    await test.step(`Dismissing the toast message`, async () => {
      await this.clickOnElement(this.dismissToastMessage);
    });
  }
}
