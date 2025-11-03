import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';

export interface IProfileScreenPageActions {}

export interface IProfileScreenPageAssertions {
  verifyingUserNameOnProfileScreenPage: () => Promise<void>;
}

export class ProfileScreenPage extends BasePage implements IProfileScreenPageActions, IProfileScreenPageAssertions {
  private baseActionUtil: BaseActionUtil;
  readonly copyProfileLinkOption: Locator = this.page.getByRole('button', { name: 'Copy profile link' });

  constructor(page: Page, peopleId: string) {
    super(page, PAGE_ENDPOINTS.getProfileScreenPage(peopleId));
    this.baseActionUtil = new BaseActionUtil(page);
  }

  get actions(): IProfileScreenPageActions {
    return this;
  }

  get assertions(): IProfileScreenPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify profile screen page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.copyProfileLinkOption, {
        assertionMessage: 'Profile screen page should be visible',
      });
    });
  }

  async verifyingUserNameOnProfileScreenPage(): Promise<void> {
    await test.step('Verifying user name on profile screen page', async () => {
      const loggedInUserName = await this.baseActionUtil.getCurrentLoggedInUserName();
      await this.verifier.verifyTheElementIsVisible(this.page.getByRole('heading', { name: loggedInUserName }), {
        assertionMessage: `User name "${loggedInUserName}" should be visible on profile screen page`,
      });
    });
  }
}
