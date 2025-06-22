import { test } from '@playwright/test';
import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

test.describe(
  'Test Footer in Homepage',
  {
    tag: [TestSuite.FOOTER],
  },
  () => {
    test(
      'Verify that the footer is visible in the homepage',
      {
        tag: [TestPriority.P0, `@privacy-policy`],
      },
      async ({ page }) => {
        const homePage = await LoginHelper.loginWithPassword(page, {
          email: getEnvConfig().appManagerEmail,
          password: getEnvConfig().appManagerPassword,
        });
        await homePage.verifyThePageIsLoaded();
        await homePage.getFooterComponent().verifynavigationofprivacyPolicyLink();
      }
    );
  }
);
