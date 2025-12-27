import { expect, Locator, Page, test } from '@playwright/test';

import { ApplicationSettingsOption } from '../types/navigation.types';

import type { TestOptions } from '@/src/core/types/test.types';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class SideNavBarComponent extends BaseComponent {
  readonly createSection: Locator;
  readonly feedLink: Locator;
  readonly homeLink: Locator;
  readonly orgChartButton: Locator;

  readonly sitesButton: Locator;
  readonly navigateOnApplication: Locator;

  readonly rolesButton: Locator;
  readonly clickOnManageFeature: Locator;
  readonly clickOnFeedSideMenu: Locator;
  readonly clickingOnHome: Locator;
  readonly favoritePeopleSection: Locator;
  //analytics section
  readonly analyticsButton: Locator;
  readonly appAnalyticsButton: Locator;
  readonly campaignsButton: Locator;
  readonly recognitionButton: Locator;

  //application settings section
  readonly applicationSettings: Locator;
  readonly manageAppSetupButton: Locator;
  readonly manageAccountButton: Locator;
  readonly manageAppsAndLinksButton: Locator;
  readonly manageCompanyValuesButton: Locator;
  readonly manageExpertiseButton: Locator;
  readonly manageHomeDefaultsButton: Locator;
  readonly managePerceptionThemesButton: Locator;
  readonly manageTopicsButton: Locator;
  readonly manageAudiencesButton: Locator;
  readonly manageRolesButton: Locator;
  readonly manageSubscriptionsButton: Locator;
  readonly manageUsersButton: Locator;
  readonly peopleButton: Locator;

  //social campaigns section
  readonly socialCampaignsElement: Locator;
  readonly moreElement: Locator;
  readonly favoriteButton: Locator;

  //recognition section
  readonly recognitionLink: Locator;
  readonly recognitionFeature: Locator;
  readonly homeNavMenu: Locator;
  readonly manageNavMenu: Locator;

  //content moderation section
  readonly clickOnContentModeration: Locator;

  constructor(page: Page) {
    super(page);
    this.clickOnContentModeration = page.locator('[href="/manage/content-moderation"][data-testid="main-nav-item"]');
    this.createSection = page.getByRole('button', { name: 'Icon' });
    this.feedLink = page.locator('[href="/feed"][data-testid="main-nav-item"]');
    this.homeLink = page.locator('[href="/home"][data-testid="main-nav-item"]');
    this.sitesButton = page.getByRole('menuitem', { name: 'Sites' });
    this.navigateOnApplication = page.locator('[aria-label="Application settings"]');
    this.clickOnManageFeature = page.locator('[aria-label="Manage"]').first();
    this.clickOnFeedSideMenu = this.page.getByTestId('icon-test').nth(1);
    this.rolesButton = page.getByRole('menuitem', { name: 'Roles' });
    this.clickingOnHome = page.getByRole('menuitem', { name: 'User mode' });
    //analytics section
    this.analyticsButton = page.getByRole('menuitem', { name: 'Analytics', exact: true });
    this.appAnalyticsButton = page.getByRole('menuitem', { name: 'App', exact: true });
    this.campaignsButton = page.locator('[href="/manage/campaigns"][data-testid="main-nav-item"]');
    this.recognitionButton = page.locator('[href="/analytics/recognition/overview"][data-testid="main-nav-item"]');
    //application settings section
    this.applicationSettings = page.locator('[aria-label="Application settings"]');
    this.manageAppSetupButton = page.locator('[href="/manage/app/setup/general"][data-testid="main-nav-item"]');
    this.manageAccountButton = page.locator('[href="/manage/account"][data-testid="main-nav-item"]');
    this.manageAppsAndLinksButton = page.locator('[href="/manage/apps-and-links"][data-testid="main-nav-item"]');
    this.manageCompanyValuesButton = page.locator('[href="/manage/company-values"][data-testid="main-nav-item"]');
    this.manageExpertiseButton = page.locator('[href="/manage/expertise"][data-testid="main-nav-item"]');
    this.manageHomeDefaultsButton = page.locator('[href="/manage/home-defaults"][data-testid="main-nav-item"]');
    this.managePerceptionThemesButton = page.locator('[href="/manage/perception-themes"][data-testid="main-nav-item"]');
    this.manageTopicsButton = page.locator('[href="/manage/topics"][data-testid="main-nav-item"]');
    this.manageAudiencesButton = page.locator('[href="/audiences/org"][data-testid="main-nav-item"]');
    this.manageRolesButton = page.locator('[href="/manage/roles"][data-testid="main-nav-item"]');
    this.manageSubscriptionsButton = page.locator('[href="/subscriptions/org"][data-testid="main-nav-item"]');
    this.manageUsersButton = page.locator('[href="/manage/users"][data-testid="main-nav-item"]');

    this.socialCampaignsElement = page.locator('[href="/campaigns"][data-testid="main-nav-item"]');
    this.moreElement = page.locator('p', { hasText: 'More' });
    this.favoritePeopleSection = page.locator('p', { hasText: 'Favorites' });
    this.orgChartButton = page.getByRole('menuitem', { name: 'Org chart Org chart' });
    this.peopleButton = page.locator('[href="/people"][data-testid="main-nav-item"]');
    this.favoriteButton = page.getByRole('menuitem', { name: 'Favorites' });

    //recognition section
    this.recognitionLink = page.getByRole('menuitem', { name: 'Recognition Recognition' });
    this.recognitionFeature = page.getByRole('button', { name: 'Recognition' });
    this.homeNavMenu = page.getByRole('menuitem', { name: 'Home' });
    this.manageNavMenu = page.getByRole('menuitem', { name: 'Manage features Manage' });
  }

  /**
   * Clicks on the Create button in the side navigation
   * @param options - The options for the step
   */
  async clickOnCreateButton(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `side navbar: clicking Create button on side navbar`, async () => {
      await this.clickOnElement(this.createSection);
    });
  }

  /**
   * Clicks on the Global Feed button in the side navigation
   * @param options - The options for the step
   */
  async clickOnGlobalFeed(): Promise<void> {
    await test.step('side navbar: clicking Global Feed button on side navbar', async () => {
      if (await this.verifier.isTheElementVisibleWithLessTimeout(this.feedLink)) {
        await this.clickOnElement(this.feedLink);
      } else {
        await this.clickOnElement(this.homeLink);
      }
    });
  }

  /**
   * Clicks on the Sites button in the side navigation
   * @param options - The options for the step
   */
  async clickOnSites(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `side navbar: clicking Sites button on side navbar`, async () => {
      // Click on sites button using framework method
      await this.clickOnElement(this.sitesButton);
    });
  }

  /**
   * Clicks on the Home button in the side navigation
   * @param options - The options for the step
   */
  async clickOnHome(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `side navbar: clicking Home button on side navbar`, async () => {
      await this.clickOnElement(this.homeLink);
    });
  }

  /**
   * Clicks on the Application settings button in the side navigation
   * @param options - The options for the step
   */
  async clickOnApplicationSettings(options?: TestOptions): Promise<void> {
    await test.step(
      options?.stepInfo || `side navbar: clicking Application settings button on side navbar`,
      async () => {
        await this.clickOnElement(this.applicationSettings);
      }
    );
  }

  /**
   * Verifies the visibility of Roles button on the side navigation panel
   * @param visible - The visibility of the Roles button
   * @param options - The options for the step
   */
  async verifyRolesButtonVisibility(visible: boolean, options?: TestOptions): Promise<void> {
    const defaultStep = visible
      ? 'Verifying Roles button is visible in side navigation'
      : 'Verifying Roles button is not visible in side navigation';
    await test.step(options?.stepInfo || defaultStep, async () => {
      if (visible) {
        await expect(this.rolesButton).toBeVisible();
      } else {
        await expect(this.rolesButton).not.toBeVisible();
      }
    });
  }

  //--------------------------------------analytics section--------------------------------------//

  /**
   * Clicks on the Analytics button in the side navigation
   * @param options - The options for the step
   */
  async clickOnAnalyticsButton(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `side navbar: clicking Analytics button on side navbar`, async () => {
      await this.clickOnElement(this.analyticsButton);
    });
  }

  /**
   * Verifies the visibility of Analytics button on the side navigation panel
   * @param visible - The visibility of the Analytics button
   * @param options - The options for the step
   */
  async verifyAnalyticsButtonVisibility(visible: boolean, options?: TestOptions): Promise<void> {
    const defaultStep = visible
      ? 'Verifying Analytics button is visible in side navigation'
      : 'Verifying Analytics button is not visible in side navigation';
    await test.step(options?.stepInfo || defaultStep, async () => {
      if (visible) {
        await expect(this.analyticsButton, `expecting analytics button to be visible`).toBeVisible();
      } else {
        await expect(this.analyticsButton, `expecting analytics button to be not visible`).not.toBeVisible();
      }
    });
  }

  /**
   * Clicks on an application settings option in the side navigation bar
   * @param option - The option to click on
   * @param options - The options for the step
   */
  async clickOnApplicationSettingsOptionInSideBar(
    menuOption: ApplicationSettingsOption,
    options?: TestOptions
  ): Promise<void> {
    await test.step(options?.stepInfo || `side navbar: clicking ${menuOption} in application settings`, async () => {
      const optionLocator = this.page.getByTestId('main-nav').getByRole('link', { name: menuOption });
      await this.clickOnElement(optionLocator);
    });
  }

  /**
   * Opens the application settings and selects a menu option from the side navigation bar
   * @param option - The option to select
   * @param options - The options for the step
   */
  async openApplicationSettingsAndSelectMenuOptionFromSideNav(
    menuOption: ApplicationSettingsOption,
    options?: TestOptions
  ): Promise<void> {
    await test.step(
      options?.stepInfo || `side navbar: opening Application settings and selecting menu option from side navigation`,
      async () => {
        await this.clickOnElement(this.applicationSettings);
        await this.clickOnApplicationSettingsOptionInSideBar(menuOption);
      }
    );
  }

  async openAppAnalytics(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `side navbar: opening App Analytics`, async () => {
      await this.clickOnElement(this.analyticsButton);
    });
  }
  async clickOnFavoritePeopleSection(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `side navbar: clicking Favourite People Section`, async () => {
      await this.clickOnElement(this.favoritePeopleSection);
    });
  }

  async openManageCampaigns(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `side navbar: opening Manage Campaigns`, async () => {
      await this.clickOnElement(this.campaignsButton);
    });
  }

  async openRecognitionAnalytics(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `side navbar: opening Recognition Analytics`, async () => {
      await this.clickOnElement(this.recognitionButton);
    });
  }

  async clickOnOrgChartButton(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `side navbar: clicking Org chart button`, async () => {
      await this.hoverOverElementInJavaScript(this.peopleButton);
      await this.clickOnElement(this.orgChartButton);
    });
  }

  async clickOnFavorite(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `side navbar: clicking on Favorite`, async () => {
      await this.clickOnElement(this.favoriteButton);
    });
  }
  /**
   * Clicks on Recognition Link under home menu of side navigation bar
   * @param options - The options for the step
   */
  async clickRecognitionLinkUnderHomeNavMenu(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || `Clicking recognition link under home side navigation menu`, async () => {
      await this.clickOnElement(this.homeNavMenu, { stepInfo: `clicking home side navigation menu` });
      await expect(this.recognitionLink, `expecting recognition link to be visible on side bar menu`).toBeVisible();
      await this.clickOnElement(this.recognitionLink, {
        stepInfo: `clicking recognition link under home side navigation menu`,
      });
    });
  }

  /**
   * Clicks on Recognition link inside manage menu of side navigation bar
   * @param options - The options for the step
   */
  async clickRecognitionLinkInsideManageNavMenu(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Clicking recognition link inside manage side navigation menu', async () => {
      await this.clickOnElement(this.manageNavMenu, {
        stepInfo: 'Clicking manage side navigation menu',
      });
      await this.clickOnElement(this.recognitionLink, {
        stepInfo: 'Clicking recognition link inside manage side navigation menu',
      });
    });
  }

  async verifyingCreateButtonIsVisible(): Promise<void> {
    await test.step('Verifying Create button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.createSection);
    });
  }
}
