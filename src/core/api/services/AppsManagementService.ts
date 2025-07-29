import { BaseApiClient } from '@/src/core/api/clients/baseApiClient';
import { APIRequestContext } from '@playwright/test';
import { IAppsManagementOperations } from '@/src/core/api/interfaces/IAppsManagementOperations';
import { App, AppsSettingsPayload, AppsSettingsResponse } from '../../types/app.type';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { test, expect } from '@playwright/test';

export class AppsManagementService extends BaseApiClient implements IAppsManagementOperations {
  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
  }

  /**
   * Gets the current apps settings
   * @returns The current apps settings
   */
  async getAppsSettings(): Promise<AppsSettingsResponse> {
    const response = await this.get(API_ENDPOINTS.apps.settings);
    return response.json();
  }

  /**
   * Updates the apps settings with the provided payload
   * @param payload - The apps settings payload
   * @returns The updated apps settings response
   */
  async updateAppsSettings(payload: AppsSettingsPayload): Promise<AppsSettingsResponse> {
    const response = await this.put(API_ENDPOINTS.apps.settings, {
      data: payload,
    });
    return response.json();
  }

  /**
   * Adds a new app to the apps settings
   * @param app - The app to add
   * @returns The updated apps settings response
   */
  async addApp(app: App): Promise<AppsSettingsResponse> {
    console.log(`Adding app: ${app.name}`);
    const currentSettings = await this.getAppsSettings();
    const updatedApps = [...currentSettings.result.externalApps.json, app];

    const updatedPayload: AppsSettingsPayload = {
      ...currentSettings.result,
      externalApps: {
        ...currentSettings.result.externalApps,
        json: updatedApps,
        appsIntegrationProvider: 'custom',
      },
    };

    return await this.updateAppsSettings(updatedPayload);
  }

  /**
   * Removes an app from the apps settings by name
   * @param appName - The name of the app to remove
   * @returns The updated apps settings response
   */
  async removeApp(appName: string): Promise<AppsSettingsResponse> {
    console.log(`Removing app: ${appName}`);
    const currentSettings = await this.getAppsSettings();
    const updatedApps = currentSettings.result.externalApps.json.filter(app => app.name !== appName);

    const updatedPayload: AppsSettingsPayload = {
      ...currentSettings.result,
      externalApps: {
        ...currentSettings.result.externalApps,
        json: updatedApps,
      },
    };

    return await this.updateAppsSettings(updatedPayload);
  }

  /**
   * Gets the launchpad apps list
   * @returns The launchpad apps list response
   */
  async getLaunchpadAppsList(): Promise<any> {
    const response = await this.post(API_ENDPOINTS.apps.list);
    return response.json();
  }

  /**
   * Waits for a specific app to appear in the launchpad apps list
   * @param appName - The name of the app to wait for
   * @param timeout - The timeout in milliseconds (default: 60 seconds)
   * @returns Promise that resolves when the app is found
   */
  async waitForAppToAppearInLaunchpadList(appName: string, timeout: number = 60_000): Promise<void> {
    await test.step(`Waiting for app "${appName}" to appear in launchpad apps list`, async () => {
      await expect(
        async () => {
          const response = await this.getLaunchpadAppsList();
          const apps = response.result?.listOfApps || [];
          const foundApp = apps.find((app: any) => app.name === appName);
          expect(foundApp).toBeDefined();
        },
        {
          message: `App "${appName}" to appear in launchpad apps list`,
        }
      ).toPass({ intervals: [5000, 10000, 15000, 20000], timeout: timeout });
    });
  }
}
