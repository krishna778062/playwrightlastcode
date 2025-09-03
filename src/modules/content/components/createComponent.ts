import { Locator, Page, test } from '@playwright/test';

import { ContentType } from '@content/constants/contentType';

import { AddContentModalComponent } from './addContentModal';

import { BaseComponent } from '@/src/core/components/baseComponent';
import { SiteCreationPage } from '@/src/modules/content/pages/siteCreationPage';
/**
 * This component gives user an
 * quick and easy interface to select
 * the type of entity they want to create
 * out of them page, album and event belongs to content type
 * but others belongs to other modules
 */

/**
 * TODO: Rename this component to something relevant, CreateComponent does not
 * relay the right intention of the component
 */
export class CreateComponent extends BaseComponent {
  readonly pageOption: Locator;
  readonly albumOption: Locator;
  readonly eventOption: Locator;
  readonly siteOption: Locator;
  readonly siteLink: Locator;
  readonly createComponentContainer: Locator;
  constructor(page: Page) {
    super(page);
    this.pageOption = this.page.locator('p', { hasText: 'Page' });
    this.albumOption = this.page.locator('p', { hasText: 'Album' });
    this.eventOption = this.page.locator('p').filter({ hasText: /^Event$/ });
    this.siteOption = this.page.locator('p', { hasText: /^Site$/ });
    this.siteLink = this.page.getByRole('link', { name: 'Site' });
    this.createComponentContainer = this.page.locator("[data-slot='dialog-content']");
  }

  /**
   * Selects the content type and returns the appropriate creation page
   * @param contentType - The content type to select
   * @param options - The options for the step
   * @returns The corresponding creation page
   */
  async selectContentTypeAndCreateContent(
    contentType: ContentType,
    options?: { stepInfo?: string }
  ): Promise<AddContentModalComponent> {
    return await test.step(options?.stepInfo || `Selecting content type: ${contentType}`, async () => {
      // Select the content type
      await this.selectContentType(contentType);
      const addContentModal = new AddContentModalComponent(this.page);
      await addContentModal.verifyTheAddContentModalIsVisible(contentType);
      return addContentModal;
    });
  }

  /**
   * Selects a content type option
   * @param contentType - The content type to select
   * @param options - The options for the step
   */
  async selectContentType(contentType: ContentType, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Selecting content type: ${contentType}`, async () => {
      switch (contentType) {
        case ContentType.PAGE:
          await this.clickOnElement(this.pageOption);
          break;
        case ContentType.ALBUM:
          await this.clickOnElement(this.albumOption);
          break;
        case ContentType.EVENT:
          await this.clickOnElement(this.eventOption);
          break;
        default:
          throw new Error(`Unsupported content type: ${contentType}`);
      }
    });
  }

  /**
   * Verifies the create component is visible
   * We assume that the create component is visible when the create component container is visible
   * and the page option is visible
   * @param options - The options for the step stepInfo - The step info to pass to the test.step method
   */
  async verifyTheCreateComponentIsVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verifying create content modal is visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.createComponentContainer);
      await this.verifier.verifyTheElementIsVisible(this.pageOption);
    });
  }

  async selectSiteOption(options?: { stepInfo?: string }): Promise<SiteCreationPage> {
    return await test.step(options?.stepInfo || `Selecting site option`, async () => {
      await this.clickOnElement(this.siteOption);
      return new SiteCreationPage(this.page);
    });
  }
}
