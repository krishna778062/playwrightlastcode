export interface PageCreationPayload {
  contentSubType: string;
  listOfFiles: any[];
  publishAt: string;
  body: string;
  imgCaption: string;
  publishingStatus: string;
  bodyHtml: string;
  imgLayout: string;
  title: string;
  language: string;
  isFeedEnabled: boolean;
  listOfTopics: any[];
  category: {
    id: string;
    name: string;
  };
  contentType: string;
  isNewTiptap: boolean;
}
