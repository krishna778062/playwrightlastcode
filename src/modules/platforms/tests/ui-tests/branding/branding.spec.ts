import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { BrandingPage } from '@/src/modules/platforms/ui/pages/branding/branding';

test.describe(
  'branding Tests',
  {
    tag: ['@Branding', '@Platform_Services'],
  },
  () => {
    test(
      'verify that Done button will be disabled if no data is added to Name and Color field',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-25477'],
          description: 'Verify that Done button is disabled when no data is added to Name and Color field',
        });

        // Navigate to manage-features
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();

        // Create branding page instance and navigate to branding
        const brandingPage = new BrandingPage(appManagerFixture.page);
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
