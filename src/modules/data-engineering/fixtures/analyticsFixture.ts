import type { UserType } from '@data-engineering/fixtures/loginFixture';
import { test as base } from '@data-engineering/fixtures/loginFixture';
import { expect } from '@playwright/test';

import { SideNavBarComponent } from '@core/ui/components/sideNavBarComponent';

import { AnalyticsBasePage } from '@/src/modules/data-engineering/pages/analyticsBasePage';

export const test = base.extend<{
  openAppAnalytics: (userType?: UserType) => Promise<void>;
}>({
  openAppAnalytics: async ({ page, loginAs }, use) => {
    await use(async (userType: UserType = 'appManager') => {
      await loginAs(userType);

      const sideNav = new SideNavBarComponent(page);
      await sideNav.clickOnAnalyticsButton();

      const landing = new AnalyticsBasePage(page);
      await landing.verifyAppAnalyticsButtonIsVisible();
      await landing.clickOnAppAnalyticsButton();
    });
  },
});

export { expect };
