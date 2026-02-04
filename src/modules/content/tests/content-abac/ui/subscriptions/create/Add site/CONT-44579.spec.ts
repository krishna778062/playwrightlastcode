import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { SITE_CREATION_TEST_DATA } from '@/src/modules/content/test-data/create-site.test-data';
import { SiteCreationPageAbac } from '@/src/modules/content/ui/pages/siteCreationPageAbac';
import { ManageSiteSubscriptionPage } from '@/src/modules/content/ui/pages/sitePages/siteSubscriptionPage';

test.describe('Subscription Private Site Creation Test Suite (ABAC)', { tag: [ContentSuiteTags.SITE_CREATION] }, () => {
  let siteId: string | undefined;
  let siteCreationPage: SiteCreationPageAbac;
  let audienceId: string | null;

  test.beforeEach('Setting up the test environment for subscription tests', async ({ appManagerFixture }) => {
    await appManagerFixture.homePage.verifyThePageIsLoaded();
    siteCreationPage = new SiteCreationPageAbac(appManagerFixture.page);
  });

  test.afterEach('Site Clean up', async ({ appManagerFixture }) => {
    if (siteId) {
      await appManagerFixture.siteManagementService.deactivateSite(siteId);
    }
  });

  test(
    'verify subscription member type and non mandatory can be added during private site creation for All org ',
    {
      tag: [ContentSuiteTags.SITE_CREATION, ContentFeatureTags.ADD_SUBSCRIPTION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Verify subscription member type and non mandatory can be added during private site creation for All org ',
        zephyrTestId: 'CONT-44579',
        storyId: 'CONT-33516',
      });

      await appManagerFixture.navigationHelper.openSiteCreationForm(true);
      let manageSiteSubscriptionPage = new ManageSiteSubscriptionPage(appManagerFixture.page);

      await siteCreationPage.verifySiteCreationFormStructure();
      await siteCreationPage.form.fillSiteDetails({
        name: SITE_CREATION_TEST_DATA.PRIVATE_SITE.name,
        category: SITE_CREATION_TEST_DATA.PRIVATE_SITE.category,
        isPrivate: true,
      });
      await siteCreationPage.form.setupTargetAudience();

      await siteCreationPage.form.abacSubscriptionComponent.clickAddSubscriptionButton();
      await siteCreationPage.form.abacSubscriptionComponent.selectAllOrganizationAudience();
      await siteCreationPage.form.abacSubscriptionComponent.verifySubscriptionsSectionIsVisible();

      audienceId = await siteCreationPage.form.abacSubscriptionComponent.extractAndVerifyAudienceIdFromFirstRow();
      await siteCreationPage.form.abacSubscriptionComponent.verifySubscriptionTypeIsMembersDuringCreation(
        audienceId,
        true
      );
      await manageSiteSubscriptionPage.verifySubscriptionExists(audienceId);
      await siteCreationPage.form.abacSubscriptionComponent.clickMoreMenu(audienceId);
      await manageSiteSubscriptionPage.verifyRerunOption(audienceId, false);
      await manageSiteSubscriptionPage.verifyDeleteOptionEnabled(audienceId);
      await manageSiteSubscriptionPage.verifyPlusButtonIsVisible();
      await manageSiteSubscriptionPage.verifyPlusButtonIsClickable();

      await siteCreationPage.form.clickOnElement(siteCreationPage.form.addSiteButton);
      await siteCreationPage.page.waitForURL(/dashboard/);
      const extractedSiteId = await siteCreationPage.getSiteIdFromUrl(siteCreationPage.page.url());
      siteId = extractedSiteId as string;
      await siteCreationPage.verifySiteCreatedSuccessfully(SITE_CREATION_TEST_DATA.PRIVATE_SITE.name);

      manageSiteSubscriptionPage = new ManageSiteSubscriptionPage(appManagerFixture.page, siteId);
      await manageSiteSubscriptionPage.loadPage();
      await manageSiteSubscriptionPage.verifyThePageIsLoaded();

      await manageSiteSubscriptionPage.verifyPlusButtonIsVisible();
      await manageSiteSubscriptionPage.verifyPlusButtonIsClickable();

      await manageSiteSubscriptionPage.abacSubscriptionComponent.waitForSyncingToStart(audienceId);
      await manageSiteSubscriptionPage.verifySubscriptionControlsDisabledDuringSync(audienceId);

      await manageSiteSubscriptionPage.waitForSubscriptionSyncingToComplete({ audienceId: audienceId });

      await manageSiteSubscriptionPage.verifySubscriptionControlsEnabledAfterSync(audienceId);

      await manageSiteSubscriptionPage.abacSubscriptionComponent.clickMoreMenu(audienceId);
      await manageSiteSubscriptionPage.verifyRerunOption(audienceId, true);
      await manageSiteSubscriptionPage.verifyDeleteOptionEnabled(audienceId);

      await manageSiteSubscriptionPage.verifySubscriptionTypeIsMembers(audienceId, true);
      await manageSiteSubscriptionPage.verifyMandatorySwitchIsOff(audienceId);

      const setupTabCount = await manageSiteSubscriptionPage.extractSubscriptionCountFromFirstRow();

      await manageSiteSubscriptionPage.clickPeopleTab();
      await manageSiteSubscriptionPage.verifyMembersTabWithCount(setupTabCount);
      await manageSiteSubscriptionPage.verifySetupTabCountMatchesPeopleTab(setupTabCount);

      await manageSiteSubscriptionPage.clickMembersTab(setupTabCount);
    }
  );
});
