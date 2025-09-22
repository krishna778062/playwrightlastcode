import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { PlatformFeatureTags, PlatformSuiteTags } from '@platforms/constants/testTags';

test.describe(
  'Test Footer in Homepage',
  {
    tag: [PlatformSuiteTags.FOOTER],
  },
  () => {
    test(
      'Verify that the footer is visible in the homepage',
      {
        tag: [TestPriority.P0, PlatformFeatureTags.SEO],
      },
      async ({ page }) => {
        const homePage = await LoginHelper.loginWithPassword(page, {
          email: getEnvConfig().appManagerEmail,
          password: getEnvConfig().appManagerPassword,
        });
        await homePage.verifyThePageIsLoaded();
        await homePage.getFooterComponent().verifyNavigationOfPrivacyPolicyLink();
      }
    );
  }
);
