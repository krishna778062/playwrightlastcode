import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { ManageApplicationPage } from '@/src/modules/platforms/ui/pages/manageApplication/manageApplication';

test.describe(
  'Zeus Browser Defaults Manage Application Tests',
  {
    tag: ['@zeus', '@Platform_Services', '@Zulu', '@regression', '@sanity', '@setupManageApplication'],
  },
  () => {
    let manageApplicationPage: ManageApplicationPage;

    test.beforeEach(async ({ zuluAppManagerPage }) => {
      manageApplicationPage = new ManageApplicationPage(zuluAppManagerPage);
      await manageApplicationPage.navigateToBrowserNotificationsPage();
    });

    test(
      'In Zeus verify that presence of Browser notifications under Default Browser section with one button and options',
      {
        tag: [TestPriority.P0],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-13800'],
          description:
            'In Zeus verify that presence of Browser notifications under Default Browser section with one button and options',
        });

        await manageApplicationPage.updateAppNameViaAPI('Good & Co Inc.');
        // Navigate back to browser notifications page after API update (which reloads email notifications page)
        await manageApplicationPage.navigateToBrowserNotificationsPage();
        await manageApplicationPage.verifyBrowserNotificationsFieldsPresence();
      }
    );

    test(
      'In Zeus verify working of Browser notifications by checking all under Browser of default',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-14986'],
          description: 'In Zeus verify working of Browser notifications by checking all under Browser of default',
        });

        await manageApplicationPage.uncheckEmailNotificationCheckbox('allItems');
        await manageApplicationPage.saveAndVerifySuccess();
        await manageApplicationPage.checkEmailNotificationCheckbox('allItems');
        await manageApplicationPage.saveAndVerifySuccess();
      }
    );

    test(
      'In Zeus verify working of Browser notifications by unchecking few section under Browser of default',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-14985'],
          description:
            'In Zeus verify working of Browser notifications by unchecking few section under Browser of default',
        });

        await manageApplicationPage.uncheckMultipleEmailNotificationCheckboxes([
          'feed',
          'profileAndExpertise',
          'event',
        ]);
        await manageApplicationPage.saveAndVerifySuccess();
      }
    );

    test(
      'In Zeus verify working of Browser notifications by clicking on use recommended under Browser of default',
      {
        tag: [TestPriority.P0],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-14984'],
          description:
            'In Zeus verify working of Browser notifications by clicking on use recommended under Browser of default',
        });

        await manageApplicationPage.clickOnUseRecommended();
        await manageApplicationPage.saveAndVerifySuccess();
      }
    );
  }
);
