import { FrontlineFeatureTags, FrontlineSuiteTags } from '@frontline/constants/testTags';
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';
import { LoginWithOtpPage } from '@frontline/pages/loginWithOtpPage';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';

import { mailosaurValues } from '../../config/frontlineConfig';

import { Roles } from '@/src/core/constants/roles';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { UserTestDataBuilder } from '@/src/core/test-data-builders/UserTestDataBuilder';
import { PropertiesFile } from '@/src/core/utils/propertiesFile';

// Path to properties file for storing user details across workers
const USER_DETAILS_FILE = 'src/modules/frontline/test-data/userDetails.properties';

/**
 * Load user details from properties file
 */
function loadUserDetails() {
  const prop = new PropertiesFile(USER_DETAILS_FILE);
  return {
    endUserEmpId: prop.getProperty('endUserEmpId') || '',
    endUserPassword: prop.getProperty('endUserPassword') || '',
    endUserId: prop.getProperty('endUserId') || '',
    endUserFirstName: prop.getProperty('endUserFirstName') || '',
    endUserLastName: prop.getProperty('endUserLastName') || '',
  };
}

test.describe(
  'feature: login with otp test cases for optional LWO',
  {
    tag: [FrontlineSuiteTags.FRONTLINE, FrontlineFeatureTags.LOGIN_WITH_OTP],
  },
  () => {
    test.beforeAll(async ({ lwoUserManagementService }) => {
      await lwoUserManagementService.setLWOAsOptional('optional'); // Set LWO as optional
    });

    test(
      'scenario: Verify newly added user try to login and enter mobile only,when LWO is set as optional',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page, otpUtils, lwoUserManagementService, appManagerApiContext, config }) => {
        tagTest(test.info(), {
          description: 'Verify newly added user try to login and enter mobile only,when LWO is set as optional',
          zephyrTestId: 'FL-435',
          storyId: 'FL-435',
        });
        const userBuilder = new UserTestDataBuilder(appManagerApiContext, config.apiBaseUrl);
        const endUser = await userBuilder.addUsersWithEmpIdAndDepartmentToSystemWithoutPassword(Roles.END_USER);

        // Store user details in properties file
        const prop = new PropertiesFile(USER_DETAILS_FILE);
        prop.setProperty('endUserEmpId', endUser[0].emp);
        prop.setProperty('endUserPassword', 'Simpplr@2025');
        prop.setProperty('endUserId', endUser[0].userId);
        prop.setProperty('endUserFirstName', endUser[0].first_name);
        prop.setProperty('endUserLastName', endUser[0].last_name);
        prop.store(null);

        const userDetails = loadUserDetails();
        await LoginHelper.setPasswordForFirstTimeLogin(page, {
          email: userDetails.endUserEmpId,
          password: userDetails.endUserPassword,
        });
        await LoginHelper.setUserProfileSecurityQuestions(page); // Set user profile security questions

        const loginWithOtpPage = new LoginWithOtpPage(page);
        await loginWithOtpPage.addMobileNumberOrEmailAndVerify(
          otpUtils,
          mailosaurValues.mailosaurPhone,
          mailosaurValues.mailosaurEmail,
          'mobile'
        );
        await lwoUserManagementService.deleteEmailAndMobile(
          userDetails.endUserId,
          userDetails.endUserEmpId,
          userDetails.endUserFirstName,
          userDetails.endUserLastName
        );
      }
    );

    test(
      'scenario: Verify added user try to login and enter email only,when LWO is set as optional',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page, otpUtils, lwoUserManagementService }) => {
        tagTest(test.info(), {
          description: 'Verify newly added user try to login and enter email only,when LWO is set as optional',
          zephyrTestId: 'FL-435',
          storyId: 'FL-435',
        });

        const userDetails = loadUserDetails();
        await LoginHelper.loginWithPassword(page, {
          email: userDetails.endUserEmpId,
          password: userDetails.endUserPassword,
        });

        const loginWithOtpPage = new LoginWithOtpPage(page);
        await loginWithOtpPage.addMobileNumberOrEmailAndVerify(
          otpUtils,
          mailosaurValues.mailosaurPhone,
          mailosaurValues.mailosaurEmail,
          'email'
        );
        await lwoUserManagementService.deleteEmailAndMobile(
          userDetails.endUserId,
          userDetails.endUserEmpId,
          userDetails.endUserFirstName,
          userDetails.endUserLastName
        );
      }
    );

    test(
      'scenario: Verify added user try to login and enter both mobile and email,when LWO is set as optional',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page, otpUtils, lwoUserManagementService }) => {
        tagTest(test.info(), {
          description:
            'Verify newly added user try to login and enter both mobile and email,when LWO is set as optional',
          zephyrTestId: 'FL-435',
          storyId: 'FL-435',
        });

        const userDetails = loadUserDetails();
        await LoginHelper.loginWithPassword(page, {
          email: userDetails.endUserEmpId,
          password: userDetails.endUserPassword,
        });

        const loginWithOtpPage = new LoginWithOtpPage(page);
        await loginWithOtpPage.addMobileNumberOrEmailAndVerify(
          otpUtils,
          mailosaurValues.mailosaurPhone,
          mailosaurValues.mailosaurEmail,
          'both'
        );
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
