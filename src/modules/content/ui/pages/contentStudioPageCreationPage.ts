import { Locator, Page, test } from '@playwright/test';

import { AddCoverImageComponent } from '@content/ui/components/addCoverImageComponent';
import { IPageCreationActions, IPageCreationAssertions, PageCreationPage } from '@content/ui/pages/pageCreationPage';

export interface IContentStudioPageCreationActions extends IPageCreationActions {
  clickAddCoverImageIcon: () => Promise<void>;
  clickOnOptionsButtonAndSelectAddCoverImageTab: (tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash') => Promise<void>;
  clickOnopenMediaManagerDialog: () => Promise<void>;
}

export interface IContentStudioPageCreationAssertions extends IPageCreationAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyCoverImageModalTabIsVisible: (tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash') => Promise<void>;
  verifyopenMediaManagerDialogIsVisible: () => Promise<void>;
}

export class ContentStudioPageCreationPage
  extends PageCreationPage
  implements IContentStudioPageCreationActions, IContentStudioPageCreationAssertions
{
  // Cover image modal locators
  readonly addCoverImageIcon: Locator;
  readonly coverTitleInput: Locator;
  readonly addCoverImageComponent: AddCoverImageComponent;

  constructor(page: Page, siteId?: string) {
    super(page, siteId);
    // Cover image modal locators
    // Use exact match to avoid strict-mode ambiguity with wrapper elements
    this.addCoverImageIcon = page.getByRole('button', { name: /^Add cover image$/ });
    this.coverTitleInput = page.locator("textarea[name='cover-title']");
    this.addCoverImageComponent = new AddCoverImageComponent(page);
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
    await this.addCoverImageComponent.verifyCoverImageModalTabIsVisible(tab);
  }
  async verifyopenMediaManagerDialogIsVisible(): Promise<void> {
    await test.step('Verify open media manager dialog is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addCoverImageComponent.openMediaManagerDialog, {
        assertionMessage: 'Open media manager dialog should be visible',
      });
    });
  }
  async clickOnopenMediaManagerDialog(): Promise<void> {
    await test.step('Click on open media manager dialog', async () => {
      await this.clickOnElement(this.addCoverImageComponent.openMediaManagerDialog);
    });
  }
  /**
   * Clicks the options (tab) button and selects the provided tab in the Add Cover Image modal
   */
  async clickOnOptionsButtonAndSelectAddCoverImageTab(tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash'): Promise<void> {
    await test.step(`Select '${tab}' tab in Add cover image modal`, async () => {
      await this.clickOnElement(this.addCoverImageComponent.tabsOptions(tab));
    });
  }
}
