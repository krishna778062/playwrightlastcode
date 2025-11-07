import { Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';

/**
 * AppsAndLinkContainerComponent is a UI component class that extends BaseComponent.
 *
 * It encapsulates interactions and assertions for app and link search result items that are displayed
 * above the normal search results in the global search results page.
 * The root locator is an anchor element that contains an img (icon) and h3 (name).
 * This includes verifying app/link name, icon, clickability, and navigation to app/link details.
 *
 * Use this component in Playwright tests to interact with and assert on app and link-specific search results.
 */
export class AppsAndLinkContainerComponent extends BaseComponent {
  readonly appName: Locator;
  readonly appImg: Locator;
  readonly appLink: Locator;
  readonly linkImg: Locator;
  // App autocomplete locators
  readonly autocompleteAppName: Locator;
  readonly autocompleteAppIcon: Locator;

  constructor(page: Page, rootLocator: Locator) {
    super(page, rootLocator);
    // Root locator is the anchor element, so we can directly locate img and h3 within it
    this.appName = this.rootLocator.locator('h3');
    this.appImg = this.rootLocator.locator('img');
    this.appLink = this.rootLocator;
    this.linkImg = this.rootLocator.getByTestId('i-link');
    // App autocomplete locators - for autocomplete items, app name is in 'p' tag and icon is in 'img' tag
    this.autocompleteAppName = this.rootLocator.locator('p');
    this.autocompleteAppIcon = this.rootLocator.locator('img');
  }
  /**
   * Creates a URL matcher function for normalized comparison
   * @param expectedUrl - The expected URL to match against
   * @returns A function that can be used with waitForURL
   */
  private createUrlMatcher(expectedUrl: string) {
    const normalizeUrl = (url: string): string => {
      // Remove trailing slash
      let normalized = url.replace(/\/$/, '');
      // Remove www. prefix for comparison
      normalized = normalized.replace(/^https?:\/\/www\./, 'https://');
      return normalized;
    };

    const normalizedExpected = normalizeUrl(expectedUrl);
    return (url: URL) => {
      const normalizedActual = normalizeUrl(url.toString());
      return normalizedActual === normalizedExpected;
    };
  }

  /**
   * Verifies that the app name is displayed in the search results
   * @param expectedName - The expected app name to verify
   */
  async verifyAppNameIsDisplayed(expectedName: string) {
    await test.step(`Verifying app name "${expectedName}" is displayed`, async () => {
      await this.verifier.verifyElementHasText(this.appName, expectedName);
    });
  }

  /**
   * Verifies that the app icon is displayed in the search results
   */
  async verifyAppIconIsDisplayed() {
    await test.step('Verifying app icon is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.appImg);
    });
  }

  /**
   * Verifies that the link icon is displayed in the search results
   */
  async verifyLinkIconIsDisplayed() {
    await test.step('Verifying link icon is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.linkImg);
    });
  }

  /**
   * Verifies that the app icon has the correct src attribute
   * @param expectedSrc - The expected image source URL
   */
  async verifyAppIconSrc(expectedSrc: string) {
    await test.step(`Verifying app icon has correct src "${expectedSrc}"`, async () => {
      await this.verifier.verifyElementHasAttribute(this.appImg, 'src', expectedSrc, {
        assertionMessage: `App icon does not have expected src. Expected: ${expectedSrc}`,
      });
    });
  }

  /**
   * Verifies that the app link has the correct href attribute
   * @param expectedHref - The expected href URL
   */
  async verifyAppLinkHref(expectedHref: string) {
    await test.step(`Verifying app link has correct href "${expectedHref}"`, async () => {
      await this.verifier.verifyElementHasAttribute(this.appLink, 'href', expectedHref, {
        assertionMessage: `App link does not have expected href. Expected: ${expectedHref}`,
      });
    });
  }

  /**
   * Verifies that the app name is clickable and navigates to the app's details page
   * @param expectedUrl - The expected URL to navigate to
   */
  async verifyAppNameIsClickable(expectedUrl: string) {
    await test.step(`Verifying app name is clickable and navigates to "${expectedUrl}"`, async () => {
      // Use the utility method for cleaner navigation handling
      await this.performActionAndWaitForPageNavigation(() => this.clickOnElement(this.appName), expectedUrl, {
        timeout: TIMEOUTS.MEDIUM,
        stepInfo: `Clicking on app name should navigate to "${expectedUrl}"`,
      });
    });
  }

  /**
   * Verifies that the app link opens in a new tab/window
   * @param expectedUrl - The expected URL to navigate to
   * @param options - Optional parameters including stepInfo
   */
  async verifyAppLinkOpensInNewTab(expectedUrl: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verifying app link opens in new tab with URL "${expectedUrl}"`, async () => {
      // Click on the app link and wait for new page to open
      const newPage = await this.clickAndWaitForNewPageToOpen(() => this.clickOnElement(this.appLink), {
        timeout: TIMEOUTS.MEDIUM,
        stepInfo: `Clicking on app link should open new page`,
      });

      // Wait for the new page to navigate to the expected URL
      await newPage.waitForURL(this.createUrlMatcher(expectedUrl), { timeout: TIMEOUTS.MEDIUM });

      // Keep focus on original tab
      await this.page.bringToFront();
    });
  }

  /**
   * Verifies that the app link has the specified target attribute
   * @param expectedTarget - The expected target value (defaults to "_blank")
   */
  async verifyAppLinkTarget(expectedTarget: string = '_blank') {
    await test.step(`Verifying app link has target="${expectedTarget}"`, async () => {
      await this.verifier.verifyElementHasAttribute(this.appLink, 'target', expectedTarget, {
        assertionMessage: `App link does not have target="${expectedTarget}"`,
      });
    });
  }

  /**
   * Verifies that the app link has the specified rel attribute
   * @param expectedRel - The expected rel value (defaults to "noreferrer")
   */
  async verifyAppLinkRel(expectedRel: string = 'noreferrer') {
    await test.step(`Verifying app link has rel="${expectedRel}"`, async () => {
      await this.verifier.verifyElementHasAttribute(this.appLink, 'rel', expectedRel, {
        assertionMessage: `App link does not have rel="${expectedRel}"`,
      });
    });
  }

  /**
   * Comprehensive verification of all app attributes
   * @param params - Object containing verification parameters
   * @param params.expectedName - The expected app name
   * @param params.expectedUrl - The expected app URL
   * @param params.expectedIconSrc - The expected icon source URL (optional)
   * @param params.validateLinkIcon - Whether to validate the link icon is displayed (defaults to false)
   */
  async verifyAllAppAttributes(params: {
    expectedName: string;
    expectedUrl: string;
    expectedIconSrc?: string;
    validateLinkIcon?: boolean;
  }) {
    const { expectedName, expectedUrl, expectedIconSrc, validateLinkIcon = false } = params;
    await test.step(`Comprehensive verification of app "${expectedName}" attributes`, async () => {
      // Verify app name
      await this.verifyAppNameIsDisplayed(expectedName);

      //Verify link icon if requested
      if (validateLinkIcon) {
        await this.verifyLinkIconIsDisplayed();
      } else {
        await this.verifyAppIconIsDisplayed();

        if (expectedIconSrc) {
          await this.verifyAppIconSrc(expectedIconSrc);
        }

        // Verify app link attributes
        await this.verifyAppLinkHref(expectedUrl);
        await this.verifyAppLinkTarget();
        await this.verifyAppLinkRel();
      }
    });
  }

  /**
   * Verifies that the app name is visible in autocomplete
   * @param expectedName - The expected app name to verify
   * @param options - Optional parameters including stepInfo
   */
  async verifyAppNameIsVisibleInAutocomplete(expectedName: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(
      options?.stepInfo || `Verifying app name "${expectedName}" is visible in autocomplete`,
      async () => {
        await this.verifier.verifyTheElementIsVisible(this.autocompleteAppName, {
          timeout: 20000,
          assertionMessage: `Verifying app name "${expectedName}" is visible in autocomplete`,
        });
        await this.verifier.verifyElementHasText(this.autocompleteAppName, expectedName, {
          timeout: 20000,
          assertionMessage: `Verifying app name "${expectedName}" is displayed in autocomplete`,
        });
      }
    );
  }

  /**
   * Verifies that the app icon is displayed in autocomplete
   * @param expectedIconSrc - The expected icon source URL
   * @param options - Optional parameters including stepInfo
   */
  async verifyIconIsDisplayedInAutocomplete(expectedIconSrc: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(
      options?.stepInfo || `Verifying app icon is displayed in autocomplete with src "${expectedIconSrc}"`,
      async () => {
        await this.verifier.verifyElementHasAttribute(this.autocompleteAppIcon, 'src', expectedIconSrc, {
          timeout: 20000,
          assertionMessage: `Verifying app icon is displayed in autocomplete with src "${expectedIconSrc}"`,
        });
      }
    );
  }
}
