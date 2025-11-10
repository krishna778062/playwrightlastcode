import { expect } from '@playwright/test';

import { PeriodFilterTimeRange } from '../constants/periodFilterTimeRange';
import { DateHelper } from '../helpers/dateHelper';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { FileUtil } from '@/src/core/utils/fileUtil';

/**
 * Type for period filter options
 */
type PeriodFilterOption = keyof typeof PeriodFilterTimeRange | string;

/**
 * Interface for database record data - completely generic
 */
export interface DBRecord {
  [key: string]: string | number | undefined;
}

/**
 * Interface for CSV validation configuration
 */
export interface CSVValidationConfig {
  csvPath: string;
  expectedDBData: DBRecord[];
  metricName: string;
  selectedPeriod: PeriodFilterOption;
  expectedHeaders: string[];
  // Optional when selectedPeriod is CUSTOM
  customStartDate?: string;
  customEndDate?: string;
  // For time-independent metrics (e.g., Profile Completeness), validates "Created On" format instead of date range
  skipDateRangeValidation?: boolean;
  // Transformation-based configuration
  transformations: {
    // CSV header → DB field mapping
    headerMapping: { [csvHeader: string]: string };
    // Field-specific value transformations (CSV value → DB value)
    valueMappings?: {
      [fieldName: string]: { [csvValue: string]: string };
    };
    // Percentage field normalization
    percentageField?: {
      fieldName: string;
      normalizeToPercentage?: boolean;
    };
    // Tolerance settings for validation
    tolerance?: {
      percentage?: number;
    };
  };
}

/**
 * Interface for validation results
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  summary: {
    dbRecordCount: number;
    csvRecordCount: number;
    matchedRecords: number;
    unmatchedRecords: number;
  };
  // Detailed validation breakdown
  validationDetails: {
    metadata: {
      isValid: boolean;
      titleMatch: boolean;
      dateRangeMatch: boolean;
    };
    headers: {
      isValid: boolean;
      missingHeaders: string[];
      unexpectedHeaders: string[];
    };
    records: {
      isValid: boolean;
      unmatchedRecords: Array<{
        keyValue: string;
        record: DBRecord;
      }>;
    };
    values: {
      isValid: boolean;
      mismatchedValues: Array<{
        keyValue: string;
        field: string;
        expectedValue: any;
        actualValue: any;
      }>;
    };
  };
}

/**
 * Utility class for comprehensive CSV validation against database data
 *
 * @example
 * // For App Web Page Views metric:
 * await CSVValidationUtil.validateAndAssert({
 *   csvPath: filePath,
 *   expectedDBData: dbData,
 *   metricName: 'App web page views',
 *   selectedPeriod: PeriodFilterTimeRange.LAST_12_MONTHS,
 *   expectedHeaders: ['Web page group', 'Total people', 'Page view count', 'Percentage contribution to total page views'],
 *   transformations: {
 *     headerMapping: {
 *       'Web page group': 'webPageGroup',
 *       'Total people': 'totalPeople',
 *       'Page view count': 'pageViewCount',
 *       'Percentage contribution to total page views': 'percentageContributionToTotalPageViews'
 *     },
 *     valueMappings: {
 *       'webPageGroup': { 'N/A': 'Undefined' }
 *     },
 *     percentageField: {
 *       fieldName: 'percentageContributionToTotalPageViews',
 *       normalizeToPercentage: true
 *     }
 *   }
 * });
 *
 * @example
 * // For User Engagement metric:
 * await CSVValidationUtil.validateAndAssert({
 *   csvPath: filePath,
 *   expectedDBData: dbData,
 *   metricName: 'User engagement',
 *   selectedPeriod: PeriodFilterTimeRange.LAST_30_DAYS,
 *   expectedHeaders: ['Department', 'Active users', 'Total interactions', 'Engagement rate'],
 *   transformations: {
 *     headerMapping: {
 *       'Department': 'department',
 *       'Active users': 'activeUsers',
 *       'Total interactions': 'totalInteractions',
 *       'Engagement rate': 'engagementRate'
 *     },
 *     percentageField: {
 *       fieldName: 'engagementRate',
 *       normalizeToPercentage: true
 *     }
 *   }
 * });
 */
