import { Page } from '@playwright/test';

import { ManageContentComponent } from '../components/manageContentComponent';
import { ManageFeatureButtonComponent } from '../components/manageFeatureButtonComponent';

import { SideNavBarComponent } from '@/src/core/components/sideNavBarComponent';
import { BasePage } from '@/src/core/pages/basePage';

export interface IActions {
  navigateToContentButton: () => Promise<void>;
}

export interface IAssertions {}

export class ManageFeaturePage extends BasePage implements IActions, IAssertions {
  private manageFeatureButtonComponent: ManageFeatureButtonComponent;
  private sideNavBarComponent: SideNavBarComponent;
  static actions: any;

  constructor(page: Page) {
    super(page);
    this.manageFeatureButtonComponent = new ManageFeatureButtonComponent(page);
    this.sideNavBarComponent = new SideNavBarComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {}

  get actions() {
    return this;
  }

  get assertions() {
    return this;
  }

  async navigateToContentButton(): Promise<void> {
    await this.sideNavBarComponent.clickOnManageFeatureButton();
    await this.manageFeatureButtonComponent.clickContentButton();
  }
}
