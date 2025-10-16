/**
 * Constants for QR code operations used in frontline tests
 */
export const QR_CONSTANTS = {
  DOWNLOAD_DIR: 'test-results/downloads',
  SUPPORTED_IMAGE_FORMATS: ['.png', '.jpg', '.jpeg'],
  SUPPORTED_PDF_FORMATS: ['.pdf'],
  // PDF processing constants
  PDF_DENSITY: 300,
  PDF_WIDTH: 2000,
  PDF_HEIGHT: 2000,
  // File validation constants
  PDF_HEADER: '%PDF-',
  PDF_HEADER_LENGTH: 8,
} as const;

export type QRConstant = (typeof QR_CONSTANTS)[keyof typeof QR_CONSTANTS];
/**
 * Constants for QR code messages used in frontline tests
 */
export const QR_MESSAGES = {
  ADD_CONTENT_DESCRIPTION:
    'Select the intranet content to link to this QR code. Users can scan the code for quick access to the content. Pages from private sites will remain accessible only to their site members.',
  CONTENT_SEARCH_BOX_TEXT: 'Unlisted site content cannot be added',
  TOGGLE_POPUP_TEXT:
    'QR codes promoting the mobile app cannot be marked disabled as they are directly mapped with App/Play store links.',
  SUCCESSFULLY_UPDATED_QR_CODE: 'Successfully updated QR code',
} as const;

export type QRMessage = (typeof QR_MESSAGES)[keyof typeof QR_MESSAGES];
