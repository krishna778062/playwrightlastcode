import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { ManageApplicationPage } from '@/src/modules/platforms/ui/pages/manageApplication/manageApplication';

test.describe(
  'Zeus Client Application Integration Tests',
  {
    tag: ['@zeus', '@Platform_Services', '@Zulu', '@regression', '@sanity', '@zeussmoke', '@setupManageApplication'],
  },
  () => {
    let manageApplicationPage: ManageApplicationPage;

    test.beforeEach(async ({ zuluAppManagerPage }) => {
      manageApplicationPage = new ManageApplicationPage(zuluAppManagerPage);
    });

    test(
      'In Zeus Verify that user can add client app in Client Application under integrations of manage application',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-16461'],
          description:
            'Verify that user can add client app in Client Application under integrations of manage application',
        });

        // Navigate to client application page
        await manageApplicationPage.navigateToClientApplicationPage();

        // Delete all the added client apps
        await manageApplicationPage.deleteAllAddedClientApps();

        // Click on Add client app button
        await manageApplicationPage.clickOnElementWithTagAndText('span', 'Add client app');

        // Enter values in client application fields
        await manageApplicationPage.enterTextInClientApplicationField('Automation Name', 'Client application name');
        await manageApplicationPage.enterTextInClientApplicationField('Automation ID', 'Client application id');
        await manageApplicationPage.enterTextInClientApplicationField(
          'Automation Description',
          'Client application description'
        );
        await manageApplicationPage.enterTextInClientApplicationField(
          'https://automation-zulu-qa.qa.simpplr.xyz/',
          'Client redirect URL'
        );

        // Scroll and click on Save button
        await manageApplicationPage.clickOnSave();

        // Verify the success message
        await manageApplicationPage.verifyTheDisplayOfMessageWithText('Saved changes successfully');
      }
    );

    test(
      'In Zeus verify that user can edit added client app in Client Application under integrations of manage application',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-16463'],
          description:
            'Verify that user can edit added client app in Client Application under integrations of manage application',
        });

        await manageApplicationPage.navigateToClientApplicationPage();
        await manageApplicationPage.mouseHoverOnOptionMenuAndClickOption('Edit');
        await manageApplicationPage.enterTextInClientApplicationField(
          'Automation Edit Name',
          'Client application name'
        );
        await manageApplicationPage.enterTextInClientApplicationField('Automation Edit ID', 'Client application id');
        await manageApplicationPage.enterTextInClientApplicationField(
          'Automation Edit Description',
          'Client application description'
        );
        await manageApplicationPage.enterTextInClientApplicationField(
          'https://automation-zulu-qa.qa.simpplr.xyz/home',
          'Client redirect URL'
        );
        await manageApplicationPage.clickOnSave();
        await manageApplicationPage.verifyTheDisplayOfMessageWithText('Saved changes successfully');
      }
    );

    test(
      'In Zeus verify that user can delete a client application in Client Application under integrations of manage application',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-16464'],
          description:
            'Verify that user can delete a client application in Client Application under integrations of manage application',
        });

        await manageApplicationPage.navigateToClientApplicationPage();
        await manageApplicationPage.mouseHoverOnOptionMenuAndClickOption('Delete');
        await manageApplicationPage.verifyTheDisplayOfMessageWithText('Client application deleted successfully');
      }
    );

    test(
      'In Zeus Verify Presence of Client Application under integrations of manage application',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-16460'],
          description: 'Verify Presence of Client Application under integrations of manage application',
        });

        await manageApplicationPage.navigateToClientApplicationPage();
        await manageApplicationPage.verifyThePresenceOfFieldWithHtmlTagAndText('h3', 'Client application');
        await manageApplicationPage.verifyThePresenceOfFieldWithHtmlTagAndText('span', 'Add client app');
      }
    );
  }
);
