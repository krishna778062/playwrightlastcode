import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';
import { ManageContentOptions, ManageContentTags, SortOptionLabels } from '@/src/modules/content/constants';
import { ManageContentComponent } from '@/src/modules/content/ui/components/manageContentComponent';
import { OnboardingComponent } from '@/src/modules/content/ui/components/onboardingComponent';

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
  selectSiteSearchBar: (siteName: string) => Promise<void>;
  clickOnTheSiteName: () => Promise<void>;
  clickSortByButton: () => Promise<void>;
  selectSortOption: (sortBy: SortOptionLabels) => Promise<void>;
  selectPageCategoryIfVisible: () => Promise<void>;
  selectPageCategory: () => Promise<void>;
  clickOnContent: () => Promise<void>;
  clickOnViewAllButton: () => Promise<void>;
  clickOnEditButton: () => Promise<void>;
  verifyingValidationRequiredBarState: () => Promise<void>;
  clickOnCancel: () => Promise<void>;
  addPublishContentFilter: () => Promise<void>;
  openContentDetailsPage: () => Promise<void>;
  selectContentFilterByType: (filterType: 'manageByme' | 'authorByMe') => Promise<void>;
  verifyOnboardingOptionVisibleInManageContent: () => Promise<void>;
  verifyContentVisibleInManageSite: (contentName: string) => Promise<void>;
  clickOnOnboardingOption: () => Promise<void>;
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
  verifyManageContentListItemCount: (expectedCount: number) => Promise<void>;
  checkValidateOptionInBulkActions: () => Promise<void>;
}

