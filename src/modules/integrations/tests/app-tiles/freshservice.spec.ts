import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FIELD_NAMES, UI_ACTIONS } from '../../constants/common';

import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import {
  CONNECTOR_IDS,
  REDIRECT_URLS,
  STATUS_VALUES,
  TILE_IDS,
} from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe(
  'freshservice App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.FRESHSERVICE, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'FreshService';
    const TicketsSubmittedByMe = 'Display tickets submitted by me';
    const UnassignedTickets = 'Display unassigned tickets';

    let createdTileTitle: string | undefined = undefined;

    test.afterEach(async ({ appManagerFixture }) => {
      const { tileManagementHelper, homeDashboard } = appManagerFixture;
      if (createdTileTitle) {
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'create and edit FreshService Tickets Submitted by Me tile on home dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24697'],
          storyId: 'INT-23629',
        });

        createdTileTitle = `FreshService Tickets Submitted by Me ${faker.string.alphanumeric({ length: 6 })}`;

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.FRESHSERVICE_DISPLAY_TICKETS_SUBMITTED_BY_ME,
          CONNECTOR_IDS.FRESHSERVICE
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTile(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );

    test(
      'create and verify metadata for FreshService Tickets Submitted by Me tile on home dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24690'],
          storyId: 'INT-23629',
        });
        createdTileTitle = `FreshService Tickets Submitted by Me ${faker.string.alphanumeric({ length: 6 })}`;

        // Using tileId instead of connectorId to create specific FreshService tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.FRESHSERVICE_DISPLAY_TICKETS_SUBMITTED_BY_ME,
          CONNECTOR_IDS.FRESHSERVICE
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(createdTileTitle);
        await homeDashboard.verifyFreshserviceTicketsSubmittedByMe(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.FRESHSERVICE);
      }
    );

    test(
      'create and edit FreshService Unassigned Tickets tile on home dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24695'],
          storyId: 'INT-23629',
        });

        createdTileTitle = `FreshService Unassigned Tickets ${faker.string.alphanumeric({ length: 6 })}`;

        // Using tileId instead of connectorId to create specific FreshService tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.FRESHSERVICE_DISPLAY_UNASSIGNED_TICKETS,
          CONNECTOR_IDS.FRESHSERVICE
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTile(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );

    test(
      'create and verify metadata for FreshService Unassigned Tickets tile on home dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24687',
          storyId: 'INT-23629',
        });

        // Create HomeDashboard with tileManagementHelper
        createdTileTitle = `FreshService Unassigned Tickets ${faker.string.alphanumeric({ length: 6 })}`;

        // Using tileId instead of connectorId to create specific FreshService tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.FRESHSERVICE_DISPLAY_UNASSIGNED_TICKETS,
          CONNECTOR_IDS.FRESHSERVICE
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(createdTileTitle);
        await homeDashboard.verifyFreshserviceUnassignedTickets(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.FRESHSERVICE);
      }
    );

    test(
      'verify site manager is able to edit and remove a FreshService Unassigned Tickets tile on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24698', 'INT-24688'],
          storyId: 'INT-23629',
        });

        //Generate a random tile title
        createdTileTitle = `FreshService Unassigned Tickets ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, UnassignedTickets, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyFreshserviceUnassignedTickets(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.FRESHSERVICE);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await siteDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
        await siteDashboard.removeTile(updatedTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify site manager is able to edit and remove a FreshService Tickets Submitted by Me tile on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24699', 'INT-24689'],
          storyId: 'INT-23629',
        });

        //Generate a random tile title
        createdTileTitle = `FreshService Tickets Submitted by Me ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, TicketsSubmittedByMe, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await siteDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(updatedTileTitle);
        await siteDashboard.verifyFreshserviceTicketsSubmittedByMe(updatedTileTitle);
        await siteDashboard.verifyTileRedirects(updatedTileTitle, REDIRECT_URLS.FRESHSERVICE);
        createdTileTitle = updatedTileTitle;
        await siteDashboard.removeTile(updatedTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify show more behavior for FreshService Tickets Submitted by Me tile on home dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24693',
          storyId: 'INT-22854',
        });
        createdTileTitle = `FreshService Tickets Submitted by Me ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.FRESHSERVICE_DISPLAY_TICKETS_SUBMITTED_BY_ME,
          CONNECTOR_IDS.FRESHSERVICE
        );
        await homeDashboard.isTilePresent(createdTileTitle);

        // verify first 4 tickets and then click on show more button and verify all tickets are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
        await homeDashboard.verifyFreshserviceTicketsSubmittedByMe(createdTileTitle);
      }
    );

    test(
      'verify show more behavior for FreshService Unassigned Tickets tile on home dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24691',
          storyId: 'INT-22854',
        });
        createdTileTitle = `FreshService Unassigned Tickets ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.FRESHSERVICE_DISPLAY_UNASSIGNED_TICKETS,
          CONNECTOR_IDS.FRESHSERVICE
        );
        await homeDashboard.isTilePresent(createdTileTitle);

        // verify first 4 tickets and then click on show more button and verify all tickets are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
        await homeDashboard.verifyFreshserviceUnassignedTickets(createdTileTitle);
      }
    );

    test(
      'verify show more behavior for FreshService Tickets Submitted by Me tile on site dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-29144',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `FreshService Tickets Submitted by Me ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and verify tile
        await siteDashboard.addTile(createdTileTitle, AppName, TicketsSubmittedByMe, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify show more behavior
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        await siteDashboard.verifyFreshserviceTicketsSubmittedByMe(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify show more behavior for FreshService Unassigned Tickets tile on site dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-29144',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `FreshService Unassigned Tickets ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and verify tile
        await siteDashboard.addTile(createdTileTitle, AppName, UnassignedTickets, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify show more behavior
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        await siteDashboard.verifyFreshserviceUnassignedTickets(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify personalize button functionality for FreshService Tickets Submitted by Me tile on home dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-25876',
          storyId: 'INT-22854',
        });

        // Create HomeDashboard with tileManagementHelper
        createdTileTitle = `FreshService Tickets Submitted by Me ${faker.string.alphanumeric({ length: 6 })}`;

        await homeDashboard.addTilewithPersonalizeSingleField(
          createdTileTitle,
          AppName,
          TicketsSubmittedByMe,
          FIELD_NAMES.STATUS
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
        await homeDashboard.PersonalizeTile(createdTileTitle, FIELD_NAMES.STATUS, STATUS_VALUES.OPEN);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyStatusTag(createdTileTitle, STATUS_VALUES.OPEN);
      }
    );

    test(
      'verify personalize button functionality for FreshService Unassigned Tickets tile on home dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-25875',
          storyId: 'INT-22854',
        });

        // Create HomeDashboard with tileManagementHelper
        createdTileTitle = `FreshService Unassigned Tickets ${faker.string.alphanumeric({ length: 6 })}`;

        await homeDashboard.addTilewithPersonalizeSingleField(
          createdTileTitle,
          AppName,
          UnassignedTickets,
          FIELD_NAMES.STATUS
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
        await homeDashboard.PersonalizeTile(createdTileTitle, FIELD_NAMES.STATUS, STATUS_VALUES.OPEN);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyStatusTag(createdTileTitle, STATUS_VALUES.OPEN);
      }
    );

    test(
      'verify personalize button functionality for FreshService Tickets Submitted by Me tile on site dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-29145',
          storyId: 'INT-22854',
        });

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Create SiteDashboard with personalize functionality
        createdTileTitle = `FreshService Tickets Submitted by Me ${faker.string.alphanumeric({ length: 6 })}`;

        await siteDashboard.addTilewithPersonalizeSingleField(
          createdTileTitle,
          AppName,
          TicketsSubmittedByMe,
          FIELD_NAMES.STATUS
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyPersonalizeVisible(createdTileTitle);
        await siteDashboard.PersonalizeTile(createdTileTitle, FIELD_NAMES.STATUS, STATUS_VALUES.OPEN);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyStatusTag(createdTileTitle, STATUS_VALUES.OPEN);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify personalize button functionality for FreshService Unassigned Tickets tile on site dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-29146',
          storyId: 'INT-22854',
        });

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Create SiteDashboard with personalize functionality
        createdTileTitle = `FreshService Unassigned Tickets ${faker.string.alphanumeric({ length: 6 })}`;

        await siteDashboard.addTilewithPersonalizeSingleField(
          createdTileTitle,
          AppName,
          UnassignedTickets,
          FIELD_NAMES.STATUS
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyPersonalizeVisible(createdTileTitle);
        await siteDashboard.PersonalizeTile(createdTileTitle, FIELD_NAMES.STATUS, STATUS_VALUES.OPEN);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyStatusTag(createdTileTitle, STATUS_VALUES.OPEN);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify Personalize button is visible when clicked on Show more for FreshService Tickets Submitted by Me tile on home dashboard',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-29147',
          storyId: 'INT-24422',
        });

        //Generate a random tile title
        createdTileTitle = `FreshService Tickets Submitted by Me ${faker.string.alphanumeric({ length: 6 })}`;
        await homeDashboard.addTilewithPersonalize(
          createdTileTitle,
          AppName,
          TicketsSubmittedByMe,
          FIELD_NAMES.STATUS,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
      }
    );

    test(
      'verify Personalize button is visible when clicked on Show more for FreshService Unassigned Tickets tile on home dashboard',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-29148',
          storyId: 'INT-24422',
        });

        //Generate a random tile title
        createdTileTitle = `FreshService Unassigned Tickets ${faker.string.alphanumeric({ length: 6 })}`;
        await homeDashboard.addTilewithPersonalize(
          createdTileTitle,
          AppName,
          UnassignedTickets,
          FIELD_NAMES.STATUS,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
      }
    );

    test(
      'verify App Admin is able to add FreshService tile on Home Dashboard with App Manager Defined for Status and user editable toggle on for Tickets Submitted by Me',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-25878'],
          storyId: 'INT-24587',
        });

        //Generate a random tile title
        createdTileTitle = `FreshService Tickets Submitted by Me ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addFreshServiceWithOptionsEnableToggle(
          createdTileTitle,
          AppName,
          TicketsSubmittedByMe,
          UI_ACTIONS.ADD_TO_HOME,
          FIELD_NAMES.STATUS,
          STATUS_VALUES.OPEN
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
        await homeDashboard.verifyStatusTag(createdTileTitle, STATUS_VALUES.OPEN);
        await homeDashboard.verifyFreshserviceTicketsSubmittedByMe(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.FRESHSERVICE);
        await homeDashboard.PersonalizeTile(createdTileTitle, FIELD_NAMES.STATUS, STATUS_VALUES.CLOSED);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyStatusTag(createdTileTitle, STATUS_VALUES.CLOSED);
      }
    );

    test(
      'verify App Admin is able to add FreshService tile on Site Dashboard with Site Manager Defined for Status and Priority and user editable toggle on for Tickets Submitted by Me',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-25879'],
          storyId: 'INT-24587',
        });

        //Generate a random tile title
        createdTileTitle = `FreshService Tickets Submitted by Me ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add,personalize,edit,verify
        await siteDashboard.addFreshServiceWithOptionsEnableToggle(
          createdTileTitle,
          AppName,
          TicketsSubmittedByMe,
          UI_ACTIONS.ADD_TO_SITE,
          FIELD_NAMES.STATUS,
          STATUS_VALUES.OPEN
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyPersonalizeVisible(createdTileTitle);
        await siteDashboard.verifyStatusTag(createdTileTitle, STATUS_VALUES.OPEN);
        await siteDashboard.verifyFreshserviceTicketsSubmittedByMe(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.FRESHSERVICE);
        await siteDashboard.PersonalizeTile(createdTileTitle, FIELD_NAMES.STATUS, STATUS_VALUES.CLOSED);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyStatusTag(createdTileTitle, STATUS_VALUES.CLOSED);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify App Admin is able to add FreshService tile on Home Dashboard with App Manager Defined for Status and user editable toggle on for Unassigned Tickets',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-25877'],
          storyId: 'INT-24587',
        });

        //Generate a random tile title
        createdTileTitle = `FreshService Unassigned Tickets ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addFreshServiceWithOptionsEnableToggle(
          createdTileTitle,
          AppName,
          UnassignedTickets,
          UI_ACTIONS.ADD_TO_HOME,
          FIELD_NAMES.STATUS,
          STATUS_VALUES.OPEN
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
        await homeDashboard.verifyStatusTag(createdTileTitle, STATUS_VALUES.OPEN);
        await homeDashboard.verifyFreshserviceUnassignedTickets(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.FRESHSERVICE);
        await homeDashboard.PersonalizeTile(createdTileTitle, FIELD_NAMES.STATUS, STATUS_VALUES.CLOSED);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyStatusTag(createdTileTitle, STATUS_VALUES.CLOSED);
      }
    );

    test(
      'verify App Admin is able to add FreshService tile on Site Dashboard with Site Manager Defined for Status and Priority and user editable toggle on for Unassigned Tickets',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-25880'],
          storyId: 'INT-24587',
        });

        //Generate a random tile title
        createdTileTitle = `FreshService Unassigned Tickets ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add,personalize,edit,verify
        await siteDashboard.addFreshServiceWithOptionsEnableToggle(
          createdTileTitle,
          AppName,
          UnassignedTickets,
          UI_ACTIONS.ADD_TO_SITE,
          FIELD_NAMES.STATUS,
          STATUS_VALUES.OPEN
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyPersonalizeVisible(createdTileTitle);
        await siteDashboard.verifyStatusTag(createdTileTitle, STATUS_VALUES.OPEN);
        await siteDashboard.verifyFreshserviceUnassignedTickets(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.FRESHSERVICE);
        await siteDashboard.PersonalizeTile(createdTileTitle, FIELD_NAMES.STATUS, STATUS_VALUES.CLOSED);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyStatusTag(createdTileTitle, STATUS_VALUES.CLOSED);
        createdTileTitle = undefined;
      }
    );
  }
);
