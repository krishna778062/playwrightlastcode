import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';

import { tagTest } from '@/src/core/utils/testDecorator';
import { GammaIntegrationsFeatureTags, IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { PEOPLE_TAB } from '@/src/modules/integrations/test-data/gamma-data-file';
import { PeopleTabPage } from '@/src/modules/integrations/ui/pages/peopleTabPage';

let peopleTab: PeopleTabPage;

test.describe(
  'people tab',
  {
    tag: [IntegrationsSuiteTags.GAMMA, GammaIntegrationsFeatureTags.PEOPLE_TAB],
  },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      peopleTab = new PeopleTabPage(appManagerFixture.page);
      await peopleTab.loadPage();
      await peopleTab.verifyThePageIsLoaded();
    });
    test(
      'verify the workday source is displayed in provisioning dropdown during standard workday flow',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-1670', 'INT-11425', 'INT-11427'],
          storyId: 'INT-10943',
        });
        await peopleTab.selectProvisioningSource(PEOPLE_TAB.OPTION_NONE);
        await peopleTab.selectSyncingSource(PEOPLE_TAB.OPTION_NONE);
        await peopleTab.verifyAllUserFieldsAreDisplayed();
        await peopleTab.clickOnTab('Integrations');
        await peopleTab.clickOnTab('People data');
        await peopleTab.verifyNavigatedToPeoplePage();
      }
    );

    test(
      'verify all fields are displayed when and syncing and provisioning source is selected from any merge vendor',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-11067', 'INT-11068'],
          storyId: 'INT-10943',
        });
        await peopleTab.clickOnTab('Integrations');
        await peopleTab.clickOnTab('People data');
        await peopleTab.checkIntegrationIfNotChecked();
        await peopleTab.clickOnTab('People');
        await peopleTab.selectProvisioningSource(PEOPLE_TAB.BAMBOO_HR_OPTION);
        await peopleTab.selectSyncingSource(PEOPLE_TAB.BAMBOO_HR_OPTION);
        await peopleTab.verifyAllUserFieldsAreDisplayed();
      }
    );

    test(
      'verify previous setting of User-editable column is retaining on switching the source',
      {
        tag: [TestPriority.P1],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-11078'],
          storyId: 'INT-10943',
        });
        await peopleTab.selectProvisioningSource(PEOPLE_TAB.BAMBOO_HR_OPTION);
        await peopleTab.selectSyncingSource(PEOPLE_TAB.OPTION_NONE);
        await peopleTab.getEditableSettingForAllMergeFields();
        await peopleTab.selectProvisioningSource(PEOPLE_TAB.GOOGLE_OPTION);
        await peopleTab.getEditableSettingForAllNonMergeFields();
        await peopleTab.verifyBothValuesForEditableSetting();
      }
    );

    test(
      'verify previous setting of Display column is retaining on switching the source',
      {
        tag: [TestPriority.P1],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-11077'],
          storyId: 'INT-10943',
        });
        await peopleTab.selectProvisioningSource(PEOPLE_TAB.BAMBOO_HR_OPTION);
        await peopleTab.selectSyncingSource(PEOPLE_TAB.OPTION_NONE);
        await peopleTab.getDisplaySettingForAllMergeFields();
        await peopleTab.selectProvisioningSource(PEOPLE_TAB.GOOGLE_OPTION);
        await peopleTab.getDisplaySettingForNonMergeFields();
        await peopleTab.verifyBothValuesForDisplaySetting();
      }
    );

    test(
      'verify Sync check box is unchecked and disabled if field is not supported with external source "Azure"',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.SANITY],
      },

      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-11080'],
          storyId: 'INT-10943',
        });
        await peopleTab.selectSyncingSource(PEOPLE_TAB.MICROSOFT_ENTRA_ID_OPTION);
        await peopleTab.verifyDisableFieldsForSyncing();
      }
    );
  }
);
