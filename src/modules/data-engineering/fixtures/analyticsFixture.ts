import type { UserType } from '@data-engineering/fixtures/loginFixture';
import { test as base } from '@data-engineering/fixtures/loginFixture';
import { AnalyticsLandingPage } from '@data-engineering/pages/analyticsLandingPage';
import { expect } from '@playwright/test';

import { SideNavBarComponent } from '@core/ui/components/sideNavBarComponent';

export const test = base.extend<{
  openAppAnalytics: (userType?: UserType) => Promise<void>;
}>({
  openAppAnalytics: async ({ page, loginAs }, use) => {
    await use(async (userType: UserType = 'appManager') => {
      await loginAs(userType);

      const sideNav = new SideNavBarComponent(page);
      const landing: AnalyticsLandingPage = await sideNav.clickOnAnalyticsButton();

      await landing.verifyAppAnalyticsButtonIsVisible();
      await landing.clickOnAppAnalyticsButton();
    });
  },
});

export { expect };
