import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { FILTER_ATTRIBUTES, PRIMARY_ROLES_VALUES } from '@platforms/constants/ManageUsers';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { TestSuite } from '@/src/core/constants/testSuite';
import { ManageUsersPage } from '@/src/modules/platforms/ui/pages/managerUsersPage/manageUsersPage';

test.describe(
  'manage users testcases',
  {
    tag: [TestSuite.ABAC],
  },
  () => {
    let manageUsersPage: ManageUsersPage;
    test.beforeEach(async ({ appManagerFixture }) => {
      manageUsersPage = new ManageUsersPage(appManagerFixture.page);
      await manageUsersPage.loadPage();
    });

    test(
      'verify that selecting values from Primary roles attribute in filters of manage users page should update the user list accordingly',
      {
        tag: [TestPriority.P0, `@manageUsers`, `@ABAC`, `@acg`, `@this-one`],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-32075'],
        });
        // Check for App manager
        await manageUsersPage.clickOnFilterButton();
        await manageUsersPage.manageUsersFilter.clickOnFilterAttributeByName(FILTER_ATTRIBUTES.PRIMARY_ROLES);
        await manageUsersPage.manageUsersFilter.checkValue(
          FILTER_ATTRIBUTES.PRIMARY_ROLES,
          PRIMARY_ROLES_VALUES.APP_MANAGER
        );
        await manageUsersPage.manageUsersFilter.clickOnFilterAttributeByName(FILTER_ATTRIBUTES.VIEW_RESULTS);
        await manageUsersPage.verifyPrimaryRoleValues(PRIMARY_ROLES_VALUES.APP_MANAGER);

        // Check for Standard user
        await manageUsersPage.clickOnFilterButton();
        await manageUsersPage.manageUsersFilter.clickOnFilterAttributeByName(FILTER_ATTRIBUTES.PRIMARY_ROLES);
        await manageUsersPage.manageUsersFilter.unCheckValue(
          FILTER_ATTRIBUTES.PRIMARY_ROLES,
          PRIMARY_ROLES_VALUES.APP_MANAGER
        );
        await manageUsersPage.manageUsersFilter.checkValue(
          FILTER_ATTRIBUTES.PRIMARY_ROLES,
          PRIMARY_ROLES_VALUES.STANDARD_USER
        );
        await manageUsersPage.manageUsersFilter.clickOnFilterAttributeByName(FILTER_ATTRIBUTES.VIEW_RESULTS);
        await manageUsersPage.verifyPrimaryRoleValues(PRIMARY_ROLES_VALUES.STANDARD_USER);
      }
    );
  }
);
