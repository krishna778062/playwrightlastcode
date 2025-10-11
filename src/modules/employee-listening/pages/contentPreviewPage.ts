import { Page } from '@playwright/test';

import { AwarenessCheckComponent } from '../components/awarenessCheckComponent';
import { MustReadComponent } from '../components/mustReadComponent';

import { ContentPreviewPage as BaseContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';

export class ContentPreviewPage extends BaseContentPreviewPage {
  readonly awarenessCheckComponent: AwarenessCheckComponent;
  readonly mustReadComponent: MustReadComponent;

  constructor(page: Page, siteId?: string, contentId?: string, contentType?: string) {
    super(page, siteId, contentId, contentType);
    this.awarenessCheckComponent = new AwarenessCheckComponent(page);
    this.mustReadComponent = new MustReadComponent(page);
  }
  /**
   * Check if must read is visible on content preview
   */
  async isMustReadVisibleOnPreview(): Promise<boolean> {
    return await this.mustReadComponent.isMustReadBannerVisible();
  }

  /**
   * Configure must read from menu options
   */
  async clickOnContentThreeDotsMenu(): Promise<void> {
    return await this.mustReadComponent.clickOnContentThreeDotsMenu();
  }

  /**
   * Select must read from menu options
   */
  async selectMustReadFromMenuOptions(): Promise<void> {
    return await this.mustReadComponent.selectMustReadFromMenuOptions();
  }

  /**
   * Navigate to content detail page
   */
  async navigateToContentDetail(contentId: string, siteId: string): Promise<void> {
    const contentUrl = `${process.env.FRONTEND_BASE_URL || 'https://el.qa.simpplr.xyz'}/site/${siteId}/page/${contentId}`;
    await this.page.goto(contentUrl);
    await this.page.waitForTimeout(4000);

    // Verify we're on the correct page and not redirected to login
    const currentUrl = this.page.url();
    if (currentUrl.includes('login') || currentUrl.includes('signin') || currentUrl.includes('sso')) {
      console.log('Detected login redirect, attempting to navigate again...');
      await this.page.goto(contentUrl);
    }
  }
}
