import { TestPriority } from '@core/constants/testPriority';
import { TIMEOUTS } from '@core/constants/timeouts';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AudiencePage } from '@platforms/pages/abacPage/acgPage/audiencePage';

import { TestSuite } from '@/src/core/constants/testSuite';

test.describe(
  'Audience Testcases',
  {
    tag: [TestSuite.AUDIENCE],
  },
  () => {
    test(
      'Create category modal: validations and basic actions',
      { tag: [TestPriority.P0] },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: [
            'PS-35395',
            'PS-35396',
            'PS-35397',
            'PS-35398',
            'PS-35399',
            'PS-35400',
            'PS-35401',
            'PS-35403',
            'PS-35404',
            'PS-35406',
          ],
        });
        const audiencePage = new AudiencePage(appManagerPage);
        await audiencePage.loadPage();
        await audiencePage.openCreateCategoryModal();
        await audiencePage.verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial();
        await audiencePage.verifyNameFieldMaxLength();
        await audiencePage.verifyDescriptionFieldMaxLength();
        await audiencePage.clickAddDescriptionAndVerify();
        await audiencePage.removeDescriptionAndVerifyAbsence();
        await audiencePage.clickOnCloseButton();
      }
    );

    test(
      'Verify category should not get created when user clicks on Cancel or Close button',
      { tag: [TestPriority.P1] },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-XXXXX'], // Add appropriate test ID
        });

        const audiencePage = new AudiencePage(appManagerPage);

        // Load the audience page
        await audiencePage.loadPage();
        await audiencePage.verifyThePageIsLoaded();

        // Test Case 1: Verify Cancel button prevents category creation
        await audiencePage.verifyCategoryCancelButtonBehavior();

        // Test Case 2: Verify Close button prevents category creation
        await audiencePage.verifyCategoryCloseButtonBehavior();
      }
    );

    test(
      'Verify alert message when duplicate category name is provided and verify presence of three options under option menu dropdown for category',
      { tag: [TestPriority.P0] },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-XXXXX'], // Add appropriate test ID
        });

        const audiencePage = new AudiencePage(appManagerPage);
        const baseCategoryName = 'DuplicateTestCategory';
        const uniqueCategoryName = `${baseCategoryName}_${Date.now()}`;

        // Load the audience page
        await audiencePage.loadPage();
        await audiencePage.verifyThePageIsLoaded();

        // Step 1: Create first category to establish duplicate scenario
        await audiencePage.createCategoryWithNameAndDescription(uniqueCategoryName);
        await audiencePage.verifyCategoryCreationSuccessToast();

        // Step 2: Attempt to create category with the same name and verify alert message
        await audiencePage.attemptToCreateDuplicateCategory(uniqueCategoryName);

        // Step 3: Verify the duplicate name error alert message appears
        await audiencePage.verifyNameAlreadyUsedError();

        // Step 4: Close the modal
        await audiencePage.clickOnCloseButton();

        // Step 5: Verify the presence of options in the category dropdown menu and perform cleanup
        const showMoreButton = audiencePage.page.locator(`//p[contains(text(),'${uniqueCategoryName}')]/ancestor::div[@role='presentation']/following-sibling::div/following-sibling::div//button`);
        await audiencePage.clickOnElement(showMoreButton, {
          stepInfo: 'Click on Show more button to verify options menu',
          timeout: 10_000,
        });

        // Verify all three options are present in the dropdown
        await audiencePage.verifyAllCategoryOptionsArePresent();

        // Step 6: Use the already open dropdown to delete the category
        await audiencePage.clickOnElement(audiencePage.page.getByText('Delete category'), {
          stepInfo: 'Click on Delete category option for cleanup',
          timeout: 10_000,
        });

        await audiencePage.clickOnElement(audiencePage.deleteCategoryButton, {
          stepInfo: 'Click on Delete button to confirm category deletion',
          timeout: 10_000,
        });

        await audiencePage.verifyCategoryDeletionSuccessToast();
      }
    );

    test(
      'Verify category with and without description should get created when user clicks on Add button under Create category popup',
      { tag: [TestPriority.P1] },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-XXXXX'], // Add appropriate test ID
        });

        const audiencePage = new AudiencePage(appManagerPage);
        const timestamp = Date.now();
        const categoryWithDescription = `TestCategoryWithDesc_${timestamp}`;
        const categoryWithoutDescription = `TestCategoryNoDesc_${timestamp}`;
        const categoryDescription = `Test description for category created at ${new Date().toISOString()}`;

        // Load the audience page
        await audiencePage.loadPage();
        await audiencePage.verifyThePageIsLoaded();

        // Test Case 1: Create category WITH description and then delete it
        await audiencePage.createCategoryWithNameAndDescription(categoryWithDescription, categoryDescription);
        await audiencePage.verifyCategoryCreationSuccessToast();
        
        // Delete the category with description
        await audiencePage.deleteCategoryByShowMore(categoryWithDescription);
        await audiencePage.verifyCategoryDeletionSuccessToast();

        // Test Case 2: Create category WITHOUT description and then delete it
        await audiencePage.createCategoryWithNameAndDescription(categoryWithoutDescription);
        await audiencePage.verifyCategoryCreationSuccessToast();
        
        // Delete the category without description
        await audiencePage.deleteCategoryByShowMore(categoryWithoutDescription);
        await audiencePage.verifyCategoryDeletionSuccessToast();
      }
    );
  }
);
