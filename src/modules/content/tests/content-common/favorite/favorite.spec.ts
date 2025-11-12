import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';

import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
import { tagTest } from '@/src/core/utils/testDecorator';
import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FavoritePage } from '@/src/modules/content/ui/pages/favoritePage';
import { PeopleScreenPage } from '@/src/modules/content/ui/pages/peopleScreenPage';
import { ProfileScreenPage } from '@/src/modules/content/ui/pages/profileScreenPage';
test.describe('favorite', () => {
  let sideNavBarComponent: SideNavBarComponent;
  let peopleScreenPage: PeopleScreenPage;
  let profileScreenPage: ProfileScreenPage;
  let favoritePage: FavoritePage;
  test.beforeEach('Setup for favorite test', async ({ appManagerFixture }) => {
    sideNavBarComponent = new SideNavBarComponent(appManagerFixture.page);
    peopleScreenPage = new PeopleScreenPage(appManagerFixture.page);
    favoritePage = new FavoritePage(appManagerFixture.page);
  });

  test.afterEach(async ({}) => {});

  test(
    'should navigate to favorite page and interact with user profile',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.FAVORITE],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'To verify that no user details are removed from the favourite people tab when hovering the mouse over the user profile.',
        zephyrTestId: 'CONT-27834',
        storyId: 'CONT-27834',
      });
      await appManagerFixture.homePage.verifyThePageIsLoaded();
      await appManagerFixture.homePage.clickOnPeople();
      await peopleScreenPage.actions.disableLimitResultToggle();
      await peopleScreenPage.actions.gettingUserName(appManagerFixture.identityManagementHelper);
      await peopleScreenPage.actions.searchingAndOpeningUserProfile(peopleScreenPage.fullName);
      await peopleScreenPage.actions.openingUserProfile();

      // Create ProfileScreenPage with the correct peopleId after getting user info
      profileScreenPage = new ProfileScreenPage(appManagerFixture.page, peopleScreenPage.peopleId);
      await profileScreenPage.verifyThePageIsLoaded();
      await profileScreenPage.actions.clickOnFavoriteOption();
      await sideNavBarComponent.clickOnFavorite();
      await favoritePage.actions.clickOnPeopleTab();
      await favoritePage.actions.searchingFavoriteUser(peopleScreenPage.fullName);
      await favoritePage.assertions.verifyTheUserIsVisible(peopleScreenPage.fullName);

      // Hover on user profile and verify details remain visible
      await favoritePage.actions.hoverOnUserProfile(peopleScreenPage.fullName);
      await favoritePage.assertions.verifyUserDetailsRemainVisible(peopleScreenPage.fullName);

      // Verify contact icons are visible
      await favoritePage.assertions.verifyContactIconsAreVisible(peopleScreenPage.fullName);

      // Verify contact icons remain visible after hover
      await favoritePage.assertions.verifyContactIconsRemainVisibleAfterHover(peopleScreenPage.fullName);
    }
  );
});
