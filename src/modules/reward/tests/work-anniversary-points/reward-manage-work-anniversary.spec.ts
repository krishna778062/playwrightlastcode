import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRecognitionPage } from '@rewards-pages/manage-recognition';
import { WorkAnniversaryPage } from '@rewards-pages/work-anniversary/work-anniversary-page';

import { TestGroupType, TestPriority } from '@core/constants';
import { tagTest } from '@core/utils';

test.describe('manage work anniversary setting', { tag: [REWARD_SUITE_TAGS.MANAGE_WORK_ANNIVERSARY] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const manageRecognitionPage = new ManageRecognitionPage(appManagerFixture.page);
    await manageRecognitionPage.rewards.enableTheRewardsAndPeerGiftingIfDisabled();
    const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);
    await workAnniversaryPage.loadPage();
  });

  test(
    '[RC-5715, RC-5716] Validate all the Elements in the Work Anniversary Edit page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate all the Elements in the Work Anniversary Edit page',
        zephyrTestId: 'RC-5715, RC-5716',
        storyId: 'RC-5715',
      });
      const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);
      await workAnniversaryPage.validateAllTheTableElements();
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.validateTheElementsInEditWorkAnniversaryPage();
    }
  );

  test(
    '[RC-5785,RC-5786] Validate the Default Badge numbering and Text in Work Anniversary Instances',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate the Default Badge numbering and Text in Work Anniversary Instances',
        zephyrTestId: 'RC-5785, RC-5786',
        storyId: 'RC-5785',
      });
      const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.selectTheDefaultBadgeInWorkAnniversary();
      await workAnniversaryPage.validateTheYearNumberInAwardBadgeForDefaultBadge();
      await workAnniversaryPage.validateTheYearNumberInAwardInstanceLabels();
    }
  );

  test(
    '[RC-5715] Verify "Award points to Receiver" option on Edit milestone award',
    {
      tag: [
        REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY,
        REWARD_FEATURE_TAGS.WORK_ANNIVERSARY_WITH_POINTS,
        TestPriority.P0,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify "Award points to Receiver" option on Edit milestone award',
        zephyrTestId: 'RC-5715',
        storyId: 'RC-5715',
      });
      const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      const currentValue = await workAnniversaryPage.enableAndEditPoints();
      await workAnniversaryPage.clickOnPreviewAwardButtonAndValidateThePoints(Number(currentValue));
      await workAnniversaryPage.setToggleAndSaveChangesInWorkAnniversary(true);
      await workAnniversaryPage.dismissTheToastMessage({
        toastText: 'Saved changes successfully',
      });
      await workAnniversaryPage.validateTheWorkAnniversaryWithPointsIsEnabledInTheTable();
    }
  );

  test(
    '[RC-5718] Validate Rewards points option on Edit milestone award page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate Rewards points option on Edit milestone award page',
        zephyrTestId: 'RC-5718',
        storyId: 'RC-5718',
      });
      const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.verifyTheErrorForInvalidInput(-12);
      await workAnniversaryPage.verifyTheErrorForInvalidInput(0);
      const currentValue = await workAnniversaryPage.enableAndEditPoints();
      await workAnniversaryPage.clickOnPreviewAwardButtonAndValidateThePoints(Number(currentValue));
      await workAnniversaryPage.setToggleAndSaveChangesInWorkAnniversary(true);
      await workAnniversaryPage.dismissTheToastMessage({
        toastText: 'Saved changes successfully',
      });
      await workAnniversaryPage.validateTheWorkAnniversaryWithPointsIsEnabledInTheTable();
    }
  );

  test(
    '[RC-5732] Verify cancel button on milestone award instance page while adding reward points',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify cancel button on milestone award instance page while adding reward points',
        zephyrTestId: 'RC-5732',
        storyId: 'RC-5732',
      });

      const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.cleanUpTheDataIfAlreadySet();
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.clickWorkAnniversaryAwardInstanceEditButton(0);
      await workAnniversaryPage.milestoneAwardInstance.validateTheAwardInstanceModalIsOpened(0);
      await workAnniversaryPage.milestoneAwardInstance.enableAndEditPointsInDialogBox();
      await workAnniversaryPage.milestoneAwardInstance.closeTheAwardInstanceModal();
      await workAnniversaryPage.validateTheIconsInAwardInstance(0);
    }
  );

  test(
    '[RC-5730] Validate "Award points to receiver option" on edit milestone instance',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate "Award points to receiver option" on edit milestone instance',
        zephyrTestId: 'RC-5730',
        storyId: 'RC-5730',
      });
      tagTest(test.info(), {
        description: 'Verify rewards points icon on Milestone award instance',
        zephyrTestId: 'RC-5721',
        storyId: 'RC-5721',
      });
      tagTest(test.info(), {
        description: 'Validate remove option for rewards points on edit milestone award instance',
        zephyrTestId: 'RC-5731',
        storyId: 'RC-5731',
      });
      tagTest(test.info(), {
        description: 'Verify save button on milestone award instance page while adding reward points',
        zephyrTestId: 'RC-5733',
        storyId: 'RC-5733',
      });
      // RC-5730, RC-5733
      const workAnniversaryPage = new WorkAnniversaryPage(appManagerFixture.page);
      await workAnniversaryPage.clickOnTheEditWorkAnniversaryButton();
      await workAnniversaryPage.clickWorkAnniversaryAwardInstanceEditButton(0);
      await workAnniversaryPage.milestoneAwardInstance.validateTheAwardInstanceModalIsOpened(0);
      await workAnniversaryPage.milestoneAwardInstance.enableAndEditPointsInDialogBox();
      await workAnniversaryPage.milestoneAwardInstance.validateTheRemoveButton('customAwardPoints');
      await workAnniversaryPage.milestoneAwardInstance.saveTheChangesInAwardInstanceModal();

      // RC-5721
      await workAnniversaryPage.validateTheIconsInAwardInstance(0, true);

      // RC-5731
      await workAnniversaryPage.clickWorkAnniversaryAwardInstanceEditButton(0);
      await workAnniversaryPage.milestoneAwardInstance.validateTheRemoveButton('customAwardPoints');
      await workAnniversaryPage.milestoneAwardInstance.clickOnTheRemoveButton('customAwardPoints');
      await workAnniversaryPage.milestoneAwardInstance.saveTheChangesInAwardInstanceModal();
      await workAnniversaryPage.validateTheIconsInAwardInstance(0, false);
    }
  );
});
