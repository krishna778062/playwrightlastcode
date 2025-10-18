import fs from 'fs';
import path from 'path';

export class CSVUtils {
  private downloadDir: string;

  constructor(downloadDir: string = './downloads') {
    this.downloadDir = downloadDir;
    // Ensure download directory exists
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true });
    }
  }

  /**
   * Get the latest CSV file from the download directory
   * @returns The path to the latest CSV file
   */
  getLatestCSV(): string {
    const files = fs
      .readdirSync(this.downloadDir)
      .filter(file => file.endsWith('.csv'))
      .map(file => ({
        name: file,
        path: path.join(this.downloadDir, file),
        time: fs.statSync(path.join(this.downloadDir, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
      throw new Error(`No CSV files found in ${this.downloadDir}`);
    }

    return files[0].path;
  }

  /**
   * Validate CSV headers
   * @param expectedHeaders - Array of expected header names
   * @returns Validation result with missing and unexpected headers
   */
  async validateHeaders(expectedHeaders: string[]): Promise<{
    isValid: boolean;
    missingHeaders: string[];
    unexpectedHeaders: string[];
  }> {
    const csvPath = this.getLatestCSV();
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const actualHeaders = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
    const missingHeaders = expectedHeaders.filter(header => !actualHeaders.includes(header));
    const unexpectedHeaders = actualHeaders.filter(header => !expectedHeaders.includes(header));

    return {
      isValid: missingHeaders.length === 0 && unexpectedHeaders.length === 0,
      missingHeaders,
      unexpectedHeaders,
    };
  }

  /**
   * Validate a specific row and column value
   * @param rowPosition - 'first', 'last', or row index (0-based)
   * @param columnIndex - Column index (0-based)
   * @param expectedValue - Expected value
   * @returns Validation result with actual value
   */
  async validateRowValue(
    rowPosition: 'first' | 'last' | number,
    columnIndex: number,
    expectedValue: string
  ): Promise<{
    isMatch: boolean;
    actualValue: string;
  }> {
    const csvPath = this.getLatestCSV();
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    if (lines.length <= 1) {
      throw new Error('CSV file has no data rows');
    }

    const dataLines = lines.slice(1); // Skip header row
    let targetRowIndex: number;

    if (rowPosition === 'first') {
      targetRowIndex = 0;
    } else if (rowPosition === 'last') {
      targetRowIndex = dataLines.length - 1;
    } else {
      targetRowIndex = rowPosition;
    }

    if (targetRowIndex >= dataLines.length) {
      throw new Error(`Row at position ${rowPosition} not found`);
    }

    const targetRow = dataLines[targetRowIndex];
    const values = this.parseCSVLine(targetRow);

    if (columnIndex >= values.length) {
      throw new Error(`Column index ${columnIndex} is out of bounds (max: ${values.length - 1})`);
    }

    const actualValue = values[columnIndex];

    return {
      isMatch: actualValue === expectedValue,
      actualValue,
    };
  }

  /**
   * Get data of a specific row
   * @param rowNumber : 'first', 'last', or row index (0-based)
   * @param columnIndex : Column index (0-based)
   * @returns Array of values in the specified row
   */
  async getTheNRowNColumnData(rowNumber: string, columnIndex: number): Promise<string> {
    const csvPath = this.getLatestCSV();
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    if (lines.length <= 1) {
      return 'No Data';
    }
    let targetRowIndex: number;
    const dataLines = lines.slice(1); // Skip header row
    if (rowNumber === 'first') {
      targetRowIndex = 0;
    } else if (rowNumber === 'last') {
      targetRowIndex = dataLines.length - 1;
    } else if (rowNumber === 'second_last') {
      targetRowIndex = dataLines.length - 2;
    } else {
      targetRowIndex = Number(rowNumber);
    }

    if (targetRowIndex < 0 || targetRowIndex >= dataLines.length) {
      return 'No Data';
    }
    const rowValues = this.parseCSVLine(dataLines[targetRowIndex]);
    return rowValues[columnIndex];
  }

  /**
   * Parse a CSV line handling quoted values
   */
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    return values.map(v => v.replace(/^"|"$/g, ''));
  }

  /**
   * Get all records from the CSV
   * @returns Array of records
   */
  async getAllRecords(): Promise<any[]> {
    const csvPath = this.getLatestCSV();
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    if (lines.length <= 1) {
      return [];
    }

    const headers = this.parseCSVLine(lines[0]);
    const records: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      records.push(record);
    }

    return records;
  }

  /**
   * Get the number of rows in the CSV (excluding header)
   * @returns Number of rows
   */
  async getRowCount(): Promise<number> {
    const records = await this.getAllRecords();
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
