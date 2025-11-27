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

  constructor(page: Page) {
    super(page);
    this.createSection = page.getByRole('button', { name: 'Create', exact: true });
    this.feedLink = page.locator('p', { hasText: 'Feed' });
    this.homeLink = page.locator('p:text-is("Home")');
    this.sitesButton = page.getByRole('button', { name: 'Sites' });
    this.navigateOnApplication = page.getByRole('menuitem', { name: 'Application settings', exact: true });
    this.clickOnManageFeature = page.locator('[aria-label="Manage features"]').first();
    this.clickOnFeedSideMenu = this.page.getByTestId('icon-test').nth(1);
    this.rolesButton = page.getByRole('menuitem', { name: 'Roles' });
    this.clickingOnHome = page.getByRole('menuitem', { name: 'User mode' });

    //analytics section
    this.analyticsButton = page.getByRole('menuitem', { name: 'Analytics', exact: true });
    this.appAnalyticsButton = page.getByRole('menuitem', { name: 'App', exact: true });
    this.campaignsButton = page.getByRole('menuitem', { name: 'Campaigns', exact: true });
    this.recognitionButton = page.getByRole('menuitem', { name: 'Recognition', exact: true });

    //application settings section
    this.applicationSettings = page.getByRole('menuitem', { name: 'Application settings', exact: true });
    this.manageAppSetupButton = page.getByRole('menuitem', { name: 'Application', exact: true });
    this.manageAccountButton = page.getByRole('menuitem', { name: 'Account', exact: true });
    this.manageAppsAndLinksButton = page.getByRole('menuitem', { name: 'Apps & links', exact: true });
    this.manageCompanyValuesButton = page.getByRole('menuitem', { name: 'Company values ', exact: true });
    this.manageExpertiseButton = page.getByRole('menuitem', { name: 'Expertise', exact: true });
    this.manageHomeDefaultsButton = page.getByRole('menuitem', { name: 'Home defaults', exact: true });
    this.managePerceptionThemesButton = page.getByRole('menuitem', { name: 'Perception themes', exact: true });
    this.manageTopicsButton = page.getByRole('menuitem', { name: 'Topics', exact: true });
    this.manageAudiencesButton = page.getByRole('menuitem', { name: 'Audiences', exact: true });
    this.manageRolesButton = page.getByRole('menuitem', { name: 'Roles', exact: true });
    this.manageSubscriptionsButton = page.getByRole('menuitem', { name: 'Subscriptions', exact: true });
    this.manageUsersButton = page.getByRole('menuitem', { name: 'Users', exact: true });

    this.socialCampaignsElement = page.locator('p', { hasText: 'Social campaigns' });
    this.moreElement = page.locator('p', { hasText: 'More' });
    this.favoritePeopleSection = page.locator('p', { hasText: 'Favorites' });
    this.orgChartButton = page.getByRole('menuitem', { name: 'Org chart Org chart' });
    this.peopleButton = page.getByRole('menuitem', { name: 'People People' });
    this.peopleButton = page.getByRole('menuitem', { name: 'People People' });
    this.favoriteButton = page.getByRole('menuitem', { name: 'Favorites Favorites' });

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
      if (await this.verifier.isTheElementVisible(this.feedLink)) {
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
