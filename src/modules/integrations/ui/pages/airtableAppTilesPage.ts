import { BaseAppTileComponent } from '@integrations-components/baseAppTileComponent';
import { Page } from '@playwright/test';

export class AirtableAppTilesPage {
  readonly page: Page;
  readonly airtableComponent: BaseAppTileComponent;

  constructor(page: Page) {
    this.page = page;
    this.airtableComponent = new BaseAppTileComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async loginToAirtable(email: string, password: string): Promise<void> {
    const emailInput = this.page.locator('#emailLogin');
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.clear();
    await emailInput.pressSequentially(email, { delay: 100 });
    await this.page.waitForTimeout(500);

    const continueBtn = this.page.locator('//button[.//span[text()="Continue"]]');
    await continueBtn.click();

    const passwordInput = this.page.locator('#passwordLogin');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.clear();
    await passwordInput.pressSequentially(password, { delay: 100 });
    await this.page.waitForTimeout(500);

    const signInBtn = this.page.locator('//button[@type="submit" and .//span[text()="Sign in"]]');
    await signInBtn.click();

    await this.page.getByText('Add a base').click();
    await this.page.locator('[title="Content Calendar"]').click();
    await this.page.getByRole('button', { name: 'Grant access' }).click();
  }
}
