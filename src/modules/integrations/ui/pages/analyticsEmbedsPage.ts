import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IAnalyticsEmbedsActions {
  navigateToAnalyticsEmbedsPage: () => Promise<void>;
  clickOnHotjarAnalyticsCheckbox: () => Promise<void>;
  clickOnGoogleAnalyticsCheckbox: () => Promise<void>;
  clickOnSaveButton: () => Promise<void>;
}

export interface IAnalyticsEmbedsAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyHotjarVersionShouldBeNumberOnlyErrorMessage: () => Promise<void>;
  verifyHotjarSiteIdShouldBeNumberOnlyErrorMessage: () => Promise<void>;
  verifyHotjarVersionNotEnteredErrorMessage: () => Promise<void>;
  verifyHotjarSiteIdNotEnteredErrorMessage: () => Promise<void>;
  verifyHotjarDescriptionText: () => Promise<void>;
  verifyGoogleAnalyticsDescriptionText: () => Promise<void>;
}

export class AnalyticsEmbedsPage extends BasePage implements IAnalyticsEmbedsActions, IAnalyticsEmbedsAssertions {
  readonly googleAnalyticsCheckbox: Locator;
  readonly googleAnalytics4Inputbox: Locator;
  readonly hotjarVersionInputbox: Locator;
  readonly hotjarSiteIdInputbox: Locator;
  readonly hotjarAnalyticsCheckbox: Locator;
  readonly googleAnalyticsCodeNotEnteredErrorMessage: Locator;
  readonly saveButton: Locator;
  readonly hotjarSiteIdNotEnteredErrorMessage: Locator;
  readonly hotjarVersionNotEnteredErrorMessage: Locator;
  readonly googleAnalyticsCodeShouldBeMoreThan3CharactersErrorMessage: Locator;
  readonly hotjarVersionShouldBeNumberOnlyErrorMessage: Locator;
  readonly hotjarSiteIdShouldBeNumberOnlyErrorMessage: Locator;
  readonly hotjarAnalyticsH5Text: Locator;
  readonly googleAnalyticsH5Text: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.ANALYTICS_EMBEDS_PAGE);
    this.googleAnalyticsCheckbox = page.locator('input[type="checkbox"][id="googleAnalytics4"]');
    this.googleAnalytics4Inputbox = page.locator('input[type="text"][id="trackingCode4"]');
    this.hotjarSiteIdInputbox = page.locator('input[type="text"][id="siteId"]');
    this.hotjarAnalyticsCheckbox = page.locator('input[type="checkbox"][id="hotjarTrackingEnabled"]');
    this.hotjarVersionInputbox = page.locator('input[type="text"][id="version"]');
    this.saveButton = page.locator('span:has-text("Save")');
    this.googleAnalyticsCodeNotEnteredErrorMessage = page.locator(
      'span:has-text("Tracking code ID is a required field")'
    );
    this.googleAnalyticsCodeShouldBeMoreThan3CharactersErrorMessage = page.locator(
      'span:has-text("Should be more than 3 characters")'
    );
    this.hotjarVersionShouldBeNumberOnlyErrorMessage = page.locator(
      'xpath=//label[@for="version"]/following-sibling::div[@class="Field-error"]//span[contains(text(),"Should be number only")]'
    );
    this.hotjarSiteIdShouldBeNumberOnlyErrorMessage = page.locator(
      'xpath=//label[@for="siteId"]/following-sibling::div[@class="Field-error"]//span[contains(text(),"Should be number only")]'
    );
    this.hotjarVersionNotEnteredErrorMessage = page.locator('span:has-text("Hotjar Version is a required field")');
    this.hotjarSiteIdNotEnteredErrorMessage = page.locator('span:has-text("Hotjar SiteId is a required field")');
    this.hotjarAnalyticsH5Text = page.locator(
      'h5:has-text("Monitor user behavior, identify UX issues, and improve engagement with Hotjar\'s heatmaps, recordings, and feedback tools.")'
    );
    this.googleAnalyticsH5Text = page.locator(
      'h5:has-text("Google Analytics 4 is a next-generation measurement solution.")'
    );
  }

  get actions(): IAnalyticsEmbedsActions {
    return this;
  }

  get assertions(): IAnalyticsEmbedsAssertions {
    return this;
  }

  async navigateToAnalyticsEmbedsPage(): Promise<void> {
    await test.step('Navigate to analytics & embeds integrations page', async () => {
      const url = PAGE_ENDPOINTS.ANALYTICS_EMBEDS_PAGE;
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the analytics & embeds page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.hotjarAnalyticsCheckbox, {
        timeout: 30_000,
        assertionMessage: 'Verifying that the hotjar analytics checkbox is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.googleAnalyticsCheckbox, {
        timeout: 10_000,
        assertionMessage: 'Verifying that the google analytics checkbox is visible',
      });
    });
  }

  async clickOnHotjarAnalyticsCheckbox(): Promise<void> {
    await test.step('Clicking on hotjar analytics checkbox', async () => {
      await this.hotjarAnalyticsCheckbox.click();
    });
  }

  async clickOnGoogleAnalyticsCheckbox(): Promise<void> {
    await test.step('Clicking on google analytics checkbox', async () => {
      await this.googleAnalyticsCheckbox.click();
    });
  }

  async clickOnSaveButton(): Promise<void> {
    await test.step('Clicking on save button', async () => {
      await this.saveButton.click();
    });
  }

  async verifyHotjarVersionShouldBeNumberOnlyErrorMessage(): Promise<void> {
    await test.step('Verify Hotjar Version "Should be Number only" error message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.hotjarVersionShouldBeNumberOnlyErrorMessage, {
        timeout: 10_000,
        assertionMessage: 'Verifying that Hotjar Version field shows "Should be Number only" error message',
      });
    });
  }

  async verifyHotjarSiteIdShouldBeNumberOnlyErrorMessage(): Promise<void> {
    await test.step('Verify Hotjar Site ID "Should be Number only" error message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.hotjarSiteIdShouldBeNumberOnlyErrorMessage, {
        timeout: 10_000,
        assertionMessage: 'Verifying that Hotjar Site ID field shows "Should be Number only" error message',
      });
    });
  }

  async verifyHotjarVersionNotEnteredErrorMessage(): Promise<void> {
    await test.step('Verify Hotjar Version "is a required field" error message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.hotjarVersionNotEnteredErrorMessage, {
        timeout: 10_000,
        assertionMessage:
          'Verifying that Hotjar Version field shows "Hotjar Version is a required field" error message',
      });
    });
  }

  async verifyHotjarSiteIdNotEnteredErrorMessage(): Promise<void> {
    await test.step('Verify Hotjar Site ID "is a required field" error message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.hotjarSiteIdNotEnteredErrorMessage, {
        timeout: 10_000,
        assertionMessage: 'Verifying that Hotjar Site ID field shows "Hotjar SiteId is a required field" error message',
      });
    });
  }

  async verifyHotjarDescriptionText(): Promise<void> {
    await test.step('Verify Hotjar description text is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.hotjarAnalyticsH5Text, {
        timeout: 10_000,
        assertionMessage:
          'Verifying that Hotjar description text "Monitor user behavior, identify UX issues, and improve engagement with Hotjar\'s heatmaps, recordings, and feedback tools." is visible',
      });
    });
  }

  async verifyGoogleAnalyticsDescriptionText(): Promise<void> {
    await test.step('Verify Google Analytics description text is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.googleAnalyticsH5Text, {
        timeout: 10_000,
        assertionMessage:
          'Verifying that Google Analytics description text "Google Analytics 4 is a next-generation measurement solution." is visible',
      });
    });
  }
}
