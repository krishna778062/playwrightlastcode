import { FrontlineSuiteTags } from '@frontline/constants/testTags';
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { Roles } from '@/src/core/constants/roles';
import { UserTestDataBuilder } from '@/src/core/test-data-builders/UserTestDataBuilder';
import { getFrontlineTenantConfigFor, initializeFrontlineConfig } from '@/src/modules/frontline/config/frontlineConfig';

// Initialize with secondary tenant for OTP tests
initializeFrontlineConfig('secondary');

test.describe(
  'feature: login with otp',
  {
    tag: [FrontlineSuiteTags.FRONTLINE],
  },
  () => {
    test.beforeAll(async ({ appManagerApiContext }) => {
      // Initialize UserTestDataBuilder with authenticated API context
      // Using secondary tenant for OTP tests
      const config = getFrontlineTenantConfigFor('secondary');
      console.log(`🔧 Running OTP test on: ${config.tenantName} (${config.frontendBaseUrl})`);

      const userBuilder = new UserTestDataBuilder(appManagerApiContext, config.apiBaseUrl);
      // Add users to system
      const endUser = await userBuilder.addUsersWithEmpIdAndDepartmentToSystem(Roles.END_USER, 'Simpplr@2025');
      console.log('Info: End user employee number: ', endUser[0].emp); //employee number
      console.log('Info: End user full name: ', endUser[0].fullName); //fullName
    });

    test(
      '[FL-434] login with otp',
      {
        tag: [TestPriority.P1],
      },
      async ({ page }) => {
        tagTest(test.info(), {
          description: 'login with otp',
          zephyrTestId: 'FL-434',
          storyId: 'FL-434',
        });

        await page.goto(PAGE_ENDPOINTS.LOGIN_PAGE);
        await page.waitForLoadState('networkidle');
      }
    );
  }
);
