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
    profileScreenPage = new ProfileScreenPage(appManagerFixture.page, '1');
    favoritePage = new FavoritePage(appManagerFixture.page);
  });

  test.afterEach(async ({}) => {});

  test(
    'should navigate to favorite page and interact with user profile',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.FAVORITE, '@cont-38912'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'In Zeus to verify the favorite functionality',
        zephyrTestId: 'CONT-38095',
        storyId: 'CONT-38095',
      });
      await appManagerFixture.homePage.verifyThePageIsLoaded();
      await sideNavBarComponent.clickOnPeople();
      await peopleScreenPage.actions.gettingUserName();
      await peopleScreenPage.actions.searchingAndOpeningUserProfile(peopleScreenPage.fullName);
      await peopleScreenPage.actions.openingUserProfile();
      await profileScreenPage.actions.clickOnFavoriteOption();
      await sideNavBarComponent.clickOnFavorite();
      await favoritePage.actions.clickOnPeopleTab();
      await favoritePage.actions.searchingFavoriteUser(peopleScreenPage.fullName);
      await favoritePage.assertions.verifyTheUserIsVisible(peopleScreenPage.fullName);
    }
  );
});
