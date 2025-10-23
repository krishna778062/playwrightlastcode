import { APIRequestContext, expect, test } from '@playwright/test';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { IQRManagementOperations } from '@/src/modules/frontline/apis/interfaces/IQRManagementOperations';

export class QRManagementService implements IQRManagementOperations {
  private httpClient: HttpClient;
  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }
  deleteQRByName(_qrName: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async getListOfQRCodes(pageSize: number = 16): Promise<{ count: number; qrCodes: any[] }> {
    let result: { count: number; qrCodes: any[] } = { count: 0, qrCodes: [] };
    await test.step(`Get list of QR codes with page size: ${pageSize}`, async () => {
      const response = await this.httpClient.get(API_ENDPOINTS.qr.list(pageSize));
      expect(response.status()).toBe(200);
      const json = await response.json();
      result = {
        count: json.result.count,
        qrCodes: json.result.qrCodes,
      };
    });
    return result;
  }
  isQRCodeExists(_qrName: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async createQR(qrType: 'AppPromotion' | 'Content', qrName: string, qrDescription: string): Promise<string> {
    let qrTypeID: string = '';
    if (qrType === 'AppPromotion') {
      qrTypeID = await this.getAppPromotionQRId();
    } else {
      const contentID = await this.getContentID();

      // Validate that contentID is not empty before using it
      if (!(!contentID || contentID.trim() === '')) {
        qrTypeID = await this.getContentQRId(contentID);
      } else {
        throw new Error('Failed to get Content ID. Content ID cannot be empty.');
      }
    }

    // Validate that qrTypeID is not empty before proceeding
    if (!(!qrTypeID || qrTypeID.trim() === '')) {
      await this.createQRUsingAPI(qrTypeID, qrName, qrDescription);
      return qrTypeID; // Return the QR code ID
    } else {
      throw new Error(`Failed to get QR Type ID for QR type: ${qrType}. QR Type ID cannot be empty.`);
    }
  }

  async getContentID(): Promise<string> {
    let result: string = '';
    const payload = { term: 'te' };
    await test.step(`Get QR ID`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.qr.contentList, {
        data: payload,
      });
      const json = await response.json();
      result = json.result.listOfItems[0].contentId;
    });
    return result;
  }

  async getAppPromotionQRId(): Promise<string> {
    let result: string = '';
    const payload = { source: 'management', type: 'mobile-promotion' };
    await test.step(`Get QR ID`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.qr.create, {
        data: payload,
      });
      const json = await response.json();
      result = json.result.qrCodeId;
    });
    return result;
  }

  async getContentQRId(contentID: string): Promise<string> {
    let result: string = '';
    const payload = { contentIds: [contentID], source: 'management', type: 'content' };
    await test.step(`Get QR ID`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.qr.create, {
        data: payload,
      });
      const json = await response.json();
      result = json.result.qrCodeId;
    });
    return result;
  }

  async createQRUsingAPI(qrCodeId: string, qrName: string, qrDescription: string) {
    const payload = {
      name: qrName,
      descriptionJson:
        '{"type":"doc","content":[{"type":"paragraph","attrs":{"className":"","data-sw-sid":null},"content":[{"type":"text","text":"dsdsd"}]}]}',
      descriptionHtml: '<p>' + qrDescription + '</p>',
    };
    await test.step(`Create QR Using API`, async () => {
      const response = await this.httpClient.put(API_ENDPOINTS.qr.create + '/' + qrCodeId, {
        data: payload,
      });
      expect(response.status()).toBe(200);
    });
  }

  async deleteEmailAndMobile(userID: string, empID: string, firstName: string, lastName: string) {
    const payload = {
      personal_info: {
        first_name: firstName,
        last_name: lastName,
        mobile: null,
        timezone_id: 17,
        language_id: 1,
        locale_id: 1,
        email: null,
        license_type: 'Corporate',
      },
      work_info: { department: 'QA', employee_number: empID },
      role_id: 'a8d8c6b0-8968-44a7-a034-00110cc25817',
      additional_role_id: [],
    };
    await test.step(`Delete Email and Mobile`, async () => {
      const response = await this.httpClient.put(API_ENDPOINTS.appManagement.users.delete(userID), {
        data: payload,
      });
      expect(response.status()).toBe(200);
    });
  }

  async deleteQRByID(qrCodeId: string): Promise<void> {
    await test.step(`Deleting QR code with ID "${qrCodeId}" via API delete request`, async () => {
      const response = await this.httpClient.delete(API_ENDPOINTS.qr.delete(qrCodeId));
      expect(response.status()).toBe(200);
    });
  }
}
