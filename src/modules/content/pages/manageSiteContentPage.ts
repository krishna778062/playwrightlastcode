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
  constructor(page: Page) {
    super(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    // TODO: Implement this
  }

  get actions(): IManageSiteContentActions {
    return this;
  }

  get assertions(): IManageSiteContentAssertions {
    return this;
  }
}
