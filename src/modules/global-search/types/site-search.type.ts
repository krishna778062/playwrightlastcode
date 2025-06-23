export interface SiteSearchTestData {
  siteType: 'public' | 'private';
  term: string;
  category: string;
  label: string;
}

// export interface SiteSearchResult {
//   term: string;
//   category: string;
//   siteType: 'public' | 'private';
//   thumbnail?: string;
//   siteIcon?: string;
//   copyLinkButton?: boolean;
//   lockIcon?: boolean;
//   description?: string;
//   label?: string;
// }

// export interface SiteSearchTestScenario {
//   siteType: 'public' | 'private';
//   term: string;
//   category: string;
//   expectedLockIcon: boolean;
//   expectedThumbnail: boolean;
//   expectedSiteLabel: boolean;
//   expectedCopyLink: boolean;
//   expectedLabel: string;
// }
