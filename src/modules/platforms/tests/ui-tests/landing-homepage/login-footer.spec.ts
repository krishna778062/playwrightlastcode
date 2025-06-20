import { test } from '@playwright/test';
import { BaseMultiUserChatTest } from '@chat-helpers/multiUserChatTestHelper';
import { Roles } from '@core/constants/roles';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { CHAT_TEST_DATA } from '@platforms/tests/test-data/chat.test-data';
import { LoginPage } from '../../../pages/loginPage';

test.describe(
  'Test Footer in Homepage',
  {
    tag: [TestSuite.PLATFORM],
  },
  () => {


    test(
      'Verify that the footer is visible in the homepage',
      {
        tag: [TestPriority.P0],
      },
      async ({ page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.loadPage();
        const homePage=await loginPage.login(CHAT_TEST_DATA.CREDENTIALS.DEFAULT_USERNAME, CHAT_TEST_DATA.CREDENTIALS.DEFAULT_PASSWORD);
        await homePage.verifyThePageIsLoaded();
        await homePage.getFooterComponent().verifynavigationofprivacyPolicyLink();



      }
    );
  }
);
