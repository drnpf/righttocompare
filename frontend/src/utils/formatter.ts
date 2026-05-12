/**
 * Formats a price to USD rounded to nearest dollar.
 * @param price Price to be formatted
 * @returns Returns a rounded number to the nearest dollar
 */
export const formatPrice = (price: number | string | undefined | null) => {
  if (price === undefined || price === null || price === "---" || price === 0) {
    return "---";
  }

  // Strips out characters other than numbers and .
  let numericValue: number;
  if (typeof price === "string") {
    // Regex: keep only digits and the first decimal point
    const cleaned = price.replace(/[^0-9.]/g, "");
    numericValue = parseFloat(cleaned);
  } else {
    numericValue = price;
  }

  // Fallback = ---
  if (isNaN(numericValue) || numericValue === 0) return "---";

  // Format as USD with no decimals
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numericValue);
};
