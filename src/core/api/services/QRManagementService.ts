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
  createQR(qrCodeId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async deleteQRByID(qrCodeId: string): Promise<void> {
    await test.step(`Deleting QR code with ID "${qrCodeId}" via API delete request`, async () => {
      const response = await this.delete(API_ENDPOINTS.qr.delete(qrCodeId));
      expect(response.status()).toBe(200);
    });
  }
}
