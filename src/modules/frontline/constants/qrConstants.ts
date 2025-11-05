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
  TEXT_BELOW_QR_CODES_POPUP_HEADING:
    'Download the QR code and share it with your frontline audiences for seamless access, guided by the access controls you’ve configured.',
  HELP_TEXT_BELOW_QR_NAME_FIELD: 'Name your QR code to make it easier to identify and manage later.',
  HELP_TEXT_BELOW_DESCRIPTION_FIELD: 'Give your QR code some instructions so users understand the purpose behind it.',
  HELP_TEXT_BELOW_VALID_TILL_FIELD:
    'Set a validity period for this QR code. Once it expires, anyone who scans it will be unable to access the content.',
  TEXT_BELOW_PREVIEW_QR_CODE_POPUP_HEADING: "You're previewing the QR code as it will appear when printed or shared.",
} as const;

export type QRMessage = (typeof QR_MESSAGES)[keyof typeof QR_MESSAGES];
