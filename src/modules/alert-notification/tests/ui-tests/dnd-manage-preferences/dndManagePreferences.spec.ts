import { ALERT_NOTIFICATION_MESSAGES } from '@alert-notification-constants/messageRepo';
import { POPUP_BUTTONS } from '@alert-notification-constants/popupButtons';
import { AlertNotificationSuiteTags } from '@alert-notification-constants/testTags';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { DndManagePreferencesPage } from '../../../ui/pages/dnd-manage-preferences/dndManagePreferencesPage';
import { appManagerFixture as test } from '../../fixtures/fixtures';
import {
  MANAGE_PREFERENCES_CATEGORIES,
  MANAGE_PREFERENCES_NOTIFICATIONS,
  MANAGE_PREFERENCES_PAGE_TEXT,
  MANAGE_PREFERENCES_SEARCH_TERMS,
  PRIORITY_DROPDOWN_OPTIONS,
} from '../../test-data/dnd-manage-preferences.test-data';

test.describe(
  '[Alert Notification] DND & Manage Preferences - Full Suite',
  {
    tag: [AlertNotificationSuiteTags.ALERT_NOTIFICATION, AlertNotificationSuiteTags.DND_MANAGE_PREFERENCE],
  },
  () => {
    let dndManagePreferencesPage: DndManagePreferencesPage;

    test.beforeEach(async ({ appManager }) => {
      // Navigate to Defaults page (Email notifications is the default tab)
      await appManager.goto(PAGE_ENDPOINTS.EMAIL_NOTIFICATION_APP_SETTINGS_PAGE);
      dndManagePreferencesPage = new DndManagePreferencesPage(appManager);
    });

    test(
      'tc001 - Verify navigation between Do Not Disturb and Manage Preferences preserves UI state',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29366',
        });

        // Given: user is on the DND page
        await dndManagePreferencesPage.navigateToDndPage();

        // When: user clicks "Manage preferences"
        await dndManagePreferencesPage.clickManagePreferencesLink();

        // Then: Manage Preferences page shows heading and descriptions
        await dndManagePreferencesPage.verifyManagePreferencesHeadingAndDescriptions();

        // When: user clicks "Do not disturb" back link
        await dndManagePreferencesPage.clickBackToDndPage();

        // Then: DND page content is preserved (heading, description, All organization, Audience)
        await dndManagePreferencesPage.verifyDndPageContentAfterNavigatingBack();
      }
    );

    test(
      'tc002 - Verify notification name, description and category for all items on Manage preferences page',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29369',
        });

        // Given: user opens Manage Preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();

        // Then: Manage Preferences page heading and all notification rows are visible
        await dndManagePreferencesPage.verifyManagePreferencesPageHeading();

        // And all notifications should be displayed with correct descriptions and categories
        await dndManagePreferencesPage.verifyAllNotificationRows(MANAGE_PREFERENCES_NOTIFICATIONS);
      }
    );

    test(
      'tc003 - Verify Search functionality and Sort by Category on Manage preferences page',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29380',
        });

        // Given: user opens Manage Preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();

        // Search: must
        // When the user enters "must" in the Manage preferences search box
        await dndManagePreferencesPage.searchNotifications(MANAGE_PREFERENCES_SEARCH_TERMS.MUST);

        // Then the "Must reads" notification row is displayed
        await dndManagePreferencesPage.verifySearchResultContains(
          'Must reads',
          MANAGE_PREFERENCES_CATEGORIES.ORG_COMMUNICATIONS
        );

        // When the user clicks the "Cancel" button
        await dndManagePreferencesPage.clearSearch();

        // Search: alert
        // When the user enters "alert" in the Manage preferences search box
        await dndManagePreferencesPage.searchNotifications(MANAGE_PREFERENCES_SEARCH_TERMS.ALERT);

        // Then the alert-related notification rows are displayed
        await dndManagePreferencesPage.verifySearchResultContains(
          'Alerts',
          MANAGE_PREFERENCES_CATEGORIES.ORG_COMMUNICATIONS
        );

        // When the user clicks the "Cancel" button
        await dndManagePreferencesPage.clearSearch();

        // Search: follow
        // When the user enters "follow" in the Manage preferences search box
        await dndManagePreferencesPage.searchNotifications(MANAGE_PREFERENCES_SEARCH_TERMS.FOLLOW);

        // Then the follow-related notification rows are displayed
        await dndManagePreferencesPage.verifySearchResultContains(
          'Follows',
          MANAGE_PREFERENCES_CATEGORIES.PROFILE_EXPERTISE
        );

        // When the user clicks the "Cancel" button
        await dndManagePreferencesPage.clearSearch();

        // Sort by Category dropdown
        // When the user clicks on "Sort by: Category"
        await dndManagePreferencesPage.clickSortByDropdown();

        // Then the sort options should appear
        await dndManagePreferencesPage.verifySortOptionsVisible([
          MANAGE_PREFERENCES_PAGE_TEXT.SORT.OPTIONS.PRIORITY,
          MANAGE_PREFERENCES_PAGE_TEXT.SORT.OPTIONS.CATEGORY,
          MANAGE_PREFERENCES_PAGE_TEXT.SORT.OPTIONS.LAST_MODIFIED,
        ]);
      }
    );

    test(
      'tc004 - Verify DND Filters panel including Priority & Category filter lists',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29379',
        });

        // Given: user opens Manage Preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();

        // When the user clicks the "Filters" button
        await dndManagePreferencesPage.clickFiltersButton();

        // Then: Filters panel is displayed with header, Reset all, Priority and Category sections
        await dndManagePreferencesPage.verifyFiltersPanelVisible();
        await dndManagePreferencesPage.verifyFiltersPanelSectionsVisible();

        // When: user expands the Priority section
        await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.PRIORITY);

        // Then the priority options should appear
        await dndManagePreferencesPage.verifyFilterOptionsVisible(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.PRIORITY_OPTIONS
        );

        // When the user expands the "Category" dropdown
        await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.CATEGORY);

        // Then the category names should appear
        await dndManagePreferencesPage.verifyFilterOptionsVisible(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.CATEGORY_OPTIONS
        );
      }
    );

    test(
      'tc005 - Verify priority dropdown options and system notifications are locked',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29640',
        });

        // Given: user opens Manage Preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();

        // Filter editable and locked notifications from the main array
        const editableNotifications = MANAGE_PREFERENCES_NOTIFICATIONS.filter(n => n.isEditable).slice(0, 5);
        const lockedNotifications = MANAGE_PREFERENCES_NOTIFICATIONS.filter(n => !n.isEditable).slice(0, 3);

        // Verify priority dropdown options for 5 editable notifications
        // When the user opens the Priority dropdown for each editable notification
        // Then the dropdown should contain all 3 priority options
        for (const notification of editableNotifications) {
          await dndManagePreferencesPage.verifyEditablePriorityDropdownOptions(notification);
        }

        // Verify system notifications have locked priority (non-editable)
        // And for system notification rows the Priority field should show "Receive immediately"
        // And the user should NOT be able to change the priority option
        for (const notification of lockedNotifications) {
          await dndManagePreferencesPage.verifySystemNotificationPriorityLocked(notification);
        }

        // Verify Filters panel labels
        // When the user clicks on the "Filters" button
        await dndManagePreferencesPage.clickFiltersButton();

        // Then the Filters panel is displayed with header and Reset all link
        await dndManagePreferencesPage.verifyFiltersPanelVisible();

        // And the Priority and Category sections are visible
        await dndManagePreferencesPage.verifyButton(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.PRIORITY, 'visible');
        await dndManagePreferencesPage.verifyButton(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.CATEGORY, 'visible');
      }
    );

    test(
      'tc006 - Filter notifications by priority and verify visible rows',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29654',
        });

        // Given: user opens Manage Preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();

        // Wait for page to fully load
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // Filter by "Receive immediately"
        // When the user clicks on the "Filters" button
        await dndManagePreferencesPage.clickFiltersButton();

        // And the user expands the "Priority" section
        await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.PRIORITY);

        // And the user selects "Receive immediately"
        await dndManagePreferencesPage.selectFilterOption(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.PRIORITY_OPTIONS[0] // Receive immediately
        );

        // Then only notifications with Priority "Receive immediately" should be listed
        await dndManagePreferencesPage.verifyAllRowsHavePriority(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.PRIORITY_OPTIONS[0]
        );

        // And the Filters button should show active state
        await dndManagePreferencesPage.verifyFiltersButtonActiveState(1);

        // Filter by "Receive after DND ends"
        // When the user opens the Filters panel again
        await dndManagePreferencesPage.clickFiltersButton();

        // And the user unchecks "Receive immediately"
        await dndManagePreferencesPage.unselectFilterOption(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.PRIORITY_OPTIONS[0]);

        // And the user checks "Receive after DND ends"
        await dndManagePreferencesPage.selectFilterOption(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.PRIORITY_OPTIONS[1] // Receive after DND ends
        );

        // Then only notifications with Priority "Receive after DND ends" should be listed
        await dndManagePreferencesPage.verifyAllRowsHavePriority(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.PRIORITY_OPTIONS[1]
        );

        // Filter by "Receive as digest after DND ends"
        // When the user opens the Filters panel again
        await dndManagePreferencesPage.clickFiltersButton();

        // And the user unchecks "Receive after DND ends"
        await dndManagePreferencesPage.unselectFilterOption(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.PRIORITY_OPTIONS[1]);

        // And the user checks "Receive as digest after DND ends"
        await dndManagePreferencesPage.selectFilterOption(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.PRIORITY_OPTIONS[2] // Receive as digest after DND ends
        );

        // Then only notifications with Priority "Receive as digest after DND ends" should be listed
        await dndManagePreferencesPage.verifyAllRowsHavePriority(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.PRIORITY_OPTIONS[2]
        );
      }
    );

    test(
      'tc007 - Filter notifications by Category and verify results and reset',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29656',
        });

        // Given: user opens Manage Preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // When the user clicks on the "Filters" button
        await dndManagePreferencesPage.clickFiltersButton();

        // And the user expands the "Category" section
        await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.CATEGORY);

        // Then the Category filter search box is visible
        await dndManagePreferencesPage.verifyCategorySearchBoxVisible();

        // And all category options are listed
        await dndManagePreferencesPage.verifyFilterOptionsVisible(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.CATEGORY_OPTIONS
        );

        // Use search + single category selection
        // When the user types "Expertise" in the Category search box
        await dndManagePreferencesPage.searchInCategoryFilter('Expertise');

        // And the user selects the "Profile & expertise" category checkbox
        await dndManagePreferencesPage.selectFilterOption(MANAGE_PREFERENCES_CATEGORIES.PROFILE_EXPERTISE);

        // Then only notifications with Category "Profile & expertise" are displayed
        await dndManagePreferencesPage.verifyAllRowsHaveCategory(MANAGE_PREFERENCES_CATEGORIES.PROFILE_EXPERTISE);

        // And the Category filter count for "Profile & expertise" matches the visible rows
        // Reopen Filters panel, clear Category search (so default options like "App management" are present),
        // and expand Category section so the checkbox is present in the DOM
        await dndManagePreferencesPage.clickFiltersButton();
        await dndManagePreferencesPage.clearCategorySearch();
        await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.CATEGORY);
        await dndManagePreferencesPage.verifyCategoryFilterCountMatchesVisibleRows(
          MANAGE_PREFERENCES_CATEGORIES.PROFILE_EXPERTISE
        );

        // And the Filters button shows active state
        await dndManagePreferencesPage.verifyFiltersButtonActiveState(1);

        // Multi-select categories
        // When the user opens Filters panel again (panel is already open from previous step)
        await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.CATEGORY);

        // And the user unchecks "Profile & expertise"
        await dndManagePreferencesPage.unselectFilterOption(MANAGE_PREFERENCES_CATEGORIES.PROFILE_EXPERTISE);

        // And the user selects the "Content" category checkbox
        await dndManagePreferencesPage.selectFilterOption(MANAGE_PREFERENCES_CATEGORIES.CONTENT);

        // When the user opens Filters panel again
        await dndManagePreferencesPage.clickFiltersButton();

        // And the user also selects the "Feed" category checkbox
        await dndManagePreferencesPage.selectFilterOption(MANAGE_PREFERENCES_CATEGORIES.FEED);

        // Then each visible notification row has Category either "Content" or "Feed"
        await dndManagePreferencesPage.verifyAllRowsHaveCategoryOneOf([
          MANAGE_PREFERENCES_CATEGORIES.CONTENT,
          MANAGE_PREFERENCES_CATEGORIES.FEED,
        ]);

        // And the Filters button shows active state (count=1 for Category section)
        await dndManagePreferencesPage.verifyFiltersButtonActiveState(1);

        // Reset behaviour
        // When the user clicks on the "Filters" button
        await dndManagePreferencesPage.clickFiltersButton();

        // And the user clicks on the "Reset all" link in the Filters panel
        await dndManagePreferencesPage.clickResetAllFilters();

        // Then the full list of notifications is visible again
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // And the Filters button shows default state (no count)
        await dndManagePreferencesPage.verifyFiltersButtonDefaultState();
      }
    );

    test(
      'tc008 - Cancel discards multiple priority changes and original values remain unchanged',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29661',
        });

        // Given the user is logged in as an App Manager (handled in beforeEach)
        // And the user navigates to Manage preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // Use 3 editable notifications from existing test data
        const notificationA = MANAGE_PREFERENCES_NOTIFICATIONS[0]; // Actionable notifications (all public sites)
        const notificationB = MANAGE_PREFERENCES_NOTIFICATIONS[5]; // Likes or shares on my content
        const notificationC = MANAGE_PREFERENCES_NOTIFICATIONS[13]; // Follows

        // Note the current Priority values for three notifications
        const originalPriorityA = await dndManagePreferencesPage.getNotificationPriorityValue(notificationA);
        const originalPriorityB = await dndManagePreferencesPage.getNotificationPriorityValue(notificationB);
        const originalPriorityC = await dndManagePreferencesPage.getNotificationPriorityValue(notificationC);

        // When the user changes the Priority of Notification A to "Receive after DND ends"
        await dndManagePreferencesPage.changeNotificationPriority(
          notificationA,
          PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AFTER_DND_ENDS
        );

        // And the user changes the Priority of Notification B to "Receive as digest after DND ends"
        await dndManagePreferencesPage.changeNotificationPriority(
          notificationB,
          PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AS_DIGEST
        );

        // And the user changes the Priority of Notification C to "Receive immediately"
        await dndManagePreferencesPage.changeNotificationPriority(
          notificationC,
          PRIORITY_DROPDOWN_OPTIONS.RECEIVE_IMMEDIATELY
        );

        // Then the "Save" button should be enabled
        await dndManagePreferencesPage.verifyButton(POPUP_BUTTONS.SAVE, 'enabled');

        // When the user clicks the "Cancel" button
        await dndManagePreferencesPage.clickButton(POPUP_BUTTONS.CANCEL);

        // Then the user should be navigated back to the main "Do not disturb" page
        await dndManagePreferencesPage.verifyThePageIsLoaded();

        // When: user reopens "Manage preferences"
        await dndManagePreferencesPage.clickManagePreferencesLink();
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // Then Notification A should show its ORIGINAL priority value
        await dndManagePreferencesPage.verifyNotificationPriorityValue(notificationA, originalPriorityA);

        // And Notification B should show its ORIGINAL priority value
        await dndManagePreferencesPage.verifyNotificationPriorityValue(notificationB, originalPriorityB);

        // And Notification C should show its ORIGINAL priority value
        await dndManagePreferencesPage.verifyNotificationPriorityValue(notificationC, originalPriorityC);
      }
    );

    test(
      'tc009 - Save multiple priority changes and verify persistence across navigation',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29668',
        });

        // Given the user is on the Manage preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // Use 3 editable notifications from existing test data
        const notificationA = MANAGE_PREFERENCES_NOTIFICATIONS[0]; // Actionable notifications (all public sites)
        const notificationB = MANAGE_PREFERENCES_NOTIFICATIONS[5]; // Likes or shares on my content
        const notificationC = MANAGE_PREFERENCES_NOTIFICATIONS[13]; // Follows

        // Note the current Priority of three different notifications (for cleanup later)
        const originalPriorityA = await dndManagePreferencesPage.getNotificationPriorityValue(notificationA);
        const originalPriorityB = await dndManagePreferencesPage.getNotificationPriorityValue(notificationB);
        const originalPriorityC = await dndManagePreferencesPage.getNotificationPriorityValue(notificationC);

        // When the user changes Priority of A to "Receive after DND ends"
        await dndManagePreferencesPage.changeNotificationPriority(
          notificationA,
          PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AFTER_DND_ENDS
        );

        // And the user changes Priority of B to "Receive as digest after DND ends"
        await dndManagePreferencesPage.changeNotificationPriority(
          notificationB,
          PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AS_DIGEST
        );

        // And the user changes Priority of C to "Receive immediately"
        await dndManagePreferencesPage.changeNotificationPriority(
          notificationC,
          PRIORITY_DROPDOWN_OPTIONS.RECEIVE_IMMEDIATELY
        );

        // Then the "Save" button should be enabled
        await dndManagePreferencesPage.verifyButton(POPUP_BUTTONS.SAVE, 'enabled');

        // When the user clicks on "Save"
        await dndManagePreferencesPage.clickButton(POPUP_BUTTONS.SAVE);

        // Then a success toast should be displayed
        await dndManagePreferencesPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.NOTIFICATION_PREFERENCE_SAVED);

        // And the "Save" button should become disabled
        await dndManagePreferencesPage.verifyButton(POPUP_BUTTONS.SAVE, 'disabled');

        // When: user navigates away to Home
        await dndManagePreferencesPage.goToHome();

        // And navigates back to "Manage preferences"
        await dndManagePreferencesPage.openManagePreferencesPage();
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // Then notification A should show "Receive after DND ends"
        await dndManagePreferencesPage.verifyNotificationPriorityValue(
          notificationA,
          PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AFTER_DND_ENDS
        );

        // And notification B should show "Receive as digest after DND ends"
        await dndManagePreferencesPage.verifyNotificationPriorityValue(
          notificationB,
          PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AS_DIGEST
        );

        // And notification C should show "Receive immediately"
        await dndManagePreferencesPage.verifyNotificationPriorityValue(
          notificationC,
          PRIORITY_DROPDOWN_OPTIONS.RECEIVE_IMMEDIATELY
        );

        // Cleanup: Restore original priority values
        await dndManagePreferencesPage.changeNotificationPriority(notificationA, originalPriorityA);
        await dndManagePreferencesPage.changeNotificationPriority(notificationB, originalPriorityB);
        await dndManagePreferencesPage.changeNotificationPriority(notificationC, originalPriorityC);
        await dndManagePreferencesPage.clickButton(POPUP_BUTTONS.SAVE);
        await dndManagePreferencesPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.NOTIFICATION_PREFERENCE_SAVED);
      }
    );

    test(
      'tc010 - Verify DND “Sort by Priority” Ordering on Manage Preferences without edit',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29694',
        });

        // Given the user is logged in as an App Manager (handled in beforeEach)
        // And the user navigates to Manage preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // When the user clicks on the "Sort by" dropdown
        await dndManagePreferencesPage.clickSortByDropdown();

        // And the user selects "Priority"
        await dndManagePreferencesPage.selectSortOption(MANAGE_PREFERENCES_PAGE_TEXT.SORT.OPTIONS.PRIORITY);

        // Then the notifications list should be sorted based on Priority
        // All "Receive as digest after DND ends" at top
        // All "Receive after DND ends" in middle
        // All "Receive immediately" at bottom
        await dndManagePreferencesPage.verifySortedByPriorityOrder();
      }
    );

    test(
      'tc011 - Verify sorting by Priority after modifying and saving notification priority changes',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29695',
        });

        // Given the user is logged in as an App Manager (handled in beforeEach)
        // And the user navigates to Manage preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // Use 3 editable notifications from existing test data
        const notificationA = MANAGE_PREFERENCES_NOTIFICATIONS[0]; // Actionable notifications (all public sites)
        const notificationB = MANAGE_PREFERENCES_NOTIFICATIONS[5]; // Likes or shares on my content
        const notificationC = MANAGE_PREFERENCES_NOTIFICATIONS[13]; // Follows

        // Note original priorities for cleanup
        const originalPriorityA = await dndManagePreferencesPage.getNotificationPriorityValue(notificationA);
        const originalPriorityB = await dndManagePreferencesPage.getNotificationPriorityValue(notificationB);
        const originalPriorityC = await dndManagePreferencesPage.getNotificationPriorityValue(notificationC);

        // When the user changes notification A to "Receive as digest after DND ends"
        await dndManagePreferencesPage.changeNotificationPriority(
          notificationA,
          PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AS_DIGEST
        );

        // And the user changes notification B to "Receive after DND ends"
        await dndManagePreferencesPage.changeNotificationPriority(
          notificationB,
          PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AFTER_DND_ENDS
        );

        // And the user changes notification C to "Receive immediately"
        await dndManagePreferencesPage.changeNotificationPriority(
          notificationC,
          PRIORITY_DROPDOWN_OPTIONS.RECEIVE_IMMEDIATELY
        );

        // Then the "Save" button should be enabled
        await dndManagePreferencesPage.verifyButton(POPUP_BUTTONS.SAVE, 'enabled');

        // When the user clicks "Save"
        await dndManagePreferencesPage.clickButton(POPUP_BUTTONS.SAVE);

        // Then a success message should be displayed
        await dndManagePreferencesPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.NOTIFICATION_PREFERENCE_SAVED);

        // When the user clicks on the "Sort by" dropdown
        await dndManagePreferencesPage.clickSortByDropdown();

        // And the user selects "Priority"
        await dndManagePreferencesPage.selectSortOption(MANAGE_PREFERENCES_PAGE_TEXT.SORT.OPTIONS.PRIORITY);

        // Then the notifications should be sorted in the correct priority order
        await dndManagePreferencesPage.verifySortedByPriorityOrder();

        // Cleanup: Restore original priority values
        await dndManagePreferencesPage.changeNotificationPriority(notificationA, originalPriorityA);
        await dndManagePreferencesPage.changeNotificationPriority(notificationB, originalPriorityB);
        await dndManagePreferencesPage.changeNotificationPriority(notificationC, originalPriorityC);
        await dndManagePreferencesPage.clickButton(POPUP_BUTTONS.SAVE);
        await dndManagePreferencesPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.NOTIFICATION_PREFERENCE_SAVED);
      }
    );

    test(
      'tc012 - Verify DND manage preference notifications appear at the top when sorted by Last modified after editing and saving changes',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29711',
        });

        // Given the user is logged in as an App Manager (handled in beforeEach)
        // And the user navigates to Manage preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // Select a notification to modify
        const notificationA = MANAGE_PREFERENCES_NOTIFICATIONS[0]; // Actionable notifications (all public sites)

        // Note its current Priority value
        const originalPriority = await dndManagePreferencesPage.getNotificationPriorityValue(notificationA);

        // Determine a different priority value to change to
        const newPriority =
          originalPriority === PRIORITY_DROPDOWN_OPTIONS.RECEIVE_IMMEDIATELY
            ? PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AFTER_DND_ENDS
            : PRIORITY_DROPDOWN_OPTIONS.RECEIVE_IMMEDIATELY;

        // When the user changes the Priority of Notification A to a different value
        await dndManagePreferencesPage.changeNotificationPriority(notificationA, newPriority);

        // Then the "Save" button should be enabled
        await dndManagePreferencesPage.verifyButton(POPUP_BUTTONS.SAVE, 'enabled');

        // When the user clicks "Save"
        await dndManagePreferencesPage.clickButton(POPUP_BUTTONS.SAVE);

        // Then a success message should be displayed
        await dndManagePreferencesPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.NOTIFICATION_PREFERENCE_SAVED);

        // When the user navigates back to "Do not disturb"
        await dndManagePreferencesPage.clickBackToDndPage();
        await dndManagePreferencesPage.verifyThePageIsLoaded();

        // And the user opens "Manage preferences" again
        await dndManagePreferencesPage.clickManagePreferencesLink();
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // When the user clicks on the "Sort by" dropdown
        await dndManagePreferencesPage.clickSortByDropdown();

        // And selects "Last modified"
        await dndManagePreferencesPage.selectSortOption(MANAGE_PREFERENCES_PAGE_TEXT.SORT.OPTIONS.LAST_MODIFIED);

        // Then Notification A should appear at the top of the list
        await dndManagePreferencesPage.verifyNotificationIsAtTop(notificationA);

        // When the user refreshes the page
        await dndManagePreferencesPage.reloadPage();
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // And sorts by "Last modified" again
        await dndManagePreferencesPage.clickSortByDropdown();
        await dndManagePreferencesPage.selectSortOption(MANAGE_PREFERENCES_PAGE_TEXT.SORT.OPTIONS.LAST_MODIFIED);

        // Then Notification A should still appear at the top of the sorted list
        await dndManagePreferencesPage.verifyNotificationIsAtTop(notificationA);

        // Cleanup: Restore original priority
        await dndManagePreferencesPage.changeNotificationPriority(notificationA, originalPriority);
        await dndManagePreferencesPage.clickButton(POPUP_BUTTONS.SAVE);
        await dndManagePreferencesPage.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.NOTIFICATION_PREFERENCE_SAVED);
      }
    );

    test(
      'tc013 - Verify default sorting is Category and user can switch sorting and return back to Category',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29735',
        });

        // Given the user is logged in as an App Manager (handled in beforeEach)
        // And the user navigates to Manage preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // Step 1: Verify default sort is "Sort by: Category"
        await dndManagePreferencesPage.verifySortByButtonText(MANAGE_PREFERENCES_PAGE_TEXT.SORT.BUTTON_TEXT);

        // And the notifications list should be grouped by Category
        await dndManagePreferencesPage.verifySortedByCategoryOrder(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.CATEGORY_OPTIONS
        );

        // Step 2: User changes sorting to Priority
        await dndManagePreferencesPage.clickSortByDropdown();
        await dndManagePreferencesPage.selectSortOption(MANAGE_PREFERENCES_PAGE_TEXT.SORT.OPTIONS.PRIORITY);

        // Then the Sort control should display "Sort by: Priority"
        await dndManagePreferencesPage.verifySortByButtonText(
          `Sort by: ${MANAGE_PREFERENCES_PAGE_TEXT.SORT.OPTIONS.PRIORITY}`
        );

        // And the notification list should be sorted based on Priority
        await dndManagePreferencesPage.verifySortedByPriorityOrder();

        // Step 3: User returns back to Category
        await dndManagePreferencesPage.clickSortByDropdown();
        await dndManagePreferencesPage.selectSortOption(MANAGE_PREFERENCES_PAGE_TEXT.SORT.OPTIONS.CATEGORY);

        // Then the Sort control should again display "Sort by: Category"
        await dndManagePreferencesPage.verifySortByButtonText(MANAGE_PREFERENCES_PAGE_TEXT.SORT.BUTTON_TEXT);

        // And the notifications should once again be grouped by Category
        await dndManagePreferencesPage.verifySortedByCategoryOrder(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.CATEGORY_OPTIONS
        );
      }
    );

    test(
      'tc014 - Apply Priority and Category filters together and verify filtered results and counts',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29741',
        });

        // Given the user is logged in as an App Manager (handled in beforeEach)
        // And the user navigates to Manage preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // And no filters are applied on the Manage preferences page
        const originalRowCount = await dndManagePreferencesPage.getNotificationRowCount();
        await dndManagePreferencesPage.verifyFiltersButtonDefaultState();

        // Step 1: Apply Priority filter - Receive immediately
        await dndManagePreferencesPage.clickFiltersButton();
        await dndManagePreferencesPage.verifyFiltersPanelVisible();
        await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.PRIORITY);
        await dndManagePreferencesPage.selectFilterOption(PRIORITY_DROPDOWN_OPTIONS.RECEIVE_IMMEDIATELY);

        // Then the "Filters" button should display "Filters (1)"
        await dndManagePreferencesPage.verifyFiltersButtonActiveState(1);

        // And only notifications with Priority "Receive immediately" should be visible in the list
        await dndManagePreferencesPage.verifyAllRowsHavePriority(PRIORITY_DROPDOWN_OPTIONS.RECEIVE_IMMEDIATELY);

        // Step 2: Apply Category filters (App management + Content) on top of Priority
        await dndManagePreferencesPage.clickFiltersButton();
        await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.CATEGORY);
        await dndManagePreferencesPage.selectFilterOption(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.CATEGORY_OPTIONS[0] // App management
        );

        // Then the "Filters" button should display "Filters (2)"
        await dndManagePreferencesPage.verifyFiltersButtonActiveState(2);

        // And only notifications with Priority "Receive immediately" and Category App management or Content should be visible
        await dndManagePreferencesPage.verifyAllRowsHavePriority(PRIORITY_DROPDOWN_OPTIONS.RECEIVE_IMMEDIATELY);
        await dndManagePreferencesPage.verifyAllRowsHaveCategoryOneOf([
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.CATEGORY_OPTIONS[0], // App management
        ]);

        // Then the "Filters" button should still display "Filters (2)" (Priority + App management)
        await dndManagePreferencesPage.verifyFiltersButtonActiveState(2);

        // And only notifications with Priority "Receive immediately" and Category "App management" should be visible
        await dndManagePreferencesPage.verifyAllRowsHavePriority(PRIORITY_DROPDOWN_OPTIONS.RECEIVE_IMMEDIATELY);
        await dndManagePreferencesPage.verifyAllRowsHaveCategory(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.CATEGORY_OPTIONS[0]
        );

        // Step 4: Clear all filters
        // Reopen the Filters panel so the "Reset all" link is visible
        await dndManagePreferencesPage.clickFiltersButton();
        await dndManagePreferencesPage.verifyFiltersPanelVisible();
        await dndManagePreferencesPage.clickResetAllFilters();

        // Then the "Filters" button should not show any count badge
        await dndManagePreferencesPage.verifyFiltersButtonDefaultState();

        // And all notifications should be visible again with original Priority and Category values
        const resetRowCount = await dndManagePreferencesPage.getNotificationRowCount();
        test.expect(resetRowCount).toBe(originalRowCount);
      }
    );

    test(
      'tc015 - Verify priority filter behavior DND for each priority type',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29654',
        });

        // Given the user is logged in as an App Manager (handled in beforeEach)
        // And the user navigates to Manage preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // And no filters are applied initially
        await dndManagePreferencesPage.verifyFiltersButtonDefaultState();

        // Helper to apply a single priority filter, verify rows, and reset
        const applyPriorityFilterAndReset = async (priorityLabel: string) => {
          // Open Filters and Priority section
          await dndManagePreferencesPage.clickFiltersButton();
          await dndManagePreferencesPage.verifyFiltersPanelVisible();
          await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.PRIORITY);

          // Select the desired priority option
          await dndManagePreferencesPage.selectFilterOption(priorityLabel);

          // Then only notifications with the selected Priority should be listed
          await dndManagePreferencesPage.verifyAllRowsHavePriority(priorityLabel);

          // And the Filters button should show active state "Filters (1)"
          await dndManagePreferencesPage.verifyFiltersButtonActiveState(1);

          // And the Priority filter count for the selected option matches the visible rows
          await dndManagePreferencesPage.clickFiltersButton();
          await dndManagePreferencesPage.verifyFiltersPanelVisible();
          await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.PRIORITY);
          await dndManagePreferencesPage.verifyPriorityFilterCountMatchesVisibleRows(priorityLabel);

          // Filters panel is already open from the previous step - click "Reset all" directly
          await dndManagePreferencesPage.clickResetAllFilters();

          // Verify Filters button returns to default state
          await dndManagePreferencesPage.verifyFiltersButtonDefaultState();
        };

        // Filter by "Receive immediately"
        await applyPriorityFilterAndReset(PRIORITY_DROPDOWN_OPTIONS.RECEIVE_IMMEDIATELY);

        // Filter by "Receive after DND ends"
        await applyPriorityFilterAndReset(PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AFTER_DND_ENDS);

        // Filter by "Receive as digest after DND ends"
        await applyPriorityFilterAndReset(PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AS_DIGEST);
      }
    );

    test(
      'tc016 - Verify Priority and Category filters with full category list and count validation (DND)',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29668',
        });

        // Given the user is logged in as an App Manager (handled in beforeEach)
        // And the user navigates to Manage preferences page
        await dndManagePreferencesPage.openManagePreferencesPage();
        await dndManagePreferencesPage.verifyManagePreferencesPageIsLoaded();

        // When the user clicks on the "Filters" button
        await dndManagePreferencesPage.clickFiltersButton();

        // Then the Filters panel should be displayed
        await dndManagePreferencesPage.verifyFiltersPanelVisible();

        // And the sections "Priority" and "Category" should be visible
        await dndManagePreferencesPage.verifyButton(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.PRIORITY, 'visible');
        await dndManagePreferencesPage.verifyButton(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.CATEGORY, 'visible');

        // Verify Priority filter counts are displayed for each option
        await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.PRIORITY);
        await dndManagePreferencesPage.verifyFilterOptionsHaveCounts(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.PRIORITY_OPTIONS
        );

        // Verify Category filter counts are displayed for each option
        await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.CATEGORY);
        await dndManagePreferencesPage.verifyFilterOptionsHaveCounts(
          MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.CATEGORY_OPTIONS
        );

        // Close Filters panel before running detailed count checks
        await dndManagePreferencesPage.clickFiltersButton();

        // Helper: apply a Priority filter, verify rows + count, then reset
        const verifyPrioritySelectionAndCount = async (priorityLabel: string) => {
          await dndManagePreferencesPage.clickFiltersButton();
          await dndManagePreferencesPage.verifyFiltersPanelVisible();
          await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.PRIORITY);
          await dndManagePreferencesPage.selectFilterOption(priorityLabel);
          await dndManagePreferencesPage.verifyAllRowsHavePriority(priorityLabel);

          await dndManagePreferencesPage.clickFiltersButton();
          await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.PRIORITY);
          await dndManagePreferencesPage.verifyPriorityFilterCountMatchesVisibleRows(priorityLabel);
          await dndManagePreferencesPage.clickResetAllFilters();
          await dndManagePreferencesPage.verifyFiltersButtonDefaultState();
        };

        // Helper: apply a Category filter, verify rows + count, then reset
        const verifyCategorySelectionAndCount = async (categoryLabel: string) => {
          await dndManagePreferencesPage.clickFiltersButton();
          await dndManagePreferencesPage.verifyFiltersPanelVisible();
          await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.CATEGORY);
          await dndManagePreferencesPage.selectFilterOption(categoryLabel);
          await dndManagePreferencesPage.verifyAllRowsHaveCategory(categoryLabel);

          await dndManagePreferencesPage.clickFiltersButton();
          await dndManagePreferencesPage.expandFilterSection(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.CATEGORY);
          await dndManagePreferencesPage.verifyCategoryFilterCountMatchesVisibleRows(categoryLabel);
          await dndManagePreferencesPage.clickResetAllFilters();
          await dndManagePreferencesPage.verifyFiltersButtonDefaultState();
        };

        // Additionally verify one Priority and one Category example end‑to‑end
        await verifyPrioritySelectionAndCount(PRIORITY_DROPDOWN_OPTIONS.RECEIVE_IMMEDIATELY);
        await verifyCategorySelectionAndCount(MANAGE_PREFERENCES_CATEGORIES.PROFILE_EXPERTISE);
      }
    );
  }
);
