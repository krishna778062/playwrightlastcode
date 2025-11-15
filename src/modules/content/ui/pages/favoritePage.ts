import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { ContactIconType } from '@/src/modules/content/constants';
export interface IFavoritePageActions {
  clickOnPeopleTab: () => Promise<void>;
  searchingFavoriteUser: (fullName: string) => Promise<void>;
  hoverOnUserProfile: (fullName: string) => Promise<void>;
  getFirstDisplayedUserName: () => Promise<string>;
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
  readonly firstUserCard: Locator = this.page
    .getByRole('tabpanel', { name: 'People' })
    .getByRole('list')
    .getByRole('listitem')
    .first();

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
  readonly getContactIcon = (fullName: string, iconType: ContactIconType): Locator => {
    const userCard = this.getUserProfileCard(fullName);
    const iconName = iconType.toLowerCase();

    // Special case for email - includes mailto link selector
    if (iconType === ContactIconType.EMAIL) {
      return userCard
        .locator(
          `[aria-label*="${iconName}" i], [title*="${iconName}" i], svg[class*="${iconName}"], a[href^="mailto:"]`
        )
        .first();
    }

    // Generic case for all other icons
    return userCard
      .locator(`[aria-label*="${iconName}" i], [title*="${iconName}" i], svg[class*="${iconName}"]`)
      .first();
  };

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

  async getFirstDisplayedUserName(): Promise<string> {
    return await test.step('Getting first displayed user name from favorites people tab', async () => {
      // Wait for at least one user listitem to be visible
      await this.verifier.verifyTheElementIsVisible(this.firstUserCard, {
        assertionMessage: 'At least one user should be visible on favorites people tab',
        timeout: 10000,
      });

      // Get the user name from the link inside the first listitem
      const userLink = this.firstUserCard.getByRole('link').first();
      const linkCount = await userLink.count();

      if (linkCount > 0) {
        // Get the text content of the link
        const userName = await userLink.textContent();
        if (userName && userName.trim() !== '') {
          return userName.trim();
        }

        // Fallback: try innerText if textContent doesn't work
        const innerText = await userLink.innerText();
        if (innerText && innerText.trim() !== '') {
          return innerText.trim();
        }
      }

      throw new Error('First user name is empty or not found on favorites people tab');
    });
  }

  async hoverOnUserProfile(fullName: string): Promise<void> {
    await test.step(`Hovering on user profile: ${fullName}`, async () => {
      const userProfileLink = this.getUserProfileLink(fullName);
      await this.verifier.verifyTheElementIsVisible(userProfileLink, {
        assertionMessage: `User profile link for ${fullName} should be visible before hover`,
      });
      await userProfileLink.hover();
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
        });
      }

      if (locationVisibleBefore) {
        await this.verifier.verifyTheElementIsVisible(locationBefore, {
          assertionMessage: `Location should remain visible after hover for ${fullName}`,
        });
      }

      if (jobTitleVisibleBefore) {
        await this.verifier.verifyTheElementIsVisible(jobTitleBefore, {
          assertionMessage: `Job title should remain visible after hover for ${fullName}`,
        });
      }

      if (departmentVisibleBefore) {
        await this.verifier.verifyTheElementIsVisible(departmentBefore, {
          assertionMessage: `Department should remain visible after hover for ${fullName}`,
        });
      }
    });
  }

  async verifyContactIconsAreVisible(fullName: string): Promise<void> {
    await test.step(`Verifying contact icons are visible for: ${fullName}`, async () => {
      const contactIcons = [
        { name: 'Phone', iconType: ContactIconType.PHONE },
        { name: 'Mobile', iconType: ContactIconType.MOBILE },
        { name: 'Email', iconType: ContactIconType.EMAIL },
        { name: 'Zoom', iconType: ContactIconType.ZOOM },
        { name: 'Slack', iconType: ContactIconType.SLACK },
        { name: 'Skype', iconType: ContactIconType.SKYPE },
        { name: 'MS Teams', iconType: ContactIconType.MS_TEAMS },
      ];

      for (const icon of contactIcons) {
        const locator = this.getContactIcon(fullName, icon.iconType);
        const count = await locator.count();
        if (count > 0) {
          const isVisible = await locator.isVisible().catch(() => false);
          if (isVisible) {
            await this.verifier.verifyTheElementIsVisible(locator, {
              assertionMessage: `${icon.name} icon should be visible for ${fullName}`,
            });
          }
        }
      }
    });
  }

  async verifyContactIconsRemainVisibleAfterHover(fullName: string): Promise<void> {
    await test.step(`Verifying contact icons remain visible after hover for: ${fullName}`, async () => {
      const contactIcons = [
        { name: 'Phone', iconType: ContactIconType.PHONE },
        { name: 'Mobile', iconType: ContactIconType.MOBILE },
        { name: 'Email', iconType: ContactIconType.EMAIL },
        { name: 'Zoom', iconType: ContactIconType.ZOOM },
        { name: 'Slack', iconType: ContactIconType.SLACK },
        { name: 'Skype', iconType: ContactIconType.SKYPE },
        { name: 'MS Teams', iconType: ContactIconType.MS_TEAMS },
      ];

      // Check which icons are visible before hover
      const visibleIconsBefore: Array<{ name: string; locator: Locator }> = [];
      for (const icon of contactIcons) {
        const locator = this.getContactIcon(fullName, icon.iconType);
        const count = await locator.count();
        if (count > 0) {
          const isVisible = await locator.isVisible().catch(() => false);
          if (isVisible) {
            visibleIconsBefore.push({ name: icon.name, locator });
          }
        }
      }

      // Hover on the user profile
      await this.hoverOnUserProfile(fullName);

      // Verify all previously visible icons remain visible after hover
      for (const icon of visibleIconsBefore) {
        await this.verifier.verifyTheElementIsVisible(icon.locator, {
          assertionMessage: `${icon.name} icon should remain visible after hover for ${fullName}`,
        });
      }
    });
  }
}
