import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';
import { Page, Locator } from '@playwright/test';
import { TopNavBarComponent } from '@core/components/topNavBarComponent';
import { TIMEOUTS } from '@core/constants/timeouts';
import { FooterComponent } from '@core/components/footerComponent';
import { HomePageActionHelper } from '@core/helpers/homePageActionHelper';
import { HomePageAssertionHelper } from '@core/helpers/homePageAssertionHelper';
import { getEnvConfig } from '../../utils/getEnvConfig';

export class HomePage extends BasePage<HomePageActionHelper, HomePageAssertionHelper> {
  readonly topNavBarComponent: TopNavBarComponent;
  readonly footer: FooterComponent;

  //actions
  readonly homeActionHelper: HomePageActionHelper;

  //assertions
  readonly homeAssertionHelper: HomePageAssertionHelper;
  constructor(page: Page, readonly newUxEnabled: boolean = getEnvConfig().newUxEnabled) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.topNavBarComponent = new TopNavBarComponent(page);
    this.footer = new FooterComponent(page, this.page.locator('#site-footer'));
    this.homeActionHelper = new HomePageActionHelper(this, this.newUxEnabled);
    this.homeAssertionHelper = new HomePageAssertionHelper(this, this.newUxEnabled);
  }

  get actions(): HomePageActionHelper {
    return this.homeActionHelper;
  }
  get assertions(): HomePageAssertionHelper {
    return this.homeAssertionHelper;
  }

  getTopNavBarComponent(): TopNavBarComponent {
    return this.topNavBarComponent;
  }

  getFooterComponent(): FooterComponent {
    return this.footer;
  }

  /**
   * Verifies the home page is loaded
   */
  async verifyThePageIsLoaded(options?: { timeout?: number }): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.topNavBarComponent.profileSettingsButton, {
      timeout: options?.timeout || TIMEOUTS.MEDIUM,
      assertionMessage: `expecting messaging button to be visible`,
    });
  }

 
}

