import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AudienceBuilderPage } from '@platforms/ui/pages/abacPage/acgPage/audienceBuilderPage';

test.describe('audience builder filter testcases', { tag: [TestSuite.AUDIENCE, TestSuite.ABAC] }, () => {
  test(
    'filters under audience rule page',
    { tag: [TestPriority.P1, `@ABAC`, `@audience-builder`, '@healthcheck'] },
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

  test(
    'verify the presence and functionality of View results and Reset all buttons under filters tab',
    { tag: [TestPriority.P1, `@ABAC`, `@audience-builder`] },
    async ({ appManagerUiFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-33964', 'PS-33965', 'PS-33966', 'PS-33967', 'PS-33968', 'PS-33971', 'PS-33969'],
      });

      const audienceBuilderPage = new AudienceBuilderPage(appManagerUiFixture.page);
      await audienceBuilderPage.loadPage();
      await audienceBuilderPage.clickFiltersButton();
      //  Verify absence of Reset button when no filter value selected
      await audienceBuilderPage.verifyButtonTextAbsence('Reset');
      await audienceBuilderPage.clickFilterElement('Attributes');
      await audienceBuilderPage.clickFilterOption('City');
      await audienceBuilderPage.verifyButtonTextPresence('View results');
      await audienceBuilderPage.clickButtonText('View results');
      await audienceBuilderPage.verifyFiltersDialogClosed();
      await audienceBuilderPage.verifyAppliedFilterRailPresence('Attributes');
      //  Reset all clears applied filters
      await audienceBuilderPage.clickFiltersButton();
      await audienceBuilderPage.verifyButtonTextPresence('Reset all');
      await audienceBuilderPage.clickButtonText('Reset all');
      await audienceBuilderPage.verifyFiltersDialogClosed();
      await audienceBuilderPage.verifyAppliedFilterRailAbsence('Attributes');
      //  Verify reset functionality for Created date filter
      await audienceBuilderPage.clickFiltersButton();
      await audienceBuilderPage.clickFilterElement('Created date');
      await audienceBuilderPage.clickFilterOption('Last 12 months');
      await audienceBuilderPage.clickButtonText('View results');
      await audienceBuilderPage.verifyAppliedFilterRailPresence('Created date');
      await audienceBuilderPage.clickFiltersButton();
      await audienceBuilderPage.clickButtonText('Reset');
      await audienceBuilderPage.clickButtonText('View results');
      await audienceBuilderPage.verifyAppliedFilterRailAbsence('Created date');
      //  Verify clear button on filter rail removes the applied filter
      await audienceBuilderPage.clickFiltersButton();
      await audienceBuilderPage.clickFilterElement('Attributes');
      await audienceBuilderPage.clickFilterOption('Business unit');
      await audienceBuilderPage.clickButtonText('View results');
      await audienceBuilderPage.verifyAppliedFilterRailPresence('Attributes');
      await audienceBuilderPage.clickAppliedFilterRail('Attributes');
      await audienceBuilderPage.clickButtonText('Clear');
      await audienceBuilderPage.verifyAppliedFilterRailAbsence('Attributes');
    }
  );
});
