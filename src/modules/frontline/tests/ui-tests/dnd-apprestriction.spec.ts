import { DND_MESSAGES } from '@frontline/constants/dndConstants';
import { FrontlineFeatureTags, FrontlineSuiteTags } from '@frontline/constants/testTags';
import { frontlineTestFixture as test } from '@frontline/fixtures/frontlineFixture';
import { DNDAppRestriction } from '@frontline/pages/dndAppRestrictionManagerPage';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  'feature: DND and App Restriction UI as App Manager',
  {
    tag: [FrontlineSuiteTags.FRONTLINE, FrontlineFeatureTags.DND],
  },
  () => {
    test(
      '[FL-488] Verify Display of DND and App Restrictions Tab for App Manager',
      {
        tag: [TestPriority.P1, FrontlineFeatureTags.DND, TestGroupType.HEALTHCHECK],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description: 'Verify Display of DND and App Restrictions Tab for App Manager',
          zephyrTestId: 'FL-488',
          storyId: 'FL-488',
        });

        const dndAppRestriction = new DNDAppRestriction(appManagerHomePage.page);
        await dndAppRestriction.navigateToDNDAppRestriction();
        await dndAppRestriction.verifySelectedOptionDND(DND_MESSAGES.DND_APP_RESTRICTIONS_TAB);
      }
    );

    test(
      '[FL-489] Verify updated description when app manager selects DND and app restrictions as adminUser',
      {
        tag: [TestPriority.P1, FrontlineFeatureTags.DND],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description: 'Verify updated description when app manager selects DND and app restrictions as adminUser',
          zephyrTestId: 'FL-489',
          storyId: 'FL-489',
        });

        const dndAppRestriction = new DNDAppRestriction(appManagerHomePage.page);
        await dndAppRestriction.navigateToDNDAppRestriction();
        await dndAppRestriction.verifySelectedOptionDND(DND_MESSAGES.DND_APP_RESTRICTIONS_TAB);
        await dndAppRestriction.verifyDndAndAppRestrictionPageHeading(DND_MESSAGES.DND_PAGE_HEADING);
        await dndAppRestriction.verifyDescriptionText();
      }
    );

    test(
      '[FL-490] Verify Toggle Display and Descriptions When App Manager Selects DND and App Restrictions as adminUser',
      {
        tag: [TestPriority.P1, FrontlineFeatureTags.DND],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description:
            'Verify Toggle Display and Descriptions When App Manager Selects DND and App Restrictions as adminUser',
          zephyrTestId: 'FL-490',
          storyId: 'FL-490',
        });

        const dndAppRestriction = new DNDAppRestriction(appManagerHomePage.page);
        await dndAppRestriction.navigateToDNDAppRestriction();
        await dndAppRestriction.verifyAllOrgToogleAndLabel();
        await dndAppRestriction.verifyAudienceToogleAndLabel();
        await dndAppRestriction.verifyDescriptionAllOrg(DND_MESSAGES.ALL_ORG_DESCRIPTION);
        await dndAppRestriction.verifyDescriptionAudience(DND_MESSAGES.AUDIENCE_DESCRIPTION);
      }
    );

    test(
      '[FL-358][FL-549] Verify display of user my settings when DND set for audience with source as Manual',
      {
        tag: [TestPriority.P1, FrontlineFeatureTags.DND, TestGroupType.HEALTHCHECK],
      },
      async ({ endUserHomePage }) => {
        tagTest(test.info(), {
          description: 'Verify display of user my settings when DND set for audience with source as Manual',
          zephyrTestId: 'FL-358, FL-549',
          storyId: 'FL-358, FL-549',
        });

        const dndAppRestriction = new DNDAppRestriction(endUserHomePage.page);
        await dndAppRestriction.navigateToMySettings();
        await dndAppRestriction.verifyDNDMenuUnderMysettings(DND_MESSAGES.DO_NOT_DISTURB_MENU);

        const expectedDays = [...DND_MESSAGES.WORKING_DAYS];
        await dndAppRestriction.verifyWorkingDaysAreChecked(expectedDays);
        await dndAppRestriction.verifyWorkingHours();
        await dndAppRestriction.verifyWorkingDaysAndHoursEditable();
      }
    );

    test(
      '[FL-585][FL-587] Verify Options Displayed When App Manager Selects a Source for Audience DND and App Restrictions as adminUser',
      {
        tag: [TestPriority.P1, FrontlineFeatureTags.DND],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description:
            'Verify Options Displayed When App Manager Selects a Source for Audience DND and App Restrictions as adminUser',
          zephyrTestId: 'FL-585, FL-587',
          storyId: 'FL-585, FL-587',
        });

        const dndAppRestriction = new DNDAppRestriction(appManagerHomePage.page);

        await dndAppRestriction.navigateToDNDAppRestriction();
        await dndAppRestriction.verifySelectedOptionDND(DND_MESSAGES.DND_APP_RESTRICTIONS_TAB);

        await dndAppRestriction.clickAddAudienceButton();
        await dndAppRestriction.verifyAudienceDNDHeading(DND_MESSAGES.AUDIENCE_DND_HEADING);

        await dndAppRestriction.selectAudience('Extra audience for automation (1)');
        await dndAppRestriction.selectManualSource();
        await dndAppRestriction.configureWorkingDaysAndHours();
        await dndAppRestriction.clickNextButton();
        await dndAppRestriction.verifyChooseSettingsHeading(DND_MESSAGES.CHOOSE_SETTINGS_HEADING);
        await dndAppRestriction.verifyDNDCheckboxAndDescription();
        await dndAppRestriction.verifyRestrictionCheckboxAndDescription();
        await dndAppRestriction.checkRestrictionCheckbox();
        await dndAppRestriction.verifyRadioButtonsAndHelpText();
        await dndAppRestriction.verifySaveButtonDisabled();
      }
    );

    test(
      '[FL-567][FL-568] Verify display of selecting source for All organisation DND and app restrictions settings when HRIS(UKG) integration is successfully connected as adminUser',
      {
        tag: [TestPriority.P1, FrontlineFeatureTags.DND],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description:
            'Verify display of selecting source for All organisation DND and app restrictions settings when HRIS(UKG) integration is successfully connected as adminUser',
          zephyrTestId: 'FL-567, FL-568',
          storyId: 'FL-567, FL-568',
        });

        const dndAppRestriction = new DNDAppRestriction(appManagerHomePage.page);

        await dndAppRestriction.navigateToDNDAppRestriction();
        await dndAppRestriction.verifySelectedOptionDND(DND_MESSAGES.DND_APP_RESTRICTIONS_TAB);

        await dndAppRestriction.verifyAllOrgToogleAndLabel();
        await dndAppRestriction.clickManageButton();
        await dndAppRestriction.verifyAllOrgSettingHeader(DND_MESSAGES.ALL_ORG_SETTING_HEADER);
        await dndAppRestriction.verifyOrgSettingSourceText(DND_MESSAGES.ORG_SETTING_SOURCE_TEXT);
        await dndAppRestriction.verifyUKGAndManualOptions();
        await dndAppRestriction.selectUKGSource();
        await dndAppRestriction.verifyUKGSelected();
        await dndAppRestriction.verifyTextUnderUKGSelection(DND_MESSAGES.UKG_DESCRIPTION_TEXT);
        await dndAppRestriction.verifyNextButtonEnabled();
      }
    );

    test(
      '[FL-570] Verify Options Displayed When App Manager Selects a Source for Organization DND and App Restrictions as adminUser',
      {
        tag: [TestPriority.P1, FrontlineFeatureTags.DND],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description:
            'Verify Options Displayed When App Manager Selects a Source for Organization DND and App Restrictions as adminUser',
          zephyrTestId: 'FL-570',
          storyId: 'FL-570',
        });

        const dndAppRestriction = new DNDAppRestriction(appManagerHomePage.page);

        await dndAppRestriction.navigateToDNDAppRestriction();
        await dndAppRestriction.verifySelectedOptionDND(DND_MESSAGES.DND_APP_RESTRICTIONS_TAB);

        await dndAppRestriction.verifyAllOrgToogleAndLabel();
        await dndAppRestriction.clickManageButton();

        await dndAppRestriction.verifyAllOrgSettingHeader(DND_MESSAGES.ALL_ORG_SETTING_HEADER);
        await dndAppRestriction.verifyOrgSettingSourceText(DND_MESSAGES.ORG_SETTING_SOURCE_TEXT);

        await dndAppRestriction.verifyUKGAndManualOptions();

        await dndAppRestriction.selectManualSourceForAllOrg();
        await dndAppRestriction.clickNextButton();

        await dndAppRestriction.verifyChooseSettingsHeading(DND_MESSAGES.CHOOSE_SETTINGS_HEADING);
        await dndAppRestriction.verifyDNDCheckboxAndDescription();
        await dndAppRestriction.verifyRestrictionCheckboxAndDescription();
      }
    );
  }
);
