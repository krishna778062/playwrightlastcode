import { PeopleBlockComponent } from '@newsletter/components/peopleBlock.component';
import { SelectTemplateModal } from '@newsletter/components/selectTemplateModal.component';
import { NEWSLETTER_FEATURE_TAGS, NEWSLETTER_SUITE_TAGS } from '@newsletter/constants/testTags';
import { newsletterFixture as test } from '@newsletter/fixtures/newsletterFixture';
import { BrowsePeopleModal } from '@newsletter/Modals/browsePeopleModal';
import { NewsletterEditorPage } from '@newsletter/pages/NewsletterEditorPage.page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

const TEMPLATE_NAME = 'Blank template';
const locationName = process.env.TarlJacksonLocation || 'Nottingham';
const PERSON_NAMES = ['Dev Test', 'Tarl Jackson', 'Ankit Gupta'];

test.describe('Newsletter People Block - Smart Blocks', { tag: [NEWSLETTER_SUITE_TAGS.NEWSLETTER] }, () => {
  let newsletterEditorPage: NewsletterEditorPage;
  let selectTemplateModal: SelectTemplateModal;
  let peopleBlockComponent: PeopleBlockComponent;
  let browsePeopleModal: BrowsePeopleModal;

  test.beforeEach(async ({ appManagerPage }) => {
    newsletterEditorPage = new NewsletterEditorPage(appManagerPage);
    selectTemplateModal = new SelectTemplateModal(appManagerPage);
    peopleBlockComponent = new PeopleBlockComponent(appManagerPage);
    browsePeopleModal = new BrowsePeopleModal(appManagerPage);

    const newsletterName = `People_Block_Test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await newsletterEditorPage.loadPage();
    await newsletterEditorPage.verifyThePageIsLoaded();
    await newsletterEditorPage.clickCreateButton();
    await newsletterEditorPage.enterNewsletterName(newsletterName);
    await newsletterEditorPage.clickNextButtonOnNameModal();
    await selectTemplateModal.selectTemplateByName(TEMPLATE_NAME);
    await selectTemplateModal.clickNextButton();
    await newsletterEditorPage.verifyEditorIsLoaded();
  });

  test(
    'Add people block and select person',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Add people block and select a person from the list',
        zephyrTestId: 'NL-People-1',
        storyId: 'NL-People-1',
      });

      await peopleBlockComponent.clickPeopleBlock();
      await peopleBlockComponent.assertPeopleBlockIsDisplayed();
      await peopleBlockComponent.clickBrowse();
      await peopleBlockComponent.assertPeopleModalIsDisplayed();
      await browsePeopleModal.selectDisplayedPerson('Tarl Jackson');
      await browsePeopleModal.clickAdd();
      await newsletterEditorPage.clickOntoStagingOuterArea();
      await peopleBlockComponent.assertPeopleAreDisplayedAsCards('Tarl Jackson');
    }
  );

  test(
    'Add people block then search for people, by location',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Add people block and search for people by location',
        zephyrTestId: 'NL-People-2',
        storyId: 'NL-People-2',
      });

      await peopleBlockComponent.clickPeopleBlock();
      await peopleBlockComponent.assertPeopleBlockIsDisplayed();
      await peopleBlockComponent.clickBrowse();
      await peopleBlockComponent.assertPeopleModalIsDisplayed();
      await browsePeopleModal.enterTextIntoSearchLocationField(locationName);
      await browsePeopleModal.clickSearchLocationFieldSearchResult(locationName);
      await browsePeopleModal.selectDisplayedPerson('Tarl Jackson');
      await browsePeopleModal.clickAdd();
      await newsletterEditorPage.clickOntoStagingOuterArea();
      await peopleBlockComponent.assertPeopleAreDisplayedAsCards('Tarl Jackson');
    }
  );

  test(
    'Add people block then select by people category',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Add people block and filter by people category',
        zephyrTestId: 'NL-People-3',
        storyId: 'NL-People-3',
      });

      await peopleBlockComponent.clickPeopleBlock();
      await peopleBlockComponent.assertPeopleBlockIsDisplayed();
      await peopleBlockComponent.clickBrowse();
      await peopleBlockComponent.assertPeopleModalIsDisplayed();
      await browsePeopleModal.selectUserCategory('Test Analysts');
      await browsePeopleModal.handleNoResultsAndSelectFirstPerson();
      await browsePeopleModal.clickAdd();
      await newsletterEditorPage.clickOntoStagingOuterArea();
      await peopleBlockComponent.assertFirstPersonCardIsDisplayed();
    }
  );

  test(
    'Add people block then search for people, as list',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Add people block, search for multiple people, and display as list',
        zephyrTestId: 'NL-People-4',
        storyId: 'NL-People-4',
      });

      await peopleBlockComponent.clickPeopleBlock();
      await peopleBlockComponent.assertPeopleBlockIsDisplayed();
      await peopleBlockComponent.enterPersonNameInSidebarSearchField('Dev Test');
      await peopleBlockComponent.selectPersonName('Dev Test');
      await peopleBlockComponent.enterPersonNameInSidebarSearchField('Tarl');
      await peopleBlockComponent.selectPersonName('Tarl Jackson');
      await peopleBlockComponent.enterPersonNameInSidebarSearchField('Ankit');
      await peopleBlockComponent.selectPersonName('Ankit Gupta');
      await peopleBlockComponent.checkList();

      for (const personName of PERSON_NAMES) {
        await peopleBlockComponent.assertPeopleAreDisplayedAsList(personName);
      }
    }
  );

  test(
    'Add people block then search for people, as cards',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Add people block, search for multiple people, and display as cards',
        zephyrTestId: 'NL-People-5',
        storyId: 'NL-People-5',
      });

      await peopleBlockComponent.clickPeopleBlock();
      await peopleBlockComponent.assertPeopleBlockIsDisplayed();
      await peopleBlockComponent.enterPersonNameInSidebarSearchField('Dev Test');
      await peopleBlockComponent.selectPersonName('Dev Test');
      await peopleBlockComponent.sideBarSearchFieldClearAndTypeAgain('Tarl');
      await peopleBlockComponent.selectPersonName('Tarl Jackson');
      await peopleBlockComponent.sideBarSearchFieldClearAndTypeAgain('Ankit');
      await peopleBlockComponent.selectPersonName('Ankit Gupta');
      await peopleBlockComponent.checkCards();
      await peopleBlockComponent.selectAndVerifyPeopleNames(PERSON_NAMES);
    }
  );

  test(
    'Add people block then Browse for people as avatars',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Add people block via Browse modal and display as avatars',
        zephyrTestId: 'NL-People-6',
        storyId: 'NL-People-6',
      });

      await peopleBlockComponent.clickPeopleBlock();
      await peopleBlockComponent.assertPeopleBlockIsDisplayed();
      await peopleBlockComponent.clickBrowse();
      await peopleBlockComponent.assertPeopleModalIsDisplayed();
      await browsePeopleModal.enterAndSelectPersonNameInBrowsePeopleModal('Dev Test');
      await browsePeopleModal.enterAndSelectPersonNameInBrowsePeopleModal('Tarl');
      await browsePeopleModal.enterAndSelectPersonNameInBrowsePeopleModal('Ankit');
      await browsePeopleModal.clickAdd();
      await peopleBlockComponent.checkAvatars();
      await peopleBlockComponent.assertPeopleAreDisplayedAsAvatars();
    }
  );

  test(
    'Make people picker show results when no search term in department and location fields',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify people list is displayed by default in Browse modal without search terms',
        zephyrTestId: 'NL-People-7',
        storyId: 'NL-People-7',
      });

      await peopleBlockComponent.clickPeopleBlock();
      await peopleBlockComponent.assertPeopleBlockIsDisplayed();
      await peopleBlockComponent.clickBrowse();
      await peopleBlockComponent.assertPeopleModalIsDisplayed();
      await browsePeopleModal.assertPeopleListAreDisplayedOnModal();
    }
  );

  test(
    'Add people block then verify max selection limit error',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify that when max number of people are selected, attempting to select more shows error message',
        zephyrTestId: 'NL-People-8',
        storyId: 'NL-People-8',
      });

      await peopleBlockComponent.clickPeopleBlock();
      await peopleBlockComponent.assertPeopleBlockIsDisplayed();
      await peopleBlockComponent.clickBrowse();
      await peopleBlockComponent.assertPeopleModalIsDisplayed();
      await browsePeopleModal.assertPeopleListAreDisplayedOnModal();
      await browsePeopleModal.clickOnShowMoreButton();
      await browsePeopleModal.checkMaxNumberOfPeople();
      await browsePeopleModal.searchAndTryToCheckPersonAtMaxLimit(PERSON_NAMES[0]);
      await browsePeopleModal.assertMaxSelectErrorIsDisplayed();
    }
  );
});
