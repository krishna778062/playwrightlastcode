import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';
import { AddContentTileComponent } from '@/src/modules/content/ui/components/addContentTileComponent';
import { AddTileComponent } from '@/src/modules/content/ui/components/addTileComponent';
import { OnboardingComponent } from '@/src/modules/content/ui/components/onboardingComponent';
import { PageTileSectionComponent } from '@/src/modules/content/ui/components/pageTileSectionComponent';

export interface IHomeDashboardPageActions {
  clickOnEditDashboardButton: () => Promise<void>;
  clickOnAddTileButton: () => Promise<void>;
  clickOnAddContentTileOption: () => Promise<void>;
  selectingPagesAsContentType: () => Promise<void>;
  namingTheTile: (tileName: string) => Promise<void>;
  clickingOnAddToHomeButton: () => Promise<void>;
  clickingOnDoneButton: () => Promise<void>;
  openingCreatedPageInTile: (pageName: string) => Promise<void>;
  clickingOnEditTileButton: (tileName: string) => Promise<void>;
  selectingSiteRadioButton: (siteName: string) => Promise<void>;
  selectingShowcaseRadioButton: () => Promise<void>;
  clickingOnSaveButton: () => Promise<void>;
  clickingOnRemoveTileButton: (tileName: string) => Promise<void>;
  clickingOnOnboardingTab: () => Promise<void>;
  isAddToHomeButtonDisabled: () => Promise<boolean>;
}

export interface IHomeDashboardPageAssertions {
  verifyToastMessage: (toastMessage: string) => Promise<void>;
  verifyingThePageTileSectionIsVisible: (tileName: string) => Promise<void>;
  verifyingCreatedPageIsVisibleInTile: (pageName: string) => Promise<void>;
  verifyingCreatedPageIsNotVisibleInTile: (pageName: string) => Promise<void>;
  verifyingThePageTileSectionIsNotVisible: (tileName: string) => Promise<void>;
  verifyOnboardingTileIsVisible: () => Promise<void>;
  verifyAddToHomeButtonIsDisabled: () => Promise<void>;
}
export class HomeDashboardPage extends BasePage implements IHomeDashboardPageActions, IHomeDashboardPageAssertions {
  addTileComponent: AddTileComponent;
  addContentTileComponent: AddContentTileComponent;
  onboardingComponent: OnboardingComponent;
  baseActionUtil: BaseActionUtil;
  pageTileSectionComponent: PageTileSectionComponent;

