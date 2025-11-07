import fs from 'fs';
import Papa from 'papaparse';

// Define interface for CSV row data
interface CSVRow {
  [key: string]: string | number | boolean;
}

// Define interface for report-style CSV metadata
interface CSVReportMetadata {
  title: string;
  dateRange: string;
  createdOn: string;
  headers: string[];
  dataStartRow: number;
}

export class CSVUtils {
  /**
   * Get the title from a report CSV file (Line 1)
   * @param csvPath - Path to the CSV file
   * @returns The title string
   */
  public static getReportTitleFromCSV(csvPath: string): string {
    const lines = this.getCSVLines(csvPath);
    return lines[0] || '';
  }

  /**
   * Get the date range from a report CSV file (Line 2)
   * @param csvPath - Path to the CSV file
   * @returns The date range string
   */
  public static getReportDateRangeFromCSV(csvPath: string): string {
    const lines = this.getCSVLines(csvPath);
    return lines[1] || '';
  }

  /**
   * Get the created date from a report CSV file (Line 3)
   * @param csvPath - Path to the CSV file
   * @returns The created date string
   */
  public static getReportCreatedDateFromCSV(csvPath: string): string {
    const lines = this.getCSVLines(csvPath);
    return lines[2] || '';
  }

  /**
   * Get metadata from a report CSV file (Lines 1-3: title, date range, created date)
   * @param csvPath - Path to the CSV file
   * @returns Object containing title, dateRange, and createdOn
   */
  public static getReportMetadataFromCSV(csvPath: string): {
    title: string;
    dateRange: string;
    createdOn: string;
  } {
    const lines = this.getCSVLines(csvPath);

    if (lines.length < 3) {
      throw new Error(`CSV file has insufficient lines for metadata - expected at least 3 lines, got ${lines.length}`);
    }

    return {
      title: lines[0] || '',
      dateRange: lines[1] || '',
      createdOn: lines[2] || '',
    };
  }

  /**
   * Get the headers from a report CSV file (Line 4)
   * @param csvPath - Path to the CSV file
   * @returns Array of header strings
   */
  public static getHeadersFromReportCSV(csvPath: string): string[] {
    const lines = this.getCSVLines(csvPath);

    if (lines.length < 4) {
      throw new Error(`CSV file has insufficient lines - expected at least 4 lines, got ${lines.length}`);
    }

    const headerLine = lines[3]; // Line 4 (0-indexed)
    if (!headerLine?.includes(',')) {
      throw new Error(`Line 4 does not contain valid headers: "${headerLine}"`);
    }

    console.log(`Debug: Headers found at line 4: [${headerLine}]`);
    console.log(
      `Debug: Headers split: [${headerLine
        .split(',')
        .map(h => h.trim())
        .join(', ')}]`
    );
    return headerLine.split(',').map(h => h.trim());
  }

  /**
   * Get the data records from a report CSV file (Lines 5+)
   * @param csvPath - Path to the CSV file
   * @returns Array of data records
   */
  public static getDataRecordsFromReportCSV(csvPath: string): CSVRow[] {
    const lines = this.getCSVLines(csvPath);

    if (lines.length < 5) {
      return []; // No data records
    }

    // Create CSV content starting from headers (Line 4)
    const csvDataLines = lines.slice(3); // From line 4 onwards
    const csvDataContent = csvDataLines.join('\n');

    // Parse the data portion
    const parseResult = Papa.parse<CSVRow>(csvDataContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimiter: ',',
    });

