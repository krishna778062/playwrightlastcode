import { analyticsTestFixture as test } from '@data-engineering/fixtures/analyticsFixture';

import { TestGroupType, TestPriority } from '@/src/core';

test.describe('analytics Overview Dashboard UI Checks', () => {
  test(
    'verify overview metrics are visible and loaded',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerFixture }) => {
      const { analyticsOverviewDashboard } = appManagerFixture;
      await analyticsOverviewDashboard.loadPage();
      await analyticsOverviewDashboard.verifyOverViewStatsSectionIsVisible();
      await analyticsOverviewDashboard.verifyOverViewSectionMetricsAreVisible();
    }
  );
});
