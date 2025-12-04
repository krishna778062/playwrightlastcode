export interface ICarouselOperations {
  getHomeCarouselItems(): Promise<any>;
  getSiteCarouselItems(siteId: string): Promise<any>;
  addHomeCarouselItem(contentId: string, itemType?: string): Promise<any>;
  addSiteCarouselItem(siteId: string, contentId: string, itemType?: string): Promise<any>;
  deleteHomeCarouselItem(carouselItemId: string): Promise<any>;
  deleteSiteCarouselItem(siteId: string, carouselItemId: string): Promise<any>;
}
