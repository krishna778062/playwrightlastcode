import { contentTestFixture } from '@content/fixtures/contentFixture';
import { SiteCategoriesPage } from '@content/pages/siteCategoriesPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

const CATEGORY_NAME_LIMITS = {
  MAX_LENGTH: 100,
  STARTING_ALPHABET_COUNT: 20,
  PARTIAL_TEXT_LENGTH: 30,
} as const;

const test = contentTestFixture;

test.describe('Site Category Validation', { tag: ['@content-management', '@site-categories'] }, () => {
  let siteCategoriesPage: SiteCategoriesPage;
  let createdCategoryName: string;

  test.beforeEach(async ({ appManagersPage }) => {
    siteCategoriesPage = new SiteCategoriesPage(appManagersPage);

    // ✅Use loadPage method inherited from BasePage for direct navigation
    await siteCategoriesPage.loadPage({ timeout: 40000 });
  });

  test.afterEach(async ({ appManagerApiClient }) => {
    // Cleanup: Delete created category using API instead of UI
    if (createdCategoryName) {
      try {
        await appManagerApiClient.getSiteManagementService().deleteCategory(createdCategoryName);
        console.log(`API cleanup completed for category: ${createdCategoryName.substring(0, 30)}...`);
      } catch (error) {
        console.log(`API cleanup failed for category: ${error}`);
      }
      createdCategoryName = '';
    }
  });

  test(
    'Verify category name field validation and successful creation with maximum characters',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'CONT-26590',
        storyId: 'CONT-26590',
        description: 'Verify category name field validation limits and successful creation',
        customTags: ['@category-validation', '@character-limit'],
      });

      // Step 1: Open modal and verify field rejects characters beyond 100 limit
      await siteCategoriesPage.actions.clickAddCategoryButton();
      await siteCategoriesPage.assertions.verifyCategoryNameFieldRejectsExcessCharacters(1);

      // Step 2: Generate unique category name and fill it
      const maxLengthCategoryName = await siteCategoriesPage.actions.generateUniqueCategoryName(
        CATEGORY_NAME_LIMITS.MAX_LENGTH,
        CATEGORY_NAME_LIMITS.STARTING_ALPHABET_COUNT
      );
      await siteCategoriesPage.actions.fillCategoryName(maxLengthCategoryName);

      // Step 3: Click Add button to save the category
      await siteCategoriesPage.actions.clickAddButton();

      // Store for cleanup
      createdCategoryName = maxLengthCategoryName;

      // Step 4: Verify category is created successfully
      await siteCategoriesPage.assertions.verifyCategoryCreatedSuccessfully(maxLengthCategoryName);

      // Step 5: Verify partial text is visible in listing
      const partialText = maxLengthCategoryName.substring(0, CATEGORY_NAME_LIMITS.PARTIAL_TEXT_LENGTH);
      await siteCategoriesPage.assertions.verifyPartialTextVisibleInListing(partialText);
    }
  );
});
