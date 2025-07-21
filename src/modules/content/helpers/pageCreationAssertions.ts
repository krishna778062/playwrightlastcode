import { test, expect, Locator } from '@playwright/test';
import { PageCreationPage } from '../pages/pageCreationPage';
import { CONTENT_TEST_DATA } from '../test-data/content.test-data';

export interface IPageCreationAssertions {
  verifyUploadedCoverImagePreviewIsVisible: (options?: { timeout?: number }) => Promise<void>;
  verifyContentPublishedSuccessfully: (title: string) => Promise<void>;
}

export class PageCreationAssertions {
  
  constructor(private readonly pageCreationPage: PageCreationPage) {
  }


} 