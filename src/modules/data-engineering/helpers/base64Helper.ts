/**
 * Helper functions for Base64 encoding and decoding
 * Similar to Java's Base64.getDecoder().decode() functionality
 */

/**
 * Decodes a Base64 encoded string to UTF-8 string
 * @param encodedString - The Base64 encoded string
 * @returns The decoded UTF-8 string
 */
export function decodeBase64(encodedString: string): string {
  const buffer = Buffer.from(encodedString, 'base64');
  return buffer.toString('utf-8');
}

/**
 * Encodes a UTF-8 string to Base64
 * @param plainString - The plain UTF-8 string
 * @returns The Base64 encoded string
 */
export function encodeBase64(plainString: string): string {
  const buffer = Buffer.from(plainString, 'utf-8');
  return buffer.toString('base64');
}
