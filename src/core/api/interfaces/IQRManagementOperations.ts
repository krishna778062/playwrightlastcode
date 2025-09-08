export interface IQRManagementOperations {
  createQR(QRType: 'AppPromotion' | 'Content', qrName: string, qrDescription: string): Promise<void>;
  deleteQRByID(qrCodeId: string): Promise<void>;
  deleteQRByName(qrName: string): Promise<void>;
  getListOfQRCodes(): Promise<any>;
  isQRCodeExists(qrName: string): Promise<boolean>;
}
