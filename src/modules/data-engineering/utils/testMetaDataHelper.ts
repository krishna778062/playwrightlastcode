import { TestInfo } from '@playwright/test';

import { ContentDataResult, SiteType } from '../helpers/analyticsQueryHelper';

export class TestMetaDataHelper {
  /**
   * Adds test metadata with content details
   * @param testInfo - The test info object
   * @param contentData - The content data
   * @param siteType - The site type
   * @param isRestricted - Whether the content is restricted
   */
  static addTestMetaDataWithContentDetails(
    testInfo: TestInfo,
    {
      contentData,
      siteType,
      isRestricted,
    }: {
      contentData: ContentDataResult;
      siteType: SiteType;
      isRestricted: boolean;
    }
  ) {
    const description = `Title: ${contentData.TITLE} | ID: ${contentData.CODE} | Type: ${contentData.CONTENT_TYPE} | Site: ${siteType} | Restricted: ${isRestricted} | URL: ${contentData.CONTENT_URL}`;
    testInfo.annotations.push({ type: 'Content Details', description });
  }
}
