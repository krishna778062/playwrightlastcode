import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AudienceBuilderPage } from '@platforms/ui/pages/abacPage/acgPage/audienceBuilderPage';

test.describe('Audience Builder Filter Testcases', { tag: [TestSuite.AUDIENCE, TestSuite.ABAC] }, () => {
  test(
    'Filters under audience rule page',
    { tag: [TestPriority.P1, `@ABAC`, `@audience-builder`] },
    async ({ appManagerUiFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-33960', 'PS-33961', 'PS-36298', 'PS-33962', 'PS-33963'],
      });

      const audienceBuilderPage = new AudienceBuilderPage(appManagerUiFixture.page);

      await audienceBuilderPage.loadPage();

      await audienceBuilderPage.verifyFiltersButtonPresence();

      await audienceBuilderPage.clickFiltersButton();

      // Verify close button presence in filters dialog
      await audienceBuilderPage.verifyCloseButtonPresence();

      await audienceBuilderPage.verifyFilterElementPresence('Attributes');
      await audienceBuilderPage.verifyFilterElementPresence('Created by');
      await audienceBuilderPage.verifyFilterElementPresence('Created date');

      //  verify created date filter options
      await audienceBuilderPage.clickFilterElement('Created date');
      await audienceBuilderPage.verifyFilterOptionPresence('Last 30 days');
      await audienceBuilderPage.verifyFilterOptionPresence('Last 90 days');
      await audienceBuilderPage.verifyFilterOptionPresence('Last 12 months');
      await audienceBuilderPage.verifyFilterOptionPresence('Custom');
      await audienceBuilderPage.clickFilterElement('Created date');

      //  verify attributes filter options
      await audienceBuilderPage.clickFilterElement('Attributes');
      await audienceBuilderPage.verifyFilterOptionPresence('Business unit');
      await audienceBuilderPage.verifyFilterOptionPresence('City');
      await audienceBuilderPage.verifyFilterOptionPresence('Company name');
      await audienceBuilderPage.verifyFilterOptionPresence('Department');
      await audienceBuilderPage.verifyFilterOptionPresence('State');
      await audienceBuilderPage.verifyFilterOptionPresence('Country');
      await audienceBuilderPage.verifyFilterOptionPresence('Division');
      await audienceBuilderPage.verifyFilterOptionPresence('Is manager');
      await audienceBuilderPage.verifyFilterOptionPresence('Job title');
      await audienceBuilderPage.verifyFilterOptionPresence('User type');
      await audienceBuilderPage.clickFilterElement('Attributes');

      // Test close button functionality
      await audienceBuilderPage.clickCloseButton();
      await audienceBuilderPage.verifyFiltersDialogClosed();

    }
  );
});
