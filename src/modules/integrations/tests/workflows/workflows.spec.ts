import { IntegrationsFeatureTags, IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { WorkflowsPage } from '@/src/modules/integrations/ui/pages/workflowsPage';

test.describe(
  'workflows test cases',
  {
    tag: [IntegrationsSuiteTags.INTEGRATIONS, IntegrationsSuiteTags.PHOENIX, IntegrationsFeatureTags.WORKFLOWS],
  },
  () => {
    let workflowsPage: WorkflowsPage;

    test.beforeEach(async ({ appManagerFixture }) => {
      workflowsPage = new WorkflowsPage(appManagerFixture.page);
      await workflowsPage.actions.navigateToWorkflowsPage();
      await workflowsPage.assertions.verifyThePageIsLoaded();
    });

    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      'verify navigation to workflows page',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY, IntegrationsFeatureTags.WORKFLOWS],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29579',
          zephyrTestId: 'TBD',
        });

        await workflowsPage.assertions.verifyThePageIsLoaded();
        await workflowsPage.actions.selectWorkflowStatusFilter('Draft');
        await workflowsPage.assertions.verifyOnlyWorkflowsWithStatusAreVisible('Draft');
        await workflowsPage.actions.selectWorkflowStatusFilter('Unpublished');
        await workflowsPage.assertions.verifyOnlyWorkflowsWithStatusAreVisible('Unpublished');
        await workflowsPage.actions.selectWorkflowStatusFilter('Published');
        await workflowsPage.assertions.verifyOnlyWorkflowsWithStatusAreVisible('Published');

        await workflowsPage.actions.searchWorkflows('dummy');
        await workflowsPage.assertions.verifySearchedWorkflowIsFound('dummy');
        await workflowsPage.actions.selectWorkflowItemsPerPage(100);
      }
    );
  }
);
