import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

interface FileContent {
  siteId: string;
  fileId: string;
}

export class IntranetFileHelper {
  private content: FileContent[] = [];

  constructor(private appManagerApiClient: AppManagerApiClient) {}

  /**
   * Creates a new site and uploads a file to it.
   * @param siteName - The name for the new site.
   * @param category - The site category object, containing name and categoryId.
   * @returns An object containing details of the uploaded file and site.
   */
  async createFile(
    siteName: string,
    category: { name: string; categoryId: string },
    fileName: string,
    mimeType: string,
    fileType: string
  ) {
    const siteResult = await this.appManagerApiClient.getSiteManagementService().addNewSite({
      access: 'public',
      name: siteName,
      category: {
        categoryId: category.categoryId,
        name: category.name,
      },
    });
    const siteId = siteResult.siteId;

    const randomNum = Math.floor(Math.random() * 1000000 + 1);
    const uniqueFileName = `File_Test_${randomNum}`;
    const uniqueFileNameWithExt = `${uniqueFileName}.${fileType}`;
    const filePath = `${API_ENDPOINTS.fileUpload.albumImg}/${fileName}`;

    const fileResult = await this.appManagerApiClient
      .getIntranetFileService()
      .uploadFileAndGetId(siteId, uniqueFileNameWithExt, filePath, mimeType);

    await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
      this.appManagerApiClient,
      uniqueFileNameWithExt,
      uniqueFileNameWithExt,
      'file'
    );

    const createdContent = {
      siteId,
      fileId: fileResult.fileId,
      fileName: uniqueFileNameWithExt,
      authorName: fileResult.authorName,
    };
    this.content.push({ siteId, fileId: fileResult.fileId });

    return createdContent;
  }

  /**
   * Cleans up all files and sites created by this helper instance.
   */
  async cleanup() {
    for (const { siteId } of this.content) {
      if (siteId) {
        await this.appManagerApiClient.getSiteManagementService().deactivateSite(siteId);
      }
    }
  }
} 