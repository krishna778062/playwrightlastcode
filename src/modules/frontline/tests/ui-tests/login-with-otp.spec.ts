import { FrontlineSuiteTags } from '@frontline/constants/testTags';
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { Roles } from '@/src/core/constants/roles';
import { UserTestDataBuilder } from '@/src/core/test-data-builders/UserTestDataBuilder';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';

test.describe(
  'feature: login with otp',
  {
    tag: [FrontlineSuiteTags.FRONTLINE],
  },
  () => {
    test.beforeAll(async ({ appManagerApiContext }) => {
      // Initialize UserTestDataBuilder with authenticated API context
      const userBuilder = new UserTestDataBuilder(appManagerApiContext, getEnvConfig().apiBaseUrl);
      // Add users to system
      const endUser = await userBuilder.addUsersWithEmpIdAndDepartmentToSystem(Roles.END_USER, 'Simpplr@2025');
      console.log('Info: End user emp: ', endUser[0].emp); //username
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
        await page.waitForTimeout(10000);
      }
    );
  }
);
