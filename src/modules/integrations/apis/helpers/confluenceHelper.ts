import test, { expect, Locator, Page } from '@playwright/test';
import * as OTPAuth from 'otpauth';

import { GlobalSearchResultPage } from '@/src/modules/global-search/ui/pages/globalSearchResultPage';

const CONFLUENCE_CREDENTIALS = {
  username: 'developer@simpplr.com',
  password: 'Long@beach@8715',
  totpSecret: 'MATF2NBPEISVYVJ7JBVVETLGLZFXAYDH',
};

const confluenceTotp = new OTPAuth.TOTP({
  issuer: 'Atlassian',
  label: CONFLUENCE_CREDENTIALS.username,
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  secret: CONFLUENCE_CREDENTIALS.totpSecret,
});

export class ConfluenceHelper {
  private readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly twoFactorCodeInput: Locator;
  private readonly verifyButton: Locator;
  private readonly acceptButton: Locator;
  private readonly spaceDropdown: Locator;
  private readonly typeDropdown: Locator;
  private readonly contributorDropdown: Locator;
  private readonly lastModifiedDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-testid="username"]');
    this.passwordInput = page.locator('[data-testid="password"]');
    this.loginButton = page.locator('[data-testid="login-submit-idf-testid"]');
    this.twoFactorCodeInput = page.locator('#two-step-verification-otp-code-input');
    this.verifyButton = page.getByRole('button', { name: 'Verify' });
    this.acceptButton = page.locator('button[type="submit"]');

    this.contributorDropdown = page.locator('h3:has-text("Contributor")');
    this.lastModifiedDropdown = page.locator('h3:has-text("Last modified")');
    this.typeDropdown = page.locator('h3:has-text("Type")');
    this.spaceDropdown = page.locator('h3:has-text("Space")');
  }

  private generateTOTP(): string {
    return confluenceTotp.generate();
  }

  private async verifyIncorrectCredentials(): Promise<void> {
    await test.step('Verify incorrect credentials error message is visible', async () => {
      const errorMessage = this.page.locator('text=Incorrect email address and/or password');
      await expect(errorMessage).toBeVisible();
    });
  }

  async handleConfluenceLogin(incorrectCredentials: boolean = false): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    if (await this.acceptButton.isVisible({ timeout: 10000 })) {
      await this.acceptButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    }

    if (!(await this.usernameInput.isVisible({ timeout: 10000 }))) {
      return;
    }

    await this.usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.usernameInput.fill(CONFLUENCE_CREDENTIALS.username);
    await this.loginButton.click();

    await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.passwordInput.fill(incorrectCredentials ? 'incorrectpassword' : CONFLUENCE_CREDENTIALS.password);
    await this.loginButton.click();

    if (incorrectCredentials) {
      await this.verifyIncorrectCredentials();
      return;
    }
    await this.page.waitForLoadState('domcontentloaded');

    const otpCode = this.generateTOTP();
    await this.twoFactorCodeInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.twoFactorCodeInput.fill(otpCode);

    await this.page.waitForLoadState('domcontentloaded');

    await this.acceptButton.waitFor({ state: 'visible', timeout: 30000 });
    await this.acceptButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickConfluenceKnowledgeBaseInSearchResults(
    knowledgeBaseName: string,
    globalSearchResultPage: GlobalSearchResultPage
  ): Promise<void> {
    await test.step('Click confluence knowledge base name in search results', async () => {
      await globalSearchResultPage.verifyThePageIsLoaded();
      await globalSearchResultPage.page.locator(`span:has-text("${knowledgeBaseName}")`).first().click();
    });
  }

  async verifyConfluenceKnowledgeBaseNameInSearchResults(
    knowledgeBaseName: string,
    globalSearchResultPage: GlobalSearchResultPage
  ): Promise<void> {
    await test.step('Verify confluence knowledge base name in search results', async () => {
      await globalSearchResultPage.verifyThePageIsLoaded();
      await globalSearchResultPage.page.waitForSelector(`span:has-text("${knowledgeBaseName}")`, {
        state: 'visible',
        timeout: 30000,
      });
      const knowledgeBaseNameInSearchResults = globalSearchResultPage.page.locator(
        `span:has-text("${knowledgeBaseName}")`
      );
      await expect(knowledgeBaseNameInSearchResults.first()).toBeVisible();
    });
  }
}
