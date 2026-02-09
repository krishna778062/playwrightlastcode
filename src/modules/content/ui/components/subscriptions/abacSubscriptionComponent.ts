import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class AbacSubscriptionComponent extends BaseComponent {
  readonly addSubscriptionButton: Locator;
  readonly subscriptionsSection: Locator;
  readonly audiencesDialogSelector: string;
  readonly allOrganizationSwitch: Locator;
  readonly selectedAllOrganizationTextSelector: string;
  readonly doneButton: Locator;
  readonly menuItemSelector: string;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.addSubscriptionButton = this.page.getByRole('button', { name: 'Add subscription' });
    this.subscriptionsSection = this.page.locator('section').filter({ hasText: 'Subscriptions' });
    this.audiencesDialogSelector = 'dialog:has-text("Audiences"), [role="dialog"]:has-text("Audiences")';
    this.allOrganizationSwitch = this.page.getByRole('switch', { name: 'All organization' });
    this.selectedAllOrganizationTextSelector = "text=You've selected 'All organization'";
    this.doneButton = this.page.getByRole('button', { name: 'Done' });
    this.menuItemSelector = '[role="menuitem"]';
  }

  async clickAddSubscriptionButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Click Add subscription button', async () => {
      await this.clickOnElement(this.addSubscriptionButton);
      await this.page.waitForSelector(this.audiencesDialogSelector, {
        state: 'visible',
        timeout: 10000,
      });
    });
  }

  async selectAllOrganizationAudience(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Select All organization audience', async () => {
      await this.clickOnElement(this.allOrganizationSwitch);
      await this.page.waitForSelector(this.selectedAllOrganizationTextSelector, { timeout: 10000 });
      await this.verifier.verifyTheElementIsEnabled(this.doneButton, {
        assertionMessage: 'Done button should be enabled',
      });
      await this.clickOnElement(this.doneButton);
      await this.page.waitForSelector(this.audiencesDialogSelector, {
        state: 'hidden',
        timeout: 10000,
      });
    });
  }

  async verifySubscriptionsSectionIsVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify subscriptions section is visible', async () => {
      const subscriptionRow = this.page.locator('text=All organization').first();
      await this.verifier.verifyTheElementIsVisible(subscriptionRow, {
        assertionMessage: 'Subscription row should be visible',
        timeout: 10000,
      });
    });
  }

  /**
   * Extracts the audience ID from the first subscription row
   * @returns null if no subscription is found
   */
  async extractAudienceIdFromFirstRow(options?: { stepInfo?: string }): Promise<string | null> {
    return await test.step(options?.stepInfo || 'Extract audience ID from first subscription row', async () => {
      try {
        const subscriptionRow = this.page.locator('text=All organization').first().locator('..').locator('..');
        const rowElement = subscriptionRow.first();
        const dataId = await rowElement.getAttribute('data-id');
        const id = await rowElement.getAttribute('id');

        if (dataId) {
          return dataId;
        }
        if (id) {
          return id;
        }

        const textContent = await subscriptionRow.textContent();
        if (textContent && textContent.includes('All organization')) {
          return 'all-organization';
        }

        return null;
      } catch (error) {
        return null;
      }
    });
  }

  /**
   * Extracts and verifies the audience ID from the first subscription row
   * @returns The extracted audience ID (guaranteed to be non-null)
   * @throws Error if audience ID cannot be extracted
   */
  async extractAndVerifyAudienceIdFromFirstRow(options?: { stepInfo?: string }): Promise<string> {
    return await test.step(
      options?.stepInfo || 'Extract and verify audience ID from first subscription row',
      async () => {
        const audienceId = await this.extractAudienceIdFromFirstRow();
        expect(audienceId, 'Audience ID should be extracted from subscription row').not.toBeNull();
        return audienceId!;
      }
    );
  }

  /**
   * @param audienceId - The audience ID to identify the subscription row
   */
  async clickMoreMenu(audienceId: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Click More menu for subscription ${audienceId}`, async () => {
      let moreButton = this.page.getByRole('button', { name: 'More', exact: true }).first();

      if (!(await moreButton.isVisible({ timeout: 2000 }).catch(() => false))) {
        const subscriptionContainer = this.page.locator('text=All organization').first();
        moreButton = subscriptionContainer
          .locator('..')
          .locator('..')
          .getByRole('button', { name: 'More', exact: true });
      }

      await this.clickOnElement(moreButton);
      await this.page.waitForSelector(this.menuItemSelector, { state: 'visible', timeout: 10000 });
    });
  }

  /**
   * @param audienceId - The audience ID to identify the subscription row
   */
  async deleteSubscription(audienceId: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Delete subscription ${audienceId}`, async () => {
      const menu = this.page.locator('menu[role="menu"], [role="menu"]').first();
      const isMenuVisible = await menu.isVisible({ timeout: 2000 }).catch(() => false);

      if (!isMenuVisible) {
        await this.clickMoreMenu(audienceId);
      }

      const deleteOption = this.page.getByRole('menuitem', { name: 'Delete' });
      await this.verifier.verifyTheElementIsVisible(deleteOption, {
        assertionMessage: 'Delete option should be visible',
        timeout: 10000,
      });
      await this.clickOnElement(deleteOption);
      const subscriptionRow = this.page.locator('text=All organization').first();
      await this.verifier.verifyTheElementIsNotVisible(subscriptionRow, {
        assertionMessage: 'Subscription should be removed',
        timeout: 10000,
      });
    });
  }

  getMoreButton(audienceId: string): Locator {
    return this.page.getByRole('button', { name: 'More', exact: true }).first();
  }

  getSubscriptionRow(audienceId: string): Locator {
    return this.page.locator('text=All organization').first();
  }

  /**
   * Checks for disabled controls and syncing indicators (tooltips, icons, or text)
   * @param audienceId - The audience ID to identify the subscription row
   */
  async isSyncingInProgress(audienceId: string): Promise<boolean> {
    const mandatorySwitch = this.getMandatorySwitch(audienceId);
    const moreButton = this.getMoreButtonForSubscription(audienceId);
    const isMandatoryDisabled = await mandatorySwitch.isDisabled({ timeout: 1000 }).catch(() => false);
    const isMoreDisabled = await moreButton.isDisabled({ timeout: 1000 }).catch(() => false);

    if (isMandatoryDisabled || isMoreDisabled) {
      return true;
    }

    const row = this.getSubscriptionRowContainer(audienceId);
    const syncingTooltip = this.page.getByText('Cannot edit while subscriptions are syncing', { exact: false });
    const syncingStatusText = this.page.getByText('Subscription syncing in progress', { exact: false });
    const syncingIcon = row.locator('svg[data-testid="ReloadIcon"]').first();

    const hasTooltip = await syncingTooltip.isVisible({ timeout: 500 }).catch(() => false);
    const hasText = await syncingStatusText.isVisible({ timeout: 500 }).catch(() => false);
    const hasIcon = await syncingIcon.isVisible({ timeout: 500 }).catch(() => false);

    return hasTooltip || hasText || hasIcon;
  }

  /**
   * Waits for syncing to start by checking for syncing indicators or disabled controls.
   * Returns immediately if syncing indicators or disabled controls are detected.
   * @param audienceId - The audience ID to identify the subscription row
   * @param timeout - Maximum time to wait for syncing to start (default: 10 seconds)
   */
  async waitForSyncingToStart(audienceId: string, timeout: number = 10000): Promise<void> {
    await test.step(`Wait for subscription syncing to start for ${audienceId}`, async () => {
      const mandatorySwitch = this.getMandatorySwitch(audienceId);
      const moreButton = this.getMoreButtonForSubscription(audienceId);
      const row = this.getSubscriptionRowContainer(audienceId);
      const syncingTooltip = this.page.getByText('Cannot edit while subscriptions are syncing', { exact: false });
      const syncingStatusText = this.page.getByText('Subscription syncing in progress', { exact: false });
      const syncingIcon = row.locator('svg[data-testid="ReloadIcon"]').first();
      const syncingIndicators = syncingTooltip.or(syncingStatusText).or(syncingIcon);

      try {
        await Promise.race([
          syncingIndicators.waitFor({ state: 'visible', timeout }),
          mandatorySwitch.waitFor({ state: 'attached' }).then(async () => {
            await expect(mandatorySwitch).toBeDisabled({ timeout });
          }),
          moreButton.waitFor({ state: 'attached' }).then(async () => {
            await expect(moreButton).toBeDisabled({ timeout });
          }),
        ]);
      } catch {
        const isMandatoryDisabled = await mandatorySwitch.isDisabled({ timeout: 1000 }).catch(() => false);
        const isMoreDisabled = await moreButton.isDisabled({ timeout: 1000 }).catch(() => false);
        const hasSyncingIndicator = await syncingIndicators.isVisible({ timeout: 1000 }).catch(() => false);

        if (!isMandatoryDisabled && !isMoreDisabled && !hasSyncingIndicator) {
          const isMandatoryEnabled = await this.verifier
            .isTheElementEnabled(mandatorySwitch, { timeout: 1000 })
            .catch(() => false);
          const isMoreEnabled = await this.verifier
            .isTheElementEnabled(moreButton, { timeout: 1000 })
            .catch(() => false);
          if (isMandatoryEnabled && isMoreEnabled) {
            return;
          }
        }
      }
    });
  }

  /**
   * Finds the table row that contains "All organization" or "Everyone in organization" text
   * @param audienceId - The audience ID to identify the subscription row
   */
  getSubscriptionRowContainer(audienceId: string): Locator {
    return this.page
      .locator('table')
      .filter({ has: this.page.getByText(/All organization|Everyone in organization/i) })
      .locator('tr')
      .filter({ has: this.page.getByText(/All organization|Everyone in organization/i) })
      .first();
  }

  getMandatorySwitch(audienceId: string): Locator {
    const row = this.getSubscriptionRowContainer(audienceId);
    return row.getByRole('switch', { name: 'Mandatory' });
  }

  getMoreButtonForSubscription(audienceId: string): Locator {
    const row = this.getSubscriptionRowContainer(audienceId);
    return row.getByRole('button', { name: 'More' });
  }

  getMembersDropdown(audienceId: string): Locator {
    const row = this.getSubscriptionRowContainer(audienceId);
    return row.getByRole('button', { name: /Members/i }).first();
  }

  /**
   * @param audienceId - The audience ID to identify the subscription row
   */
  async hasMembersDropdown(audienceId: string): Promise<boolean> {
    const row = this.getSubscriptionRowContainer(audienceId);
    const buttonLocator = row.getByRole('button', { name: /Members/i }).first();
    const count = await buttonLocator.count().catch(() => 0);
    return count > 0;
  }

  /**
   * @param _audienceId - Unused, kept for API consistency with other methods
   */
  getSubscriptionRowForCreationForm(_audienceId: string): Locator {
    return this.page.locator('text=All organization').first().locator('..').locator('..');
  }

  /**
   * For private sites, ensures only "Members" type can be created (not "Followers")
   * @param audienceId - The audience ID to identify the subscription row
   * @param isPrivateSite - Whether this is a private site
   */
  async verifySubscriptionTypeIsMembersDuringCreation(
    audienceId: string,
    isPrivateSite: boolean,
    options?: { stepInfo?: string }
  ): Promise<void> {
    await test.step(
      options?.stepInfo ||
        `Verify subscription type is Members during ${isPrivateSite ? 'private' : 'public'} site creation`,
      async () => {
        const row = this.getSubscriptionRowForCreationForm(audienceId);
        const rowText = await row.textContent({ timeout: 5000 }).catch(() => null);

        if (!rowText) {
          throw new Error('Subscription row text content should be available');
        }

        if (isPrivateSite) {
          const followersButton = row.getByRole('button', { name: /Followers/i }).first();
          const hasFollowersButton = (await followersButton.count().catch(() => 0)) > 0;

          if (hasFollowersButton) {
            throw new Error('Private sites should not have "Followers" option available');
          }

          const membersButton = row.getByRole('button', { name: /Members/i }).first();
          const hasMembersButton = (await membersButton.count().catch(() => 0)) > 0;

          if (hasMembersButton) {
            const dropdownText = await membersButton.textContent();
            if (!dropdownText?.includes('Members')) {
              throw new Error(`Subscription type should be "Members" for private sites but found: ${dropdownText}`);
            }
          } else if (rowText.includes('Followers')) {
            throw new Error(`Subscription type should not be "Followers" for private sites but found: ${rowText}`);
          }
        } else {
          const membersButton = row.getByRole('button', { name: /Members/i }).first();
          const hasMembersButton = (await membersButton.count().catch(() => 0)) > 0;
          if (hasMembersButton) {
            const dropdownText = await membersButton.textContent();
            if (!dropdownText?.includes('Members')) {
              throw new Error(`Subscription type should be "Members" but found: ${dropdownText}`);
            }
          } else if (!rowText.includes('Members')) {
            throw new Error(`Subscription row should contain "Members" but found: ${rowText}`);
          }
        }
      }
    );
  }

  /**
   * Waits until all controls are enabled. Returns as soon as all controls are enabled.
   * @param audienceId - The audience ID to identify the subscription row
   * @param maxTimeout - Maximum time to wait in milliseconds (default: 4.5 minutes)
   */
  async waitForSyncingToComplete(audienceId: string, maxTimeout: number = 270000): Promise<void> {
    await test.step(`Wait for subscription syncing to complete for ${audienceId}`, async () => {
      const mandatorySwitch = this.getMandatorySwitch(audienceId);
      const membersDropdown = this.getMembersDropdown(audienceId);
      const moreButton = this.getMoreButtonForSubscription(audienceId);

      await this.verifier.verifyTheElementIsEnabled(mandatorySwitch, {
        assertionMessage: 'Mandatory switch should be enabled after sync',
        timeout: maxTimeout,
      });

      const dropdownExists = await this.hasMembersDropdown(audienceId);
      if (dropdownExists) {
        await this.verifier.verifyTheElementIsEnabled(membersDropdown, {
          assertionMessage: 'Members dropdown should be enabled after sync',
          timeout: maxTimeout,
        });
      }

      await this.verifier.verifyTheElementIsEnabled(moreButton, {
        assertionMessage: 'More button should be enabled after sync',
        timeout: maxTimeout,
      });
    });
  }

  /**
   * Verifies controls are disabled during sync. If syncing completes quickly, returns gracefully.
   * @param audienceId - The audience ID to identify the subscription row
   */
  async verifyControlsDisabledDuringSync(audienceId: string): Promise<void> {
    await test.step(`Verify subscription controls are disabled during sync for ${audienceId}`, async () => {
      const mandatorySwitch = this.getMandatorySwitch(audienceId);
      const membersDropdown = this.getMembersDropdown(audienceId);
      const moreButton = this.getMoreButtonForSubscription(audienceId);
      const row = this.getSubscriptionRowContainer(audienceId);
      const syncingTooltip = this.page.getByText('Cannot edit while subscriptions are syncing', { exact: false });
      const syncingStatusText = this.page.getByText('Subscription syncing in progress', { exact: false });
      const syncingIcon = row.locator('svg[data-testid="ReloadIcon"]').first();

      const checkTimeout = 5000;
      const hasSyncingTooltip = await syncingTooltip.isVisible({ timeout: checkTimeout }).catch(() => false);
      const hasSyncingText = await syncingStatusText.isVisible({ timeout: checkTimeout }).catch(() => false);
      const hasSyncingIcon = await syncingIcon.isVisible({ timeout: checkTimeout }).catch(() => false);
      const hasSyncingIndicators = hasSyncingTooltip || hasSyncingText || hasSyncingIcon;

      const isMandatoryDisabled = await mandatorySwitch.isDisabled({ timeout: checkTimeout }).catch(() => false);
      const dropdownExists = await this.hasMembersDropdown(audienceId);
      const isMembersDisabled = dropdownExists
        ? await membersDropdown.isDisabled({ timeout: checkTimeout }).catch(() => false)
        : false;
      const isMoreDisabled = await moreButton.isDisabled({ timeout: checkTimeout }).catch(() => false);
      const hasDisabledControls = isMandatoryDisabled || (dropdownExists && isMembersDisabled) || isMoreDisabled;

      if (hasSyncingIndicators) {
        if (isMandatoryDisabled) {
          await this.verifier.verifyTheElementIsDisabled(mandatorySwitch, {
            assertionMessage: 'Mandatory switch should be disabled during sync',
          });
        }
        if (dropdownExists && isMembersDisabled) {
          await this.verifier.verifyTheElementIsDisabled(membersDropdown, {
            assertionMessage: 'Members dropdown should be disabled during sync',
          });
        }
        if (isMoreDisabled) {
          await this.verifier.verifyTheElementIsDisabled(moreButton, {
            assertionMessage: 'More button should be disabled during sync',
          });
        }
        return;
      }

      if (hasDisabledControls) {
        if (isMandatoryDisabled) {
          await this.verifier.verifyTheElementIsDisabled(mandatorySwitch, {
            assertionMessage: 'Mandatory switch should be disabled during sync',
          });
        }
        if (dropdownExists && isMembersDisabled) {
          await this.verifier.verifyTheElementIsDisabled(membersDropdown, {
            assertionMessage: 'Members dropdown should be disabled during sync',
          });
        }
        if (isMoreDisabled) {
          await this.verifier.verifyTheElementIsDisabled(moreButton, {
            assertionMessage: 'More button should be disabled during sync',
          });
        }
        return;
      }

      const isMandatoryEnabled = await this.verifier
        .isTheElementEnabled(mandatorySwitch, { timeout: 1000 })
        .catch(() => false);
      const isMoreEnabled = await this.verifier.isTheElementEnabled(moreButton, { timeout: 1000 }).catch(() => false);
      const isMembersEnabled = dropdownExists
        ? await this.verifier.isTheElementEnabled(membersDropdown, { timeout: 1000 }).catch(() => true)
        : true;

      if (isMandatoryEnabled && isMoreEnabled && isMembersEnabled) {
        return;
      }

      throw new Error(
        'No syncing indicators or disabled controls detected - syncing may have completed too quickly or not started'
      );
    });
  }

  /**
   * @param audienceId - The audience ID to identify the subscription row
   */
  async verifyControlsEnabledAfterSync(audienceId: string): Promise<void> {
    await test.step(`Verify subscription controls are enabled after sync for ${audienceId}`, async () => {
      const mandatorySwitch = this.getMandatorySwitch(audienceId);
      const membersDropdown = this.getMembersDropdown(audienceId);
      const moreButton = this.getMoreButtonForSubscription(audienceId);

      await this.verifier.verifyTheElementIsEnabled(mandatorySwitch, {
        assertionMessage: 'Mandatory switch should be enabled after sync',
        timeout: 10000,
      });
      const dropdownExists = await this.hasMembersDropdown(audienceId);
      if (dropdownExists) {
        await this.verifier.verifyTheElementIsEnabled(membersDropdown, {
          assertionMessage: 'Members dropdown should be enabled after sync',
          timeout: 10000,
        });
      }
      await this.verifier.verifyTheElementIsEnabled(moreButton, {
        assertionMessage: 'More button should be enabled after sync',
        timeout: 10000,
      });
    });
  }
}
