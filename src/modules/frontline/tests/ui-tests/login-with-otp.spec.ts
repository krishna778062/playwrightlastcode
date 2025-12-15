import { FrontlineFeatureTags, FrontlineSuiteTags } from '@frontline/constants/testTags';
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';
import { LoginWithOtpPage } from '@frontline/pages/loginWithOtpPage';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { mailosaurValues } from '../../config/frontlineConfig';
import { ProfilePage } from '../../pages/profilePage';

import { Roles } from '@/src/core/constants/roles';
import { USER_STATUS } from '@/src/core/constants/status';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { UserTestDataBuilder } from '@/src/core/test-data-builders/UserTestDataBuilder';
import { TopNavBarComponent } from '@/src/core/ui/components/topNavBarComponent';
import { LoginPage } from '@/src/core/ui/pages/loginPage';
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
      await lwoUserManagementService.deleteUserContactInfo(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName,
        { deleteEmail: true }
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
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
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
      await lwoUserManagementService.deleteUserContactInfo(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName,
        { deleteEmail: true, deleteMobile: true }
      );
    });

    test(
      'scenario: Verify newly added user try to login and enter email only,when LWO is set as mandatory',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP, TestGroupType.HEALTHCHECK],
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
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
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
      await lwoUserManagementService.deleteUserContactInfo(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName,
        { deleteEmail: false, deleteMobile: true }
      );
    });

    test.afterAll(async ({ lwoUserManagementService, appManagerApiContext, config }) => {
      const userDetails = loadUserDetails();
      await lwoUserManagementService.deleteUserContactInfo(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName,
        { deleteEmail: true, deleteMobile: true }
      );

      await new UserManagementService(appManagerApiContext, config.apiBaseUrl).updateUserStatus(
        userDetails.endUserId,
        USER_STATUS.INACTIVE
      );
    });

    test(
      'scenario: Verify activated user try to login with email as login identifiers,when LWO is set as optional',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
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
        const loginPage = new LoginPage(page);

        const loginWithOtpPage = new LoginWithOtpPage(page);

        await loginPage.loadPage({ stepInfo: 'Loading login page' });
        await loginPage.verifyThePageIsLoaded();

        await loginWithOtpPage.performLoginWithOtp(
          loginPage,
          userDetails.endUserEmail,
          otpUtils,
          mailosaurValues.mailosaurEmail,
          'email'
        );

        // Add mobile number based on identifiers
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
          zephyrTestId: 'FL-879',
          storyId: 'FL-879',
        });

        const userDetails = loadUserDetails();
        await LoginHelper.loginWithPassword(page, {
          email: userDetails.endUserEmail,
          password: userDetails.endUserPassword,
        });

        const loginWithOtpPage = new LoginWithOtpPage(page);
        await loginWithOtpPage.verifyForceAddContactPageForIdentifierType('mobile', 'optional');
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
      await lwoUserManagementService.deleteUserContactInfo(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName,
        { deleteEmail: false, deleteMobile: true }
      );
    });

    test.afterAll(async ({ lwoUserManagementService, appManagerApiContext, config }) => {
      const userDetails = loadUserDetails();
      await lwoUserManagementService.deleteUserContactInfo(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName,
        { deleteEmail: true, deleteMobile: true }
      );

      await new UserManagementService(appManagerApiContext, config.apiBaseUrl).updateUserStatus(
        userDetails.endUserId,
        USER_STATUS.INACTIVE
      );
    });

    test(
      'scenario: Verify activated user try to login with email and employee number as login identifiers,when LWO is set as mandatory',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
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
        await loginWithOtpPage.verifyForceAddContactPageForIdentifierType('mobile', 'optional');
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

test.describe(
  'feature: Profile login with otp cases',
  {
    tag: [FrontlineSuiteTags.FRONTLINE, FrontlineFeatureTags.LOGIN_WITH_OTP, FrontlineFeatureTags.LWO_PROFILE],
  },
  () => {
    test.beforeAll(async ({ appManagerApiContext, config }) => {
      await new IdentityService(appManagerApiContext, config.apiBaseUrl).enableLoginIdentifiers([
        'employee_number',
        'email',
      ]);
    });

    test.afterAll(async ({ appManagerApiContext, config, lwoUserManagementService }) => {
      const userDetails = loadUserDetails();
      await lwoUserManagementService.deleteUserContactInfo(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName,
        { deleteEmail: true, deleteMobile: true }
      );
      await new UserManagementService(appManagerApiContext, config.apiBaseUrl).updateUserStatus(
        userDetails.endUserId,
        USER_STATUS.INACTIVE
      );
    });

    test.afterEach(async ({ lwoUserManagementService }) => {
      const userDetails = loadUserDetails();
      await lwoUserManagementService.deleteUserContactInfo(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName,
        { deleteEmail: false, deleteMobile: true }
      );
    });

    test(
      'scenario: Verify user can add mobile number from profile page contact edit when LWO is disabled',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page, lwoUserManagementService, appManagerApiContext, config }) => {
        tagTest(test.info(), {
          description: 'Verify user can add mobile number from profile page contact edit when LWO is disabled',
          zephyrTestId: 'FL-1006',
          storyId: 'FL-1006',
        });

        try {
          await lwoUserManagementService.disableLoginWithOtp();
        } catch (error) {
          throw error;
        }

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
        // Navigate to profile page
        const topNavBar = new TopNavBarComponent(page);
        await topNavBar.openViewProfile();

        // Add mobile number from contact edit
        const profilePage = new ProfilePage(page);
        await profilePage.verifyThePageIsLoaded();
        await profilePage.addMobileNumberFromContactEdit(mailosaurValues.mailosaurPhone);
      }
    );

    test(
      'scenario: Verify user can add mobile number from profile page and verify with OTP when LWO is enabled',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page, lwoUserManagementService, otpUtils }) => {
        test.fail(); // Mark as expected to fail - known failure (Bug: FL-1297)
        tagTest(test.info(), {
          description: 'Verify user can add mobile number from profile page and verify with OTP when LWO is enabled',
          isKnownFailure: true,
          bugTicket: 'FL-1297', // bug ticket from Jira
          bugReportedDate: '2025-12-02', // Date when the bug was reported
          knownFailurePriority: 'Low', // Medium priority known failure (Eg: High, Medium, Low)
          knownFailureNote:
            'Continue button doesnt work after giving correct OTP on profile edit ,using login with OTP feature.', // description of the known failure
          zephyrTestId: 'FL-1007',
          storyId: 'FL-1007',
        });

        try {
          await lwoUserManagementService.setLWOSetting('optional');
        } catch (error) {
          throw error;
        }

        const userDetails = loadUserDetails();
        await LoginHelper.loginWithPassword(page, {
          email: userDetails.endUserEmail,
          password: userDetails.endUserPassword,
        });
        const loginWithOtpPage = new LoginWithOtpPage(page);
        await loginWithOtpPage.verifyForceAddContactPageForIdentifierType('mobile', 'optional');
        await loginWithOtpPage.skipVerificationPage();

        const topNavBar = new TopNavBarComponent(page);
        await topNavBar.openViewProfile();

        const profilePage = new ProfilePage(page);
        await profilePage.verifyThePageIsLoaded();
        await profilePage.addMobileNumberAndVerifyWithOtp(mailosaurValues.mailosaurPhone, otpUtils);
      }
    );
  }
);

