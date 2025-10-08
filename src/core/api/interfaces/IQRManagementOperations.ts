export interface IQRManagementOperations {
  createQR(qrType: 'AppPromotion' | 'Content', qrName: string, qrDescription: string): Promise<void>;
  deleteQRByID(qrCodeId: string): Promise<void>;
  deleteQRByName(qrName: string): Promise<void>;
  getListOfQRCodes(pageSize?: number): Promise<{ count: number; qrCodes: any[] }>;
  isQRCodeExists(qrName: string): Promise<boolean>;
}
