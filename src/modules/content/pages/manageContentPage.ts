import { Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

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
    super(page, PAGE_ENDPOINTS.MANAGE_CONTENT_PAGE);
    this.manageContentComponent = new ManageContentComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async load(): Promise<void> {
    await this.page.goto(PAGE_ENDPOINTS.MANAGE_CONTENT_PAGE);
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
=======
import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { ManageContentComponent } from '@/src/modules/content/components/manageContentComponent';

export interface IManageContentPageActions {
  clickOnContent: () => Promise<void>;
  clickOnViewAllButton: () => Promise<void>;
  verifyingValidationRequiredBarState: () => Promise<void>;
  clickOnEditButton: () => Promise<void>;
}

export interface IFeaturedSiteAssertions {}
export class ManageContentPage extends BasePage {
  private manageContentComponent: ManageContentComponent;
  actions: any;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_CONTENT);
    this.manageContentComponent = new ManageContentComponent(page);
    this.actions = {
      clickOnContent: this.clickOnContent.bind(this),
      clickOnViewAllButton: this.clickOnViewAllButton.bind(this),
      verifyingValidationRequiredBarState: this.verifyingValidationRequiredBarState.bind(this),
      clickOnEditButton: this.clickOnEditButton.bind(this),
    };
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify manage content page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageContentComponent.sendFeedback, {
        assertionMessage: 'Manage content page should be visible',
      });
    });
  }

  async clickOnContent(): Promise<void> {
    await test.step('Clicking on content', async () => {
      await this.clickOnElement(this.manageContentComponent.clickOnContent);
      await this.manageContentComponent.clickOnContent.press('Enter');
    });
  }

  async clickOnViewAllButton(): Promise<void> {
    await test.step('Clicking on view all option', async () => {
      await this.clickOnElement(this.manageContentComponent.clickOnViewAll);
    });
  }

  async verifyingValidationRequiredBarState(): Promise<void> {
    await test.step('Verifying validation required bar state', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageContentComponent.validationRequiredBarState, {
        assertionMessage: 'Validation required bar state should be visible',
      });
    });
  }

  async clickOnEditButton(): Promise<void> {
    await test.step('Clicking on edit button', async () => {
      await this.clickOnElement(this.manageContentComponent.openingPanelMenu);
      await this.clickOnElement(this.manageContentComponent.clickOnEditButton);
    });
  }
}
