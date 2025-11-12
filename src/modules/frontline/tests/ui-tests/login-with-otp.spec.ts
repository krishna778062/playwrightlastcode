import { FrontlineFeatureTags, FrontlineSuiteTags } from '@frontline/constants/testTags';
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';
import { LoginWithOtpPage } from '@frontline/pages/loginWithOtpPage';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { mailosaurValues } from '../../config/frontlineConfig';

import { Roles } from '@/src/core/constants/roles';
import { USER_STATUS } from '@/src/core/constants/status';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { UserTestDataBuilder } from '@/src/core/test-data-builders/UserTestDataBuilder';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { PropertiesFile } from '@/src/core/utils/propertiesFile';
import { IdentityService } from '@/src/modules/platforms/apis/services/IdentityService';
import { UserManagementService } from '@/src/modules/platforms/apis/services/UserManagementService';

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
    endUserEmail: prop.getProperty('endUserEmail') || '',
  };
}

test.describe(
  'feature: login with otp test cases for optional LWO',
  {
    tag: [FrontlineSuiteTags.FRONTLINE, FrontlineFeatureTags.LOGIN_WITH_OTP],
  },
  () => {
    test.beforeAll(async ({ lwoUserManagementService, appManagerApiContext, config }) => {
      try {
        await lwoUserManagementService.setLWOSetting('optional');
        await new IdentityService(appManagerApiContext, config.apiBaseUrl).enableLoginIdentifiers(['employee_number']);
      } catch (error) {
        throw error;
      }
    });

    test.afterAll(async ({ appManagerApiContext, config }) => {
      const userDetails = loadUserDetails();
      await new UserManagementService(appManagerApiContext, config.apiBaseUrl).updateUserStatus(
        userDetails.endUserId,
        USER_STATUS.INACTIVE
      );
    });
    test.afterEach(async ({ lwoUserManagementService }) => {
      const userDetails = loadUserDetails();
      await lwoUserManagementService.deleteEmailAndMobile(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName
      );
    });

    test(
      'scenario: Verify newly added user try to login and enter email only,when LWO is set as optional',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP, TestGroupType.HEALTHCHECK],
      },
      async ({ page, otpUtils, appManagerApiContext, config }) => {
        tagTest(test.info(), {
          description: 'Verify newly added user try to login and enter email only,when LWO is set as optional',
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
          'email',
          'optional'
        );
      }
    );

    test(
      'scenario: Verify added user try to login and enter mobile only,when LWO is set as optional',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page, otpUtils }) => {
        tagTest(test.info(), {
          description: 'Verify newly added user try to login and enter mobile only,when LWO is set as optional',
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
          'mobile',
          'optional'
        );
      }
    );

    test(
      'scenario: Verify added user try to login and enter both mobile and email,when LWO is set as optional',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP, TestGroupType.HEALTHCHECK],
      },
      async ({ page, otpUtils }) => {
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
          'both',
          'optional'
        );
      }
    );
  }
);

test.describe(
  'feature: login with otp test cases for mandatory LWO',
  {
    tag: [FrontlineSuiteTags.FRONTLINE, FrontlineFeatureTags.LOGIN_WITH_OTP],
  },
  () => {
    test.beforeAll(async ({ lwoUserManagementService, appManagerApiContext, config }) => {
      try {
        await lwoUserManagementService.setLWOSetting('mandatory');
        await new IdentityService(appManagerApiContext, config.apiBaseUrl).enableLoginIdentifiers(['employee_number']);
      } catch (error) {
        throw error;
      }
    });

    test.afterAll(async ({ appManagerApiContext, config }) => {
      const userDetails = loadUserDetails();
      await new UserManagementService(appManagerApiContext, config.apiBaseUrl).updateUserStatus(
        userDetails.endUserId,
        USER_STATUS.INACTIVE
      );
    });

    test.afterEach(async ({ lwoUserManagementService }) => {
      const userDetails = loadUserDetails();
      await lwoUserManagementService.deleteEmailAndMobile(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName
      );
    });

    test(
      'scenario: Verify newly added user try to login and enter email only,when LWO is set as mandatory',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page, otpUtils, appManagerApiContext, config }) => {
        tagTest(test.info(), {
          description: 'Verify newly added user try to login and enter email only,when LWO is set as mandatory',
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
          'email',
          'mandatory'
        );
      }
    );

    test(
      'scenario: Verify added user try to login and enter mobile only,when LWO is set as mandatory',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP, TestGroupType.HEALTHCHECK],
      },
      async ({ page, otpUtils }) => {
        tagTest(test.info(), {
          description: 'Verify newly added user try to login and enter mobile only,when LWO is set as mandatory',
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
          'mobile',
          'mandatory'
        );
      }
    );

    test(
      'scenario: Verify added user try to login and enter both mobile and email,when LWO is set as mandatory',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page, otpUtils }) => {
        tagTest(test.info(), {
          description:
            'Verify newly added user try to login and enter both mobile and email,when LWO is set as mandatory',
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
          'both',
          'mandatory'
        );
      }
    );
  }
);

