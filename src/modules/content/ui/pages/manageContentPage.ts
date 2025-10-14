import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';
import { ManageContentComponent } from '@/src/modules/content/ui/components/manageContentComponent';

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
  selectCreatedNewestOption: () => Promise<void>;
  selectPageCategoryIfVisible: () => Promise<void>;
  selectPageCategory: () => Promise<void>;
  clickOnContent: () => Promise<void>;
  clickOnViewAllButton: () => Promise<void>;
  clickOnEditButton: () => Promise<void>;
  verifyingValidationRequiredBarState: () => Promise<void>;
  clickOnCancel: () => Promise<void>;
  addPublishContentFilter: () => Promise<void>;
  openContentDetailsPage: () => Promise<void>;
}

export interface IAssertions {
  nothingToShowHereText: () => Promise<void>;
  placeHolderTextShouldBeVisible: () => Promise<void>;
  verifyImageContainer: () => Promise<void>;
  authorNameShouldBeVisible: () => Promise<void>;
  clickOnTheAuthorName: () => Promise<void>;
  verifySiteName: () => Promise<void>;
  verifySiteNameLink: () => Promise<void>;
  scheduledTagVisibleInManageContent: () => Promise<void>;
  checkValidateOptionInBulkActions: () => Promise<void>;
}

export class ManageContentPage extends BasePage implements IActions, IAssertions {
  private manageContentComponent: ManageContentComponent;
  readonly clickingOnCheckbox: Locator = this.page.locator('input[type="checkbox"][aria-label="Select"]').first();
  readonly clickOnBulkOptions: Locator = this.page.locator('input[type="text"]#action');
  readonly validateOption: Locator = this.page.getByText('Validate');
  static actions: any;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_CONTENT);
    this.manageContentComponent = new ManageContentComponent(page);
  }

  async load(): Promise<void> {
    await this.page.goto(PAGE_ENDPOINTS.MANAGE_CONTENT);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify manage content page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageContentComponent.sendFeedback, {
        assertionMessage: 'Manage content page should be visible',
      });
    });
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
  async selectCreatedNewestOption(): Promise<void> {
    await this.manageContentComponent.selectCreatedNewestOptionByText();
  }

  async selectPageCategory(): Promise<void> {
    await this.manageContentComponent.selectPageCategory();
  }
  async clickOnViewAllButton(): Promise<void> {
    await this.manageContentComponent.clickOnViewAllButton();
  }
  async clickOnEditButton(): Promise<void> {
    await this.manageContentComponent.clickOnEditButton();
  }
  async verifyingValidationRequiredBarState(): Promise<void> {
    await this.manageContentComponent.verifyingValidationRequiredBarState();
  }
  async clickOnCancel(): Promise<void> {
    await this.manageContentComponent.clickOnCancel();
  }
  async clickOnContent(): Promise<void> {
    await this.manageContentComponent.clickOnContent();
  }
  async addPublishContentFilter(): Promise<void> {
    await this.manageContentComponent.addPublishContentFilter();
  }

  async selectMoveApplyButton(): Promise<void> {
    await this.manageContentComponent.selectMoveApplyButton();
  }
  async selectDeleteApplyButton(): Promise<void> {
    await this.manageContentComponent.selectDeleteApplyButton();
  }
  async scheduledTagVisibleInManageContent(): Promise<void> {
    await this.manageContentComponent.scheduledTagVisibleInManageContent();
  }
  async checkContentDetailsVisibility(pageName: string): Promise<void> {
    await this.manageContentComponent.checkContentDetailsVisibility(pageName);
  }
  async applyButtonShouldBeDisabled(): Promise<void> {
    await this.manageContentComponent.applyButtonShouldBeDisabled();
  }
  async checkValidateOptionInBulkActions(): Promise<void> {
    await this.clickOnElement(this.clickingOnCheckbox);
    console.log('clicking on checkbox');
    await this.clickOnElement(this.clickOnBulkOptions);
    console.log('clicking on bulk options');
    await this.verifier.verifyTheElementIsVisible(this.validateOption, {
      assertionMessage: 'Validate option should be visible in bulk actions',
    });
    console.log('validate option should be visible in bulk actions');
  }
  async openContentDetailsPage(): Promise<void> {
    await this.clickOnElement(this.clickingOnCheckbox);
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Enter');
  }
}
