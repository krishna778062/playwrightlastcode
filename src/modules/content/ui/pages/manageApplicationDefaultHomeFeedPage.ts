import { Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';
import { HomeFeedComponent } from '@/src/modules/content/ui/components/homeFeedComponent';

export interface IManageApplicationPageActions {
  selectingPostsIFollow: () => Promise<void>;
  recentActivity: () => Promise<void>;
  clickOnSaveButton: () => Promise<void>;
}

export interface IManageApplicationPageAssertions {
  // verifyPostsIFollow: () => Promise<void>;
}
export class HomeFeedPage extends BasePage {
  private homeFeedComponent: HomeFeedComponent;
  readonly homeFeedHeading = this.page.getByRole('heading', { name: 'Home feed' });
  readonly saveButton = this.page.getByRole('button', { name: 'Save' });

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.DEFAULT_SCREEN);
    this.homeFeedComponent = new HomeFeedComponent(page);
  }

  get actions(): IManageApplicationPageActions {
    return this;
  }

  get assertions(): IManageApplicationPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify email notifications page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.homeFeedHeading, {
        assertionMessage: 'Email notifications screen is visible',
      });
    });
  }

  async selectingPostsIFollow(): Promise<void> {
    await test.step('Selecting posts i follow', async () => {
      await this.clickOnElement(this.homeFeedComponent.clickOnAllPosts);
      await this.clickOnElement(this.homeFeedComponent.clickOnAllPosts);
    });
  }

  async recentActivity(): Promise<void> {
    await test.step('Selecting recent activity', async () => {
      await this.clickOnElement(this.homeFeedComponent.postDate);
      await this.clickOnElement(this.homeFeedComponent.recentActivity);
    });
  }

  async clickOnSaveButton(): Promise<void> {
    await test.step('Clicking on save button', async () => {
      await this.clickOnElement(this.saveButton);
    });
  }

  async verifyTheChangesConfirmationToastMessageIsVisible(): Promise<void> {
    const baseActionUtil = new BaseActionUtil(this.page);
    await baseActionUtil.verifyToastMessageIsVisibleWithText('Saved changes successfully', {
      stepInfo: 'Verify the changes confirmation toast message is visible',
    });
  }
}
