import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { tagTest } from '@core/utils/testDecorator';
import {
  AUDIENCE_BUILDER_BUTTONS,
  AUDIENCE_BUILDER_FILTER_OPTIONS,
  AUDIENCE_BUILDER_FILTERS,
} from '@platforms/constants/audience';
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
      await audienceBuilderPage.verifyButtonTextAbsence(AUDIENCE_BUILDER_BUTTONS.RESET);
      await audienceBuilderPage.clickFilterElement(AUDIENCE_BUILDER_FILTERS.ATTRIBUTES);
      await audienceBuilderPage.clickFilterOption(AUDIENCE_BUILDER_FILTER_OPTIONS.CITY);
      await audienceBuilderPage.verifyButtonTextPresence(AUDIENCE_BUILDER_BUTTONS.VIEW_RESULTS);
      await audienceBuilderPage.clickButtonText(AUDIENCE_BUILDER_BUTTONS.VIEW_RESULTS);
      await audienceBuilderPage.verifyFiltersDialogClosed();
      await audienceBuilderPage.verifyAppliedFilterRailPresence(AUDIENCE_BUILDER_FILTERS.ATTRIBUTES);
      //  Reset all clears applied filters
      await audienceBuilderPage.clickFiltersButton();
      await audienceBuilderPage.verifyButtonTextPresence(AUDIENCE_BUILDER_BUTTONS.RESET_ALL);
      await audienceBuilderPage.clickButtonText(AUDIENCE_BUILDER_BUTTONS.RESET_ALL);
      await audienceBuilderPage.verifyFiltersDialogClosed();
      await audienceBuilderPage.verifyAppliedFilterRailAbsence(AUDIENCE_BUILDER_FILTERS.ATTRIBUTES);
      //  Verify reset functionality for Created date filter
      await audienceBuilderPage.clickFiltersButton();
      await audienceBuilderPage.clickFilterElement(AUDIENCE_BUILDER_FILTERS.CREATED_DATE);
      await audienceBuilderPage.clickFilterOption(AUDIENCE_BUILDER_FILTER_OPTIONS.LAST_12_MONTHS);
      await audienceBuilderPage.clickButtonText(AUDIENCE_BUILDER_BUTTONS.VIEW_RESULTS);
      await audienceBuilderPage.verifyAppliedFilterRailPresence(AUDIENCE_BUILDER_FILTERS.CREATED_DATE);
      await audienceBuilderPage.clickFiltersButton();
      await audienceBuilderPage.clickButtonText(AUDIENCE_BUILDER_BUTTONS.RESET);
      await audienceBuilderPage.clickButtonText(AUDIENCE_BUILDER_BUTTONS.VIEW_RESULTS);
      await audienceBuilderPage.verifyAppliedFilterRailAbsence(AUDIENCE_BUILDER_FILTERS.CREATED_DATE);
      //  Verify clear button on filter rail removes the applied filter
      await audienceBuilderPage.clickFiltersButton();
      await audienceBuilderPage.clickFilterElement(AUDIENCE_BUILDER_FILTERS.ATTRIBUTES);
      await audienceBuilderPage.clickFilterOption(AUDIENCE_BUILDER_FILTER_OPTIONS.BUSINESS_UNIT);
      await audienceBuilderPage.clickButtonText(AUDIENCE_BUILDER_BUTTONS.VIEW_RESULTS);
      await audienceBuilderPage.verifyAppliedFilterRailPresence(AUDIENCE_BUILDER_FILTERS.ATTRIBUTES);
      await audienceBuilderPage.clickAppliedFilterRail(AUDIENCE_BUILDER_FILTERS.ATTRIBUTES);
      await audienceBuilderPage.clickButtonText(AUDIENCE_BUILDER_BUTTONS.CLEAR);
      await audienceBuilderPage.verifyAppliedFilterRailAbsence(AUDIENCE_BUILDER_FILTERS.ATTRIBUTES);
    }
  );
});
