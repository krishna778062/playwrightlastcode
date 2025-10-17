import { Locator, Page } from '@playwright/test';
import { RewardsAllowance } from '@rewards-components/manage-rewards/rewards-allowance';
import { WorkAnniversaryPage } from '@rewards-pages/work-anniversary';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

export class ManageRecognitionPage extends BasePage {
  readonly header: Locator;
  readonly automatedAwards: any; // This would need to be properly defined
  readonly rewards: any; // This would need to be properly defined
  readonly dailogContainerForm: any; // This would need to be properly defined

  // Components
  readonly rewardsAllowance: RewardsAllowance;
  readonly workAnniversaryWithPoints: WorkAnniversaryPage;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);

    this.header = page.locator('h1');
    this.rewardsAllowance = new RewardsAllowance(page);
    this.workAnniversaryWithPoints = new WorkAnniversaryPage(page);

    // Mock implementations for now - these would need to be properly implemented
    this.automatedAwards = {
      getThreeDotsButton: (index: number) =>
        page.locator(`[data-testid*="dataGridRow"] button[aria-label="Show more"]`).nth(index),
      editMenuItem: page.getByRole('menuitem', { name: 'Edit' }),
    };

    this.rewards = {
      enableTheRewardsAndPeerGiftingIfDisabled: async () => {
        // Mock implementation
        console.log('enableTheRewardsAndPeerGiftingIfDisabled called');
      },
      visit: async () => {
        await this.page.goto(PAGE_ENDPOINTS.MANAGE_REWARDS_PAGE);
      },
    };

    this.dailogContainerForm = {
      dailogHeader: page.locator('[role="dialog"] h2'),
      dailogSaveBtn: page.getByRole('button', { name: 'Save' }),
      dailogCancelBtn: page.getByRole('button', { name: 'Cancel' }),
    };
  }

  async navigateViaUrl(url: string) {
    await this.page.goto(url);
  }
}
