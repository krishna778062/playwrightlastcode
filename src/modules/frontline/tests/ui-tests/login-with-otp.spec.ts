import { FrontlineSuiteTags } from '@frontline/constants/testTags';
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';

import { Roles } from '@/src/core/constants/roles';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { UserTestDataBuilder } from '@/src/core/test-data-builders/UserTestDataBuilder';

test.describe(
  'feature: login with otp',
  {
    tag: [FrontlineSuiteTags.FRONTLINE],
  },
  () => {
    const userDetails: { endUserEmpId: string; endUserPassword: string; endUserId: string } = {
      endUserEmpId: '',
      endUserPassword: '',
      endUserId: '',
    };
    test.beforeAll(async ({ appManagerApiContext, config }) => {
      // Get secondary tenant config from fixture
      console.log(`🔧 Running OTP test on: ${config.tenantName} (${config.frontendBaseUrl})`);

      // UserManagementService will automatically use ORG_ID from frontline config
      const userBuilder = new UserTestDataBuilder(appManagerApiContext, config.apiBaseUrl);
      // Add users to system
      const endUser = await userBuilder.addUsersWithEmpIdAndDepartmentToSystemWithoutPassword(Roles.END_USER);
      userDetails.endUserEmpId = endUser[0].emp;
      userDetails.endUserPassword = 'Simpplr@2025';
      userDetails.endUserId = endUser[0].userId;
      console.log('Info: End user employee number: ', userDetails.endUserEmpId); //employee number
      console.log('Info: End user full name: ', endUser[0].fullName); //fullName
      console.log('Info: End user userId: ', userDetails.endUserId); //userId
    });

    // test(
    //   '[FL-434] login with otp',
    //   {
    //     tag: [TestPriority.P1],
    //   },
    //   async ({ page, otpUtils }) => {
    //     tagTest(test.info(), {
    //       description: 'login with otp',
    //       zephyrTestId: 'FL-434',
    //       storyId: 'FL-434',
    //     });

    //     // Dummy case to test with phone number for OTP starting
    //     // Use a test number
    //     const testPhone = '+447457416481';

    //     // Project baseURL is set to secondary tenant, so relative path works
    //     await page.goto(PAGE_ENDPOINTS.LOGIN_PAGE);

    //     await page.getByRole('textbox', { name: 'Employee number' }).click();
    //     await page.getByRole('textbox', { name: 'Employee number' }).fill('1473');
    //     await page.getByRole('button', { name: 'Continue' }).click();
    //     await page.getByRole('button', { name: 'Use OTP' }).click();

    //     //   //select mobile
    //     // await page.getByTestId('SelectInput').selectOption('mobile');

    //     await page.getByRole('button', { name: 'Send OTP' }).click();
    //     await page.waitForTimeout(5000);

    //     // ===== Mobile OTP =====
    //     // const otpM = await otpUtils.getOTPFromSMS(testPhone);
    //     // console.log('otp-mobile------', otpM);

    //     // ===== Email OTP =====
    //     const otp = await otpUtils.getOTPFromEmail('green@znl8uqcc.mailosaur.net');
    //     console.log('otp-email------', otp);

    //     await page.getByRole('textbox', { name: 'Enter OTP' }).click();
    //     await page.getByRole('textbox', { name: 'Enter OTP' }).fill(otp);
    //     await page.getByRole('button', { name: 'Verify OTP' }).click();
    //     // Dummy case to test with phone number for OTP ending
    //   }
    // );

    test(
      '[FL-435] first time login with emp code',
      {
        tag: [TestPriority.P0],
      },
      async ({ page, otpUtils }) => {
        tagTest(test.info(), {
          description: 'first time login with emp code',
          zephyrTestId: 'FL-435',
          storyId: 'FL-435',
        });

        await LoginHelper.setPasswordForFirstTimeLogin(page, {
          email: userDetails.endUserEmpId,
          password: userDetails.endUserPassword,
        });
        await LoginHelper.setUserProfileSecurityQuestions(page);

        // await page.getByRole('textbox', { name: 'Email ID' }).click();
        // await page.getByRole('textbox', { name: 'Email ID' }).fill('greennn@znl8uqcc.mailosaur.net');
        // await page.getByRole('button', { name: 'Send OTP to verify' }).click();
        // await page.waitForTimeout(5000);
        // const otp = await otpUtils.getOTPFromEmail('greennn@znl8uqcc.mailosaur.net');
        // console.log('otp-email------', otp);

        // await page.getByRole('textbox', { name: 'Enter OTP*' }).click();
        // await page.getByRole('textbox', { name: 'Enter OTP*' }).fill('014975');
        // await page.getByRole('button', { name: 'Verify' }).click();
        // await page.getByRole('button', { name: 'Continue' }).click();
      }
    );
  }
);
