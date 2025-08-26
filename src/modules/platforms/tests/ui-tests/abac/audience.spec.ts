import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AudiencePage } from '@platforms/pages/abacPage/acgPage/audiencePage';

test.describe('Audience Testcases', { tag: [TestSuite.AUDIENCE] }, () => {
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
    { tag: [TestPriority.P0] },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35408', 'PS-35407'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      await audiencePage.loadPage();
      await audiencePage.verifyThePageIsLoaded();

      // Verify Cancel button prevents category creation
      await audiencePage.verifyCategoryCancelButtonBehavior();

      // Verify Close button prevents category creation
      await audiencePage.verifyCategoryCloseButtonBehavior();
    }
  );

  test(
    'Verify alert message when duplicate category name is provided and verify presence of three options under option menu dropdown for category',
    { tag: [TestPriority.P0] },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35411', 'PS-35413'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      const baseCategoryName = 'DuplicateTestCategory';
      const uniqueCategoryName = `${baseCategoryName}_${Date.now()}`;

      await audiencePage.loadPage();
      await audiencePage.verifyThePageIsLoaded();

      // Create first category to establish duplicate scenario
      await audiencePage.createCategoryWithNameAndDescription(uniqueCategoryName);
      await audiencePage.verifyCategoryOperationSuccessToast('created');

      // Attempt to create category with the same name and verify alert message
      await audiencePage.attemptToCreateDuplicateCategory(uniqueCategoryName);
      await audiencePage.verifyNameAlreadyUsedError();
      await audiencePage.clickOnCloseButton();

      // Verify the presence of options in the category dropdown menu
      await audiencePage.verifyAllCategoryOptionsArePresent(uniqueCategoryName);
      await audiencePage.closeOpenDropdown();

      // Clean up: Delete the category
      await audiencePage.deleteCategoryByShowMore(uniqueCategoryName);
      await audiencePage.verifyCategoryOperationSuccessToast('deleted');
    }
  );

  test(
    'Verify category with and without description should get created when user clicks on Add button under Create category popup',
    { tag: [TestPriority.P1] },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35410', 'PS-35409'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      const timestamp = Date.now();
      const categoryWithDescription = `TestCategoryWithDesc_${timestamp}`;
      const categoryWithoutDescription = `TestCategoryNoDesc_${timestamp}`;
      const categoryDescription = `Test description for category created at ${new Date().toISOString()}`;

      await audiencePage.loadPage();
      await audiencePage.verifyThePageIsLoaded();

      // Create category WITH description and then delete it
      await audiencePage.createCategoryWithNameAndDescription(categoryWithDescription, categoryDescription);
      await audiencePage.verifyCategoryOperationSuccessToast('created');
      await audiencePage.deleteCategoryByShowMore(categoryWithDescription);
      await audiencePage.verifyCategoryOperationSuccessToast('deleted');

      // Create category WITHOUT description and then delete it
      await audiencePage.createCategoryWithNameAndDescription(categoryWithoutDescription);
      await audiencePage.verifyCategoryOperationSuccessToast('created');
      await audiencePage.deleteCategoryByShowMore(categoryWithoutDescription);
      await audiencePage.verifyCategoryOperationSuccessToast('deleted');
    }
  );

  test(
    'Verify the appearance of Edit category modal, Save button behavior, and name field validation',
    { tag: [TestPriority.P0] },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35417', 'PS-35416', 'PS-35412'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      const testCategoryName = `EditTestCategory_${Date.now()}`;

      await audiencePage.loadPage();
      await audiencePage.verifyThePageIsLoaded();

      // Create a category to edit (without description so we can test "Add description" button)
      await audiencePage.createCategoryWithNameAndDescription(testCategoryName);
      await audiencePage.verifyCategoryOperationSuccessToast('created');

      // Open Edit category modal and verify elements
      await audiencePage.openEditCategoryModal(testCategoryName);
      await audiencePage.verifyEditCategoryModalElements();
      await audiencePage.verifyEditCategoryNameFieldValidation();

      // Verify field validations similar to Create category modal
      await audiencePage.verifyNameAndDescriptionFieldsAcceptAlphaNumericAndSpecial(true);
      await audiencePage.verifyNameFieldMaxLength(true);
      await audiencePage.verifyDescriptionFieldMaxLength(true);
      await audiencePage.clickAddDescriptionAndVerify(true);
      await audiencePage.removeDescriptionAndVerifyAbsence(true);

      // Close the Edit modal and clean up
      await audiencePage.clickOnCloseButton({ isEditModal: true });
      await audiencePage.deleteCategoryByShowMore(testCategoryName);
      await audiencePage.verifyCategoryOperationSuccessToast('deleted');
    }
  );

  test(
    'Verify the presence of alert message when duplicate category name is provided in name field under Edit category popup',
    { tag: [TestPriority.P0] },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-35415'],
      });

      const audiencePage = new AudiencePage(appManagerPage);
      const timestamp = Date.now();
      const firstCategoryName = `EditDuplicateTest1_${timestamp}`;
      const secondCategoryName = `EditDuplicateTest2_${timestamp}`;

      await audiencePage.loadPage();
      await audiencePage.verifyThePageIsLoaded();

      // Create two categories for the duplicate test
      await audiencePage.createCategoryWithNameAndDescription(firstCategoryName, 'First test category');
      await audiencePage.verifyCategoryOperationSuccessToast('created');
      await audiencePage.createCategoryWithNameAndDescription(secondCategoryName, 'Second test category');
      await audiencePage.verifyCategoryOperationSuccessToast('created');

      // Open Edit modal for the second category and attempt duplicate name
      await audiencePage.openEditCategoryModal(secondCategoryName);
      await audiencePage.attemptToSaveEditCategoryWithDuplicateName(firstCategoryName);
      await audiencePage.verifyNameAlreadyUsedError();
      await audiencePage.clickOnCloseButton({ isEditModal: true });

      // Clean up - Delete both test categories
      await audiencePage.deleteCategoryByShowMore(firstCategoryName);
      await audiencePage.verifyCategoryOperationSuccessToast('deleted');
      await audiencePage.deleteCategoryByShowMore(secondCategoryName);
      await audiencePage.verifyCategoryOperationSuccessToast('deleted');
    }
  );
});