export class CSVValidationUtil {
  /**
   * Validates CSV file against database data with comprehensive checks
   * @param config - Configuration object containing all validation parameters
   * @returns Promise<ValidationResult> - Detailed validation results
   */
  public static async validateCSVAgainstDB(config: CSVValidationConfig): Promise<ValidationResult> {
    const { csvPath, expectedDBData, metricName, selectedPeriod, expectedHeaders, transformations } = config;

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      summary: {
        dbRecordCount: expectedDBData.length,
        csvRecordCount: 0,
        matchedRecords: 0,
        unmatchedRecords: 0,
      },
      validationDetails: {
        metadata: {
          isValid: false,
          titleMatch: false,
          dateRangeMatch: false,
        },
        headers: {
          isValid: false,
          missingHeaders: [],
          unexpectedHeaders: [],
        },
        records: {
          isValid: false,
          unmatchedRecords: [],
        },
        values: {
          isValid: true,
          mismatchedValues: [],
        },
      },
    };

    try {
      //step1: validate metadata (title and date range)
      const metadata = CSVUtils.getReportMetadataFromCSV(csvPath);
      const titleMatch = metadata.title.includes(metricName) || metricName.includes(metadata.title.replace(/"/g, ''));

      let dateRangeMatch = false;
      if (config.skipDateRangeValidation) {
        // For time-independent metrics, validate that date range is in readable "Created On" format
        // Format: "Created On: DD MMM YYYY at HH:MM (UTC)"
        const createdOnPattern = /Created On:\s+\d{1,2}\s+\w{3}\s+\d{4}\s+at\s+\d{1,2}:\d{2}\s+\(UTC\)/i;
        dateRangeMatch = createdOnPattern.test(metadata.dateRange);
        if (!dateRangeMatch) {
          console.log(
            `Info: Date range format validation for time-independent metric. Expected "Created On: DD MMM YYYY at HH:MM (UTC)" format, got: "${metadata.dateRange}"`
          );
        }
      } else {
        // For time-dependent metrics, validate both title and date range
        const expectedDateRange = DateHelper.generateExpectedCSVDateRange(
          selectedPeriod as any,
          config.customStartDate as any,
          config.customEndDate as any
        );
        console.log(`Expected date range for ${selectedPeriod}: ${expectedDateRange}`);
        dateRangeMatch = metadata.dateRange.includes(expectedDateRange);
      }

      result.validationDetails.metadata.titleMatch = titleMatch;
      result.validationDetails.metadata.dateRangeMatch = dateRangeMatch;
      result.validationDetails.metadata.isValid = titleMatch && dateRangeMatch;

      if (!result.validationDetails.metadata.isValid) {
        result.errors.push(
          `Metadata validation failed. Title match: ${titleMatch}, Date range match: ${dateRangeMatch}`
        );
      } else {
        console.log('Info: CSV metadata validation passed');
      }

      //step3: validate headers
      const headersValidation = await CSVUtils.validateReportHeaders(expectedHeaders, csvPath);

      result.validationDetails.headers.isValid = headersValidation.isValid;
      result.validationDetails.headers.missingHeaders = headersValidation.missingHeaders;
      result.validationDetails.headers.unexpectedHeaders = headersValidation.unexpectedHeaders;

      if (!result.validationDetails.headers.isValid) {
        result.errors.push(
          `Headers validation failed. Missing: [${headersValidation.missingHeaders.join(', ')}]. Unexpected: [${headersValidation.unexpectedHeaders.join(', ')}]`
        );
      } else {
        console.log('Info: CSV headers validation passed');
      }

      //step4: parse CSV data
      const reportData = await CSVUtils.parseReportCSV(csvPath);
      result.summary.csvRecordCount = reportData.data.length;

      //step4.5: transform CSV data to DB format and validate empty columns and date formats
      console.log('Info:Transforming CSV data to DB format...');
      const transformResult = this.transformCSVToDBFormat(reportData.data, transformations, expectedDBData);
      const transformedCSVData = transformResult.data;
      console.log(`Info: Transformed ${transformedCSVData.length} CSV records to DB format`);

      // Add empty column and date format validation errors
      if (transformResult.emptyColumnErrors.length > 0) {
        result.errors.push(`Empty columns found in CSV: ${transformResult.emptyColumnErrors.join('; ')}`);
        result.validationDetails.values.isValid = false;
      }
      if (transformResult.dateFormatErrors.length > 0) {
        result.errors.push(`Date format errors in CSV: ${transformResult.dateFormatErrors.join('; ')}`);
        result.validationDetails.values.isValid = false;
      }

      if (reportData.data.length === 0) {
        if (expectedDBData.length > 0) {
          result.errors.push(
            `CSV file has no data rows but DB has ${expectedDBData.length} records - this is an error`
          );
          console.log(
            `Error: CSV file has no data rows but DB has ${expectedDBData.length} records - validation failed`
          );
        } else {
          result.errors.push('CSV file has no data rows and DB also has no records - this might be expected');
          console.log('Info: CSV file has no data rows and DB also has no records - this might be expected');
        }
        return result;
      }

      //step5: validate data integrity
      console.log(
        `Debug: Validating ${transformedCSVData.length} transformed CSV rows against ${expectedDBData.length} DB records`
      );

      //step6: check row count matches
      const rowCountMatch = transformedCSVData.length === expectedDBData.length;
      if (!rowCountMatch) {
        result.errors.push(
          `Row count mismatch: CSV has ${transformedCSVData.length} rows, DB has ${expectedDBData.length} rows - this is an error`
        );
        console.log(
          `❌ Row count mismatch: CSV has ${transformedCSVData.length} rows, DB has ${expectedDBData.length} rows - validation failed`
        );

        // Identify which records are missing/extra
        const dbKeys = expectedDBData.map(dbRecord => this.getKeyValue(dbRecord, transformations));
        const csvKeys = transformedCSVData.map(csvRecord => this.getKeyValue(csvRecord, transformations));

        const missingInCSV = dbKeys.filter(dbKey => !csvKeys.includes(dbKey));
        const extraInCSV = csvKeys.filter(csvKey => !dbKeys.includes(csvKey));

        if (missingInCSV.length > 0) {
          result.errors.push(`Records missing in CSV: ${missingInCSV.join(', ')}`);
          console.log(`❌ Records missing in CSV: ${missingInCSV.join(', ')}`);
        }

        if (extraInCSV.length > 0) {
          result.errors.push(`Extra records in CSV: ${extraInCSV.join(', ')}`);
          console.log(`❌ Extra records in CSV: ${extraInCSV.join(', ')}`);
        }
      } else {
        console.log('✅ Row count matches');
      }

      //step7: validate records between DB and transformed CSV
      const recordValidationResult = this.validateRecords(expectedDBData, transformedCSVData, transformations);

      result.summary.matchedRecords = recordValidationResult.matchedCount;
      result.summary.unmatchedRecords = recordValidationResult.unmatchedCount;
      result.validationDetails.records.isValid = recordValidationResult.unmatchedCount === 0;
      result.validationDetails.values.isValid = recordValidationResult.validationErrors.length === 0;

      // Add validation errors to result
      result.errors.push(...recordValidationResult.validationErrors);
      result.validationDetails.values.mismatchedValues.push(...recordValidationResult.mismatchedValues);
      result.validationDetails.records.unmatchedRecords.push(...recordValidationResult.unmatchedRecords);

      // Step 8: Final validation result - fail if ANY errors exist
      result.isValid =
        result.errors.length === 0 &&
        result.validationDetails.metadata.isValid &&
        result.validationDetails.headers.isValid &&
        result.validationDetails.records.isValid &&
        result.validationDetails.values.isValid;

      // Step 9: Comprehensive validation summary
      this.logValidationSummary(result);

      if (result.isValid) {
        console.log('✅ All CSV validations passed successfully');
      } else {
        console.log('❌ CSV validation failed');
        console.log(`Errors: ${result.errors.length}`);
      }

      return result;
    } catch (error) {
      result.errors.push(`Validation error: ${error}`);
      result.isValid = false;
      console.error('❌ CSV validation error:', error);
      return result;
    }
  }

  /**
   * Validates CSV and runs assertions (convenience method for tests)
   * @param config - Configuration object containing all validation parameters
   */
  public static async validateAndAssert(config: CSVValidationConfig): Promise<void> {
    const result = await this.validateCSVAgainstDB(config);

    try {
      // First check: Overall validation result - fail if ANY errors exist
      expect(
        result.isValid,
        `CSV validation completed with ${result.errors.length} error(s): ${result.errors.join('; ')}`
      ).toBe(true);

      // Additional detailed assertions for better error messages
      expect(
        result.validationDetails.metadata.isValid,
        `CSV metadata validation passed: ${result.errors.filter(e => e.includes('Metadata')).join(', ')}`
      ).toBe(true);
      expect(
        result.validationDetails.headers.isValid,
        `CSV headers validation passed: ${result.errors.filter(e => e.includes('Headers')).join(', ')}`
      ).toBe(true);

      if (result.summary.csvRecordCount > 0) {
        expect(
          result.validationDetails.records.isValid,
          `CSV records validation passed. Found ${result.summary.unmatchedRecords} unmatched records. Errors: ${result.errors.join(', ')}`
        ).toBe(true);
        expect(
          result.validationDetails.values.isValid,
          `CSV values validation passed. Errors: ${result.errors.join(', ')}`
        ).toBe(true);
      }
    } catch (assertionError) {
      // Create debug copy when assertions fail
      try {
        FileUtil.createDebugFileCopy(config.csvPath, `debug-assertion-failed-${Date.now()}.csv`);
      } catch (debugError) {
        console.warn(`Failed to create debug copy: ${debugError}`);
      }

      // Re-throw the assertion error
      throw assertionError;
    }
  }

  /**
   * Logs comprehensive validation summary
   * @param result - Validation result object
   */
  private static logValidationSummary(result: ValidationResult): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE CSV VALIDATION SUMMARY');
    console.log('='.repeat(80));

    // Metadata validation
    console.log(`\n📋 METADATA VALIDATION:`);
    console.log(`   Status: ${result.validationDetails.metadata.isValid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Title Match: ${result.validationDetails.metadata.titleMatch ? '✅' : '❌'}`);
    console.log(`   Date Range Match: ${result.validationDetails.metadata.dateRangeMatch ? '✅' : '❌'}`);

    // Headers validation
    console.log(`\n📋 HEADERS VALIDATION:`);
    console.log(`   Status: ${result.validationDetails.headers.isValid ? '✅ PASSED' : '❌ FAILED'}`);
    if (!result.validationDetails.headers.isValid) {
      if (result.validationDetails.headers.missingHeaders.length > 0) {
        console.log(`   Missing Headers: [${result.validationDetails.headers.missingHeaders.join(', ')}]`);
      }
      if (result.validationDetails.headers.unexpectedHeaders.length > 0) {
        console.log(`   Unexpected Headers: [${result.validationDetails.headers.unexpectedHeaders.join(', ')}]`);
      }
    }

    // Records validation
    console.log(`\n📝 RECORDS VALIDATION:`);
    console.log(`   Status: ${result.validationDetails.records.isValid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   DB Records: ${result.summary.dbRecordCount}`);
    console.log(`   CSV Records: ${result.summary.csvRecordCount}`);
    console.log(`   Matched: ${result.summary.matchedRecords}`);
    console.log(`   Unmatched: ${result.summary.unmatchedRecords}`);

    if (!result.validationDetails.records.isValid && result.validationDetails.records.unmatchedRecords.length > 0) {
      console.log(`   Unmatched Records:`);
      result.validationDetails.records.unmatchedRecords.forEach((unmatched, index) => {
        console.log(`     ${index + 1}. ${unmatched.keyValue}: ${JSON.stringify(unmatched.record)}`);
      });
    }

    // Values validation
    console.log(`\n🔢 VALUES VALIDATION:`);
    console.log(`   Status: ${result.validationDetails.values.isValid ? '✅ PASSED' : '❌ FAILED'}`);

    if (!result.validationDetails.values.isValid && result.validationDetails.values.mismatchedValues.length > 0) {
      console.log(`   Mismatched Values:`);
      result.validationDetails.values.mismatchedValues.forEach((mismatch, index) => {
        console.log(
          `     ${index + 1}. ${mismatch.keyValue} - ${mismatch.field}: Expected "${mismatch.expectedValue}" vs Actual "${mismatch.actualValue}"`
        );
      });
    }

    // Overall result
    console.log(`\n🎯 OVERALL RESULT:`);
    console.log(`   Status: ${result.isValid ? '✅ ALL VALIDATIONS PASSED' : '❌ VALIDATION FAILED'}`);
    console.log(`   Metadata: ${result.validationDetails.metadata.isValid ? '✅' : '❌'}`);
    console.log(`   Headers: ${result.validationDetails.headers.isValid ? '✅' : '❌'}`);
    console.log(`   Records: ${result.validationDetails.records.isValid ? '✅' : '❌'}`);
    console.log(`   Values: ${result.validationDetails.values.isValid ? '✅' : '❌'}`);

    if (result.errors.length > 0) {
      console.log(`\n❌ ERRORS:`);
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    console.log('='.repeat(80) + '\n');
  }

  /**
   * Converts epoch timestamp (seconds) to readable date (YYYY-MM-DD)
   * @param epochSeconds - Epoch timestamp in seconds
   * @returns Date string in YYYY-MM-DD format, or null if epoch is null/invalid
   */
  private static convertEpochToReadableDate(epochSeconds: number | null | undefined): string | null {
    if (epochSeconds === null || epochSeconds === undefined) {
      return null;
    }

    // Convert epoch seconds to Date object
    const date = new Date(epochSeconds * 1000);
    if (isNaN(date.getTime())) {
      return null;
    }

    // Format as YYYY-MM-DD
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Validates that a date string is in readable format (YYYY-MM-DD), not epoch
   * @param dateString - Date string to validate
   * @returns True if date is in readable format, false if it's epoch or invalid
   */
  private static isReadableDate(dateString: string | null | undefined): boolean {
    if (!dateString || dateString === '' || dateString === 'null') {
      return false;
    }

    const trimmedValue = String(dateString).trim();

    // Check if it's a number (epoch format) - should not be
    // Epoch timestamps are typically 10 digits (seconds) or 13 digits (milliseconds)
    if (!isNaN(Number(trimmedValue)) && trimmedValue !== '') {
      // Check if it looks like an epoch timestamp (10 or 13 digits)
      if (/^\d{10}$/.test(trimmedValue) || /^\d{13}$/.test(trimmedValue)) {
        return false; // It's an epoch timestamp, not readable
      }
    }

    // Check if it matches YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(trimmedValue);
  }

  /**
   * Validates that CSV record has no empty columns
   * Note: "User activated on" (Day(User Active Datetime)) can be empty, so it's excluded from validation
   * @param csvRecord - CSV record to validate
   * @param csvHeaders - Array of CSV header names
   * @param headerMapping - Mapping from CSV headers to DB field names
   * @returns Array of empty column names (DB field names)
   */
  private static findEmptyColumns(
    csvRecord: any,
    csvHeaders: string[],
    headerMapping: Record<string, string>
  ): string[] {
    const emptyColumns: string[] = [];
    // Fields that are allowed to be empty
    const allowedEmptyFields = new Set(['Day(User Active Datetime)']);

    for (const csvHeader of csvHeaders) {
      const dbField = headerMapping[csvHeader];
      // Skip validation for fields that are allowed to be empty
      if (allowedEmptyFields.has(dbField)) {
        continue;
      }

      const value = csvRecord[csvHeader];
      if (value === undefined || value === null || value === '' || String(value).trim() === '') {
        emptyColumns.push(dbField); // Return DB field name for consistency
      }
    }
    return emptyColumns;
  }

  /**
   * Transforms CSV data to DB format using header and value mappings
   * Also validates empty columns and date formats
   * @param csvData - Raw CSV data
   * @param transformations - Transformation configuration
   * @param expectedDBData - Expected DB data (used for date conversion)
   * @returns Object with transformed data and validation errors
   */
  private static transformCSVToDBFormat(
    csvData: any[],
    transformations: CSVValidationConfig['transformations'],
    _expectedDBData?: DBRecord[]
  ): { data: DBRecord[]; emptyColumnErrors: string[]; dateFormatErrors: string[] } {
    const emptyColumnErrors: string[] = [];
    const dateFormatErrors: string[] = [];

    const transformedData = csvData.map((csvRecord, index) => {
      const transformedRecord: DBRecord = {};

      // Validate that no columns are empty in CSV
      const csvHeaders = Object.keys(transformations.headerMapping);
      const emptyColumns = this.findEmptyColumns(csvRecord, csvHeaders, transformations.headerMapping);
      if (emptyColumns.length > 0) {
        const errorMsg = `Record ${index + 1} has empty columns: ${emptyColumns.join(', ')}`;
        emptyColumnErrors.push(errorMsg);
        console.warn(`    ⚠️  ${errorMsg}`);
      }

      // Transform headers and values
      for (const [csvHeader, dbField] of Object.entries(transformations.headerMapping)) {
        let value = csvRecord[csvHeader];

        // Validate date fields are in readable format (not epoch)
        // Note: "User activated on" can be empty, so skip validation for empty values
        if (dbField.includes('Datetime)') && value !== undefined && value !== null && value !== '') {
          if (!this.isReadableDate(String(value))) {
            const errorMsg = `Record ${index + 1}, field "${csvHeader}": Expected readable date (YYYY-MM-DD) but found "${value}" (epoch format not allowed)`;
            dateFormatErrors.push(errorMsg);
            console.warn(`    ⚠️  ${errorMsg}`);
          }
        }

        // Apply value transformations if configured
        if (transformations.valueMappings?.[dbField] && value !== undefined) {
          const valueMapping = transformations.valueMappings[dbField];
          const stringValue = String(value);
          if (stringValue in valueMapping) {
            value = valueMapping[stringValue];
            console.log(`    🔄 Transformed ${csvHeader}: "${csvRecord[csvHeader]}" → "${value}"`);
          }
        }

        transformedRecord[dbField] = value;
      }

      return transformedRecord;
    });

    return {
      data: transformedData,
      emptyColumnErrors,
      dateFormatErrors,
    };
  }

  /**
   * Gets the key value for a record (used for matching)
   * @param record - Database record
   * @param transformations - Transformation configuration
   * @returns Key value for matching
   */
  private static getKeyValue(record: DBRecord, _transformations: CSVValidationConfig['transformations']): string {
    // Find the first field that's likely to be the key (usually the first field)
    const fields = Object.keys(record);
    return fields.length > 0 ? String(record[fields[0]]) : 'unknown';
  }

  /**
   * Finds matching transformed CSV record for a database record
   * @param dbRecord - Database record to match
   * @param transformedCSVData - Transformed CSV data
   * @param transformations - Transformation configuration
   * @returns Matching transformed CSV record or undefined
   */
  private static findMatchingTransformedRecord(
    dbRecord: DBRecord,
    transformedCSVData: DBRecord[],
    transformations: CSVValidationConfig['transformations']
  ): DBRecord | undefined {
    const dbKeyValue = this.getKeyValue(dbRecord, transformations);

    return transformedCSVData.find(csvRecord => {
      const csvKeyValue = this.getKeyValue(csvRecord, transformations);
      return csvKeyValue === dbKeyValue;
    });
  }

  /**
   * Normalizes percentage values by removing % symbol and converting to number
   * @param value - Value to normalize (can be string with % or number)
   * @returns Normalized numeric value
   */
  private static normalizePercentageValue(value: any): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      // Remove % symbol and convert to number
      const cleanValue = value.replace('%', '').trim();
      const numericValue = parseFloat(cleanValue);
      return isNaN(numericValue) ? 0 : numericValue;
    }

    return 0;
  }

