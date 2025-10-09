import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationscreenPage';
import { ManageTopicsPage } from '@/src/modules/content/ui/pages/manageTopicsPage';
test.describe('Edit Topic', () => {
  let applicationScreenPage: ApplicationScreenPage;
  let manageTopicsPage: ManageTopicsPage;

  test.beforeEach('Setup for edit topic test', async ({ appManagerFixture }) => {
    applicationScreenPage = new ApplicationScreenPage(appManagerFixture.page);
    manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
  });

  test.afterEach(async ({}) => {});

  test(
    'In Zeus to verify the Edit topic - negative scenario',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.EDIT_TOPICS],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'In Zeus to verify the Edit topic - negative scenario',
        zephyrTestId: 'CONT-38095',
        storyId: 'CONT-38095',
      });
      await appManagerFixture.navigationHelper.openApplicationSettings();
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
});
