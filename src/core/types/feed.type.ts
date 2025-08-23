/**
 * @description Interface for feed
 * @export
 * @interface Feed
 */
export interface Feed {
  textJson: string;
  textHtml: string;
  scope: string;
  siteId: string | null;
  listOfAttachedFiles: any[];
  ignoreToxic: boolean;
  type: string;
  variant: string;
}
