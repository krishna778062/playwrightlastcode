import { Activity } from '@modules/comms-planner/constants/activity';
import { CommsPlannerApiFixture } from '@modules/comms-planner/fixtures/loginFixture';

export const create = async (appManagerApiFixture: CommsPlannerApiFixture, activity: Activity) => {
  const siteId = process.env.SITE_ID;

  if (!siteId) {
    throw new Error('SITE_ID environment variable is not defined');
  }

  const { contentManagementHelper } = appManagerApiFixture;
  const { type, title, description, subType, location } = activity.content;
  const commonOptions = { contentDescription: description };

  switch (type) {
    case 'page':
      return contentManagementHelper.createPage({
        siteId,
        contentInfo: {
          contentType: type,
          contentSubType: subType || '',
        },
        options: {
          ...commonOptions,
          pageName: title,
        },
      });

    case 'album':
      return contentManagementHelper.createAlbum({
        siteId,
        imageName: 'beach.jpg',
        options: {
          ...commonOptions,
          albumName: title,
        },
      });

    case 'event':
      return contentManagementHelper.createEvent({
        siteId,
        contentInfo: {
          contentType: 'event',
        },
        options: {
          ...commonOptions,
          eventName: title,
          location,
        },
      });
  }
};
