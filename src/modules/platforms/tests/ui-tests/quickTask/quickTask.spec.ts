import { Page } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

test.describe('quick Task', () => {
  test(
    'verify quick task functionality',
    { tag: [TestPriority.P0, '@quick-task'] },
    async ({ page }: { page: Page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['QT-001'],
      });

      // TODO: Add test implementation
    }
  );
});
