import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';
import { Page, Locator } from '@playwright/test';
import { TopNavBarComponent } from '@core/components/topNavBarComponent';
import { SideNavBarComponent } from '@core/components/sideNavBarComponent';
import { TIMEOUTS } from '@core/constants/timeouts';
import { FooterComponent } from '@core/components/footerComponent';
import { HomePageActionHelper } from '@core/helpers/homePageActionHelper';
import { HomePageAssertionHelper } from '@core/helpers/homePageAssertionHelper';
import { getEnvConfig } from '../../utils/getEnvConfig';

export class HomePage extends BasePage<HomePageActionHelper, HomePageAssertionHelper> {
  readonly topNavBarComponent: TopNavBarComponent;
  readonly sideNavBarComponent: SideNavBarComponent;
  readonly footer: FooterComponent;

  // Navigation locators
  private readonly feedLink: Locator;
  private readonly homeLink: Locator;

  //actions
  readonly homeActionHelper: HomePageActionHelper;

  //assertions
  readonly homeAssertionHelper: HomePageAssertionHelper;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.topNavBarComponent = new TopNavBarComponent(page);
    this.sideNavBarComponent = new SideNavBarComponent(page);
    this.footer = new FooterComponent(page, this.page.locator('#site-footer'));
    this.homeActionHelper = new HomePageActionHelper(this, getEnvConfig().newUxEnabled);
    this.homeAssertionHelper = new HomePageAssertionHelper(this, getEnvConfig().newUxEnabled);

    // Initialize navigation locators
    this.feedLink = page.locator("p:has-text('Feed')");
    this.homeLink = page.locator("p:has-text('Home')");
  }

  async clickOnFeedLink(): Promise<void> {
    await this.clickOnElement(this.feedLink);
  }

  async clickOnHomeLink(): Promise<void> {
    await this.clickOnElement(this.homeLink);
  }

  async isFeedLinkVisible(): Promise<boolean> {
    return await this.feedLink.isVisible();
  }

  get actions(): HomePageActionHelper {
    return this.homeActionHelper;
  }
  get assertions(): HomePageAssertionHelper {
    return this.homeAssertionHelper;
  }

  getSideNavBarComponent(): SideNavBarComponent {
    return this.sideNavBarComponent;
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

