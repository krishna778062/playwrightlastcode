export interface ContentCreationData {
  title: string;
  contentType: 'page' | 'article' | 'news';
  siteName?: string;
  siteId?: string;
  coverImage?: string;
  cropSettings?: {
    widescreen: boolean;
    square: boolean;
  };
}

export interface CoverImageUpload {
  fileName: string;
  cropForWidescreen: boolean;
  cropForSquare: boolean;
}

export interface SiteSelection {
  siteName: string;
  siteId: string;
  isRecentlyUsed: boolean;
} 