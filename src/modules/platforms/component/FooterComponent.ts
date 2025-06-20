import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '@core/components/baseComponent';
import { TIMEOUTS } from '../../../core/constants/timeouts';

export class FooterComponent extends BaseComponent{
  readonly privacyPolicyLink: Locator;


  constructor(page: Page, rootLocator: Locator) {
    super(page);
    this.privacyPolicyLink = rootLocator.getByText('Privacy policy',{exact:true});

  
  }

  /**
   * Example method: verifies the footer is visible
   */
  async verifyFooterIsVisible(): Promise<void> {
    await this.rootLocator.waitFor({ state: 'visible' });
  }
  async verifyPrivacyPolicyLinkIsVisible(): Promise<void> {
    await this.privacyPolicyLink.waitFor({ state: 'visible' });
  }
  async verifynavigationofprivacyPolicyLink(): Promise<void> {
  
    await this.clickAndWaitForNewPageToOpen(
      () => this.clickOnElement(this.privacyPolicyLink),
      { timeout: TIMEOUTS.MEDIUM ,stepInfo:'Clicking on privacy policy link should redirect to privacy policy page'}
    );
  
  }
  
} 