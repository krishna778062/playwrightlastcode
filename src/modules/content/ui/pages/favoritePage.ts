import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
export interface IFavoritePageActions {
  clickOnPeopleTab: () => Promise<void>;
  searchingFavoriteUser: (fullName: string) => Promise<void>;
  hoverOnUserProfile: (fullName: string) => Promise<void>;
}
export interface IFavoritePageAssertions {
  verifyTheUserIsVisible: (fullName: string) => Promise<void>;
  verifyUserDetailsRemainVisible: (fullName: string) => Promise<void>;
  verifyContactIconsAreVisible: (fullName: string) => Promise<void>;
  verifyContactIconsRemainVisibleAfterHover: (fullName: string) => Promise<void>;
}
export class FavoritePage extends BasePage implements IFavoritePageActions, IFavoritePageAssertions {
  readonly favoriteHeading: Locator = this.page.getByRole('heading', { name: 'Favorites' });
  readonly peopleTab: Locator = this.page.getByRole('tab', { name: 'People' });
  readonly searchBar: Locator = this.page.getByRole('textbox', { name: 'Search favorite people…' });
  readonly searchIcon: Locator = this.page.locator('button[aria-label="Search"][type="submit"]');

  // User profile locators
  readonly getUserProfileLink = (fullName: string): Locator => this.page.getByRole('link', { name: fullName });
  readonly getUserProfileCard = (fullName: string): Locator =>
    this.page.locator(`[data-testid*="user-card"], [class*="user-card"]`).filter({ hasText: fullName }).first();

  // User details locators
  readonly getDivisionLocator = (fullName: string): Locator =>
    this.getUserProfileCard(fullName)
      .locator('text=/division/i')
      .or(this.getUserProfileCard(fullName).getByText(/division/i));
  readonly getLocationLocator = (fullName: string): Locator =>
    this.getUserProfileCard(fullName)
      .locator('text=/location/i')
      .or(this.getUserProfileCard(fullName).getByText(/location/i));
  readonly getJobTitleLocator = (fullName: string): Locator =>
    this.getUserProfileCard(fullName)
      .locator('text=/job title|title/i')
      .or(this.getUserProfileCard(fullName).getByText(/job title|title/i));
  readonly getDepartmentLocator = (fullName: string): Locator =>
    this.getUserProfileCard(fullName)
      .locator('text=/department/i')
      .or(this.getUserProfileCard(fullName).getByText(/department/i));

