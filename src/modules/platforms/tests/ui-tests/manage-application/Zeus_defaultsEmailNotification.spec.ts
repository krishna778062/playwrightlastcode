import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { ManageApplicationPage } from '@/src/modules/platforms/ui/pages/manageApplication/manageApplication';

test.describe(
  'Zeus Email Defaults Manage Application Tests',
  {
    tag: ['@zeus', '@Platform_Services', '@Zulu', '@regression', '@sanity', '@setupManageApplication'],
  },
  () => {
    let manageApplicationPage: ManageApplicationPage;

    test.beforeEach(async ({ zuluAppManagerPage }) => {
      manageApplicationPage = new ManageApplicationPage(zuluAppManagerPage);
      await manageApplicationPage.navigateToEmailNotificationsPage();
    });

    test(
      'In Zeus verify that presence of Email Notification under Default Email section',
      {
        tag: [TestPriority.P0],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-13796'],
          description: 'In Zeus verify that presence of Email Notification under Default Email section',
        });

        await manageApplicationPage.updateAppNameViaAPI('Good & Co Inc.');
        // Navigate back to email notifications page after API update (which reloads the current page)
        await manageApplicationPage.navigateToEmailNotificationsPage();
        await manageApplicationPage.verifyEmailNotificationsFieldsPresence();
      }
    );

    test(
      'In Zeus verify that presence of Email notification frequency under Default Email section with two options',
      {
        tag: [TestPriority.P0],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-13798'],
          description:
            'In Zeus verify that presence of Email notification frequency under Default Email section with two options',
        });

        await manageApplicationPage.verifyEmailNotificationFrequencyFieldsPresence();
      }
    );

    test(
      'In Zeus verify working of Email notifications by clicking on use recommended under Email of default',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-14973'],
          description:
            'In Zeus verify working of Email notifications by clicking on use recommended under Email of default',
        });

        await manageApplicationPage.clickOnUseRecommended();
        await manageApplicationPage.saveAndVerifySuccess();
      }
    );

    test(
      'In Zeus verify working of Email notifications by unchecking few section under Email of default',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-14975'],
          description: 'In Zeus verify working of Email notifications by unchecking few section under Email of default',
        });

        await manageApplicationPage.uncheckMultipleEmailNotificationCheckboxes([
          'feed',
          'profileAndExpertise',
          'event',
          'appManager',
        ]);
        await manageApplicationPage.saveAndVerifySuccess();
      }
    );

    test(
      'In Zeus verify working of Email notifications by checking all under Email of default',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-14974'],
          description: 'In Zeus verify working of Email notifications by checking all under Email of default',
        });

        await manageApplicationPage.checkEmailNotificationCheckbox('allItems');
        await manageApplicationPage.saveAndVerifySuccess();
      }
    );

    test(
      'In Zeus verify working of Email notification frequency under email of default section',
      {
        tag: [TestPriority.P0],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-14978'],
          description: 'In Zeus verify working of Email notification frequency under email of default section',
        });

        await manageApplicationPage.clickOnEmailNotificationFrequencyLabel('Daily');
        await manageApplicationPage.saveAndVerifySuccess();
        await manageApplicationPage.clickOnEmailNotificationFrequencyLabel('Immediate');
        await manageApplicationPage.saveAndVerifySuccess();
      }
    );
  }
);