export class ManageContentPage extends BasePage implements IActions, IAssertions {
  private manageContentComponent: ManageContentComponent;
  private onboardingComponent: OnboardingComponent;
  readonly clickingOnCheckbox: Locator = this.page.locator('input[type="checkbox"][aria-label="Select"]').first();
  readonly clickOnBulkOptions: Locator = this.page.locator('input[type="text"]#action');
  readonly validateOption: Locator = this.page.getByText('Validate');
  static actions: any;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_CONTENT);
    this.manageContentComponent = new ManageContentComponent(page);
    this.onboardingComponent = new OnboardingComponent(page);
    this.editButton = this.manageContentComponent.editButton;
    this.deleteButton = this.manageContentComponent.deleteButton;
    this.unpublishButton = this.manageContentComponent.unpublishButton;
    this.publishButton = this.manageContentComponent.publishButton;
    this.moveButton = this.manageContentComponent.moveButton;
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
  async clickOnApply(): Promise<void> {
    await this.manageContentComponent.clickOnApply();
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
  async clickOnValidateApplyButton(): Promise<void> {
    await this.manageContentComponent.clickOnValidateApplyButton();
  }

  async clickOnFirstDropDownOption(): Promise<void> {
    await this.manageContentComponent.selectFirstDropDownOption();
  }
  async hoverOnFirstDropDownOption(): Promise<void> {
    await this.manageContentComponent.hoverOnFirstDropDownOption();
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
  async selectSiteSearchBar(siteName: string): Promise<void> {
    await this.manageContentComponent.selectSiteSearchBar(siteName);
  }
  async clickSiteSearchBar(siteName: string): Promise<void> {
    await this.manageContentComponent.clickSiteSearchBar(siteName);
  }
  async selectCreatedNewestOption(): Promise<void> {
    await this.manageContentComponent.selectCreatedNewestOption();
  }
  async selectCreateNewestPublishedOption(): Promise<void> {
    await this.manageContentComponent.selectCreateNewestPublishedOptionByText();
  }
  async selectTheStatusFilter(status: string): Promise<void> {
    await this.manageContentComponent.selectTheStatusFilter(status);
  }
  async clickOnActivateButton(): Promise<void> {
    await this.manageContentComponent.clickOnActivateButton();
  }
  async clickOnActivateApplyButton(): Promise<void> {
    await this.manageContentComponent.clickOnActivateApplyButton();
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

  async selectEditedNewestOption(): Promise<void> {
    await this.selectSortOption(SortOptionLabels.MODIFIED_NEWEST);
  }
  async selectEditedOldestOption(): Promise<void> {
    await this.selectSortOption(SortOptionLabels.MODIFIED_OLDEST);
  }
  /**
   * Parameterized function to select any sort option by SortOptionLabels enum
   * @param sortBy - The sort option to select
   */
  async selectSortOption(sortBy: SortOptionLabels): Promise<void> {
    await this.manageContentComponent.selectSortOption(sortBy);
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

  async selectContentManagedBy(managedBy: string): Promise<void> {
    await this.manageContentComponent.selectContentFilter(managedBy);
  }

  async selectContentFilterByType(filterType: 'manageByme' | 'authorByMe'): Promise<void> {
    await this.manageContentComponent.selectContentFilterByType(filterType);
  }
  async verifyCreatedAtDateVisibleInManageContent(createdAtDate: string): Promise<void> {
    await this.manageContentComponent.verifyCreatedAtDateVisibleInManageContent(createdAtDate);
  }
  async verifyEditedAtDateVisibleInManageContent(editedAtDate: string): Promise<void> {
    await this.manageContentComponent.verifyEditedAtDateVisibleInManageContent(editedAtDate);
  }
  async verifyPublishedAtDateVisibleInManageContent(publishedAtDate: string): Promise<void> {
    await this.manageContentComponent.verifyPublishedAtDateVisibleInManageContent(publishedAtDate);
  }
  async verifyTagVisibleInManageContent(tag: ManageContentTags): Promise<void> {
    await this.manageContentComponent.verifyTagVisibleInManageContent(tag);
  }

  async verifyContentDetailsVisibility(pageName: string): Promise<void> {
    await this.manageContentComponent.verifyContentDetailsVisibility(pageName);
  }

  async verifyAllCreatedAtDatesFromArray(dates: string[]): Promise<void> {
    await this.manageContentComponent.verifyAllCreatedAtDatesFromArray(dates);
  }

  async verifyAllPublishedAtDatesFromArray(dates: string[]): Promise<void> {
    await this.manageContentComponent.verifyAllPublishedAtDatesFromArray(dates);
  }
  async getAllContentNames(): Promise<string[]> {
    return await this.manageContentComponent.getAllContentNames();
  }
  async searchAllContentsInGlobalSearchBar(contentNames: string[]): Promise<void> {
    await this.manageContentComponent.searchAllContentsInGlobalSearchBar(contentNames);
  }

  async verifyManageContentListItemCount(expectedCount: number): Promise<void> {
    await this.manageContentComponent.verifyManageContentListItemCount(expectedCount);
  }

  async clickShowMoreButton(): Promise<void> {
    await this.manageContentComponent.clickShowMoreButton();
  }

  async selectPageOption(): Promise<void> {
    await this.manageContentComponent.selectPageOption();
  }
  /**
   * Unified function to verify any option visibility in manage content
   * @param option - The enum value for the option to verify (e.g., ManageContentOptions.EDIT)
   */
  async verifyOptionVisibleInManageContent(option: ManageContentOptions): Promise<void> {
    await this.manageContentComponent.verifyOptionVisibleInManageContent(option);
  }

  async verifyOnboardingOptionVisibleInManageContent(): Promise<void> {
    await this.manageContentComponent.verifyOnboardingOptionVisibleInManageContent();
  }

  async verifyOnboardingOptionVisibleInManageContent(): Promise<void> {
    await this.manageContentComponent.verifyOnboardingOptionVisibleInManageContent();
  }
  async clickOnOnboardingOption(): Promise<void> {
    await this.manageContentComponent.clickOnOnboardingOption();
  }
  async clickOnContentEditButton(): Promise<void> {
    await this.manageContentComponent.clickOnContentEditButton();
  }
  async UpdatedPageName(pageName: string): Promise<void> {
    await this.manageContentComponent.UpdatedPageName(pageName);
  }
  async clickOnPublishChangesButton(): Promise<void> {
    await this.manageContentComponent.clickOnPublishChangesButton();
  }
  async clickOnDeleteOption(): Promise<void> {
    await this.manageContentComponent.clickOnDeleteOption();
  }
  async verifyAllContentsAreSelected(expectedCount: number = 16): Promise<void> {
    await this.manageContentComponent.verifyAllContentsAreSelected(expectedCount);
  }
  async verifyAllContentsAreDeleted(deletedContentNames: string[]): Promise<void> {
    await this.manageContentComponent.verifyAllContentsAreDeleted(deletedContentNames);
  }
  async verifyContentVisibleInManageSite(contentName: string): Promise<void> {
    await this.manageContentComponent.verifyContentVisibleInManageSite(contentName);
  }
}
