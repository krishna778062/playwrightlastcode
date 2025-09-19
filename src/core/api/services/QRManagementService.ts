import { APIRequestContext, expect, test } from '@playwright/test';

import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { BaseApiClient } from '../clients/baseApiClient';
import { IQRManagementOperations } from '../interfaces/IQRManagementOperations';

export class QRManagementService extends BaseApiClient implements IQRManagementOperations {
  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
  }
  deleteQRByName(qrName: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getListOfQRCodes(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  isQRCodeExists(qrName: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async createQR(qrType: 'AppPromotion' | 'Content', qrName: string, qrDescription: string): Promise<void> {
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
    } else {
      throw new Error(`Failed to get QR Type ID for QR type: ${qrType}. QR Type ID cannot be empty.`);
    }
  }

  async getContentID(): Promise<string> {
    let result: string = '';
    const payload = { term: 'te' };
    await test.step(`Get QR ID`, async () => {
      const response = await this.post(API_ENDPOINTS.qr.contentList, {
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
      const response = await this.post(API_ENDPOINTS.qr.create, {
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
      const response = await this.post(API_ENDPOINTS.qr.create, {
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
      const response = await this.put(API_ENDPOINTS.qr.create + '/' + qrCodeId, {
        data: payload,
      });
      expect(response.status()).toBe(200);
    });
  }

  async deleteQRByID(qrCodeId: string): Promise<void> {
    await test.step(`Deleting QR code with ID "${qrCodeId}" via API delete request`, async () => {
      const response = await this.delete(API_ENDPOINTS.qr.delete(qrCodeId));
      expect(response.status()).toBe(200);
    });
  }
}