  readonly editDashboardButton: Locator = this.page.getByRole('button', { name: 'Manage dashboard & carousel' });
  readonly addTileButton: Locator = this.page.getByRole('button', { name: 'Add tile' });
  readonly doneButton: Locator = this.page.getByRole('button', { name: 'Done' });
  readonly addContentTileDialog: Locator = this.page.getByRole('dialog', { name: 'Add content tile' });
  readonly addToHomeButton: Locator = this.addContentTileDialog.getByRole('button', { name: 'Add to home' });

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.addTileComponent = new AddTileComponent(page);
    this.addContentTileComponent = new AddContentTileComponent(page);
    this.onboardingComponent = new OnboardingComponent(page);
    this.baseActionUtil = new BaseActionUtil(page);
    this.pageTileSectionComponent = new PageTileSectionComponent(page);
  }

  get actions(): IHomeDashboardPageActions {
    return this;
  }

  get assertions(): IHomeDashboardPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify home dashboard page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.editDashboardButton, {
        assertionMessage: 'Home dashboard page should be visible',
      });
    });
  }
  async clickOnEditDashboardButton(): Promise<void> {
    await this.clickByInjectingJavaScript(this.editDashboardButton);
  }
  async clickOnAddTileButton(): Promise<void> {
    await this.clickOnElement(this.addTileButton);
  }
  async clickOnAddContentTileOption(): Promise<void> {
    await this.addTileComponent.clickingOnAddContentTileOption();
  }
  async selectingPagesAsContentType(): Promise<void> {
    await this.addContentTileComponent.selectingPagesAsContentType();
  }
  async namingTheTile(tileName: string): Promise<void> {
    await this.addContentTileComponent.namingTheTile(tileName);
  }
  async clickingOnAddToHomeButton(): Promise<void> {
    await test.step('Click on Add to home button', async () => {
      // First ensure the dialog is still open
      await this.addContentTileDialog.waitFor({ state: 'visible' });

      await this.addToHomeButton.waitFor({ state: 'visible' });

      await this.addToHomeButton.scrollIntoViewIfNeeded();

      await this.addToHomeButton.waitFor({ state: 'attached' });

      try {
        await this.addToHomeButton.click({ timeout: 5000 });
      } catch {
        await this.addToHomeButton.click({ force: true });
      }
    });
  }
  async verifyToastMessage(toastMessage: string): Promise<void> {
    await this.baseActionUtil.verifyToastMessageIsVisibleWithText(toastMessage);
  }
  async clickingOnDoneButton(): Promise<void> {
    await test.step('Click on Done button', async () => {
      await this.clickOnElement(this.doneButton);
      await this.addContentTileDialog.waitFor({ state: 'hidden' });
    });
  }
  async verifyingThePageTileSectionIsVisible(tileName: string): Promise<void> {
    await this.pageTileSectionComponent.verifyingThePageTileSectionIsVisible(tileName);
  }
  async verifyingThePageTileSectionIsNotVisible(tileName: string): Promise<void> {
    await this.pageTileSectionComponent.verifyingThePageTileSectionIsNotVisible(tileName);
  }
  async verifyingCreatedPageIsVisibleInTile(pageName: string): Promise<void> {
    await this.pageTileSectionComponent.verifyingCreatedPageIsVisibleInTile(pageName);
  }
  async verifyingCreatedPageIsNotVisibleInTile(pageName: string): Promise<void> {
    await this.pageTileSectionComponent.verifyingCreatedPageIsNotVisibleInTile(pageName);
  }
  async openingCreatedPageInTile(pageName: string): Promise<void> {
    await this.pageTileSectionComponent.openingCreatedPageInTile(pageName);
  }
  async clickingOnEditTileButton(tileName: string): Promise<void> {
    await this.pageTileSectionComponent.clickingOnEditTileButton(tileName);
  }
  async selectingSiteRadioButton(siteName: string): Promise<void> {
    await this.addContentTileComponent.selectingSiteRadioButton(siteName);
  }
  async selectingShowcaseRadioButton(): Promise<void> {
    await this.addContentTileComponent.selectingShowcaseRadioButton();
  }
  async clickingOnSaveButton(): Promise<void> {
    await this.addContentTileComponent.clickingOnSaveButton();
  }
  async clickingOnRemoveTileButton(tileName: string): Promise<void> {
    await this.pageTileSectionComponent.clickingOnRemoveTileButton(tileName);
  }
  async clickingOnOnboardingTab(): Promise<void> {
    await test.step('Click on Onboarding tab', async () => {
      await this.clickOnElement(this.onboardingComponent.onboardingTab);
      await this.verifier.waitUntilElementIsVisible(this.addContentTileComponent.addToHomeButton, {
        stepInfo: 'Wait for Add to home button to be visible after clicking Onboarding tab',
      });
    });
  }
  async verifyOnboardingTileIsVisible(): Promise<void> {
    await test.step('Verify onboarding tile is visible on home dashboard', async () => {
      const onboardingTileHeading = this.page.getByRole('heading', { name: /Onboarding/i }).first();
      await this.verifier.waitUntilElementIsVisible(onboardingTileHeading, {
        stepInfo: 'Wait for onboarding tile to appear on dashboard',
      });
    });
  }
  async isAddToHomeButtonDisabled(): Promise<boolean> {
    return await test.step('Check if Add to home button is disabled', async () => {
      return await this.addContentTileComponent.addToHomeButton.isDisabled();
    });
  }

  async verifyAddToHomeButtonIsDisabled(): Promise<void> {
    await test.step('Verify Add to home button is disabled', async () => {
      await this.verifier.verifyTheElementIsDisabled(this.addContentTileComponent.addToHomeButton);
    });
  }
}
