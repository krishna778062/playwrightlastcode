/**
 * Utility functions for percentage and decimal conversions
 */

/**
 * Converts percentage value to decimal format
 * Handles both string (with or without % symbol) and number formats
 * If value is > 1, assumes it's percentage and converts to decimal (50 -> 0.5)
 * If value is <= 1, assumes it's already decimal and returns as-is
 *
 * @param value - Percentage value (string with % or number)
 * @returns Decimal value (0.5 for 50%)
 */
export function convertPercentageToDecimal(value: string | number): number {
  if (typeof value === 'string') {
    // Remove % if present and convert to number
    const cleanValue = value.replace('%', '').trim();
    const percentageValue = parseFloat(cleanValue);
    // Convert percentage to decimal (50 -> 0.5)
    return isNaN(percentageValue) ? 0 : percentageValue / 100;
  } else if (typeof value === 'number') {
    // If it's already a number, check if it's percentage (> 1) or decimal (<= 1)
    // If > 1, assume it's percentage and convert to decimal
    return value > 1 ? value / 100 : value;
  }
  return 0;
}