test.describe(
  'feature: login with otp test cases for email and employee number as login identifiers and LWO is set as optional',
  {
    tag: [FrontlineSuiteTags.FRONTLINE, FrontlineFeatureTags.LOGIN_WITH_OTP],
  },
  () => {
    test.beforeAll(async ({ lwoUserManagementService, appManagerApiContext, config }) => {
      try {
        await lwoUserManagementService.setLWOSetting('optional');
        await new IdentityService(appManagerApiContext, config.apiBaseUrl).enableLoginIdentifiers([
          'email',
          'employee_number',
        ]);
      } catch (error) {
        throw error;
      }
    });

    test.afterEach(async ({ lwoUserManagementService }) => {
      const userDetails = loadUserDetails();
      await lwoUserManagementService.deleteMobileOnly(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName
      );
    });

    test.afterAll(async ({ lwoUserManagementService, appManagerApiContext, config }) => {
      const userDetails = loadUserDetails();
      await lwoUserManagementService.deleteEmailAndMobile(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName
      );

      await new UserManagementService(appManagerApiContext, config.apiBaseUrl).updateUserStatus(
        userDetails.endUserId,
        USER_STATUS.INACTIVE
      );
    });

    test(
      'scenario: Verify activated user try to login with email as login identifiers,when LWO is set as optional',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP, TestGroupType.HEALTHCHECK],
      },
      async ({ page, otpUtils, appManagerApiContext, config }) => {
        tagTest(test.info(), {
          description:
            'Verify already added and activated user try to login with email/employee number as login identifiers,when LWO is set as optional',
          zephyrTestId: 'FL-435',
          storyId: 'FL-435',
        });
        const userBuilder = new UserTestDataBuilder(appManagerApiContext, config.apiBaseUrl);
        const endUser = await userBuilder.addUsersToSystemWithGivenEmail(
          1,
          Roles.END_USER,
          'Simpplr@2025',
          mailosaurValues.mailosaurEmail
        );

        const prop = new PropertiesFile(USER_DETAILS_FILE);
        prop.setProperty('endUserEmpId', endUser[0].emp);
        prop.setProperty('endUserPassword', 'Simpplr@2025');
        prop.setProperty('endUserId', endUser[0].userId);
        prop.setProperty('endUserFirstName', endUser[0].first_name);
        prop.setProperty('endUserLastName', endUser[0].last_name);
        prop.setProperty('endUserEmail', endUser[0].email);
        prop.store(null);

        const userDetails = loadUserDetails();
        await LoginHelper.loginWithPassword(page, {
          email: userDetails.endUserEmail,
          password: userDetails.endUserPassword,
        });
        const loginWithOtpPage = new LoginWithOtpPage(page);
        await loginWithOtpPage.addEmailOrMobileBasedOnIdentifiers(otpUtils, mailosaurValues.mailosaurPhone, 'mobile');
      }
    );

    test(
      'scenario: Verify user reaches to Home page, when click on skip for now from force add contact page',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page }) => {
        tagTest(test.info(), {
          description: 'Verify user reaches to Home page, when click on skip for now from force add contact page',
          zephyrTestId: 'FL-435',
          storyId: 'FL-435',
        });

        const userDetails = loadUserDetails();
        await LoginHelper.loginWithPassword(page, {
          email: userDetails.endUserEmail,
          password: userDetails.endUserPassword,
        });

        const loginWithOtpPage = new LoginWithOtpPage(page);
        await loginWithOtpPage.verifyForceAddContactPageForIdentifierTypeMobileOrEmail('mobile');
        await loginWithOtpPage.skipVerificationPage();

        // Verify navigation to home page
        await page.waitForURL('/home', {
          timeout: TIMEOUTS.MEDIUM,
        });
        const homePage = new NewHomePage(page);
        await homePage.verifyThePageIsLoaded();
      }
    );
  }
);

