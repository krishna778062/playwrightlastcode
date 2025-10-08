/**
 * Constants for QR code operations used in frontline tests
 */
export const QR_CONSTANTS = {
  DOWNLOAD_DIR: 'test-results/downloads',
  SUPPORTED_IMAGE_FORMATS: ['.png', '.jpg', '.jpeg'],
  SUPPORTED_PDF_FORMATS: ['.pdf'],
} as const;

export type QRConstant = (typeof QR_CONSTANTS)[keyof typeof QR_CONSTANTS];
