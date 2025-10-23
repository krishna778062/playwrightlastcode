import { FrontlineSuiteTags } from '@frontline/constants/testTags';
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';
import { LoginWithOtpPage } from '@frontline/pages/loginWithOtpPage';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';

import { MailosaurValues } from '../../config/frontlineConfig';

import { Roles } from '@/src/core/constants/roles';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { UserTestDataBuilder } from '@/src/core/test-data-builders/UserTestDataBuilder';

test.describe(
  'feature: login with otp',
  {
    tag: [FrontlineSuiteTags.FRONTLINE],
  },
  () => {
    const userDetails: {
      endUserEmpId: string;
      endUserPassword: string;
      endUserId: string;
      endUserFirstName: string;
      endUserLastName: string;
    } = {
      endUserEmpId: '',
      endUserPassword: '',
      endUserId: '',
      endUserFirstName: '',
      endUserLastName: '',
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
      userDetails.endUserFirstName = endUser[0].first_name;
      userDetails.endUserLastName = endUser[0].last_name;
      console.log('Info: End user employee number: ', userDetails.endUserEmpId); //employee number
      console.log('Info: End user full name: ', endUser[0].fullName); //fullName
      console.log('Info: End user userId: ', userDetails.endUserId); //userId
      console.log('Info: End user first name: ', endUser[0].first_name); //firstName
      console.log('Info: End user last name: ', endUser[0].last_name); //lastName
    });

    test(
      'scenario: Verify newly added user try to login and enter email only,when LWO is set as optional',
      {
        tag: [TestPriority.P0],
      },
      async ({ page, otpUtils, lwoUserManagementService }) => {
        tagTest(test.info(), {
          description: 'Verify newly added user try to login and enter email only,when LWO is set as optional',
          zephyrTestId: 'FL-435',
          storyId: 'FL-435',
        });
        const testPhone = MailosaurValues.MAILOSAUR_PHONE; // Test phone number for OTP
        const testEmail = MailosaurValues.MAILOSAUR_EMAIL; // Test email for OTP
        await lwoUserManagementService.setLWOAsOptional('optional'); // Set LWO as optional

        await LoginHelper.setPasswordForFirstTimeLogin(page, {
          email: userDetails.endUserEmpId,
          password: userDetails.endUserPassword,
        });
        await LoginHelper.setUserProfileSecurityQuestions(page); // Set user profile security questions

        const loginWithOtpPage = new LoginWithOtpPage(page);
        await loginWithOtpPage.addMobileNumberOrEmailAndVerify(otpUtils, testPhone, testEmail, 'email');
        await lwoUserManagementService.deleteEmailAndMobile(
          userDetails.endUserId,
          userDetails.endUserEmpId,
          userDetails.endUserFirstName,
          userDetails.endUserLastName
        );
      }
    );
  }
);