test.describe(
  'feature: login with otp test cases for email and employee number as login identifiers for mandatory LWO',
  {
    tag: [FrontlineSuiteTags.FRONTLINE, FrontlineFeatureTags.LOGIN_WITH_OTP],
  },
  () => {
    test.beforeAll(async ({ lwoUserManagementService, appManagerApiContext, config }) => {
      try {
        await lwoUserManagementService.setLWOSetting('mandatory');
        await new IdentityService(appManagerApiContext, config.apiBaseUrl).enableLoginIdentifiers([
          'email',
          'employee_number',
        ]);
      } catch (error) {
        throw error;
      }
    });
    test.afterEach(async ({ lwoUserManagementService }) => {
      const userDetails = loadUserDetails();
      await lwoUserManagementService.deleteMobileOnly(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName
      );
    });

    test.afterAll(async ({ lwoUserManagementService, appManagerApiContext, config }) => {
      const userDetails = loadUserDetails();
      await lwoUserManagementService.deleteEmailAndMobile(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName
      );

      await new UserManagementService(appManagerApiContext, config.apiBaseUrl).updateUserStatus(
        userDetails.endUserId,
        USER_STATUS.INACTIVE
      );
    });

    test(
      'scenario: Verify activated user try to login with email and employee number as login identifiers,when LWO is set as mandatory',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP, TestGroupType.HEALTHCHECK],
      },
      async ({ page, otpUtils, appManagerApiContext, config }) => {
        tagTest(test.info(), {
          description:
            'Verify already added and activated user try to login with email/employee number as login identifiers,when LWO is set as mandatory',
          zephyrTestId: 'FL-435',
          storyId: 'FL-435',
        });
        const userBuilder = new UserTestDataBuilder(appManagerApiContext, config.apiBaseUrl);
        const endUser = await userBuilder.addUsersToSystemWithGivenEmail(
          1,
          Roles.END_USER,
          'Simpplr@2025',
          mailosaurValues.mailosaurEmail
        );

        const prop = new PropertiesFile(USER_DETAILS_FILE);
        prop.setProperty('endUserEmpId', endUser[0].emp);
        prop.setProperty('endUserPassword', 'Simpplr@2025');
        prop.setProperty('endUserId', endUser[0].userId);
        prop.setProperty('endUserFirstName', endUser[0].first_name);
        prop.setProperty('endUserLastName', endUser[0].last_name);
        prop.setProperty('endUserEmail', endUser[0].email);
        prop.store(null);

        const userDetails = loadUserDetails();
        await LoginHelper.loginWithPassword(page, {
          email: userDetails.endUserEmail,
          password: userDetails.endUserPassword,
        });
        const loginWithOtpPage = new LoginWithOtpPage(page);
        await loginWithOtpPage.addEmailOrMobileBasedOnIdentifiers(otpUtils, mailosaurValues.mailosaurPhone, 'mobile');
      }
    );

    test(
      "scenario: Verify user reaches to Home page, when click on Don't show this again from force add contact page",
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page }) => {
        tagTest(test.info(), {
          description:
            "Verify user reaches to Home page, when click on Don't show this again from force add contact page",
          zephyrTestId: 'FL-435',
          storyId: 'FL-435',
        });

        const userDetails = loadUserDetails();
        await LoginHelper.loginWithPassword(page, {
          email: userDetails.endUserEmail,
          password: userDetails.endUserPassword,
        });

        const loginWithOtpPage = new LoginWithOtpPage(page);
        await loginWithOtpPage.verifyForceAddContactPageForIdentifierTypeMobileOrEmail('mobile');
        await loginWithOtpPage.clickDontShowThisAgainButton();

        // Verify navigation to home page
        await page.waitForURL('/home', {
          timeout: TIMEOUTS.MEDIUM,
        });
        const homePage = new NewHomePage(page);
        await homePage.verifyThePageIsLoaded();
      }
    );

    test(
      "scenario: Verify user reaches to Home page after login,if clicked Don't show this again button in previous login",
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page }) => {
        tagTest(test.info(), {
          description:
            "Verify user reaches to Home page after login,if clicked Don't show this again button in previous login'",
          zephyrTestId: 'FL-435',
          storyId: 'FL-435',
        });

        const userDetails = loadUserDetails();
        await LoginHelper.loginWithPassword(page, {
          email: userDetails.endUserEmail,
          password: userDetails.endUserPassword,
        });

        await page.waitForURL('/home', {
          timeout: TIMEOUTS.MEDIUM,
        });
        const homePage = new NewHomePage(page);
        await homePage.verifyThePageIsLoaded();
      }
    );
  }
);
