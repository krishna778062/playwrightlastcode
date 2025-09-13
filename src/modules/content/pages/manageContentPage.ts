import { Page } from '@playwright/test';

import { ManageContentComponent } from '../components/manageContentComponent';

import { BasePage } from '@/src/core/pages/basePage';

export interface IActions {
  writeRandomTextInSearchBar: (inputText: string) => Promise<void>;
  clickSearchIcon: () => Promise<void>;
  clickXButton: () => Promise<void>;
  clickOnFirstContentButton: () => Promise<void>;
  clickOnSelectActionDropdown: () => Promise<void>;
  clickOnUnpublishButton: () => Promise<void>;
  clickOnApplyButton: () => Promise<void>;
  clickOnPublishButton: () => Promise<void>;
  clickFilterButton: () => Promise<void>;
  clickSiteSearchBar: (siteName: string) => Promise<void>;
  clickOnTheSiteName: () => Promise<void>;
  clickSortByButton: () => Promise<void>;
  selectCreatedNewestOptionThroughUrl: () => Promise<void>;
  selectPageCategoryIfVisible: () => Promise<void>;
  selectPageCategory: () => Promise<void>;
}

export interface IAssertions {
  nothingToShowHereText: () => Promise<void>;
  placeHolderTextShouldBeVisible: () => Promise<void>;
  verifyImageContainer: () => Promise<void>;
  authorNameShouldBeVisible: () => Promise<void>;
  clickOnTheAuthorName: () => Promise<void>;
  verifySiteName: () => Promise<void>;
  verifySiteNameLink: () => Promise<void>;
}

export class ManageContentPage extends BasePage implements IActions, IAssertions {
  private manageContentComponent: ManageContentComponent;

  static actions: any;

  constructor(page: Page) {
    super(page);
    this.manageContentComponent = new ManageContentComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  get actions() {
    return this;
  }

  get assertions() {
    return this;
  }

  async writeRandomTextInSearchBar(inputText: string): Promise<void> {
    await this.manageContentComponent.writeRandomTextInSearchBar(inputText);
  }

  async clickSearchIcon(): Promise<void> {
    await this.manageContentComponent.searchIcon();
  }

  async nothingToShowHereText(): Promise<void> {
    await this.manageContentComponent.nothingToShowHere();
  }

  async clickXButton(): Promise<void> {
    await this.manageContentComponent.clickXButton();
  }
  async placeHolderTextShouldBeVisible(): Promise<void> {
    await this.manageContentComponent.placeHolderShouldBeVisible();
  }

  async clickOnFirstContentButton(): Promise<void> {
    await this.manageContentComponent.selectFirstContent();
  }

  async clickOnSelectActionDropdown(): Promise<void> {
    await this.manageContentComponent.selectActionDropdown();
  }

  async clickOnUnpublishButton(): Promise<void> {
    await this.manageContentComponent.selectUnpublishButton();
  }

  async clickOnApplyButton(): Promise<void> {
    await this.manageContentComponent.selectApplyButton();
  }

  async clickOnPublishButton(): Promise<void> {
    await this.manageContentComponent.selectPublishButton();
  }

  async clickOnMoveButton(): Promise<void> {
    await this.manageContentComponent.selectMoveButton();
  }

  async moveContentSearchBar(siteName: string): Promise<void> {
    await this.manageContentComponent.moveContentSearchBar(siteName);
  }

  async clickOnMoveConfirmButton(): Promise<void> {
    await this.manageContentComponent.selectMoveConfirmButton();
  }

  async siteListSelecting(): Promise<void> {
    await this.manageContentComponent.siteListSelecting();
  }

  async selectPageCategoryIfVisible(): Promise<void> {
    await this.manageContentComponent.selectPageCategoryIfVisible();
  }

  async clickOnDeleteButton(): Promise<void> {
    await this.manageContentComponent.selectDeleteButton();
  }

  async clickOnSelectAllButton(): Promise<void> {
    await this.manageContentComponent.selectSelectAllButton();
  }

  async clickOnValidateButton(): Promise<void> {
    await this.manageContentComponent.selectValidateButton();
  }

  async clickOnFirstDropDownOption(): Promise<void> {
    await this.manageContentComponent.selectFirstDropDownOption();
  }

  async checkPublishOption(): Promise<void> {
    await this.manageContentComponent.checkPublishOption();
  }

  async clickDeleteOption(): Promise<void> {
    await this.manageContentComponent.clickDeleteOption();
  }

  async clickDeleteModalConfirmButton(): Promise<void> {
    await this.manageContentComponent.clickDeleteModalConfirmButton();
  }
  async verifyImageContainer(): Promise<void> {
    await this.manageContentComponent.verifyImageContainer();
  }
  async clickFilterButton(): Promise<void> {
    await this.manageContentComponent.clickFilterButton();
  }
  async clickSiteSearchBar(siteName: string): Promise<void> {
    await this.manageContentComponent.clickSiteSearchBar(siteName);
  }
  async authorNameShouldBeVisible(): Promise<void> {
    await this.manageContentComponent.authorNameShouldBeVisible();
  }
  async clickOnTheAuthorName(): Promise<void> {
    await this.manageContentComponent.clickOnTheAuthorName();
  }
  async verifySiteName(): Promise<void> {
    await this.manageContentComponent.verifySiteName();
  }
  async clickOnTheSiteName(): Promise<void> {
    await this.manageContentComponent.clickOnTheSiteName();
  }
  async verifySiteStatusStamp(): Promise<void> {
    await this.manageContentComponent.verifySiteStatusStamp();
  }
  async selectSiteSearchBarOption(): Promise<void> {
    await this.manageContentComponent.selectSiteSearchBarOption();
  }
  async verifySiteNameLink(): Promise<void> {
    await this.manageContentComponent.verifySiteNameLink();
  }
  async clickSortByButton(): Promise<void> {
    await this.manageContentComponent.clickSortByButton();
  }
  async selectCreatedNewestOptionThroughUrl(): Promise<void> {
    await this.manageContentComponent.selectCreatedNewestOptionByText();
  }

  async selectPageCategory(): Promise<void> {
    await this.manageContentComponent.selectPageCategory();
  }
}
