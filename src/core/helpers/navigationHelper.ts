import { Page } from '@playwright/test';

import { SideNavBarComponent, TopNavBarComponent } from '../ui/components';
import { getEnvConfig } from '../utils/getEnvConfig';

export class NavigationHelper {
  readonly isNewUx: boolean;
  readonly topNavBarComponent: TopNavBarComponent;
  readonly sideNavBarComponent: SideNavBarComponent;
  constructor(private readonly page: Page) {
    this.isNewUx = getEnvConfig().newUxEnabled;
    this.topNavBarComponent = new TopNavBarComponent(page);
    this.sideNavBarComponent = new SideNavBarComponent(page);
  }
}
