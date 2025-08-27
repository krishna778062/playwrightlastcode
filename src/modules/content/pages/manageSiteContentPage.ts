import { Page, test } from '@playwright/test';

import { BasePage } from '@/src/core/pages/basePage';

interface ContentFilters {
  contentType?: string;
  dateRange?: string;
  sortBy?: string;
  status?: string;
}

export interface IManageSiteContentActions {}

export interface IManageSiteContentAssertions {}

export class ManageSiteContentPage extends BasePage implements IManageSiteContentActions, IManageSiteContentAssertions {
  // Locators
  readonly contentTypeFilter = this.page.locator('[data-testid="content-type-filter"], select[name="contentType"]');

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
}
