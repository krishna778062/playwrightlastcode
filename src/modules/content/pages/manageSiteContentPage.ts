import { Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';
import { SideNavBarComponent } from '@/src/core/components/sideNavBarComponent';
import { ManageSitesComponent } from '../components/manageSitesComponent';

interface ContentFilters {
  contentType?: string;
  dateRange?: string;
  sortBy?: string;
  status?: string;
}

export interface IManageSiteContentActions {
  navigateToSitesButton: () => Promise<void>;

}

export interface IManageSiteContentAssertions {}

export class ManageSiteContentPage extends BasePage implements IManageSiteContentActions, IManageSiteContentAssertions {
  private sideNavBarComponent: SideNavBarComponent;
  private manageSitesComponent: ManageSitesComponent;
  static actions: any;

  constructor(page: Page) {
    super(page);
    this.manageSitesComponent = new ManageSitesComponent(page);
    this.sideNavBarComponent = new SideNavBarComponent(page);
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

  async navigateToSitesButton(): Promise<void> {
    await this.sideNavBarComponent.clickOnManageFeatureButton();
    await this.manageSitesComponent.clickOnSite();
  }

}
