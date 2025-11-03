/**
 * Constants for QR search terms used in frontline tests
 */
export const QR_SEARCH_TERMS = {
  VALID_SEARCH: 'automation',
  INVALID_SEARCH: 'nowhere',
  EMPTY_SEARCH: '',
} as const;

export type QRSearchTerm = (typeof QR_SEARCH_TERMS)[keyof typeof QR_SEARCH_TERMS];
