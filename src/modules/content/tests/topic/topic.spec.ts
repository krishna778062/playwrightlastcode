import { faker } from '@faker-js/faker';
import { expect, Page } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { tagTest } from '@core/utils/testDecorator';

import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ApplicationSettingsPage } from '@/src/modules/content/pages/applicationscreenPage';
import { ManageTopicsPage } from '@/src/modules/content/pages/manageTopicsPage';
test.describe('Edit Topic', () => {
  let homePage: NewUxHomePage;
  let applicationScreenPage: ApplicationSettingsPage;
  let manageTopicsPage: ManageTopicsPage;

  test.beforeEach('Setup for edit topic test', async ({ appManagersPage }) => {
    homePage = new NewUxHomePage(appManagersPage);
    applicationScreenPage = new ApplicationSettingsPage(appManagersPage);
    manageTopicsPage = new ManageTopicsPage(appManagersPage);
  });

  test.afterEach(async ({}) => {});

  test(
    'In Zeus to verify the Edit topic - negative scenario',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.EDIT_TOPICS],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        description: 'In Zeus to verify the Edit topic - negative scenario',
        zephyrTestId: 'CONT-38095',
        storyId: 'CONT-38095',
      });
      await homePage.actions.navigateToApplication();
      await applicationScreenPage.actions.clickOnTopics();
      await manageTopicsPage.actions.clickOnAddTopic();
      const topicName = faker.lorem.words(2);
      await manageTopicsPage.actions.fillTopicName(topicName);
      await manageTopicsPage.actions.clickOnAddButton();
      await manageTopicsPage.actions.clickOnEditTopic();
      await manageTopicsPage.actions.editTopicName(`${topicName}--__`);
      await manageTopicsPage.actions.clickOnUpdateButton();
      await manageTopicsPage.assertions.verifyErroToastMessage();
    }
  );
  test(
    'To verify search topics',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.SEARCH_TOPICS],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        description: 'To verify search topics',
        zephyrTestId: 'CONT-21059',
        storyId: 'CONT-21059',
      });
      await homePage.actions.navigateToApplication();
      await applicationScreenPage.actions.clickOnTopics();
      await manageTopicsPage.actions.clickOnAddTopic();
      const topicName = faker.lorem.words(2);
      await manageTopicsPage.actions.fillTopicName(topicName);
      await manageTopicsPage.actions.clickOnAddButton();
      await manageTopicsPage.assertions.verifyToastMessage('Created topic successfully');
      await manageTopicsPage.actions.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.assertions.verifyingTheSearhcedTopicIsVisible(topicName);
      await manageTopicsPage.actions.searchingTopicInSearchBar(`${topicName}--__`);
      await manageTopicsPage.assertions.verifyingNothingToShowHereText();
    }
  );
});