    // Check for parsing errors
    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing errors:', parseResult.errors);
      parseResult.errors.forEach((error: any, index: number) => {
        console.warn(`CSV Error ${index + 1}:`, error.message, `at row ${error.row}`);
      });
    }

    return parseResult.data;
  }

  /**
   * Helper method to get CSV lines with validation
   * @param csvPath - Path to the CSV file
   * @returns Array of trimmed lines
   */
  private static getCSVLines(csvPath: string): string[] {
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    return fileContent.split('\n').map(line => line.trim());
  }

  /**
   * Parse report-style CSV with metadata (title, date range, created date, then headers)
   * @param csvPath - Path to the CSV file to parse
   * @returns Object containing metadata and parsed data
   */
  public static async parseReportCSV(csvPath: string): Promise<{
    metadata: CSVReportMetadata;
    data: CSVRow[];
  }> {
    // Debug: Log all lines to understand the structure
    console.log(`Debug: Parsing CSV file from path: ${csvPath}`);
    const lines = this.getCSVLines(csvPath);
    console.log('=== CSV File Structure Debug ===');
    console.log(`Total lines: ${lines.length}`);
    lines.forEach((line, index) => {
      console.log(`Line ${index + 1}: "${line}"`);
    });
    console.log('===============================');

    // Use the dedicated methods
    const metadata = this.getReportMetadataFromCSV(csvPath);
    const headers = this.getHeadersFromReportCSV(csvPath);
    const data = this.getDataRecordsFromReportCSV(csvPath);

    console.log(`Found headers at line 4: [${headers.join(', ')}]`);

    return {
      metadata: {
        title: metadata.title,
        dateRange: metadata.dateRange,
        createdOn: metadata.createdOn,
        headers,
        dataStartRow: 4, // Line 5 (0-indexed)
      },
      data,
    };
  }

  /**
   * Validate CSV metadata (title, date range, created date)
   * @param expectedTitle - Expected title/metric name
   * @param expectedDateRange - Expected date range pattern
   * @param csvPath - Path to the CSV file to validate
   * @returns Validation result with metadata
   */
  public static async validateReportMetadata(
    expectedTitle: string,
    expectedDateRange: string,
    csvPath: string
  ): Promise<{
    isValid: boolean;
    titleMatch: boolean;
    dateRangeMatch: boolean;
    metadata: CSVReportMetadata;
  }> {
    console.log('Validating CSV metadata...');
    // Use the new dedicated metadata method
    const metadata = this.getReportMetadataFromCSV(csvPath);
    const headers = this.getHeadersFromReportCSV(csvPath);

    const titleMatch = metadata.title.includes(expectedTitle);
    const dateRangeMatch = metadata.dateRange.includes(expectedDateRange);

    // Enhanced logging for debugging
    console.log('=== CSV Metadata Validation ===');
    console.log(`CSV File: ${csvPath}`);
    console.log(`Expected Title: "${expectedTitle}"`);
    console.log(`Actual Title: "${metadata.title}"`);
    console.log(`Title Match: ${titleMatch ? '✅' : '❌'}`);
    console.log(`Expected Date Range: "${expectedDateRange}"`);
    console.log(`Actual Date Range: "${metadata.dateRange}"`);
    console.log(`Date Range Match: ${dateRangeMatch ? '✅' : '❌'}`);
    console.log(`Created On: "${metadata.createdOn}"`);

    if (titleMatch && dateRangeMatch) {
      console.log('✅ All metadata matches perfectly!');
    } else {
      console.log('❌ Metadata validation failed');
    }
    console.log('================================');

    return {
      isValid: titleMatch && dateRangeMatch,
      titleMatch,
      dateRangeMatch,
      metadata: {
        title: metadata.title,
        dateRange: metadata.dateRange,
        createdOn: metadata.createdOn,
        headers,
        dataStartRow: 4,
      },
    };
  }

  /**
   * Validate headers for report-style CSV
   * @param expectedHeaders - Array of expected header names
   * @param csvPath - Path to the CSV file to validate
   * @returns Validation result with missing and unexpected headers
   */
  public static async validateReportHeaders(
    expectedHeaders: string[],
    csvPath: string
  ): Promise<{
    isValid: boolean;
    missingHeaders: string[];
    unexpectedHeaders: string[];
    metadata: CSVReportMetadata;
  }> {
    console.log('Validating CSV headers...');
    const metadata = this.getReportMetadataFromCSV(csvPath);
    const actualHeaders = this.getHeadersFromReportCSV(csvPath);

    const missingHeaders = expectedHeaders.filter((header: string) => !actualHeaders.includes(header));
    const unexpectedHeaders = actualHeaders.filter((header: string) => !expectedHeaders.includes(header));

    // Enhanced logging for debugging
    console.log('=== Report CSV Header Validation ===');
    console.log(`CSV File: ${csvPath}`);
    console.log(`Title: ${metadata.title}`);
    console.log(`Date Range: ${metadata.dateRange}`);
    console.log(`Created On: ${metadata.createdOn}`);
    console.log(`Expected Headers (${expectedHeaders.length}): [${expectedHeaders.join(', ')}]`);
    console.log(`Actual Headers (${actualHeaders.length}): [${actualHeaders.join(', ')}]`);

    if (missingHeaders.length > 0) {
      console.log(`❌ Missing Headers (${missingHeaders.length}): [${missingHeaders.join(', ')}]`);
    }

    if (unexpectedHeaders.length > 0) {
      console.log(`❌ Unexpected Headers (${unexpectedHeaders.length}): [${unexpectedHeaders.join(', ')}]`);
    }

    if (missingHeaders.length === 0 && unexpectedHeaders.length === 0) {
      console.log('✅ All headers match perfectly!');
    } else {
      console.log('❌ Header validation failed');
    }
    console.log('=====================================');

    return {
      isValid: missingHeaders.length === 0 && unexpectedHeaders.length === 0,
      missingHeaders,
      unexpectedHeaders,
      metadata: {
        title: metadata.title,
        dateRange: metadata.dateRange,
        createdOn: metadata.createdOn,
        headers: actualHeaders,
        dataStartRow: 4,
      },
    };
  }

  /**
   * Validate CSV headers
   * @param expectedHeaders - Array of expected header names
   * @param csvPath - Path to the CSV file to validate
   * @returns Validation result with missing and unexpected headers
   */
  public static async validateHeaders(
    expectedHeaders: string[],
    csvPath: string
  ): Promise<{
    isValid: boolean;
    missingHeaders: string[];
    unexpectedHeaders: string[];
  }> {
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    // Parse CSV with proper configuration
    const parseResult = Papa.parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // Automatically convert numbers and booleans
    });

    // Check for parsing errors
    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing errors:', parseResult.errors);
      // Log each error for debugging
      parseResult.errors.forEach((error: any, index: number) => {
        console.warn(`CSV Error ${index + 1}:`, error.message, `at row ${error.row}`);
      });
    }

    const actualHeaders = parseResult.meta.fields || [];
    const missingHeaders = expectedHeaders.filter((header: string) => !actualHeaders.includes(header));
    const unexpectedHeaders = actualHeaders.filter((header: string) => !expectedHeaders.includes(header));

    // Enhanced logging for debugging
    console.log('=== CSV Header Validation ===');
    console.log(`CSV File: ${csvPath}`);
    console.log(`Expected Headers (${expectedHeaders.length}): [${expectedHeaders.join(', ')}]`);
    console.log(`Actual Headers (${actualHeaders.length}): [${actualHeaders.join(', ')}]`);

    if (missingHeaders.length > 0) {
      console.log(`❌ Missing Headers (${missingHeaders.length}): [${missingHeaders.join(', ')}]`);
    }

    if (unexpectedHeaders.length > 0) {
      console.log(`❌ Unexpected Headers (${unexpectedHeaders.length}): [${unexpectedHeaders.join(', ')}]`);
    }

    if (missingHeaders.length === 0 && unexpectedHeaders.length === 0) {
      console.log('✅ All headers match perfectly!');
    } else {
      console.log('❌ Header validation failed');
    }
    console.log('===============================');

    return {
      isValid: missingHeaders.length === 0 && unexpectedHeaders.length === 0,
      missingHeaders,
      unexpectedHeaders,
    };
  }

  /**
   * Validate a specific row and column value for report-style CSV
   * @param rowPosition - 'first', 'last', or row index (0-based)
   * @param columnIndex - Column index (0-based)
   * @param expectedValue - Expected value
   * @param csvPath - Path to the CSV file to validate
   * @returns Validation result with actual value
   */
  public static async validateReportRowValue(
    rowPosition: 'first' | 'last' | number,
    columnIndex: number,
    expectedValue: string,
    csvPath: string
  ): Promise<{
    isMatch: boolean;
    actualValue: string;
    rowIndex: number;
    metadata: CSVReportMetadata;
  }> {
    const reportData = await this.parseReportCSV(csvPath);
    const rows = reportData.data;

    // Check if there are any data rows
    if (rows.length === 0) {
      throw new Error(`CSV file has no data rows. Only headers found: [${reportData.metadata.headers.join(', ')}]`);
    }

    let targetRow: CSVRow;
    let rowIndex: number;

    if (rowPosition === 'first') {
      targetRow = rows[0];
      rowIndex = 0;
    } else if (rowPosition === 'last') {
      targetRow = rows[rows.length - 1];
      rowIndex = rows.length - 1;
    } else {
      if (rowPosition >= rows.length) {
        throw new Error(`Row index ${rowPosition} is out of bounds. CSV has ${rows.length} data rows.`);
      }
      targetRow = rows[rowPosition];
      rowIndex = rowPosition;
    }

    const headers = reportData.metadata.headers;
    if (columnIndex >= headers.length) {
      throw new Error(`Column index ${columnIndex} is out of bounds. CSV has ${headers.length} columns.`);
    }

    const columnName = headers[columnIndex];
    const actualValue = targetRow[columnName].toString() || '';

    return {
      isMatch: actualValue === expectedValue,
      actualValue,
      rowIndex,
      metadata: reportData.metadata,
    };
  }

  /**
   * Validate a specific row and column value
   * @param rowPosition - 'first', 'last', or row index (0-based)
   * @param columnIndex - Column index (0-based)
   * @param expectedValue - Expected value
   * @param csvPath - Path to the CSV file to validate
   * @returns Validation result with actual value
   */
  public static async validateRowValue(
    rowPosition: 'first' | 'last' | number,
    columnIndex: number,
    expectedValue: string,
    csvPath: string
  ): Promise<{
    isMatch: boolean;
    actualValue: string;
    rowIndex: number;
  }> {
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    const parseResult = Papa.parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    // Check for parsing errors
    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing errors:', parseResult.errors);
      parseResult.errors.forEach((error: any, index: number) => {
        console.warn(`CSV Error ${index + 1}:`, error.message, `at row ${error.row}`);
      });
    }

    const rows = parseResult.data;
    let targetRow: CSVRow;
    let rowIndex: number;

    if (rowPosition === 'first') {
      targetRow = rows[0];
      rowIndex = 0;
    } else if (rowPosition === 'last') {
      targetRow = rows[rows.length - 1];
      rowIndex = rows.length - 1;
    } else {
      if (rowPosition >= rows.length) {
        throw new Error(`Row index ${rowPosition} is out of bounds. CSV has ${rows.length} data rows.`);
      }
      targetRow = rows[rowPosition];
      rowIndex = rowPosition;
    }

    const headers = parseResult.meta.fields || [];
    if (columnIndex >= headers.length) {
      throw new Error(`Column index ${columnIndex} is out of bounds. CSV has ${headers.length} columns.`);
    }

    const columnName = headers[columnIndex];
    const actualValue = targetRow[columnName].toString() || '';

    return {
      isMatch: actualValue === expectedValue,
      actualValue,
      rowIndex,
    };
  }

  /**
   * Get all records from the CSV
   * @param csvPath - Path to the CSV file to read
   * @returns Array of records
   */
  public static async getAllRecords(csvPath: string): Promise<CSVRow[]> {
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    const parseResult = Papa.parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    // Check for parsing errors
    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing errors:', parseResult.errors);
      parseResult.errors.forEach((error: any, index: number) => {
        console.warn(`CSV Error ${index + 1}:`, error.message, `at row ${error.row}`);
      });
    }

    return parseResult.data;
  }

  /**
   * Get the number of rows in the CSV (excluding header)
   * @param csvPath - Path to the CSV file to read
   * @returns Number of rows
   */
  public static async getRowCount(csvPath: string): Promise<number> {
    const records = await this.getAllRecords(csvPath);
    return records.length;
  }

  /**
   * Delete the specified downloaded CSV file
   * @param filePath - Path to the CSV file to delete
   */
  async deleteTheDownloadedCSV(filePath?: string): Promise<void> {
    try {
      if (!filePath) return;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Deleted CSV:', filePath);
      }
    } catch (err) {
      console.warn('Failed to delete CSV:', err);
    }
  }
}
