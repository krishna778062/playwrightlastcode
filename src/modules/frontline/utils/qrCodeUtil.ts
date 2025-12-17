import { QR_CONSTANTS } from '@frontline/constants/qrConstants';
import { Jimp } from 'jimp';
import jsQR from 'jsqr';
import * as path from 'path';
import { fromPath } from 'pdf2pic';

import { FileUtil } from '@core/utils/fileUtil';
import { PlaywrightAction, PlaywrightErrorHandler } from '@core/utils/playwrightErrorHandler';

/**
 * Utility class for QR code processing operations in frontline module
 * Handles QR code scanning, PDF extraction, and validation
 * Specifically designed for frontline QR code functionality
 */
export class QRCodeUtil {
  /**
   * Scans a QR code from an image file
   * @param imagePath - Path to the image file containing the QR code
   * @returns Promise with the QR code content as string
   * @throws Error if QR code cannot be scanned
   */
  static async scanQRCode(imagePath: string): Promise<string> {
    try {
      // Verify file exists using FileUtil
      if (!FileUtil.fileExists(imagePath)) {
        throw new Error(`QR code image not found: ${imagePath}`);
      }

      // Read and process image
      const image = await Jimp.read(imagePath);
      const { width, height, data } = image.bitmap;

      // Decode QR code using jsQR
      const qr = jsQR(new Uint8ClampedArray(data), width, height);

      if (!qr?.data) {
        throw new Error('No QR code found in the image');
      }

      console.log(`QR code content extracted: ${qr.data}`);
      return qr.data;
    } catch (error) {
      throw PlaywrightErrorHandler.handle(error, PlaywrightAction.SCAN, 'QR code');
    }
  }

  /**
   * Extracts QR code from a PDF file by converting to image
   * @param pdfPath - Path to the PDF file
   * @param qrName - Name of the QR code for file naming
   * @returns Promise with the extracted image path
   * @throws Error if extraction fails
   */
  static async extractQRCodeFromPDF(pdfPath: string, qrName: string): Promise<string> {
    try {
      // Create output directory for extracted images
      const outputDir = path.join(process.cwd(), QR_CONSTANTS.DOWNLOAD_DIR, 'extracted');
      FileUtil.createDir(outputDir);

      // Convert PDF to images
      const convert = fromPath(pdfPath, {
        density: QR_CONSTANTS.PDF_DENSITY,
        saveFilename: qrName,
        savePath: outputDir,
        format: 'png',
        width: QR_CONSTANTS.PDF_WIDTH,
        height: QR_CONSTANTS.PDF_HEIGHT,
      });

      // Convert all pages to images
      const results = await convert.bulk(-1, { responseType: 'image' });

      if (!results || results.length === 0) {
        throw new Error('No pages found in PDF');
      }

      // Return the first extracted image path
      if (results.length > 0 && results[0].path) {
        console.log(`QR code extracted from PDF to: ${results[0].path}`);
        return results[0].path;
      }

      throw new Error('No QR code found in any page of the PDF');
    } catch (error) {
      throw PlaywrightErrorHandler.handle(error, PlaywrightAction.SCAN, 'QR code from PDF');
    }
  }

  /**
   * Checks if a file is a PDF by reading the file header
   * @param filePath - Path to the file to check
   * @returns Promise with boolean indicating if file is PDF
   */
  static async isPDFFile(filePath: string): Promise<boolean> {
    try {
      const fs = require('fs');
      const buffer = fs.readFileSync(filePath);
      // PDF files start with %PDF-1.
      const header = buffer.toString('ascii', 0, QR_CONSTANTS.PDF_HEADER_LENGTH);
      return header.startsWith(QR_CONSTANTS.PDF_HEADER);
    } catch (error) {
      console.log(`Error checking PDF file type: ${error}`);
      return false;
    }
  }

  /**
   * Validates QR code content format
   * @param content - QR code content to validate
   * @returns boolean indicating if content is valid
   */
  static validateQRContent(content: string): boolean {
    if (!content || typeof content !== 'string') {
      return false;
    }

    // Basic validation - could be enhanced based on requirements
    return content.length > 0 && content.trim().length > 0;
  }

  /**
   * Processes a downloaded file and extracts QR code if needed
   * @param filePath - Path to the downloaded file
   * @param qrName - Name of the QR code
   * @returns Promise with the final image path for QR scanning
   */
  static async processDownloadedFile(filePath: string, qrName: string): Promise<string> {
    console.log(`Processing downloaded file: ${filePath}`);
    console.log(`File extension: ${path.extname(filePath)}`);

    // Check if the downloaded file is a PDF
    const isPDF = await this.isPDFFile(filePath);
    console.log(`Is PDF file: ${isPDF}`);

    if (isPDF) {
      console.log(`PDF downloaded successfully: ${filePath}`);
      // Extract QR code from PDF and return the extracted image path
      return await this.extractQRCodeFromPDF(filePath, qrName);
    } else {
      console.log(`QR image downloaded successfully: ${filePath}`);
      return filePath;
    }
  }
}
