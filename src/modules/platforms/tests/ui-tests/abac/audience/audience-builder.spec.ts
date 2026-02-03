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
    'verify the presence of createdBy filter under audience rules filter',
    { tag: [TestPriority.P1, `@ABAC`, `@audience-builder`] },
    async ({ appManagerUiFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-34534'],
      });

      const audienceBuilderPage = new AudienceBuilderPage(appManagerUiFixture.page);

      await audienceBuilderPage.loadPage();

      await audienceBuilderPage.clickFiltersButton();

      await audienceBuilderPage.verifyFilterElementPresence(AUDIENCE_BUILDER_FILTERS.CREATED_BY);
    }
  );

  test(
    'verify the presence of Filters button under audience page',
    { tag: [TestPriority.P1, `@ABAC`, `@audience-builder`] },
    async ({ appManagerUiFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-33930'],
      });

      const audienceBuilderPage = new AudienceBuilderPage(appManagerUiFixture.page);

      await audienceBuilderPage.loadPage();

      await audienceBuilderPage.verifyFiltersButtonPresence();

      await audienceBuilderPage.clickFiltersButton();
    }
  );

  test(
    'verify the presence of cross Reset all and View results button under filters tab',
    { tag: [TestPriority.P1, `@ABAC`, `@audience-builder`] },
    async ({ appManagerUiFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-33932'],
      });

      const audienceBuilderPage = new AudienceBuilderPage(appManagerUiFixture.page);

      await audienceBuilderPage.loadPage();

      await audienceBuilderPage.clickFiltersButton();

      await audienceBuilderPage.verifyCloseButtonPresence();

      await audienceBuilderPage.verifyButtonTextPresence(AUDIENCE_BUILDER_BUTTONS.RESET_ALL);

      await audienceBuilderPage.verifyButtonTextPresence(AUDIENCE_BUILDER_BUTTONS.VIEW_RESULTS);
    }
  );

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

      await audienceBuilderPage.verifyFilterElementPresence(AUDIENCE_BUILDER_FILTERS.ATTRIBUTES);
      await audienceBuilderPage.verifyFilterElementPresence(AUDIENCE_BUILDER_FILTERS.CREATED_BY);
      await audienceBuilderPage.verifyFilterElementPresence(AUDIENCE_BUILDER_FILTERS.CREATED_DATE);

      //  verify created date filter options
      await audienceBuilderPage.clickFilterElement(AUDIENCE_BUILDER_FILTERS.CREATED_DATE);
      await audienceBuilderPage.verifyFilterOptionPresence('Last 30 days');
      await audienceBuilderPage.verifyFilterOptionPresence('Last 90 days');
      await audienceBuilderPage.verifyFilterOptionPresence('Last 12 months');
      await audienceBuilderPage.verifyFilterOptionPresence('Custom');
      await audienceBuilderPage.clickFilterElement(AUDIENCE_BUILDER_FILTERS.CREATED_DATE);

      //  verify attributes filter options
      await audienceBuilderPage.clickFilterElement(AUDIENCE_BUILDER_FILTERS.ATTRIBUTES);

      await audienceBuilderPage.searchFilterOption('Business unit');
      await audienceBuilderPage.verifyFilterOptionPresence('Business unit');

      await audienceBuilderPage.searchFilterOption('City');
      await audienceBuilderPage.verifyFilterOptionPresence('City');

      await audienceBuilderPage.searchFilterOption('Company name');
      await audienceBuilderPage.verifyFilterOptionPresence('Company name');

      await audienceBuilderPage.searchFilterOption('Department');
      await audienceBuilderPage.verifyFilterOptionPresence('Department');

      await audienceBuilderPage.searchFilterOption('State');
      await audienceBuilderPage.verifyFilterOptionPresence('State');

      await audienceBuilderPage.searchFilterOption('Country');
      await audienceBuilderPage.verifyFilterOptionPresence('Country');

      await audienceBuilderPage.searchFilterOption('Division');
      await audienceBuilderPage.verifyFilterOptionPresence('Division');

      await audienceBuilderPage.searchFilterOption('Is manager');
      await audienceBuilderPage.verifyFilterOptionPresence('Is manager');

      await audienceBuilderPage.searchFilterOption('Job title');
      await audienceBuilderPage.verifyFilterOptionPresence('Job title');

      await audienceBuilderPage.searchFilterOption('User type');
      await audienceBuilderPage.verifyFilterOptionPresence('User type');

      await audienceBuilderPage.clickFilterElement(AUDIENCE_BUILDER_FILTERS.ATTRIBUTES);

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
