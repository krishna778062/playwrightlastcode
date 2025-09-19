import { test } from '@employee-listening/fixtures/loginFixture';
import { AwarenessCheckPage } from '@employee-listening/pages/awarenessCheckPage';
import { AwarenessQuestionData } from '@employee-listening/types/awareness-check.type';
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

// Import content creation related types
import { PageContentType } from '@/src/modules/content/constants/pageContentType';

test.describe('Awareness Check Functionality', { tag: ['@awarenessCheck'] }, () => {
  let awarenessCheckPage: AwarenessCheckPage;
  let createdPageInfo: { pageId: string; siteId: string; pageTitle: string };

  test.beforeEach(async ({ appManagerPage }) => {
    awarenessCheckPage = new AwarenessCheckPage(appManagerPage);
    await awarenessCheckPage.loadPage();
    createdPageInfo = await awarenessCheckPage.actions.createPageWithAwarenessCheck({
      pageTitle: `Test Page for Awareness Check - ${test.info().title}`,
      contentType: PageContentType.NEWS,
      stepInfo: 'Create test page for awareness check',
    });
  });
});