  /**
   * Validates data fields between two DB-format records
   * @param dbRecord - Database record
   * @param csvRecord - Transformed CSV record (in DB format)
   * @param transformations - Transformation configuration for tolerance settings
   * @returns Array of validation error messages
   */
  private static validateTransformedDataFields(
    dbRecord: DBRecord,
    csvRecord: DBRecord,
    transformations: CSVValidationConfig['transformations']
  ): string[] {
    const errors: string[] = [];

    // Get all fields that are mapped from CSV (i.e., fields that exist in headerMapping values)
    const mappedFields = new Set(Object.values(transformations.headerMapping));

    // Compare only fields that are mapped from CSV
    for (const [field, dbValue] of Object.entries(dbRecord)) {
      // Skip fields that are not in the CSV (not in headerMapping)
      if (!mappedFields.has(field)) {
        continue;
      }

      const csvValue = csvRecord[field];

      if (csvValue === undefined) {
        errors.push(`${field}: Field not found in transformed CSV`);
      } else {
        // Convert DB epoch timestamps to readable dates for comparison with CSV
        let dbValueToCompare: string | number | null | undefined = dbValue;
        const csvValueToCompare = csvValue;

        if (field.includes('Datetime)')) {
          // DB has epoch timestamp, CSV has readable date - convert DB to readable for comparison
          if (typeof dbValue === 'number') {
            dbValueToCompare = this.convertEpochToReadableDate(dbValue);
          }
          // CSV should already be in readable format (validated earlier)
        }

        if (dbValueToCompare !== csvValueToCompare) {
          // Check if this is a percentage field that should use tolerance
          const isPercentageField = transformations.percentageField?.fieldName === field;
          const tolerance = transformations.tolerance?.percentage || 0;

          if (isPercentageField) {
            // Normalize both values for percentage comparison
            const normalizedDBValue = this.normalizePercentageValue(dbValueToCompare);
            const normalizedCSVValue = this.normalizePercentageValue(csvValueToCompare);

            const difference = Math.abs(normalizedCSVValue - normalizedDBValue);
            if (difference > tolerance) {
              errors.push(
                `${field}: Expected=${dbValueToCompare} vs Actual=${csvValueToCompare} (tolerance: ${tolerance})`
              );
            }
          } else {
            errors.push(`${field}: Expected=${dbValueToCompare} vs Actual=${csvValueToCompare}`);
          }
        }
      }
    }

    return errors;
  }

