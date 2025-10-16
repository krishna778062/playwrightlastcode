import { Page } from '@playwright/test';

import { getFrontlineTenantConfigFromCache } from '../config/frontlineConfig';

/**
 * Navigation helper that uses the current tenant config for navigation
 * Automatically builds full URLs based on cached tenant configuration
 */
export class FrontlineNavigationHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to a path using the current tenant's base URL
   * @param path - Relative path (e.g., '/login', '/home')
   */
  async goto(path: string): Promise<void> {
    const config = getFrontlineTenantConfigFromCache();
    const fullUrl = `${config.frontendBaseUrl}${path}`;
    console.log(`🔧 Navigating to: ${fullUrl} (tenant: ${config.tenantName})`);
    await this.page.goto(fullUrl);
  }

  /**
   * Navigate to login page using current tenant
   */
  async gotoLogin(): Promise<void> {
    await this.goto('/login');
  }

  /**
   * Navigate to home page using current tenant
   */
  async gotoHome(): Promise<void> {
    await this.goto('/home');
  }
}
