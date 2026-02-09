import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { AbacSubscriptionComponent } from '@/src/modules/content/ui/components/subscriptions/abacSubscriptionComponent';

export class ManageSiteSubscriptionPage extends BasePage {
  readonly abacSubscriptionComponent: AbacSubscriptionComponent;
  readonly peopleTab: Locator;
  readonly membersTab: (count: number) => Locator;
  readonly setupTab: Locator;

  constructor(page: Page, siteId?: string) {
    // If siteId is provided, use the manage site setup page endpoint
    // Otherwise, just use the base page (for site creation flow)
    super(page, siteId ? PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(siteId) : undefined);
    this.abacSubscriptionComponent = new AbacSubscriptionComponent(page);
    this.peopleTab = page.getByRole('tab', { name: 'People' });
    this.membersTab = (count: number) => page.getByRole('tab', { name: `Members (${count})` });
    this.setupTab = page.getByRole('tab', { name: 'Setup' });
  }

  async verifyThePageIsLoaded(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify Manage Site Setup page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      const isSetupTabVisible = await this.verifier.isTheElementVisible(this.setupTab, {
        timeout: 10000,
      });

      if (isSetupTabVisible) {
        // Setup tab is visible, page is loaded
        return;
      } else {
        // If setup tab is not found, verify subscriptions section is visible instead
        await this.abacSubscriptionComponent.verifySubscriptionsSectionIsVisible();
      }
    });
  }

  async verifySubscriptionExists(audienceId: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verify subscription exists for audience ${audienceId}`, async () => {
      const subscriptionRow = this.abacSubscriptionComponent.getSubscriptionRow(audienceId);
      await this.verifier.verifyTheElementIsVisible(subscriptionRow, {
        assertionMessage: `Subscription for audience ${audienceId} should be visible`,
      });
    });
  }

  async verifySubscriptionRemoved(audienceId: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verify subscription removed for audience ${audienceId}`, async () => {
      const subscriptionRow = this.abacSubscriptionComponent.getSubscriptionRow(audienceId);
      await this.verifier.verifyTheElementIsNotVisible(subscriptionRow, {
        assertionMessage: 'Subscription should be removed',
        timeout: 5000,
      });
    });
  }

  async verifyPlusButtonIsVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify plus button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.abacSubscriptionComponent.addSubscriptionButton, {
        assertionMessage: 'Add subscription button should be visible',
      });
    });
  }

  async verifyPlusButtonIsClickable(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify plus button is clickable', async () => {
      await this.verifier.verifyTheElementIsEnabled(this.abacSubscriptionComponent.addSubscriptionButton, {
        assertionMessage: 'Add subscription button should be enabled',
      });
    });
  }

  async verifySubscriptionControlsDisabledDuringSync(
    audienceId: string,
    options?: { stepInfo?: string }
  ): Promise<void> {
    await this.abacSubscriptionComponent.verifyControlsDisabledDuringSync(audienceId);
  }

  async waitForSubscriptionSyncingToComplete(options?: {
    stepInfo?: string;
    timeout?: number;
    audienceId?: string;
  }): Promise<void> {
    const maxTimeout = options?.timeout || 270000; // Maximum 4.5 minutes (270000ms) - default to stay within test timeout
    const audienceId = options?.audienceId;

    if (!audienceId) {
      throw new Error('audienceId is required to verify syncing completion');
    }

    await this.abacSubscriptionComponent.waitForSyncingToComplete(audienceId, maxTimeout);
  }

  async verifySubscriptionControlsEnabledAfterSync(audienceId: string, options?: { stepInfo?: string }): Promise<void> {
    await this.abacSubscriptionComponent.verifyControlsEnabledAfterSync(audienceId);
  }

  async clickMoreMenu(audienceId: string, options?: { stepInfo?: string }): Promise<void> {
    await this.abacSubscriptionComponent.clickMoreMenu(audienceId, options);
  }

  async verifyRerunOption(
    audienceId: string,
    shouldBeEnabled: boolean,
    options?: { stepInfo?: string }
  ): Promise<void> {
    await test.step(
      options?.stepInfo || `Verify Rerun option is ${shouldBeEnabled ? 'enabled' : 'disabled'} for ${audienceId}`,
      async () => {
        const rerunOption = this.page.getByRole('menuitem', { name: 'Re-run subscription' });
        if (shouldBeEnabled) {
          await this.verifier.verifyTheElementIsEnabled(rerunOption, {
            assertionMessage: 'Rerun option should be enabled',
          });
        } else {
          await this.verifier.verifyTheElementIsDisabled(rerunOption, {
            assertionMessage: 'Rerun option should be disabled',
          });
        }
      }
    );
  }

  async verifyDeleteOptionEnabled(audienceId: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verify Delete option is enabled for ${audienceId}`, async () => {
      const deleteOption = this.page.getByRole('menuitem', { name: 'Delete' });
      await this.verifier.verifyTheElementIsEnabled(deleteOption, {
        assertionMessage: 'Delete option should be enabled',
      });
    });
  }

  /**
   * @param audienceId - The audience ID to identify the subscription row
   */
  async verifyMandatorySwitchIsOff(audienceId: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verify mandatory switch is off for ${audienceId}`, async () => {
      const mandatorySwitch = this.abacSubscriptionComponent.getMandatorySwitch(audienceId);
      await this.verifier.verifyTheElementIsVisible(mandatorySwitch, {
        assertionMessage: 'Mandatory switch should be visible',
      });
      const isChecked = await mandatorySwitch.isChecked();
      if (isChecked) {
        throw new Error('Mandatory switch should be off (non-mandatory) but it is checked');
      }
    });
  }

  /**
   * Public sites: verifies dropdown shows "Members". Private sites: verifies row contains "Members" and not "Followers"
   * @param audienceId - The audience ID to identify the subscription row
   */
  async verifySubscriptionTypeIsMembers(
    audienceId: string,
    isPrivateSite: boolean,
    options?: { stepInfo?: string }
  ): Promise<void> {
    await test.step(
      options?.stepInfo || `Verify subscription type is Members for ${isPrivateSite ? 'private' : 'public'} site`,
      async () => {
        const membersDropdown = this.abacSubscriptionComponent.getMembersDropdown(audienceId);
        const dropdownExists = await this.verifier.isTheElementVisible(membersDropdown, { timeout: 2000 });

        if (dropdownExists) {
          const dropdownText = await membersDropdown.textContent();
          if (!dropdownText?.includes('Members')) {
            throw new Error(`Subscription type should be "Members" but found: ${dropdownText}`);
          }
        } else {
          const row = this.abacSubscriptionComponent.getSubscriptionRowContainer(audienceId);
          const rowText = await row.textContent();
          if (!rowText?.includes('Members')) {
            throw new Error(`Subscription row should contain "Members" for private sites but found: ${rowText}`);
          }
          if (rowText.includes('Followers')) {
            throw new Error(`Subscription row should not contain "Followers" for private sites but found: ${rowText}`);
          }
        }
      }
    );
  }

  async clickPeopleTab(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Click People tab', async () => {
      await this.clickOnElement(this.peopleTab);
      await this.page.locator('[role="tabpanel"]').first().waitFor({ state: 'visible', timeout: 5000 });
    });
  }

  /**
   * Handles formats: "(203)", "203 members", "203", etc.
   * @returns null if no number is found, number otherwise
   */
  private extractNumberFromText(text: string | null): number | null {
    if (!text) return null;
    const number = parseInt(text.replace(/\D/g, ''), 10);
    return isNaN(number) ? null : number;
  }

  /**
   * @throws Error if count cannot be extracted
   */
  async extractSubscriptionCountFromFirstRow(options?: { stepInfo?: string }): Promise<number> {
    return await test.step(options?.stepInfo || 'Extract subscription count from subscription row', async () => {
      const subscriptionRow = this.page
        .locator('table')
        .filter({ has: this.page.getByText(/All organization|Everyone in organization/i) })
        .locator('tr')
        .filter({ has: this.page.getByText(/All organization|Everyone in organization/i) })
        .first();

      const countText = await subscriptionRow
        .locator('text=/^\\(\\d+\\)$/')
        .first()
        .textContent({ timeout: 5000 })
        .catch(() => null);

      const count = this.extractNumberFromText(countText);
      if (count === null) {
        throw new Error('Subscription count should be extracted from Setup tab');
      }
      return count;
    });
  }

  async verifyMembersTabWithCount(count: number, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verify Members tab exists with count ${count}`, async () => {
      const membersTab = this.membersTab(count);
      await this.verifier.verifyTheElementIsVisible(membersTab, {
        assertionMessage: `Members tab with count ${count} should be visible`,
      });
    });
  }

  async clickMembersTab(count: number, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Click Members tab with count ${count}`, async () => {
      const membersTab = this.membersTab(count);
      await this.clickOnElement(membersTab);
      await this.page.locator('[role="tabpanel"]').first().waitFor({ state: 'visible', timeout: 5000 });
    });
  }

  /**
   * Extracts count from the Members tab (under People tab)
   */
  async verifySetupTabCountMatchesPeopleTab(setupTabCount: number, options?: { stepInfo?: string }): Promise<void> {
    await test.step(
      options?.stepInfo || `Verify Setup tab count ${setupTabCount} matches Members tab count`,
      async () => {
        const membersTabCount = await this.extractActiveUserCountFromUI();
        if (membersTabCount !== setupTabCount) {
          throw new Error(`Members tab count (${membersTabCount}) should match Setup tab count (${setupTabCount})`);
        }
      }
    );
  }

  async extractActiveUserCountFromUI(options?: { stepInfo?: string }): Promise<number> {
    return await test.step(options?.stepInfo || 'Extract active user count from Members tab', async () => {
      const membersTab = this.page.getByRole('tab', { name: /Members/ }).filter({ hasText: /Members/ });
      const tabText = await membersTab
        .first()
        .textContent({ timeout: 5000 })
        .catch(() => null);
      return this.extractNumberFromText(tabText) ?? 0;
    });
  }
}
