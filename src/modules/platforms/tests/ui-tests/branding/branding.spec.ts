import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NavigationHelper } from '@core/helpers/navigationHelper';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { BrandingPage } from '@/src/modules/platforms/ui/pages/branding/branding';

test.describe(
  'branding Tests',
  {
    tag: ['@Branding', '@Platform_Services', '@fail'],
  },
  () => {
    test(
      'verify that Done button will be disabled if no data is added to Name and Color field',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ zuluAppManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-25477'],
          description: 'Verify that Done button is disabled when no data is added to Name and Color field',
        });

        // Create navigation helper with Zulu page for navigation
        const navigationHelper = new NavigationHelper(zuluAppManagerPage);

        // Navigate to manage-features using Zulu page
        await navigationHelper.openManageFeatureSectionInSideBar();

        // Create branding page instance and navigate to branding using Zulu page
        const brandingPage = new BrandingPage(zuluAppManagerPage);
        await brandingPage.navigateToBrandingPage();

        // Navigate to Add Color form
        await brandingPage.navigateToAddColorForm();

        // Verify the presence of name input field
        await brandingPage.verifyNameInputIsVisible();

        // Verify the presence of color launcher button
        await brandingPage.verifyColorLauncherButtonIsVisible();

        // Verify that Done button is disabled when no data is added
        await brandingPage.verifyDoneButtonIsDisabled();
      }
    );
  }
);
