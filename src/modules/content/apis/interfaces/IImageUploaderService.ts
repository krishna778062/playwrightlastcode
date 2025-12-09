export interface IImageUploaderService {
  getSignedUploadUrl(payload: any): Promise<any>;
  uploadFileToSignedUrl(uploadUrl: string, filePath: string, fileName: string): Promise<any>;
  uploadImageAndGetFileId(fileName: string): Promise<string>;
  uploadIntranetFile(
    siteId: string,
    fileName: string,
    filePath: string,
    mimeType: string
  ): Promise<{
    fileInfo: any;
  }>;
  deleteIntranetFile(
    fileId: string,
    siteId: string,
    provider?: string
  ): Promise<{
    status: string;
    message: string;
    listOfFileIds: string[];
  }>;
}