test.describe(
  'feature: login with otp test cases for employee number and mobile as login identifiers ',
  {
    tag: [FrontlineSuiteTags.FRONTLINE, FrontlineFeatureTags.LOGIN_WITH_OTP],
  },
  () => {
    test.beforeAll(async ({ lwoUserManagementService, appManagerApiContext, config }) => {
      try {
        await lwoUserManagementService.setLWOSetting('optional');
        await new IdentityService(appManagerApiContext, config.apiBaseUrl).enableLoginIdentifiers([
          'employee_number',
          'mobile',
        ]);
      } catch (error) {
        throw error;
      }
    });

    test.afterEach(async ({ lwoUserManagementService }) => {
      const userDetails = loadUserDetails();
      await lwoUserManagementService.deleteUserContactInfo(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName,
        { deleteEmail: true, deleteMobile: false }
      );
    });

    test.afterAll(async ({ lwoUserManagementService, appManagerApiContext, config }) => {
      const userDetails = loadUserDetails();
      await lwoUserManagementService.deleteUserContactInfo(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName,
        { deleteEmail: true, deleteMobile: true }
      );

      await new UserManagementService(appManagerApiContext, config.apiBaseUrl).updateUserStatus(
        userDetails.endUserId,
        USER_STATUS.INACTIVE
      );
    });

    test(
      'scenario: Verify user with emp id and mobile login can add email from force add contact page when LWO is optional',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page, otpUtils, appManagerApiContext, config }) => {
        tagTest(test.info(), {
          description:
            'Verify newly added user with emp id and mobile can login and add email from force add contact page when LWO is optional',
          zephyrTestId: 'FL-435',
          storyId: 'FL-435',
        });

        // Create user with emp id only (without email and mobile)
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

        // Set password for first time login
        await LoginHelper.setPasswordForFirstTimeLogin(page, {
          email: userDetails.endUserEmpId,
          password: userDetails.endUserPassword,
        });
        await LoginHelper.setUserProfileSecurityQuestions(page);

        // Verify force add contact page appears for email only
        const loginWithOtpPage = new LoginWithOtpPage(page);
        await loginWithOtpPage.verifyForceAddContactPageForIdentifierType('email', 'optional');

        // Add email and verify with OTP
        await loginWithOtpPage.addEmailOrMobileBasedOnIdentifiers(
          otpUtils,
          mailosaurValues.mailosaurEmail,
          'email',
          'optional'
        );
      }
    );

    test(
      "scenario: Verify user with emp id and mobile as identifier can click don't show this again on force add contact page when LWO is optional",
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page }) => {
        tagTest(test.info(), {
          description:
            "Verify user with emp id and mobile as identifier can click don't show this again on force add contact page when LWO is optional",
          zephyrTestId: 'FL-436',
          storyId: 'FL-436',
        });

        const userDetails = loadUserDetails();

        // Login with emp id and password
        await LoginHelper.loginWithPassword(page, {
          email: userDetails.endUserEmpId,
          password: userDetails.endUserPassword,
        });

        // Verify force add contact page appears for email only
        const loginWithOtpPage = new LoginWithOtpPage(page);
        await loginWithOtpPage.verifyForceAddContactPageForIdentifierType('email', 'optional');

        // Click don't show this again and confirm
        await loginWithOtpPage.clickDontShowThisAgainButton();

        // Verify user is redirected to home page
        await page.waitForURL('/home', {
          timeout: TIMEOUTS.MEDIUM,
        });
        const homePage = new NewHomePage(page);
        await homePage.verifyThePageIsLoaded();
      }
    );

    test(
      "scenario: Verify user with emp id is directly redirected to home page after clicking don't show this again in previous login",
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page }) => {
        tagTest(test.info(), {
          description:
            "Verify user with emp id is directly redirected to home page without seeing force add contact page after clicking don't show this again in previous login",
          zephyrTestId: 'FL-437',
          storyId: 'FL-437',
        });

        const userDetails = loadUserDetails();

        // Login with emp id and password
        await LoginHelper.loginWithPassword(page, {
          email: userDetails.endUserEmpId,
          password: userDetails.endUserPassword,
        });

        // Verify user is directly redirected to home page without force add contact page
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
  'feature: login with otp test cases for employee number and mobile as login identifiers when LWO is mandatory',
  {
    tag: [FrontlineSuiteTags.FRONTLINE, FrontlineFeatureTags.LOGIN_WITH_OTP],
  },
  () => {
    test.beforeAll(async ({ lwoUserManagementService, appManagerApiContext, config }) => {
      try {
        await lwoUserManagementService.setLWOSetting('mandatory');
        await new IdentityService(appManagerApiContext, config.apiBaseUrl).enableLoginIdentifiers([
          'employee_number',
          'mobile',
        ]);
      } catch (error) {
        throw error;
      }
    });

    test.afterEach(async ({ lwoUserManagementService }) => {
      const userDetails = loadUserDetails();
      await lwoUserManagementService.deleteUserContactInfo(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName,
        { deleteEmail: true, deleteMobile: false }
      );
    });

    test.afterAll(async ({ lwoUserManagementService, appManagerApiContext, config }) => {
      const userDetails = loadUserDetails();
      await lwoUserManagementService.deleteUserContactInfo(
        userDetails.endUserId,
        userDetails.endUserEmpId,
        userDetails.endUserFirstName,
        userDetails.endUserLastName,
        { deleteEmail: true, deleteMobile: true }
      );

      await new UserManagementService(appManagerApiContext, config.apiBaseUrl).updateUserStatus(
        userDetails.endUserId,
        USER_STATUS.INACTIVE
      );
    });

    test(
      'scenario: Verify user with emp id and mobile login must add email from force add contact page when LWO is mandatory',
      {
        tag: [TestPriority.P0, FrontlineFeatureTags.LOGIN_WITH_OTP],
      },
      async ({ page, otpUtils, appManagerApiContext, config }) => {
        tagTest(test.info(), {
          description:
            'Verify newly added user with emp id and mobile must add email from force add contact page when LWO is mandatory (no skip or dont show this again option)',
          zephyrTestId: 'FL-438',
          storyId: 'FL-438',
        });

        // Create user with emp id only (without email and mobile)
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

        // Set password for first time login
        await LoginHelper.setPasswordForFirstTimeLogin(page, {
          email: userDetails.endUserEmpId,
          password: userDetails.endUserPassword,
        });
        await LoginHelper.setUserProfileSecurityQuestions(page);

        // Verify mandatory force add contact page appears for email (no skip or don't show this again buttons)
        const loginWithOtpPage = new LoginWithOtpPage(page);
        await loginWithOtpPage.verifyForceAddContactPageForIdentifierType('email', 'mandatory');

        // Add email and verify with OTP (mandatory flow)
        await loginWithOtpPage.addEmailOrMobileBasedOnIdentifiers(
          otpUtils,
          mailosaurValues.mailosaurEmail,
          'email',
          'mandatory'
        );
      }
    );
  }
);
