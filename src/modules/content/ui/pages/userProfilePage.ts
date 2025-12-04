import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IUserProfilePageActions {
  clickOnFollowersTab: () => Promise<void>;
}

export interface IUserProfilePageAssertions {
  verifyContactInformation: () => Promise<void>;
}

export class UserProfilePage extends BasePage implements IUserProfilePageActions, IUserProfilePageAssertions {
  //COMPONENTS

  //LOCATORS
  readonly contactInformation: Locator;
  readonly followersTab: Locator;
  readonly followingTab: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.FEATURED_SITES_PAGE);

    this.contactInformation = page.getByTestId('contact-item').first();
    this.followersTab = page.getByRole('button', { name: 'Follow' });
    this.followingTab = page.getByRole('button', { name: 'Following' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify ORG Chart page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.contactInformation, {
        assertionMessage: 'Contact information should be visible',
      });
      // TODO: Implement page load verification
    });
  }

  get actions(): IUserProfilePageActions {
    return this;
  }

  get assertions(): IUserProfilePageAssertions {
    return this;
  }
  async clickOnFollowersTab(): Promise<void> {
    await test.step('Clicking on followers tab', async () => {
      const isFollowing = await this.verifier.isTheElementVisible(this.followingTab);
      if (isFollowing) {
        console.log('User has already followed the person');
      } else {
        await this.clickOnElement(this.followersTab);
      }
    });
  }
  async verifyContactInformation(): Promise<void> {
    await test.step('Verify contact information', async () => {
      await this.verifier.verifyTheElementIsVisible(this.contactInformation, {
        assertionMessage: 'Contact information should be visible',
      });
    });
  }
}
