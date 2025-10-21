import { FrontlineSuiteTags } from '@frontline/constants/testTags';
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { Roles } from '@/src/core/constants/roles';
import { UserTestDataBuilder } from '@/src/core/test-data-builders/UserTestDataBuilder';
import { getSecondaryConfig } from '@/src/modules/frontline/config/secondaryTenantConfig';

test.describe(
  'feature: login with otp',
  {
    tag: [FrontlineSuiteTags.FRONTLINE],
  },
  () => {
    test.beforeAll(async ({ appManagerApiContext }) => {
      // Get secondary tenant config from dedicated config file
      const config = getSecondaryConfig();
      console.log(`🔧 Running OTP test on: ${config.tenantName} (${config.frontendBaseUrl})`);

      // UserManagementService will automatically use ORG_ID from frontline config
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
      async ({ page, otpUtils }) => {
        tagTest(test.info(), {
          description: 'login with otp',
          zephyrTestId: 'FL-434',
          storyId: 'FL-434',
        });

        // Dummy case to test with phone number for OTP starting
        // Use a test number
        const testPhone = '+447457416481';

        // Project baseURL is set to secondary tenant, so relative path works
        await page.goto(PAGE_ENDPOINTS.LOGIN_PAGE);

        await page.getByRole('textbox', { name: 'Employee number' }).click();
        await page.getByRole('textbox', { name: 'Employee number' }).fill('1473');
        await page.getByRole('button', { name: 'Continue' }).click();
        await page.getByRole('button', { name: 'Use OTP' }).click();

        //   //select mobile
        await page.getByTestId('SelectInput').selectOption('mobile');

        await page.getByRole('button', { name: 'Send OTP' }).click();

        // ===== Mobile OTP =====
        const otpM = await otpUtils.getOTPFromSMS(testPhone);
        console.log('otp-mobile------', otpM);

        // ===== Email OTP =====
        // const otp = await otpUtils.getOTPFromEmail('green@znl8uqcc.mailosaur.net');
        // console.log('otp-email------', otp);

        await page.getByRole('textbox', { name: 'Enter OTP' }).click();
        await page.getByRole('textbox', { name: 'Enter OTP' }).fill(otpM);
        await page.getByRole('button', { name: 'Verify OTP' }).click();
        await page.waitForTimeout(5000);
        // Dummy case to test with phone number for OTP ending
      }
    );
  }
);
