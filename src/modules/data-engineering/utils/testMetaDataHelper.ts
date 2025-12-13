import { TestInfo } from '@playwright/test';

import { ContentDataResult, SiteType } from '../helpers/analyticsQueryHelper';

interface ContentDetailsOptions {
  contentData: ContentDataResult;
  siteType?: SiteType;
  isRestricted?: boolean;
  tenantCode?: string;
}

interface ApiSummaryOptions {
  responseTime: number;
  schemaValid?: boolean;
  udlMatchStatus: 'OK' | 'Skipped';
}

export class TestMetaDataHelper {
  /**
   * Adds test metadata with content details
   * @param testInfo - The test info object
   * @param options - Content details options
   */
  static addTestMetaDataWithContentDetails(testInfo: TestInfo, options: ContentDetailsOptions) {
    const { contentData, siteType, isRestricted, tenantCode } = options;

    const parts = [`Title: ${contentData.TITLE}`, `ID: ${contentData.CODE}`, `Type: ${contentData.CONTENT_TYPE}`];

    if (tenantCode !== undefined) {
      parts.push(`Tenant: ${tenantCode}`);
    }
    if (siteType !== undefined) {
      parts.push(`Site: ${siteType}`);
    }
    if (isRestricted !== undefined) {
      parts.push(`Restricted: ${isRestricted}`);
    }

    parts.push(`URL: ${contentData.CONTENT_URL}`);

    const description = parts.join(' | ');
    testInfo.annotations.push({ type: 'Content Details', description });
  }

  /**
   * Adds API summary annotation
   * @param testInfo - The test info object
   * @param options - API summary options
   */
  static addApiSummary(testInfo: TestInfo, options: ApiSummaryOptions) {
    const { responseTime, schemaValid = true, udlMatchStatus } = options;
    const description = `Response: ${responseTime}ms | Schema: ${schemaValid ? 'Valid' : 'Invalid'} | UDL Match: ${udlMatchStatus}`;
    testInfo.annotations.push({ type: 'API Summary', description });
  }
}
