import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '../../../core/components/baseComponent';
import { TIMEOUTS } from '../../../core/constants/timeouts';

/**
 * AppContainerComponent is a UI component class that extends BaseComponent.
 *
 * It encapsulates interactions and assertions for app search result items that are displayed
 * above the normal search results in the global search results page.
 * The root locator is an anchor element that contains an img (icon) and h3 (name).
 * This includes verifying app name, icon, clickability, and navigation to app details.
 *
 * Use this component in Playwright tests to interact with and assert on app-specific search results.
 */
export class AppContainerComponent extends BaseComponent {
  readonly appName: Locator;
  readonly appImg: Locator;
  readonly appLink: Locator;

  constructor(page: Page, rootLocator: Locator) {
    super(page, rootLocator);
    // Root locator is the anchor element, so we can directly locate img and h3 within it
    this.appName = this.rootLocator.locator('h3');
    this.appImg = this.rootLocator.locator('img');
    this.appLink = this.rootLocator; // The root locator itself is the anchor element
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
   */
  async verifyAppLinkOpensInNewTab(expectedUrl: string) {
    await test.step(`Verifying app link opens in new tab with URL "${expectedUrl}"`, async () => {
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
   * @param expectedName - The expected app name
   * @param expectedUrl - The expected app URL
   * @param expectedIconSrc - The expected icon source URL
   */
  async verifyAllAppAttributes(expectedName: string, expectedUrl: string, expectedIconSrc: string) {
    await test.step(`Comprehensive verification of app "${expectedName}" attributes`, async () => {
      // Verify app name
      await this.verifyAppNameIsDisplayed(expectedName);

      // Verify app icon
      await this.verifyAppIconIsDisplayed();
      await this.verifyAppIconSrc(expectedIconSrc);

      // Verify app link attributes
      await this.verifyAppLinkHref(expectedUrl);
      await this.verifyAppLinkTarget();
      await this.verifyAppLinkRel();
    });
  }
}
