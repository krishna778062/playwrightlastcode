export interface IImageUploaderService {
    getSignedUploadUrl(payload: any): Promise<any>;
    uploadFileToSignedUrl(uploadUrl: string, filePath: string, fileName: string): Promise<any>;
    uploadImageAndGetFileId(fileName: string): Promise<string>;
  } 