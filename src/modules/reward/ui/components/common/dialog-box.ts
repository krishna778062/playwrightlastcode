import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class DialogBox extends BaseComponent {
  readonly container: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;
  readonly description: Locator;
  readonly descriptionText: Locator;
  readonly inputBox: Locator;
  readonly inputBoxError: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly skipButton: Locator;
  readonly shareToFeedCheckBox: Locator;
  readonly homeFeedRadioButton: Locator;
  readonly siteFeedRadioButton: Locator;
  readonly shareButton: Locator;
  readonly shareToSlackCheckBox: Locator;
  readonly siteFeedTextBox: Locator;
  readonly menuOptionShareModal: Locator;
  readonly menuLoadingContainer: Locator;
  readonly shareButtonOnShareModal: Locator;

  /**
   * This is a dialog box class that contains locators and methods for the dialog box.
   * @param { Page } page - The page object from Playwright
   */
  constructor(page: Page) {
    super(page);
    this.container = page.locator('[role="dialog"][data-state="open"]');
    this.title = this.container.getByRole('heading');
    this.closeButton = this.container.getByRole('button', { name: 'Close' });
    this.description = this.container.locator('p[class*="paragraph"]');
    this.descriptionText = this.container.locator('div[class^="TypographyBody-module__wrapper"] p');
    this.inputBox = this.container.locator('input[type="text"]');
    this.inputBoxError = this.container.locator('div[class*="Field-module__error"] p');
    this.confirmButton = this.container.getByRole('button').last();
    this.cancelButton = this.container.getByRole('button', { name: 'Cancel' });
    this.skipButton = this.container.getByRole('button', { name: 'Skip' });
    this.shareButton = this.container.getByRole('button', { name: 'Share' });
    this.menuLoadingContainer = page.locator('div[class*="loadingContainer"]');

    // Share recognition specific dialog elements
    this.homeFeedRadioButton = page.locator('#feedNamehome');
    this.siteFeedRadioButton = page.locator('#feedNamesite');
    this.siteFeedTextBox = page.locator('input[aria-autocomplete="list"]');
    this.shareToFeedCheckBox = page.locator('#shareToFeedAndSlack_shareToFeed');
    this.shareToSlackCheckBox = page.locator('#shareToFeedAndSlack_shareToSlack');
    this.menuOptionShareModal = page.locator('[role="dialog"][role="menuitem"]');
    this.shareButtonOnShareModal = page.locator('[role="dialog"]').getByRole('button', { name: 'Share' });
  }
}
