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
  private readonly appsButton: Locator;

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
    this.settingsNavButton = page.getByRole('link', { name: 'Settings', exact: true });
    this.workspacePopoverLauncher = page.getByTestId('popover-launcher');
    this.rocketButton = page.getByRole('button', { name: 'rocket' });
    this.appsButton = page.getByTestId('popover-launcher').getByRole('button', { name: 'apps' });
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
  /**
   * Verify all UI elements on Service Desk settings page under Manage Application
   * Covers: label (headings), description, checkbox, and help text
   * SHSD-213: UI validation of ServiceDesk under Manage Application
   */
  async verifyServiceDeskSettingsPageElements(): Promise<void> {
    await test.step('Verify Service Desk settings page elements (label, description, checkbox)', async () => {
      // Verify "Manage application" heading (label)
      await expect(this.manageApplicationHeading).toBeVisible();

      // Verify "Enable/Disable Service desk" section heading
      await expect(this.serviceDeskSettingsHeading).toBeVisible();

      // Verify main description text
      await expect(this.serviceDeskDescription).toBeVisible();

      // Verify enable checkbox
      await expect(this.enableServiceDeskCheckbox).toBeVisible();

      // Verify help text
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
      await expect(this.enableServiceDeskCheckbox).toBeVisible({ timeout: TIMEOUTS.SHORT });
    });

    const enabled = await this.enableServiceDeskCheckbox.isChecked();
    let option: 'support-teams' | 'everyone' | undefined;

    if (enabled) {
      // Wait for radio buttons to be visible before checking
      const isSupportTeamsVisible = await this.supportTeamsOnlyRadio.isVisible({ timeout: 3000 }).catch(() => false);
      const isSupportEveryoneVisible = await this.supportForEveryoneRadio
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      if (isSupportTeamsVisible) {
        const supportTeamsOnlyChecked = await this.supportTeamsOnlyRadio.isChecked().catch(() => false);
        if (supportTeamsOnlyChecked) {
          option = 'support-teams';
        }
      }

      if (isSupportEveryoneVisible && !option) {
        const supportForEveryoneChecked = await this.supportForEveryoneRadio.isChecked().catch(() => false);
        if (supportForEveryoneChecked) {
          option = 'everyone';
        }
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

      // Try multiple strategies to find workspace selector
      const isAppsButtonVisible = await this.appsButton.isVisible({ timeout: 3000 }).catch(() => false);
      const isRocketButtonVisible = await this.rocketButton.isVisible({ timeout: 3000 }).catch(() => false);

      if (isAppsButtonVisible) {
        await this.appsButton.click();
      } else if (isRocketButtonVisible) {
        await this.rocketButton.click();
      } else {
        // Try popover launcher
        const popoverLauncher = this.page.getByTestId('popover-launcher');
        const isPopoverVisible = await popoverLauncher.isVisible({ timeout: 3000 }).catch(() => false);
        if (isPopoverVisible) {
          await popoverLauncher.click();
        } else {
          // Look for any workspace selector button
          const workspaceSelector = this.page
            .locator('[data-testid*="workspace"], button:has-text("workspace")')
            .first();
          const isWorkspaceSelectorVisible = await workspaceSelector.isVisible({ timeout: 3000 }).catch(() => false);
          if (isWorkspaceSelectorVisible) {
            await workspaceSelector.click();
          }
        }
      }
      await this.page.waitForTimeout(1000);

      // Try multiple patterns to find workspace button
      let workspaceButton = this.page
        .locator('button')
        .filter({ hasText: new RegExp(`${workspaceName}published`, 'i') });
      let isWorkspaceVisible = await workspaceButton.isVisible({ timeout: 3000 }).catch(() => false);

      if (!isWorkspaceVisible) {
        // Try without "published"
        workspaceButton = this.page.locator('button').filter({ hasText: new RegExp(workspaceName, 'i') });
        isWorkspaceVisible = await workspaceButton.isVisible({ timeout: 3000 }).catch(() => false);
      }

      if (!isWorkspaceVisible) {
        // Try role-based locator
        workspaceButton = this.page.getByRole('button', { name: new RegExp(workspaceName, 'i') });
        isWorkspaceVisible = await workspaceButton.isVisible({ timeout: 3000 }).catch(() => false);
      }

      if (isWorkspaceVisible) {
        await workspaceButton.click();
        await this.page.waitForTimeout(1000);
      }
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

      const isAppsButtonVisible = await this.appsButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (isAppsButtonVisible) {
        await this.appsButton.click();
      } else {
        await expect(this.rocketButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
        await this.rocketButton.click();
      }
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
   * Navigate to Message Template page within a workspace
   * Path: /service-desk/settings/workspace/message-template
   * @param workspaceName - Name of the workspace (Finance, HR, or IT)
   */
  async navigateToMessageTemplate(workspaceName: string): Promise<void> {
    await test.step(`Navigate to Message Template for ${workspaceName} workspace`, async () => {
      // Go to manage features page first
      await this.goToUrl(`${this.getServiceDeskUrl()}/nav-manage-features`, {
        waitUntil: 'domcontentloaded',
      });
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      // Click on the three lines icon to open the sidebar
      const threeLinesIcon = this.page.getByRole('button', { name: 'Open main navigation' });
      const isThreeLinesVisible = await threeLinesIcon.isVisible({ timeout: 3000 }).catch(() => false);
      if (isThreeLinesVisible) {
        await threeLinesIcon.click();
        await this.page.waitForTimeout(1000);
      }

      // Click on "Service desk" link in the sidebar
      const serviceDeskLink = this.page
        .getByRole('link', { name: 'Service desk' })
        .or(this.page.getByText('Service desk').first());
      await serviceDeskLink.first().click();
      await this.page.waitForTimeout(2000);

      // Click on Settings button in the left sidebar
      const settingsButton = this.page.getByRole('link', { name: 'Settings' });
      await expect(settingsButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await settingsButton.click();
      await this.page.waitForTimeout(2000);

      // Click on Automation and productivity tab
      const automationTab = this.page
        .getByRole('tab', { name: /Automation and productivity/i })
        .or(this.page.getByText('Automation and productivity'));
      await expect(automationTab.first()).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await automationTab.first().click();
      await this.page.waitForTimeout(1000);

      // Click on Message template card
      const messageTemplateCard = this.page.getByText('Message template').first();
      await expect(messageTemplateCard).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await messageTemplateCard.click();
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Create a new message template
   * @param templateData - Object containing name, description, and message content
   * @param visibility - Visibility option: 'All agents' or 'Only me'
   */
  async createMessageTemplate(
    templateData: { name: string; description: string; messageContent: string },
    visibility: string = 'All agents'
  ): Promise<void> {
    await test.step(`Create message template: ${templateData.name}`, async () => {
      // Click on Add template button - try multiple locator strategies
      const addButtonStrategies = [
        this.page.getByRole('button', { name: /Add template|Create template|New template/i }),
        this.page.getByRole('button', { name: /Add|Create|\+/i }),
        this.page.locator('button:has-text("Add")'),
        this.page.locator('[data-testid*="add"], [data-testid*="create"]').first(),
        this.page
          .locator('button')
          .filter({ hasText: /Add|Create|New|\+/ })
          .first(),
      ];

      let addButtonClicked = false;
      for (const button of addButtonStrategies) {
        const isVisible = await button.isVisible({ timeout: 3000 }).catch(() => false);
        if (isVisible) {
          await button.click();
          addButtonClicked = true;
          break;
        }
      }

      if (!addButtonClicked) {
        throw new Error('Add template button not found');
      }
      await this.page.waitForTimeout(1000);

      // Fill template name - try multiple strategies
      const nameInputStrategies = [
        this.page.getByPlaceholder('Enter title'),
        this.page.getByRole('textbox', { name: /title|name/i }).first(),
        this.page.locator('input[type="text"]').first(),
      ];

      for (const input of nameInputStrategies) {
        const isVisible = await input.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          await input.fill(templateData.name);
          break;
        }
      }

      // Fill message content (rich text editor)
      const richTextEditor = this.page.locator('[contenteditable="true"]').first();
      const isRichTextVisible = await richTextEditor.isVisible({ timeout: 3000 }).catch(() => false);
      if (isRichTextVisible) {
        await richTextEditor.click();
        await richTextEditor.fill(templateData.messageContent);
      } else {
        const messageInput = this.page.getByPlaceholder('Type your message');
        const isMessageInputVisible = await messageInput.isVisible({ timeout: 2000 }).catch(() => false);
        if (isMessageInputVisible) {
          await messageInput.click();
          await messageInput.fill(templateData.messageContent);
        }
      }

      // Select visibility option
      const allAgentsRadio = this.page.getByRole('radio', { name: /all agents/i });
      const isAllAgentsVisible = await allAgentsRadio.isVisible({ timeout: 2000 }).catch(() => false);
      if (visibility.toLowerCase().includes('all') && isAllAgentsVisible) {
        await allAgentsRadio.check();
      }

      // Click Save/Create button
      const saveButton = this.page.getByRole('button', { name: /Save|Create|Submit/i });
      await expect(saveButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await saveButton.click();
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Verify message template creation success
   */
  async verifyMessageTemplateCreated(templateName: string): Promise<void> {
    await test.step(`Verify message template "${templateName}" is created`, async () => {
      // Wait for success toast or verify template appears in list
      const successToast = this.page.getByText(/created successfully|saved successfully|template added/i);
      const isToastVisible = await successToast.isVisible({ timeout: 5000 }).catch(() => false);

      if (isToastVisible) {
        await expect(successToast).toBeVisible();
      }

      // Verify template appears in the list
      const templateInList = this.page.getByText(templateName);
      await expect(templateInList).toBeVisible({ timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Delete a message template by name (cleanup)
   * @param templateName - Name of the template to delete
   */
  async deleteMessageTemplate(templateName: string): Promise<void> {
    await test.step(`Delete message template: ${templateName}`, async () => {
      // Find and click on the template
      const templateRow = this.page.locator('tr, div[role="row"]').filter({ hasText: templateName });
      const isTemplateVisible = await templateRow.isVisible({ timeout: 3000 }).catch(() => false);

      if (isTemplateVisible) {
        // Look for delete button or menu
        const deleteButton = templateRow.getByRole('button', { name: /delete|remove/i });
        const isDeleteVisible = await deleteButton.isVisible({ timeout: 2000 }).catch(() => false);

        if (isDeleteVisible) {
          await deleteButton.click();
        } else {
          // Try dropdown menu
          const menuButton = templateRow.getByTestId('dropdown-trigger');
          const isMenuVisible = await menuButton.isVisible({ timeout: 2000 }).catch(() => false);
          if (isMenuVisible) {
            await menuButton.click();
            await this.page.getByText('Delete').click();
          }
        }

        // Confirm delete if dialog appears
        const confirmButton = this.page.getByRole('button', { name: /Delete|Confirm|Yes/i });
        const isConfirmVisible = await confirmButton.isVisible({ timeout: 2000 }).catch(() => false);
        if (isConfirmVisible) {
          await confirmButton.click();
        }

        await this.page.waitForTimeout(1000);
      }
    });
  }

  /**
   * Navigate to Workspace Administration/Agents page
   * Path: /service-desk/settings/workspace/administration/{workspaceId}
   * @param workspaceName - Name of the workspace to navigate to
   */
  async navigateToWorkspaceAdministration(workspaceName: string): Promise<void> {
    await test.step(`Navigate to ${workspaceName} Workspace Administration`, async () => {
      // Go to manage features page first
      await this.goToUrl(`${this.getServiceDeskUrl()}/nav-manage-features`, {
        waitUntil: 'domcontentloaded',
      });
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      // Click on the three lines icon to open the sidebar
      const threeLinesIcon = this.page.getByRole('button', { name: 'Open main navigation' });
      const isThreeLinesVisible = await threeLinesIcon.isVisible({ timeout: 3000 }).catch(() => false);
      if (isThreeLinesVisible) {
        await threeLinesIcon.click();
        await this.page.waitForTimeout(1000);
      }

      // Click on "Service desk" link in the sidebar
      const serviceDeskLink = this.page
        .getByRole('link', { name: 'Service desk' })
        .or(this.page.getByText('Service desk').first());
      await serviceDeskLink.first().click();
      await this.page.waitForTimeout(2000);

      // Click on Settings button in the left sidebar
      const settingsButton = this.page.getByRole('link', { name: 'Settings' });
      await expect(settingsButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await settingsButton.click();
      await this.page.waitForTimeout(2000);

      // Click on Workspace management tab (first tab)
      const workspaceMgmtTab = this.page
        .getByRole('tab', { name: /Workspace management/i })
        .or(this.page.getByText('Workspace management'));
      await expect(workspaceMgmtTab.first()).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await workspaceMgmtTab.first().click();
      await this.page.waitForTimeout(1000);

      // Click on Workspace card/option
      const workspaceCard = this.page
        .getByTestId('Workspace-card')
        .or(this.page.locator('[data-testid*="Workspace"]').first())
        .or(this.page.getByRole('button', { name: /Workspace/i }))
        .or(
          this.page
            .locator('div')
            .filter({ hasText: /^Workspace$/ })
            .first()
        );
      await expect(workspaceCard.first()).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await workspaceCard.first().click();
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Verify that Workspace Administration/Agents screen is accessible (for admin users)
   */
  async verifyWorkspaceAdministrationAccessible(): Promise<void> {
    await test.step('Verify Workspace Administration is accessible', async () => {
      // Verify we can see agent-related content (e.g., agent groups, agents list, add agent button)
      const agentGroupsHeading = this.page.getByRole('heading', { name: /Agent groups|Agents/i });
      const addAgentButton = this.page.getByRole('button', { name: /Add agent|Create agent|New agent/i });
      const agentTable = this.page.getByRole('table');
      const agentListItems = this.page.locator('[data-testid*="agent"]');

      const isHeadingVisible = await agentGroupsHeading.isVisible({ timeout: 3000 }).catch(() => false);
      const isAddButtonVisible = await addAgentButton.isVisible({ timeout: 2000 }).catch(() => false);
      const isTableVisible = await agentTable.isVisible({ timeout: 2000 }).catch(() => false);
      const hasAgentItems = (await agentListItems.count().catch(() => 0)) > 0;

      // At least one of these should be visible for successful access
      const hasAccess = isHeadingVisible || isAddButtonVisible || isTableVisible || hasAgentItems;

      if (!hasAccess) {
        // Check if we're on the correct page by URL
        const currentUrl = this.page.url();
        const isOnAgentPage =
          currentUrl.includes('/agent') ||
          currentUrl.includes('/administration') ||
          currentUrl.includes('/user-management');
        expect(isOnAgentPage).toBeTruthy();
      }
    });
  }

  /**
   * Verify that Workspace Administration/Agents screen is NOT accessible (for non-admin users)
   * @param workspaceName - Name of the workspace to try accessing
   */
  async verifyWorkspaceAdministrationNotAccessible(workspaceName: string): Promise<void> {
    await test.step('Verify Workspace Administration is not accessible', async () => {
      // Go to manage features page first (manual navigation)
      await this.goToUrl(`${this.getServiceDeskUrl()}/nav-manage-features`, {
        waitUntil: 'domcontentloaded',
      });
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      // Click on the three lines icon to open the sidebar
      const threeLinesIcon = this.page.getByRole('button', { name: 'Open main navigation' });
      const isThreeLinesVisible = await threeLinesIcon.isVisible({ timeout: 3000 }).catch(() => false);
      if (isThreeLinesVisible) {
        await threeLinesIcon.click();
        await this.page.waitForTimeout(1000);
      }

      // Click on "Service desk" link in the sidebar
      const serviceDeskLink = this.page
        .getByRole('link', { name: 'Service desk' })
        .or(this.page.getByText('Service desk').first());
      await serviceDeskLink.first().click();
      await this.page.waitForTimeout(2000);

      // Check if Settings button is available (Agent should not have access or have limited access)
      const settingsButton = this.page.getByRole('link', { name: 'Settings' });
      const isSettingsVisible = await settingsButton.isVisible({ timeout: 3000 }).catch(() => false);

      if (isSettingsVisible) {
        await settingsButton.click();
        await this.page.waitForTimeout(2000);

        // Check if User Management tab is visible
        const userMgmtTab = this.page
          .getByRole('tab', { name: /User management/i })
          .or(this.page.getByText('User management'));
        const isUserMgmtVisible = await userMgmtTab
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false);

        if (isUserMgmtVisible) {
          await userMgmtTab.first().click();
          await this.page.waitForTimeout(1000);

          // Agent groups card should not be visible or accessible
          const agentGroupsCard = this.page.getByText('Agent groups').first();
          const isAgentGroupsVisible = await agentGroupsCard.isVisible({ timeout: 2000 }).catch(() => false);

          if (isAgentGroupsVisible) {
            await agentGroupsCard.click();
            await this.page.waitForTimeout(1000);

            // Verify no admin capabilities - Add agent button should not be visible
            const addAgentButton = this.page.getByRole('button', { name: /Add agent|Create agent/i });
            const isAddVisible = await addAgentButton.isVisible({ timeout: 2000 }).catch(() => false);
            expect(isAddVisible).toBeFalsy();
          }
        }
      } else {
        // Settings not visible means restricted access - this is expected for agent
        console.log('Settings not visible - agent has restricted access as expected');
      }
    });
  }

  /**
   * Create a custom workspace
   * @param workspaceData - Object containing name, type, and description
   * @returns The name of the created workspace
   */
  async createCustomWorkspace(workspaceData: { name: string; type: string; description?: string }): Promise<string> {
    let createdWorkspaceName = workspaceData.name;

    await test.step(`Create custom workspace: ${workspaceData.name}`, async () => {
      await this.goToUrl(`${this.getServiceDeskUrl()}/service-desk/settings/request-management`, {
        waitUntil: 'domcontentloaded',
      });
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      // Click on Create/Add workspace button
      const createButton = this.page.getByRole('button', { name: /Create workspace|Add workspace|New workspace/i });
      const isCreateVisible = await createButton.isVisible({ timeout: 3000 }).catch(() => false);

      if (isCreateVisible) {
        await createButton.click();
      } else {
        // Try alternate - click on apps button and look for create option
        const isAppsButtonVisible = await this.appsButton.isVisible({ timeout: 2000 }).catch(() => false);
        if (isAppsButtonVisible) {
          await this.appsButton.click();
          await this.page.waitForTimeout(1000);
          const addButton = this.page.getByRole('button', { name: /Add|Create|New/i }).first();
          await addButton.click();
        }
      }
      await this.page.waitForTimeout(1000);

      // Fill workspace name
      const nameInput = this.page.getByRole('textbox', { name: /name/i }).first();
      await expect(nameInput).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await nameInput.fill(workspaceData.name);

      // Select workspace type if dropdown exists
      const typeDropdown = this.page.getByRole('combobox', { name: /type/i });
      const isTypeVisible = await typeDropdown.isVisible({ timeout: 2000 }).catch(() => false);
      if (isTypeVisible) {
        await typeDropdown.click();
        await this.page.getByRole('option', { name: workspaceData.type }).click();
      }

      // Fill description if field exists
      if (workspaceData.description) {
        const descInput = this.page.getByRole('textbox', { name: /description/i });
        const isDescVisible = await descInput.isVisible({ timeout: 2000 }).catch(() => false);
        if (isDescVisible) {
          await descInput.fill(workspaceData.description);
        }
      }

      // Click Save/Create button
      const saveButton = this.page.getByRole('button', { name: /Save|Create|Submit/i });
      await expect(saveButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await saveButton.click();
      await this.page.waitForTimeout(2000);

      createdWorkspaceName = workspaceData.name;
    });

    return createdWorkspaceName;
  }

  /**
   * Navigate to a custom workspace settings
   * @param workspaceName - Name of the custom workspace
   */
  async navigateToCustomWorkspaceSettings(workspaceName: string): Promise<void> {
    await test.step(`Navigate to ${workspaceName} workspace settings`, async () => {
      await this.goToUrl(`${this.getServiceDeskUrl()}/service-desk/settings/request-management`, {
        waitUntil: 'domcontentloaded',
      });
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      // Open workspace selector
      const isAppsButtonVisible = await this.appsButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (isAppsButtonVisible) {
        await this.appsButton.click();
      } else {
        await expect(this.rocketButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
        await this.rocketButton.click();
      }
      await this.page.waitForTimeout(1000);

      // Find and click on the workspace
      const workspaceButton = this.page.locator('button').filter({ hasText: new RegExp(workspaceName, 'i') });
      await expect(workspaceButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await workspaceButton.click();
      await this.page.waitForTimeout(1000);

      // Navigate to settings
      await expect(this.settingsNavButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await this.settingsNavButton.click();
      await this.page.waitForTimeout(1000);

      // Click on Workspace Management tab (tab index 0)
      await this.clickSettingsTab(0);

      // Click on Workspace card
      const workspaceCard = this.page.getByTestId('Workspace-card');
      await expect(workspaceCard).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await workspaceCard.click();
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Edit workspace details (name, type, admins)
   * @param editData - Object containing new name, type, and/or admin to add
   */
  async editWorkspaceDetails(editData: { name?: string; type?: string; adminEmail?: string }): Promise<void> {
    await test.step('Edit workspace details', async () => {
      // Edit workspace name if provided
      if (editData.name) {
        const nameInput = this.page.getByRole('textbox', { name: /name/i }).first();
        const isNameVisible = await nameInput.isVisible({ timeout: 2000 }).catch(() => false);
        if (isNameVisible) {
          await nameInput.clear();
          await nameInput.fill(editData.name);
        }
      }

      // Edit workspace type if provided
      if (editData.type) {
        const typeDropdown = this.page.getByRole('combobox', { name: /type/i });
        const isTypeVisible = await typeDropdown.isVisible({ timeout: 2000 }).catch(() => false);
        if (isTypeVisible) {
          await typeDropdown.click();
          await this.page.getByRole('option', { name: editData.type }).click();
        }
      }

      // Add admin if provided
      if (editData.adminEmail) {
        const adminInput = this.page.getByRole('textbox', { name: /admin|manager/i });
        const isAdminVisible = await adminInput.isVisible({ timeout: 2000 }).catch(() => false);
        if (isAdminVisible) {
          await adminInput.click();
          await adminInput.fill(editData.adminEmail);
          await this.page.waitForTimeout(1000);
          // Select from dropdown if appears
          const adminOption = this.page.getByRole('option').filter({ hasText: editData.adminEmail });
          const isOptionVisible = await adminOption.isVisible({ timeout: 2000 }).catch(() => false);
          if (isOptionVisible) {
            await adminOption.click();
          }
        }
      }

      // Click Save button
      const saveButton = this.page.getByRole('button', { name: /Save|Update/i });
      await expect(saveButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await saveButton.click();
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Verify workspace edit was saved successfully
   */
  async verifyWorkspaceEditSaved(): Promise<void> {
    await test.step('Verify workspace edit saved successfully', async () => {
      // Check for success toast
      const successToast = this.page.getByText(/saved successfully|updated successfully|changes saved/i);
      const isToastVisible = await successToast.isVisible({ timeout: 5000 }).catch(() => false);

      if (isToastVisible) {
        await expect(successToast).toBeVisible();
      }

      // Alternatively, verify save button is disabled (indicating changes saved)
      const saveButton = this.page.getByRole('button', { name: /Save|Update/i });
      const isSaveDisabled = await saveButton.isDisabled({ timeout: 2000 }).catch(() => false);
      if (!isToastVisible) {
        expect(isSaveDisabled).toBeTruthy();
      }
    });
  }

  /**
   * Delete a custom workspace (cleanup)
   * @param workspaceName - Name of the workspace to delete
   */
  async deleteCustomWorkspace(workspaceName: string): Promise<void> {
    await test.step(`Delete custom workspace: ${workspaceName}`, async () => {
      await this.goToUrl(`${this.getServiceDeskUrl()}/service-desk/settings/request-management`, {
        waitUntil: 'domcontentloaded',
      });
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});
      await this.page.waitForTimeout(2000);

      // Open workspace selector
      const isAppsButtonVisible = await this.appsButton.isVisible({ timeout: 2000 }).catch(() => false);
      if (isAppsButtonVisible) {
        await this.appsButton.click();
      } else {
        await this.rocketButton.click();
      }
      await this.page.waitForTimeout(1000);

      // Find the workspace and look for delete option
      const workspaceItem = this.page.locator('button, div').filter({ hasText: new RegExp(workspaceName, 'i') });
      const isWorkspaceVisible = await workspaceItem
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (isWorkspaceVisible) {
        // Look for delete/more options button near the workspace
        const moreButton = workspaceItem.getByRole('button', { name: /more|options|menu/i });
        const isMoreVisible = await moreButton.isVisible({ timeout: 2000 }).catch(() => false);

        if (isMoreVisible) {
          await moreButton.click();
          await this.page.waitForTimeout(500);
          await this.page.getByText('Delete').click();
        } else {
          // Try right-click or hover for context menu
          await workspaceItem.first().click({ button: 'right' });
          await this.page.waitForTimeout(500);
          const deleteOption = this.page.getByText('Delete');
          const isDeleteVisible = await deleteOption.isVisible({ timeout: 2000 }).catch(() => false);
          if (isDeleteVisible) {
            await deleteOption.click();
          }
        }

        // Confirm deletion
        const confirmButton = this.page.getByRole('button', { name: /Delete|Confirm|Yes/i });
        const isConfirmVisible = await confirmButton.isVisible({ timeout: 2000 }).catch(() => false);
        if (isConfirmVisible) {
          await confirmButton.click();
        }

        await this.page.waitForTimeout(1000);
      }
    });
  }
}