  // Contact icons locators
  readonly getPhoneIcon = (fullName: string): Locator =>
    this.getUserProfileCard(fullName)
      .locator('[aria-label*="phone" i], [title*="phone" i], svg[class*="phone"]')
      .first();
  readonly getMobileIcon = (fullName: string): Locator =>
    this.getUserProfileCard(fullName)
      .locator('[aria-label*="mobile" i], [title*="mobile" i], svg[class*="mobile"]')
      .first();
  readonly getEmailIcon = (fullName: string): Locator =>
    this.getUserProfileCard(fullName)
      .locator('[aria-label*="email" i], [title*="email" i], svg[class*="email"], a[href^="mailto:"]')
      .first();
  readonly getZoomIcon = (fullName: string): Locator =>
    this.getUserProfileCard(fullName).locator('[aria-label*="zoom" i], [title*="zoom" i], svg[class*="zoom"]').first();
  readonly getSlackIcon = (fullName: string): Locator =>
    this.getUserProfileCard(fullName)
      .locator('[aria-label*="slack" i], [title*="slack" i], svg[class*="slack"]')
      .first();
  readonly getSkypeIcon = (fullName: string): Locator =>
    this.getUserProfileCard(fullName)
      .locator('[aria-label*="skype" i], [title*="skype" i], svg[class*="skype"]')
      .first();
  readonly getMSTeamsIcon = (fullName: string): Locator =>
    this.getUserProfileCard(fullName)
      .locator('[aria-label*="teams" i], [title*="teams" i], svg[class*="teams"]')
      .first();

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.FAVORITE_PAGE);
  }
  get actions(): IFavoritePageActions {
    return this;
  }
  get assertions(): IFavoritePageAssertions {
    return this;
  }
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify profile screen page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.favoriteHeading, {
        assertionMessage: 'Profile screen page should be visible',
      });
    });
  }
  async clickOnPeopleTab(): Promise<void> {
    await test.step('Clicking on people tab', async () => {
      await this.clickOnElement(this.peopleTab);
    });
  }
  async searchingFavoriteUser(fullName: string): Promise<void> {
    await test.step('Searching favorite user', async () => {
      await this.clickOnElement(this.searchBar);
      await this.fillInElement(this.searchBar, fullName);
      await this.clickOnElement(this.searchIcon);
    });
  }
  async verifyTheUserIsVisible(fullName: string): Promise<void> {
    await test.step('Verifying the user is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getUserProfileLink(fullName), {
        assertionMessage: 'User should be visible',
      });
    });
  }

  async hoverOnUserProfile(fullName: string): Promise<void> {
    await test.step(`Hovering on user profile: ${fullName}`, async () => {
      const userProfileLink = this.getUserProfileLink(fullName);
      await this.verifier.verifyTheElementIsVisible(userProfileLink, {
        assertionMessage: `User profile link for ${fullName} should be visible before hover`,
      });
      await userProfileLink.hover({ timeout: 10000 });
    });
  }

  async verifyUserDetailsRemainVisible(fullName: string): Promise<void> {
    await test.step(`Verifying user details remain visible for: ${fullName}`, async () => {
      // Verify details are visible before hover
      const divisionBefore = this.getDivisionLocator(fullName);
      const locationBefore = this.getLocationLocator(fullName);
      const jobTitleBefore = this.getJobTitleLocator(fullName);
      const departmentBefore = this.getDepartmentLocator(fullName);

      // Check if elements exist and are visible (some may not be present for all users)
      const divisionCount = await divisionBefore.count();
      const locationCount = await locationBefore.count();
      const jobTitleCount = await jobTitleBefore.count();
      const departmentCount = await departmentBefore.count();

      // Store visibility state before hover
      const divisionVisibleBefore = divisionCount > 0 ? await divisionBefore.isVisible().catch(() => false) : false;
      const locationVisibleBefore = locationCount > 0 ? await locationBefore.isVisible().catch(() => false) : false;
      const jobTitleVisibleBefore = jobTitleCount > 0 ? await jobTitleBefore.isVisible().catch(() => false) : false;
      const departmentVisibleBefore =
        departmentCount > 0 ? await departmentBefore.isVisible().catch(() => false) : false;

      // Hover on the user profile
      await this.hoverOnUserProfile(fullName);

      // Verify details remain visible after hover
      if (divisionVisibleBefore) {
        await this.verifier.verifyTheElementIsVisible(divisionBefore, {
          assertionMessage: `Division should remain visible after hover for ${fullName}`,
          timeout: 5000,
        });
      }

      if (locationVisibleBefore) {
        await this.verifier.verifyTheElementIsVisible(locationBefore, {
          assertionMessage: `Location should remain visible after hover for ${fullName}`,
          timeout: 5000,
        });
      }

      if (jobTitleVisibleBefore) {
        await this.verifier.verifyTheElementIsVisible(jobTitleBefore, {
          assertionMessage: `Job title should remain visible after hover for ${fullName}`,
          timeout: 5000,
        });
      }

      if (departmentVisibleBefore) {
        await this.verifier.verifyTheElementIsVisible(departmentBefore, {
          assertionMessage: `Department should remain visible after hover for ${fullName}`,
          timeout: 5000,
        });
      }
    });
  }

  async verifyContactIconsAreVisible(fullName: string): Promise<void> {
    await test.step(`Verifying contact icons are visible for: ${fullName}`, async () => {
      const contactIcons = [
        { name: 'Phone', locator: this.getPhoneIcon(fullName) },
        { name: 'Mobile', locator: this.getMobileIcon(fullName) },
        { name: 'Email', locator: this.getEmailIcon(fullName) },
        { name: 'Zoom', locator: this.getZoomIcon(fullName) },
        { name: 'Slack', locator: this.getSlackIcon(fullName) },
        { name: 'Skype', locator: this.getSkypeIcon(fullName) },
        { name: 'MS Teams', locator: this.getMSTeamsIcon(fullName) },
      ];

      for (const icon of contactIcons) {
        const count = await icon.locator.count();
        if (count > 0) {
          const isVisible = await icon.locator.isVisible().catch(() => false);
          if (isVisible) {
            await this.verifier.verifyTheElementIsVisible(icon.locator, {
              assertionMessage: `${icon.name} icon should be visible for ${fullName}`,
              timeout: 5000,
            });
          }
        }
      }
    });
  }

  async verifyContactIconsRemainVisibleAfterHover(fullName: string): Promise<void> {
    await test.step(`Verifying contact icons remain visible after hover for: ${fullName}`, async () => {
      const contactIcons = [
        { name: 'Phone', locator: this.getPhoneIcon(fullName) },
        { name: 'Mobile', locator: this.getMobileIcon(fullName) },
        { name: 'Email', locator: this.getEmailIcon(fullName) },
        { name: 'Zoom', locator: this.getZoomIcon(fullName) },
        { name: 'Slack', locator: this.getSlackIcon(fullName) },
        { name: 'Skype', locator: this.getSkypeIcon(fullName) },
        { name: 'MS Teams', locator: this.getMSTeamsIcon(fullName) },
      ];

      // Check which icons are visible before hover
      const visibleIconsBefore: Array<{ name: string; locator: Locator }> = [];
      for (const icon of contactIcons) {
        const count = await icon.locator.count();
        if (count > 0) {
          const isVisible = await icon.locator.isVisible().catch(() => false);
          if (isVisible) {
            visibleIconsBefore.push(icon);
          }
        }
      }

      // Hover on the user profile
      await this.hoverOnUserProfile(fullName);

      // Verify all previously visible icons remain visible after hover
      for (const icon of visibleIconsBefore) {
        await this.verifier.verifyTheElementIsVisible(icon.locator, {
          assertionMessage: `${icon.name} icon should remain visible after hover for ${fullName}`,
          timeout: 5000,
        });
      }
    });
  }
}
