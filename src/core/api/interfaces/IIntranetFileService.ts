export interface IIntranetFileService {
    uploadFileAndGetId(
      siteId: string,
      fileName: string,
      filePath: string,
      mimeType: string
    ): Promise<{ fileId: string; authorName: string }>;
  } 