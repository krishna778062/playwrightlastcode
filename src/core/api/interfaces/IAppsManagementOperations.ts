import { App, AppsSettingsPayload, AppsSettingsResponse } from '../../types/app.type';

export interface IAppsManagementOperations {
  getAppsSettings(): Promise<AppsSettingsResponse>;
  updateAppsSettings(payload: AppsSettingsPayload): Promise<AppsSettingsResponse>;
  addApp(app: App): Promise<AppsSettingsResponse>;
  removeApp(appName: string): Promise<AppsSettingsResponse>;
  getLaunchpadAppsList(): Promise<any>;
  waitForAppToAppearInLaunchpadList(appName: string, timeout?: number): Promise<void>;
}
