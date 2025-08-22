import { Page, test } from '@playwright/test';

import { BasePage } from '@/src/core/pages/basePage';

interface ContentFilters {
  contentType?: string;
  dateRange?: string;
  sortBy?: string;
  status?: string;
}

export interface IManageSiteContentActions {
  applyContentFilters: (filters: ContentFilters) => Promise<void>;
}

export interface IManageSiteContentAssertions {
  // Add assertions as needed
}

export class ManageSiteContentPage extends BasePage implements IManageSiteContentActions, IManageSiteContentAssertions {
  // Locators
  readonly contentTypeFilter = this.page.locator('[data-testid="content-type-filter"], select[name="contentType"]');
  readonly dateRangeFilter = this.page.locator('[data-testid="date-range-filter"], select[name="dateRange"]');
  readonly sortByFilter = this.page.locator('[data-testid="sort-by-filter"], select[name="sortBy"]');
  readonly statusFilter = this.page.locator('[data-testid="status-filter"], select[name="status"]');
  readonly applyFiltersButton = this.page.locator('button:has-text("Apply"), button:has-text("Filter")');

  constructor(page: Page) {
    super(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.contentTypeFilter, {
      assertionMessage: 'Content type filter should be visible on manage site content page',
    });
  }

  get actions(): IManageSiteContentActions {
    return this;
  }

  get assertions(): IManageSiteContentAssertions {
    return this;
  }

  async applyContentFilters(filters: ContentFilters): Promise<void> {
    await test.step('Apply content filters', async () => {
      if (filters.contentType) {
        await this.page.selectOption(this.contentTypeFilter, filters.contentType);
      }

      if (filters.dateRange) {
        await this.page.selectOption(this.dateRangeFilter, filters.dateRange);
      }

      if (filters.sortBy) {
        await this.page.selectOption(this.sortByFilter, filters.sortBy);
      }

      if (filters.status) {
        await this.page.selectOption(this.statusFilter, filters.status);
      }

      // Apply the filters
      if (await this.applyFiltersButton.isVisible()) {
        await this.clickOnElement(this.applyFiltersButton, {
          stepInfo: 'Click apply filters button',
        });
      }
    });
  }
}
