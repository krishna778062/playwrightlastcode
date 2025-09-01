import { Page, test } from '@playwright/test';

import { deleteTileByTitleViaApi } from '@integrations/api/helpers/tileApiHelpers';
import { deleteTileByInstanceIdViaApi } from '@integrations/api/helpers/tileApiHelpers';

export class IntegrationApi {
  constructor(private page: Page) {}

  /**
   * Get current user ID from Simpplr.CurrentUser.uid
   */
  async getCurrentUserId(): Promise<string> {
    const userId = await this.page.evaluate(() => {
      return (window as any).Simpplr?.CurrentUser?.uid;
    });

    if (!userId) {
      throw new Error('Could not get current user ID from Simpplr.CurrentUser.uid');
    }

    return userId;
  }

  /**
   * Navigate to external apps page via API for the current user
   */
  async navigateToExternalAppsPage(): Promise<void> {
    await test.step('Navigate to external apps via API', async () => {
      const userId = await this.getCurrentUserId();
      await this.page.goto(`/people/${userId}/edit/external-apps`, { waitUntil: 'domcontentloaded' });
    });
  }

  /**
   * Get user profile data
   */
  async getUserProfile(): Promise<any> {
    return await this.page.evaluate(() => {
      return (window as any).Simpplr?.CurrentUser;
    });
  }

  /**
   * Check if user is authenticated
   */
  async isUserAuthenticated(): Promise<boolean> {
    const user = await this.getUserProfile();
    return !!user?.uid;
  }

  async removeTileThroughApi(tileTitle: string): Promise<boolean> {
    return deleteTileByTitleViaApi(this.page, { tileInstanceName: tileTitle });
  }

  async removeTileByInstanceIdThroughApi(instanceId: string): Promise<boolean> {
    return deleteTileByInstanceIdViaApi(this.page, { instanceId });
  }
}