  /**
   * Validates percentage calculation for transformed data
   * @param dbRecord - Database record
   * @param allDBRecords - All database records for total calculation
   * @param csvRecord - Transformed CSV record
   * @param percentageField - Percentage field configuration
   * @returns True if percentage is valid
   */
  private static validateTransformedPercentageCalculation(
    dbRecord: DBRecord,
    allDBRecords: DBRecord[],
    csvRecord: DBRecord,
    percentageField: CSVValidationConfig['transformations']['percentageField']
  ): boolean {
    if (!percentageField) {
      return true;
    }

    const fieldName = percentageField.fieldName;
    const dbPercentage = this.normalizePercentageValue(dbRecord[fieldName]);
    const csvPercentage = this.normalizePercentageValue(csvRecord[fieldName]);

    const isValid = Math.abs(csvPercentage - dbPercentage) <= 1;

    if (!isValid) {
      const keyValue = this.getKeyValue(dbRecord, { headerMapping: {} });
      console.warn(`Percentage mismatch for ${keyValue}: expected ${dbRecord[fieldName]}, got ${csvRecord[fieldName]}`);
    }

    return isValid;
  }

  /**
   * Validates records between DB and transformed CSV data
   * @param expectedDBData - Expected database records
   * @param transformedCSVData - Transformed CSV data in DB format
   * @param transformations - Transformation configuration
   * @returns Validation result with counts and errors
   */
  private static validateRecords(
    expectedDBData: DBRecord[],
    transformedCSVData: DBRecord[],
    transformations: CSVValidationConfig['transformations']
  ): {
    matchedCount: number;
    unmatchedCount: number;
    validationErrors: string[];
    mismatchedValues: Array<{
      keyValue: string;
      field: string;
      expectedValue: any;
      actualValue: any;
    }>;
    unmatchedRecords: Array<{
      keyValue: string;
      record: DBRecord;
    }>;
  } {
    let matchedCount = 0;
    let unmatchedCount = 0;
    const validationErrors: string[] = [];
    const mismatchedValues: Array<{
      keyValue: string;
      field: string;
      expectedValue: any;
      actualValue: any;
    }> = [];
    const unmatchedRecords: Array<{
      keyValue: string;
      record: DBRecord;
    }> = [];

    for (const dbRecord of expectedDBData) {
      const keyValue = this.getKeyValue(dbRecord, transformations);
      console.log(`\nChecking if DB record exists in transformed CSV: ${keyValue}`);

      // Find matching transformed CSV record
      const csvRecord = this.findMatchingTransformedRecord(dbRecord, transformedCSVData, transformations);

      if (csvRecord) {
        matchedCount++;
        console.log(`  ✅ Found matching transformed CSV record for ${keyValue}`);
        console.log(`  DB:`, dbRecord);
        console.log(`  CSV:`, csvRecord);

        // Validate all data fields (direct comparison since both are in DB format)
        const dataValidationErrors = this.validateTransformedDataFields(dbRecord, csvRecord, transformations);
        if (dataValidationErrors.length > 0) {
          validationErrors.push(`Data validation failed for ${keyValue}: ${dataValidationErrors.join(', ')}`);
          console.log(`  ❌ Data validation errors:`, dataValidationErrors);
          // Collect detailed mismatch information
          dataValidationErrors.forEach(error => {
            const match = error.match(/^(.+): Expected=(.+) vs Actual=(.+)$/);
            if (match) {
              mismatchedValues.push({
                keyValue: String(keyValue || 'unknown'),
                field: match[1],
                expectedValue: match[2],
                actualValue: match[3],
              });
            }
          });
        } else {
          console.log(`  ✅ Data validation passed for ${keyValue}`);
        }

        // Validate percentage calculation if applicable
        if (transformations.percentageField) {
          const percentageValid = this.validateTransformedPercentageCalculation(
            dbRecord,
            expectedDBData,
            csvRecord,
            transformations.percentageField
          );

          if (!percentageValid) {
            validationErrors.push(`Percentage calculation mismatch for ${keyValue}`);
          }
        }
      } else {
        unmatchedCount++;
        validationErrors.push(`DB record not found in transformed CSV: ${JSON.stringify(dbRecord)}`);
        unmatchedRecords.push({
          keyValue: String(keyValue || 'unknown'),
          record: dbRecord,
        });
        console.log(`  ❌ DB record not found in transformed CSV: ${keyValue}`);
      }
    }

    return {
      matchedCount,
      unmatchedCount,
      validationErrors,
      mismatchedValues,
      unmatchedRecords,
    };
  }

  /**
   * Cleanup method to remove temporary files
   * @param csvPath - Path to CSV file to clean up
   */
  public static cleanup(csvPath: string): void {
    FileUtil.deleteTemporaryFile(csvPath);
  }
}
