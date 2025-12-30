import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IManageApplicationPageActions {
  navigateToClientApplicationPage: () => Promise<void>;
  enterTextInClientApplicationField: (text: string, field: string) => Promise<void>;
  clickOnAddClientApp: () => Promise<void>;
  clickOnSave: () => Promise<void>;
  mouseHoverOnOptionMenuAndClickOption: (option: 'Edit' | 'Delete') => Promise<void>;
  deleteAllAddedClientApps: () => Promise<void>;
  waitForClientApplicationHeading: () => Promise<void>;
  clickOnElementWithTagAndText: (tag: string, text: string) => Promise<void>;
}

export interface IManageApplicationPageAssertions {
  verifyThePresenceOfFieldWithHtmlTagAndText: (tag: string, text: string) => Promise<void>;
  verifyTheDisplayOfMessageWithText: (message: string) => Promise<void>;
}

export class ManageApplicationPage extends BasePage {
  readonly clientApplicationHeading: Locator;
  readonly addClientAppButton: Locator;
  readonly clientApplicationNameInput: Locator;
  readonly clientApplicationIdInput: Locator;
  readonly clientApplicationDescriptionTextarea: Locator;
  readonly clientRedirectUrlInput: Locator;
  readonly saveButton: Locator;
  readonly optionsMenu: Locator;
  readonly addedClientApplicationRows: Locator;

  constructor(page: Page, pageUrl?: string) {
    super(page, pageUrl);
    this.clientApplicationHeading = page.locator('h3:has-text("Client application")');
    this.addClientAppButton = page.locator('span:has-text("Add client app")');
    this.clientApplicationNameInput = page.locator('#app_disp_name');
    this.clientApplicationIdInput = page.locator('#app_id');
    this.clientApplicationDescriptionTextarea = page.locator('textarea[name="app_desc"]');
    this.clientRedirectUrlInput = page.locator('#redirect_uri');
    this.saveButton = page.locator('button:has-text("Save")');
    this.optionsMenu = page.locator('(//*[contains(@class,"OptionsMenu-iconContainer")])[1]');
    this.addedClientApplicationRows = page.locator('li[class*="istingItem--borderLastChild"]');
  }

  get actions(): IManageApplicationPageActions {
    return this;
  }

  get assertions(): IManageApplicationPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the manage application page is loaded', async () => {
      await this.verifier.waitUntilElementIsVisible(this.clientApplicationHeading, {
        timeout: 10000,
      });
    });
  }

  async navigateToClientApplicationPage(): Promise<void> {
    await test.step('Navigate to client application page', async () => {
      const zuluUrl = process.env.ZULU_URL;
      const currentUrl = this.page.url();
      const path = 'manage/app/integrations/clientapp';

      if (zuluUrl && currentUrl.includes('zulu')) {
        await this.goToUrl(`${zuluUrl}/${path}`);
      } else {
        await this.goToUrl(path);
      }
      await this.waitForClientApplicationHeading();
    });
  }

  async waitForClientApplicationHeading(): Promise<void> {
    await test.step('Wait for Client application heading', async () => {
      await this.verifier.waitUntilElementIsVisible(this.clientApplicationHeading, {
        timeout: 10000,
      });
    });
  }

  async clickOnElementWithTagAndText(tag: string, text: string): Promise<void> {
    await test.step(`Click on ${tag} element with text "${text}"`, async () => {
      const locator = this.page.locator(`${tag}:has-text("${text}")`).first();
      await this.clickOnElement(locator, {
        stepInfo: `Click on ${tag} with text "${text}"`,
      });
    });
  }

  async clickOnAddClientApp(): Promise<void> {
    await test.step('Click on Add client app button', async () => {
      await this.clickOnElement(this.addClientAppButton, {
        stepInfo: 'Click on Add client app button',
      });
    });
  }

  async enterTextInClientApplicationField(text: string, field: string): Promise<void> {
    await test.step(`Enter "${text}" in ${field}`, async () => {
      let locator: Locator;

      switch (field) {
        case 'Client application name':
          locator = this.clientApplicationNameInput;
          break;
        case 'Client application id':
          locator = this.clientApplicationIdInput;
          break;
        case 'Client application description':
          locator = this.clientApplicationDescriptionTextarea;
          break;
        case 'Client redirect URL':
          locator = this.clientRedirectUrlInput;
          break;
        default:
          throw new Error(`Unknown field: ${field}`);
      }

      await this.verifier.waitUntilElementIsVisible(locator, { timeout: 10000 });
      await this.fillInElement(locator, text, {
        stepInfo: `Enter ${text} in ${field}`,
      });
    });
  }

  async clickOnSave(): Promise<void> {
    await test.step('Scroll and click on Save button', async () => {
      await this.saveButton.scrollIntoViewIfNeeded();
      await this.clickOnElement(this.saveButton, {
        stepInfo: 'Click on Save button',
      });
    });
  }

  async mouseHoverOnOptionMenuAndClickOption(option: 'Edit' | 'Delete'): Promise<void> {
    await test.step(`Mouse hover on OptionMenu and click on ${option}`, async () => {
      await this.verifier.waitUntilElementIsVisible(this.optionsMenu, { timeout: 10000 });
      await this.optionsMenu.scrollIntoViewIfNeeded();
      await this.optionsMenu.hover();

      const optionButton = this.page.locator(`button:has-text("${option}")`).first();
      await this.verifier.waitUntilElementIsVisible(optionButton, { timeout: 5000 });
      await this.clickOnElement(optionButton, {
        stepInfo: `Click on ${option} option`,
      });
    });
  }

  async deleteAllAddedClientApps(): Promise<void> {
    await test.step('Delete all added client apps', async () => {
      let count = 0;
      const maxAttempts = 10;
      await this.page.waitForTimeout(1000);
      const rows = this.addedClientApplicationRows;
      const rowCount = await rows.count();

      while (rowCount > 1 && count < maxAttempts) {
        const currentCount = await rows.count();
        if (currentCount <= 1) {
          break;
        }
        await this.mouseHoverOnOptionMenuAndClickOption('Delete');
        await this.verifyTheDisplayOfMessageWithText('Client application deleted successfully');
        await this.page.waitForTimeout(1000);
        count++;
      }
    });
  }

  async verifyThePresenceOfFieldWithHtmlTagAndText(tag: string, text: string): Promise<void> {
    await test.step(`Verify presence of ${tag} element with text "${text}"`, async () => {
      const locator = this.page.locator(`${tag}:has-text("${text}")`).first();
      await this.verifier.verifyTheElementIsVisible(locator);
    });
  }

  async verifyTheDisplayOfMessageWithText(message: string): Promise<void> {
    await test.step(`Verify display of message: "${message}"`, async () => {
      const messageLocator = this.page.locator(`p:has-text("${message}")`).first();
      await this.verifier.verifyTheElementIsVisible(messageLocator, { timeout: 10000 });
    });
  }
}
