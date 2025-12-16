import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

/**
 * Service Desk Settings Page Object Model
 *
 * Handles interactions with the Service Desk application settings page
 * where you can enable/disable the Service Desk feature
 * Path: /manage/app/setup/service-desk
 */
export class ServiceDeskSettingsPage extends BasePage {
  private readonly manageApplicationHeading: Locator;
  private readonly enableServiceDeskCheckbox: Locator;
  private readonly saveButton: Locator;
  private readonly serviceDeskSettingsHeading: Locator;
  private readonly serviceDeskDescription: Locator;
  private readonly serviceDeskHelpText: Locator;
  private readonly supportTeamsOnlyRadio: Locator;
  private readonly supportForEveryoneRadio: Locator;
  private readonly supportTeamsOnlyDescription: Locator;
  private readonly supportForEveryoneDescription: Locator;
  private readonly successToast: Locator;
  private readonly globalButton: Locator;
  private readonly workspaceSettingHeading: Locator;
  private readonly tabTrigger0: Locator;
  private readonly globalButtonRegex: Locator;
  private readonly globalButtonRole: Locator;
  private readonly applicationSettingsMenu: Locator;
  private readonly manageFeaturesMenu: Locator;
  private readonly serviceDeskButton: Locator;
  private readonly formElements: Locator;
  private readonly settingsNavButton: Locator;
  private readonly workspacePopoverLauncher: Locator;
  private readonly rocketButton: Locator;

  constructor(page: Page) {
    super(page, '/manage/app/setup/service-desk');

    this.manageApplicationHeading = page.getByRole('heading', { name: 'Manage application' });
    this.enableServiceDeskCheckbox = page.getByRole('checkbox', { name: 'Enable Service desk' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.serviceDeskSettingsHeading = page.getByRole('heading', { name: 'Enable/Disable Service desk' });
    this.serviceDeskDescription = page.getByText(
      'Service desk allows employees to raise requests and allow assigned agents to manage these tickets directly within Simpplr.'
    );
    this.serviceDeskHelpText = page.getByText(
      'Turn on Service desk to let support teams manage service requests, incidents, and approvals directly within Simpplr.'
    );
    this.supportTeamsOnlyRadio = page.getByRole('radio', {
      name: 'Enable Service desk (for support teams only)',
    });
    this.supportForEveryoneRadio = page.getByRole('radio', {
      name: 'Enable Service desk with Support (for everyone)',
    });
    this.supportTeamsOnlyDescription = page.getByText(
      'Only support teams and admins will have access to the Service desk feature to manage requests and incidents.'
    );
    this.supportForEveryoneDescription = page.getByText(
      'All employees will see the Support option to raise requests and track tickets, while support teams continue managing them through Service desk.'
    );
    this.successToast = page.getByText('Saved changes successfully');
    this.globalButton = page.locator('button').filter({ hasText: 'GlobalManage user and' });
    this.globalButtonRegex = page.locator('button').filter({ hasText: /Global.*Manage/i });
    this.globalButtonRole = page.getByRole('button', { name: /Global/i });
    this.workspaceSettingHeading = page.getByTestId('workspace-setting-heading');
    this.tabTrigger0 = page.getByTestId('tab-trigger-0');
    this.applicationSettingsMenu = page
      .getByTestId('menu-section')
      .getByRole('menuitem', { name: 'Application settings' });
    this.manageFeaturesMenu = page.getByRole('menuitem', { name: 'Manage features' });
    this.serviceDeskButton = page.getByRole('button', { name: 'Service desk' });
    this.formElements = page.locator('form, input, select, button[type="submit"]');
    this.settingsNavButton = page.getByTestId('main_sidenav.settings');
    this.workspacePopoverLauncher = page.getByTestId('popover-launcher');
    this.rocketButton = page.getByRole('button', { name: 'rocket' });
  }

  private getAppsButton(): Locator {
    return this.page.getByTestId('popover-launcher').getByRole('button', { name: 'apps' });
  }

  private getServiceDeskUrl(): string {
    const serviceDeskUrl = process.env.SERVICE_DESK_URL;
    if (!serviceDeskUrl) {
      throw new Error('SERVICE_DESK_URL not configured in environment variables');
    }
    return serviceDeskUrl;
  }

  /**
   * Find Global button using multiple locator strategies
   * @returns Locator for the Global button
   * @throws Error if button is not found
   */
  private async findGlobalButton(): Promise<Locator> {
    const strategies = [this.globalButton, this.globalButtonRegex, this.globalButtonRole];

    for (const locator of strategies) {
      try {
        await expect(locator).toBeVisible({ timeout: 3000 });
        return locator;
      } catch {
        continue;
      }
    }

    throw new Error('Global button not found on the page.');
  }

  /**
   * Check if Global button is visible
   * @returns true if Global button is visible, false otherwise
   */
  private async isGlobalButtonVisible(): Promise<boolean> {
    return await this.globalButtonRegex.isVisible({ timeout: 2000 }).catch(() => false);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Service Desk Settings page is loaded', async () => {
      await expect(this.manageApplicationHeading).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await expect(this.serviceDeskSettingsHeading).toBeVisible({ timeout: TIMEOUTS.SHORT });
    });
  }

