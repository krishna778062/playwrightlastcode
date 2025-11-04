import { Locator, Page, test } from '@playwright/test';

import { IPageCreationActions, IPageCreationAssertions, PageCreationPage } from './pageCreationPage';

export interface IContentStudioPageCreationActions extends IPageCreationActions {
  clickAddCoverImageIcon: () => Promise<void>;
}

export interface IContentStudioPageCreationAssertions extends IPageCreationAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyCoverImageModalTabIsVisible: (tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash') => Promise<void>;
}

export class ContentStudioPageCreationPage
  extends PageCreationPage
  implements IContentStudioPageCreationActions, IContentStudioPageCreationAssertions
{
  // Cover image modal locators
  readonly addCoverImageIcon: Locator;
  readonly browseTab: Locator;
  readonly urlTab: Locator;
  readonly unsplashTab: Locator;
  readonly activeTab: Locator;
  readonly coverTitleInput: Locator;
  readonly tabsOptions: (tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash') => Locator;

  constructor(page: Page, siteId?: string) {
    super(page, siteId);
    // Cover image modal locators
    this.addCoverImageIcon = page.getByRole('button', { name: 'Add cover image' });
    this.browseTab = page.getByRole('tab', { name: 'Browse' });
    this.urlTab = page.getByRole('tab', { name: 'URL' });
    this.unsplashTab = page.getByRole('tab', { name: 'Unsplash' });
    this.activeTab = page.locator('[role="tab"][aria-selected="true"]');
    this.coverTitleInput = page.locator("textarea[name='cover-title']");
    this.tabsOptions = (tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash') => page.getByRole('button', { name: tab });
  }

  get actions(): IContentStudioPageCreationActions {
    return this;
  }

  get assertions(): IContentStudioPageCreationAssertions {
    return this;
  }

  /**
   * Clicks on the "Add cover image" icon to open the cover image modal
   */
  async clickAddCoverImageIcon(): Promise<void> {
    await test.step('Click on Add cover image icon', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addCoverImageIcon, {
        assertionMessage: 'Add cover image icon should be visible',
      });
      await this.clickOnElement(this.addCoverImageIcon);
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.coverTitleInput, {
        assertionMessage: 'Cover title input should be visible',
      });
    });
  }

  /**
   * Verifies that the specified tab is visible in the cover image modal
   * @param tab - The tab name to verify ('Upload', 'Browse', 'URL', or 'Unsplash')
   */
  async verifyCoverImageModalTabIsVisible(tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash'): Promise<void> {
    await test.step(`Verify ${tab} tab is visible in cover image modal`, async () => {
      const tabLocator = this.tabsOptions(tab);
      await this.verifier.verifyTheElementIsVisible(tabLocator, {
        assertionMessage: `${tab} tab should be visible`,
      });
    });
  }
}
