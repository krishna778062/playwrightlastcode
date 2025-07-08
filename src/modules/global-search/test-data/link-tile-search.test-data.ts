import { faker } from '@faker-js/faker';
import { LinkTilePayload } from '../../../core/types/tile.type';

export interface LinkTileSearchTestCase {
  dashboardId: string;
  tileTitle: string;
  expectedLinksCount: number;
  hasPlaywrightLink: boolean;
  hasGoogleLink: boolean;
}

export const LINK_TILE_SEARCH_TEST_DATA: LinkTileSearchTestCase = {
  dashboardId: 'site',
  tileTitle: `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Resources`,
  expectedLinksCount: 3,
  hasPlaywrightLink: true,
  hasGoogleLink: true,
};

// Predefined link templates for consistent testing
export const PREDEFINED_LINKS = [
  {
    text: faker.lorem.words(3),
    url: 'https://playwright.dev/',
    oembed: {
      provider_url: '',
      cache_age: 86400,
      width: 0,
      height: 0,
      html: '',
      url: 'https://playwright.dev/',
      thumbnail_width: 1280,
      duration: 0,
      version: '1.0',
      title: faker.lorem.words(3),
      provider_name: '',
      type: 'link',
      thumbnail_height: 640,
      author_url: '',
      thumbnail_url: 'https://repository-images.githubusercontent.com/221981891/8c5c6942-c91f-4df1-825f-4df474056bd7',
      description: 'Cross-browser end-to-end testing for modern web apps',
      author_name: '',
    },
  },
  {
    text: '',
    url: 'https://www.google.com/',
    oembed: {
      provider_url: '',
      cache_age: 86400,
      width: 0,
      height: 0,
      html: '',
      url: 'https://www.google.com/',
      thumbnail_width: 0,
      duration: 0,
      version: '',
      title: '',
      provider_name: '',
      type: 'UNSUPPORTED',
      thumbnail_height: 0,
      author_url: '',
      thumbnail_url: '',
      description: '',
      author_name: '',
    },
  },
  {
    text: faker.lorem.words(2),
    url: 'https://github.com/',
    oembed: {
      provider_url: '',
      cache_age: 86400,
      width: 0,
      height: 0,
      html: '',
      url: 'https://github.com/',
      thumbnail_width: 1200,
      duration: 0,
      version: '1.0',
      title: faker.lorem.words(2),
      provider_name: '',
      type: 'link',
      thumbnail_height: 630,
      author_url: '',
      thumbnail_url: 'https://github.githubassets.com/images/modules/site/social-cards/github-social.png',
      description: 'GitHub is where over 100 million developers shape the future of software, together.',
      author_name: '',
    },
  },
  {
    text: faker.lorem.words(2),
    url: 'https://www.stackoverflow.com/',
    oembed: {
      provider_url: '',
      cache_age: 86400,
      width: 0,
      height: 0,
      html: '',
      url: 'https://www.stackoverflow.com/',
      thumbnail_width: 1200,
      duration: 0,
      version: '1.0',
      title: faker.lorem.words(2),
      provider_name: '',
      type: 'link',
      thumbnail_height: 630,
      author_url: '',
      thumbnail_url: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon@2.png',
      description:
        'Stack Overflow is the largest, most trusted online community for developers to learn, share their programming knowledge, and build their careers.',
      author_name: '',
    },
  },
];

export const getLinkTilePayload = (
  siteId: string,
  tileTitle: string,
  linksCount: number = LINK_TILE_SEARCH_TEST_DATA.expectedLinksCount
): LinkTilePayload => {
  // Ensure we don't exceed the predefined links count
  const actualLinksCount = Math.min(linksCount, PREDEFINED_LINKS.length);

  return {
    siteId: siteId,
    dashboardId: 'site',
    tile: {
      title: tileTitle,
      options: {
        layout: 'standard',
        links: PREDEFINED_LINKS.slice(0, actualLinksCount),
      },
      pushToAllHomeDashboards: false,
      items: [],
      type: 'links',
      variant: 'custom',
    },
    isNewTiptap: false,
  };
};

export const TILE_NUMBER_OF_LINKS = [2, 4];