  async navigateToServiceDeskSettings(): Promise<void> {
    await test.step('Navigate to Service Desk Settings', async () => {
      await this.goToUrl(`${this.getServiceDeskUrl()}/manage/app/setup/service-desk`, {
        waitUntil: 'domcontentloaded',
      });
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * Set Service Desk state (enable/disable) and save
   * @param enabled - true to enable, false to disable
   */
  async setServiceDeskState(enabled: boolean): Promise<void> {
    await test.step(`${enabled ? 'Enable' : 'Disable'} Service Desk`, async () => {
      await expect(this.enableServiceDeskCheckbox).toBeVisible();
      const currentState = await this.enableServiceDeskCheckbox.isChecked();

      if (currentState !== enabled) {
        await this.enableServiceDeskCheckbox.setChecked(enabled);
        await this.saveButton.click();
        // Verify success toast message
        await expect(this.successToast).toBeVisible({ timeout: TIMEOUTS.SHORT });
      }
    });
  }

  /**
   * Disable Service Desk if it's enabled (skip if already disabled)
   */
  async disableServiceDeskIfEnabled(): Promise<void> {
    await test.step('Disable Service Desk if enabled', async () => {
      await expect(this.enableServiceDeskCheckbox).toBeVisible();
      const isEnabled = await this.enableServiceDeskCheckbox.isChecked();

      if (isEnabled) {
        await this.setServiceDeskState(false);
      }
    });
  }

  /**
   * Enable Service Desk if it's disabled (skip if already enabled)
   */
  async enableServiceDeskIfDisabled(): Promise<void> {
    await test.step('Enable Service Desk if disabled', async () => {
      await expect(this.enableServiceDeskCheckbox).toBeVisible();
      const isEnabled = await this.enableServiceDeskCheckbox.isChecked();

      if (!isEnabled) {
        await this.setServiceDeskState(true);
      }
    });
  }

  /**
   * Verify all elements on Service Desk settings page
   */
  async verifyServiceDeskSettingsPageElements(): Promise<void> {
    await test.step('Verify Service Desk settings page elements', async () => {
      await expect(this.serviceDeskSettingsHeading).toBeVisible();
      await expect(this.serviceDeskDescription).toBeVisible();
      await expect(this.enableServiceDeskCheckbox).toBeVisible();
      await expect(this.serviceDeskHelpText).toBeVisible();
    });
  }

  async verifyRadioButtonOptions(): Promise<void> {
    await test.step('Verify radio button options are visible', async () => {
      await expect(this.supportTeamsOnlyRadio).toBeVisible();
      await expect(this.supportForEveryoneRadio).toBeVisible();
      await expect(this.supportTeamsOnlyDescription).toBeVisible();
      await expect(this.supportForEveryoneDescription).toBeVisible();
    });
  }

  async verifyRadioButtonDescriptions(): Promise<void> {
    await test.step('Verify description text under each radio button', async () => {
      await expect(this.supportTeamsOnlyDescription).toBeVisible();
      await expect(this.supportTeamsOnlyDescription).toContainText(
        'Only support teams and admins will have access to the Service desk feature to manage requests and incidents.'
      );

      await expect(this.supportForEveryoneDescription).toBeVisible();
      await expect(this.supportForEveryoneDescription).toContainText(
        'All employees will see the Support option to raise requests and track tickets, while support teams continue managing them through Service desk.'
      );
    });
  }

  /**
   * Verify radio button options are NOT visible
   */
  async verifyRadioButtonOptionsNotVisible(): Promise<void> {
    await test.step('Verify radio button options are not visible', async () => {
      await expect(this.supportTeamsOnlyRadio).not.toBeVisible();
      await expect(this.supportForEveryoneRadio).not.toBeVisible();
    });
  }

  /**
   * Select radio button option
   * @param option - 'support-teams' or 'everyone'
   */
  async selectRadioOption(option: 'support-teams' | 'everyone'): Promise<void> {
    await test.step(`Select ${option} radio option`, async () => {
      if (option === 'support-teams') {
        await this.supportTeamsOnlyRadio.check();
      } else {
        await this.supportForEveryoneRadio.check();
      }
    });
  }

  /**
   * Click Save and verify success toast (only if Save button is enabled)
   */
  async saveAndVerify(): Promise<void> {
    await test.step('Save and verify success', async () => {
      const isEnabled = await this.saveButton.isEnabled();
      if (isEnabled) {
        await this.saveButton.click();
        await expect(this.successToast).toBeVisible({ timeout: TIMEOUTS.SHORT });
        // Wait for page to be ready - fallback to waiting for save button to be disabled if networkidle times out
        await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(async () => {
          await expect(this.saveButton).toBeDisabled({ timeout: TIMEOUTS.VERY_SHORT });
        });
      }
    });
  }

  /**
   * Check/Enable the Service Desk checkbox (without saving)
   */
  async checkEnableServiceDesk(): Promise<void> {
    await test.step('Check Enable Service Desk checkbox', async () => {
      await expect(this.enableServiceDeskCheckbox).toBeVisible();
      const isChecked = await this.enableServiceDeskCheckbox.isChecked();
      if (!isChecked) {
        await this.enableServiceDeskCheckbox.check();
      }
    });
  }

  /**
   * Uncheck/Disable the Service Desk checkbox (without saving)
   */
  async uncheckDisableServiceDesk(): Promise<void> {
    await test.step('Uncheck Disable Service Desk checkbox', async () => {
      await expect(this.enableServiceDeskCheckbox).toBeVisible();
      const isChecked = await this.enableServiceDeskCheckbox.isChecked();
      if (isChecked) {
        await this.enableServiceDeskCheckbox.uncheck();
      }
    });
  }

  /**
   * Get current Service Desk state (enabled/disabled and selected option)
   * @returns Object with enabled status and selected option (if enabled)
   */
  async getServiceDeskState(): Promise<{ enabled: boolean; option?: 'support-teams' | 'everyone' }> {
    await test.step('Get current Service Desk state', async () => {
      await expect(this.enableServiceDeskCheckbox).toBeVisible();
    });

    const enabled = await this.enableServiceDeskCheckbox.isChecked();
    let option: 'support-teams' | 'everyone' | undefined;

    if (enabled) {
      // Check which radio option is selected
      const supportTeamsOnlyChecked = await this.supportTeamsOnlyRadio.isChecked();
      const supportForEveryoneChecked = await this.supportForEveryoneRadio.isChecked();

      if (supportTeamsOnlyChecked) {
        option = 'support-teams';
      } else if (supportForEveryoneChecked) {
        option = 'everyone';
      }
    }

    return { enabled, option };
  }

  async restoreServiceDeskState(state: { enabled: boolean; option?: 'support-teams' | 'everyone' }): Promise<void> {
    await test.step(`Restore Service Desk state: ${state.enabled ? 'enabled' : 'disabled'}`, async () => {
      const currentState = await this.getServiceDeskState();

      if (currentState.enabled === state.enabled && currentState.option === state.option) {
        return;
      }

      if (state.enabled) {
        await this.checkEnableServiceDesk();
        if (state.option) {
          await this.selectRadioOption(state.option);
        }
      } else {
        await this.uncheckDisableServiceDesk();
      }

      await this.saveAndVerify();
    });
  }

  /**
   * Navigate to Service Desk home page
   */
  async navigateToHome(): Promise<void> {
    await test.step('Navigate to Service Desk home', async () => {
      await this.goToUrl(`${this.getServiceDeskUrl()}/home`, {
        waitUntil: 'domcontentloaded',
      });
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);
    });
  }

  /**
   * Navigate to Service Desk request management page where workspaces are visible
   */
  async navigateToRequestManagement(): Promise<void> {
    await test.step('Navigate to Service Desk request management', async () => {
      await this.goToUrl(`${this.getServiceDeskUrl()}/service-desk/settings/request-management`, {
        waitUntil: 'domcontentloaded',
      });
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);
    });
  }

  /**
   * Navigate to Global Settings page within Service Desk
   * Follows the UI navigation path: Home → Application settings → Manage features → Service desk → Settings → Global
   */
  async navigateToGlobalSettings(): Promise<void> {
    await test.step('Navigate to Global Settings', async () => {
      await this.goToUrl(`${this.getServiceDeskUrl()}/home`, {
        waitUntil: 'domcontentloaded',
      });

      await this.applicationSettingsMenu.click();
      await this.manageFeaturesMenu.click();
      await this.serviceDeskButton.click();

      await this.goToUrl(`${this.getServiceDeskUrl()}/service-desk/settings/request-management`, {
        waitUntil: 'domcontentloaded',
      });

      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      const globalButtonLocator = await this.findGlobalButton();
      await globalButtonLocator.click();
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Verify that Global Settings page is accessible (for authorized users)
   */
  async verifyGlobalSettingsAccessible(): Promise<void> {
    await test.step('Verify Global Settings is accessible', async () => {
      await this.findGlobalButton();

      await this.page.waitForTimeout(2000);
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});

      const isHeadingVisible = await this.workspaceSettingHeading.isVisible({ timeout: 3000 }).catch(() => false);
      const isTabVisible = await this.tabTrigger0.isVisible({ timeout: 3000 }).catch(() => false);

      if (isHeadingVisible || isTabVisible) {
        return;
      }

      const currentUrl = this.page.url();
      if (currentUrl.includes('/service-desk/settings')) {
        const hasFormElements = await this.formElements
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false);
        if (hasFormElements) {
          return;
        }
      }

      throw new Error('Global Settings content not found after clicking Global button.');
    });
  }

  /**
   * Verify that Global Settings page is NOT accessible (for unauthorized users)
   * @param options - Optional parameter to skip UI navigation
   */
  async verifyGlobalSettingsNotAccessible(options?: { skipUINavigation?: boolean }): Promise<void> {
    await test.step('Verify Global Settings is not accessible', async () => {
      const skipUI = options?.skipUINavigation ?? false;

      if (!skipUI) {
        await this.goToUrl(`${this.getServiceDeskUrl()}/home`, {
          waitUntil: 'domcontentloaded',
        });

        const isAppSettingsVisible = await this.applicationSettingsMenu.isVisible({ timeout: 2000 }).catch(() => false);

        if (isAppSettingsVisible) {
          await this.applicationSettingsMenu.click();

          const isManageFeaturesVisible = await this.manageFeaturesMenu.isVisible({ timeout: 2000 }).catch(() => false);

          if (isManageFeaturesVisible) {
            await this.manageFeaturesMenu.click();

            const isServiceDeskButtonVisible = await this.serviceDeskButton
              .isVisible({ timeout: 2000 })
              .catch(() => false);

            if (isServiceDeskButtonVisible) {
              await this.serviceDeskButton.click();

              await this.goToUrl(`${this.getServiceDeskUrl()}/service-desk/settings/request-management`, {
                waitUntil: 'domcontentloaded',
              });

              await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
              await this.page.waitForTimeout(2000);

              expect(await this.isGlobalButtonVisible()).toBeFalsy();
              return;
            }
          }
        }
      }

      await this.goToUrl(`${this.getServiceDeskUrl()}/service-desk/settings/request-management`, {
        waitUntil: 'domcontentloaded',
      });

      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      const currentUrl = this.page.url();
      const isOnSettingsPage = currentUrl.includes('/service-desk/settings/request-management');

      if (isOnSettingsPage) {
        expect(await this.isGlobalButtonVisible()).toBeFalsy();
      } else {
        expect(currentUrl).not.toContain('/service-desk/settings/request-management');
      }
    });
  }

  /**
   * Select a workspace by name
   * @param workspaceName - Name of the workspace (Finance, HR, or IT)
   */
  async selectWorkspace(workspaceName: string): Promise<void> {
    await test.step(`Select ${workspaceName} workspace`, async () => {
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      await expect(this.rocketButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await this.rocketButton.click();
      await this.page.waitForTimeout(1000);

      const workspaceButton = this.page
        .locator('button')
        .filter({ hasText: new RegExp(`${workspaceName}published`, 'i') });

      await expect(workspaceButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await workspaceButton.click();
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Navigate to workspace settings
   */
  async navigateToWorkspaceSettings(): Promise<void> {
    await test.step('Navigate to workspace settings', async () => {
      await expect(this.settingsNavButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await this.settingsNavButton.click();
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Verify all four main settings tabs are present
   */
  async verifySettingsTabs(): Promise<void> {
    await test.step('Verify all settings tabs are present', async () => {
      for (let i = 0; i < 4; i++) {
        const tab = this.page.getByTestId(`tab-trigger-${i}`);
        await expect(tab).toBeVisible({ timeout: TIMEOUTS.SHORT });
      }
    });
  }

  /**
   * Click on a settings tab
   * @param tabIndex - Index of the tab (0-3)
   */
  async clickSettingsTab(tabIndex: number): Promise<void> {
    await test.step(`Click on settings tab ${tabIndex}`, async () => {
      const tab = this.page.getByTestId(`tab-trigger-${tabIndex}`);
      await expect(tab).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await tab.click();
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Verify workspace management cards
   */
  async verifyWorkspaceManagementCards(): Promise<void> {
    await test.step('Verify workspace management cards', async () => {
      const workspaceCard = this.page.getByTestId('Workspace-card');
      const emailNotificationCard = this.page.getByTestId('Email notification-card');

      await expect(workspaceCard).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await expect(emailNotificationCard).toBeVisible({ timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Verify user management cards
   */
  async verifyUserManagementCards(): Promise<void> {
    await test.step('Verify user management cards', async () => {
      const agentGroupsCard = this.page.getByTestId('Agent groups-card');
      await expect(agentGroupsCard).toBeVisible({ timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Verify service management cards
   */
  async verifyServiceManagementCards(): Promise<void> {
    await test.step('Verify service management cards', async () => {
      const serviceCatalogCard = this.page.getByTestId('Service catalog-card');
      const businessHoursCard = this.page.getByTestId('Business hours setup-card');
      const slaPolicyCard = this.page.getByTestId('SLA and OLA policy-card');

      await expect(serviceCatalogCard).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await expect(businessHoursCard).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await expect(slaPolicyCard).toBeVisible({ timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Verify automation and productivity cards
   */
  async verifyAutomationAndProductivityCards(): Promise<void> {
    await test.step('Verify automation and productivity cards', async () => {
      const messageTemplateCard = this.page.getByTestId('Message template-card');
      await expect(messageTemplateCard).toBeVisible({ timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Verify service catalogs for a workspace
   * @param serviceCatalogNames - Array of service catalog names to verify
   * @param workspaceName - Name of the workspace (Finance, HR, or IT)
   */
  async verifyServiceCatalogs(serviceCatalogNames: string[], workspaceName: string): Promise<void> {
    await test.step('Verify service catalogs are present', async () => {
      const serviceCatalogCard = this.page.getByTestId('Service catalog-card');
      await expect(serviceCatalogCard).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await serviceCatalogCard.click();
      await this.page.waitForTimeout(1000);

      for (const catalogName of serviceCatalogNames) {
        const catalogLink = this.page.getByRole('link', { name: new RegExp(catalogName, 'i') });
        await expect(catalogLink).toBeVisible({ timeout: TIMEOUTS.SHORT });
      }

      await this.navigateBackToWorkspaceSettings(workspaceName);
    });
  }

  /**
   * Navigate back to workspace settings from a card
   * @param workspaceName - Name of the workspace (Finance, HR, or IT)
   */
  async navigateBackToWorkspaceSettings(workspaceName: string): Promise<void> {
    await test.step(`Navigate back to ${workspaceName} workspace settings`, async () => {
      const settingsLink = this.page.getByRole('link', { name: new RegExp(`${workspaceName} settings`, 'i') });
      await expect(settingsLink).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await settingsLink.click();
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Verify all settings for a workspace
   * @param workspaceName - Name of the workspace (Finance, HR, or IT)
   * @param serviceCatalogs - Array of service catalog names for this workspace
   */
  async verifyWorkspaceSettings(workspaceName: string, serviceCatalogs: string[]): Promise<void> {
    await test.step(`Verify all settings for ${workspaceName} workspace`, async () => {
      await this.selectWorkspace(workspaceName);
      await this.navigateToWorkspaceSettings();
      await this.verifySettingsTabs();

      await this.clickSettingsTab(0);
      await this.verifyWorkspaceManagementCards();

      await this.clickSettingsTab(1);
      await this.verifyUserManagementCards();

      await this.clickSettingsTab(2);
      await this.verifyServiceManagementCards();
      if (serviceCatalogs.length > 0) {
        await this.verifyServiceCatalogs(serviceCatalogs, workspaceName);
      }

      await this.clickSettingsTab(3);
      await this.verifyAutomationAndProductivityCards();
    });
  }

  /**
   * Switch workspace by clicking rocket button and selecting workspace
   * @param workspaceName - Name of the workspace (Finance, HR, or IT)
   */
  async switchWorkspace(workspaceName: string): Promise<void> {
    await test.step(`Switch to ${workspaceName} workspace`, async () => {
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(1000);

      await expect(this.rocketButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await this.rocketButton.click();
      await this.page.waitForTimeout(1000);

      const workspaceButton = this.page
        .locator('button')
        .filter({ hasText: new RegExp(`${workspaceName}published`, 'i') });

      await expect(workspaceButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await workspaceButton.click();
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Navigate to Global Settings and Agent management
   */
}
