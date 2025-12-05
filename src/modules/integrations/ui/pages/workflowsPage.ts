import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';

export type WorkflowStatus = 'All' | 'Published' | 'Draft' | 'Unpublished';
export type WorkflowItemsPerPage = 50 | 100 | 200 | 250;

export interface IWorkflowsActions {
  navigateToWorkflowsPage: () => Promise<void>;
  selectWorkflowStatusFilter: (status: WorkflowStatus) => Promise<void>;
  selectWorkflowItemsPerPage: (itemsPerPage: WorkflowItemsPerPage) => Promise<void>;
  searchWorkflows: (searchTerm: string) => Promise<void>;
}

export interface IWorkflowsAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyOnlyWorkflowsWithStatusAreVisible: (status: WorkflowStatus) => Promise<void>;
  verifySearchedWorkflowIsFound: (searchTerm: string) => Promise<void>;
}

export class WorkflowsPage extends BasePage implements IWorkflowsActions, IWorkflowsAssertions {
  readonly searchInputForWorkflows: Locator;
  readonly workflowStatusFilterDropdown: Locator;
  readonly createWorkflowButton: Locator;
  readonly statusPublishedFilterOption: Locator;
  readonly statusDraftFilterOption: Locator;
  readonly statusUnpublishedFilterOption: Locator;
  readonly statusAllFilterOption: Locator;
  readonly workflowItemsPerPageDropdown: Locator;
  readonly nameTableHeader: Locator;
  readonly descriptionTableHeader: Locator;
  readonly createdAtTableHeader: Locator;
  readonly updatedAtTableHeader: Locator;
  readonly statusTableHeader: Locator;
  readonly actionsTableHeader: Locator;
  readonly iSettingsTableHeader: Locator;
  readonly workflowsTableBody: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.WORKFLOWS_PAGE);
    this.searchInputForWorkflows = page.locator('input[type="text"][id="search"]');
    this.workflowStatusFilterDropdown = page.locator('select[id="workflowStatus"]');
    this.createWorkflowButton = page.getByRole('button', { name: 'Create workflow' });
    this.statusPublishedFilterOption = page.locator('option[value="Published"]');
    this.statusDraftFilterOption = page.locator('option[value="Draft"]');
    this.statusUnpublishedFilterOption = page.locator('option[value="Unpublished"]');
    this.statusAllFilterOption = page.locator('option:has-text("All")');
    this.workflowItemsPerPageDropdown = page.locator('select[data-testid="SelectInput"]').nth(1);
    this.nameTableHeader = page.locator('th[data-testid="name"]');
    this.descriptionTableHeader = page.locator('th[data-testid="description"]');
    this.createdAtTableHeader = page.locator('th[data-testid="createdAt"]');
    this.updatedAtTableHeader = page.locator('th[data-testid="updatedAt"]');
    this.statusTableHeader = page.locator('th[data-testid="status"]');
    this.actionsTableHeader = page.locator('th[data-testid="actions"]');
    this.iSettingsTableHeader = page.locator('[data-testid="i-settings"]');
    this.workflowsTableBody = page.locator('div[data-testid="table-body"]');
  }

  get actions(): IWorkflowsActions {
    return this;
  }

  get assertions(): IWorkflowsAssertions {
    return this;
  }

  async navigateToWorkflowsPage(): Promise<void> {
    await test.step('Navigate to workflows page', async () => {
      const url = PAGE_ENDPOINTS.WORKFLOWS_PAGE;
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    });
  }

  async selectWorkflowStatusFilter(status: WorkflowStatus): Promise<void> {
    await test.step(`Select workflow status filter: ${status}`, async () => {
      const statusValue = status === 'All' ? '' : status;
      console.log('statusValue', statusValue);
      await this.workflowStatusFilterDropdown.selectOption(statusValue);
    });
  }

  async selectWorkflowItemsPerPage(itemsPerPage: WorkflowItemsPerPage): Promise<void> {
    await test.step(`Select workflow items per page: ${itemsPerPage}`, async () => {
      await this.workflowItemsPerPageDropdown.selectOption(itemsPerPage.toString());
    });
  }

  async searchWorkflows(searchTerm: string): Promise<void> {
    await test.step(`Search workflows with term: ${searchTerm}`, async () => {
      await this.searchInputForWorkflows.fill(searchTerm);
      await this.page.keyboard.press('Enter');
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the workflows page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.searchInputForWorkflows, {
        timeout: 30_000,
        assertionMessage: 'Verifying that the search input for workflows is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.workflowStatusFilterDropdown, {
        timeout: 30_000,
        assertionMessage: 'Verifying that the workflow status filter dropdown is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.createWorkflowButton, {
        timeout: 30_000,
        assertionMessage: 'Verifying that the create workflow button is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.nameTableHeader, {
        timeout: 30_000,
        assertionMessage: 'Verifying that the name table header is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.descriptionTableHeader, {
        timeout: 30_000,
        assertionMessage: 'Verifying that the description table header is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.createdAtTableHeader, {
        timeout: 30_000,
        assertionMessage: 'Verifying that the createdAt table header is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.updatedAtTableHeader, {
        timeout: 30_000,
        assertionMessage: 'Verifying that the updatedAt table header is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.statusTableHeader, {
        timeout: 30_000,
        assertionMessage: 'Verifying that the status table header is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.actionsTableHeader, {
        timeout: 30_000,
        assertionMessage: 'Verifying that the actions table header is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.iSettingsTableHeader, {
        timeout: 30_000,
        assertionMessage: 'Verifying that the iSettings table header is visible',
      });
    });
  }

  async verifyOnlyWorkflowsWithStatusAreVisible(status: WorkflowStatus): Promise<void> {
    await test.step(`Verify only workflows with status '${status}' are visible`, async () => {
      const allStatuses: WorkflowStatus[] = ['Published', 'Draft', 'Unpublished'];

      // If status is 'All', all statuses should be visible, so skip verification
      if (status === 'All') {
        return;
      }

      // Verify that other statuses are NOT visible
      const otherStatuses = allStatuses.filter(s => s !== status);

      for (const otherStatus of otherStatuses) {
        const statusLocator = this.page.locator(`xpath=//span[text()='${otherStatus}']`);
        await this.verifier.verifyTheElementIsNotVisible(statusLocator, {
          timeout: 10_000,
          assertionMessage: `Verifying that workflows with status '${otherStatus}' are not visible`,
        });
      }

      // Note: We don't verify the selected status is visible because there might be no workflows with that status
      // If you want to verify at least one workflow with the selected status exists, you can add that check here
    });
  }

  /**
   * Gets a locator for a workflow link by search term
   * @param searchTerm - The search term to find the workflow
   * @returns Locator for the workflow link
   */
  private getWorkflowLinkBySearchTerm(searchTerm: string): Locator {
    return this.workflowsTableBody.locator('a').filter({ hasText: searchTerm }).first();
  }

  async verifySearchedWorkflowIsFound(searchTerm: string): Promise<void> {
    await test.step(`Verify searched workflow '${searchTerm}' is found in the table`, async () => {
      const workflowLinkLocator = this.getWorkflowLinkBySearchTerm(searchTerm);

      await this.verifier.verifyTheElementIsVisible(workflowLinkLocator, {
        timeout: 30_000,
        assertionMessage: `Verifying that workflow with search term '${searchTerm}' is found and visible in the table`,
      });
    });
  }
}
