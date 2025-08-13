import { Page, test } from '@playwright/test';

import { FooterComponent } from '@core/components/footerComponent';
import { SideNavBarComponent } from '@core/components/sideNavBarComponent';
import { TopNavBarComponent } from '@core/components/topNavBarComponent';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';

import { BasePage } from '@/src/core/pages/basePage';
import { AddContentModalComponent } from '@/src/modules/content/components/addContentModal';
import { CreateComponent } from '@/src/modules/content/components/createComponent';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { AlbumCreationPage } from '@/src/modules/content/pages/albumCreationPage';
import { EventCreationPage } from '@/src/modules/content/pages/eventCreationPage';
import { FeedPage } from '@/src/modules/content/pages/feedPage';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';
import { SiteCreationPage } from '@/src/modules/content/pages/siteCreationPage';
import { GlobalSearchResultPage } from '@/src/modules/global-search/pages/globalSearchResultPage';

export interface ICommonHomePageActions {
  searchForTerm: (searchTerm: string, options?: { stepInfo?: string }) => Promise<GlobalSearchResultPage>;
  clickOnGlobalFeed: (options?: { stepInfo?: string }) => Promise<void>;
  openSiteCreationForm: (options?: { stepInfo?: string }) => Promise<SiteCreationPage>;
}

export interface IOldUxHomePageActions extends ICommonHomePageActions {
  clickOnCreateContentButtonOnTopNavBar: (options?: { stepInfo?: string }) => Promise<AddContentModalComponent>;
  openCreateContentPageForContentType: (
    contentType: ContentType,
    options?: { stepInfo?: string }
  ) => Promise<PageCreationPage | AlbumCreationPage | EventCreationPage>;
}

export interface INewUxHomePageActions extends ICommonHomePageActions {
  clickOnCreateButtonOnSideNavBar: (options?: { stepInfo?: string }) => Promise<CreateComponent>;
  openCreateContentPageForContentType: (
    contentType: ContentType,
    options?: { stepInfo?: string }
  ) => Promise<PageCreationPage | AlbumCreationPage | EventCreationPage>;
}

export abstract class BaseHomePage extends BasePage implements ICommonHomePageActions {
  //components
  readonly topNavBarComponent: TopNavBarComponent;
  readonly sideNavBarComponent: SideNavBarComponent;
  readonly footer: FooterComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.topNavBarComponent = new TopNavBarComponent(page);
    this.sideNavBarComponent = new SideNavBarComponent(page);
    this.footer = new FooterComponent(page, this.page.locator('#site-footer'));
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
    await test.step('Verify the home page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.topNavBarComponent.profileSettingsButton, {
        timeout: options?.timeout || TIMEOUTS.MEDIUM,
        assertionMessage: `expecting messaging button to be visible`,
      });
    });
  }

  /**
   * Searches for a term in the global search
   * @param searchTerm - The term to search for
   * @param options - The options to pass to the method
   * @param options.stepInfo - The step info to pass to the test.step method
   * @returns The global search result page
   */
  async searchForTerm(searchTerm: string, options?: { stepInfo?: string }): Promise<GlobalSearchResultPage> {
    return await test.step(options?.stepInfo || `Searching for ${searchTerm}`, async () => {
      await this.topNavBarComponent.typeInSearchBarInput(searchTerm);
      await this.topNavBarComponent.clickSearchButton();
      return new GlobalSearchResultPage(this.page);
    });
  }

  /**
   * Clicks on the global feed link in the navigation
   * @param options - The options to pass to the method
   * @param options.stepInfo - The step info to pass to the test.step method
   */
  async clickOnGlobalFeed(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Clicking on global feed', async () => {
      await this.sideNavBarComponent.clickOnGlobalFeed();
    });
  }

  /**
   * Opens site creation modal - implementation varies between UX versions
   * @param options - The options to pass to the method
   * @param options.stepInfo - The step info to pass to the test.step method
   * @returns The site creation modal component
   */
  abstract openSiteCreationForm(options?: { stepInfo?: string }): Promise<SiteCreationPage>;
}
