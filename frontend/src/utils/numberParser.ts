/**
 * Extracts the first numeric value from a string (e.g. "5000 mAh" -> 5000)
 * If the input is already a number, returns it directly.
 * @param value  The value to parse
 * @returns Returns an integer value if number was parsed or 0 for possibly wrong inputs
 */
export const parseNumericValue = (value: string | number | undefined): number => {
  // Handling undefined value case and case that value is already a number
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;

  // Checking if value contains 'x' or by to flag as dimension
  const strValue = value.toString().toLowerCase().replace(/,/g, "");
  if (strValue.includes("x") || strValue.includes(" by ")) return 0;

  // Regex pattern for matching (digits.digits) [\d+ \. \d+]
  const numberPattern = /(\d+(\.\d+)?)/;
  const match = strValue.match(numberPattern);

  if (!match) return 0;

  const parsed = parseFloat(match[0]);
  return isNaN(parsed) ? 0 : parsed;
};
