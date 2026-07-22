const EXCHANGE_RATES = {
  INR: 1.0,
  USD: 83.0,  // 1 USD = 83 INR
  EUR: 90.0,  // 1 EUR = 90 INR
  GBP: 105.0, // 1 GBP = 105 INR
  JPY: 0.55   // 1 JPY = 0.55 INR
};

const LOCALES = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  JPY: "ja-JP"
};

export const convertPrice = (amount, from = "INR", to = "INR") => {
  const normalizedFrom = (from || "INR").toUpperCase();
  const normalizedTo = (to || "INR").toUpperCase();

  const fromRate = EXCHANGE_RATES[normalizedFrom];
  const toRate = EXCHANGE_RATES[normalizedTo];

  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency conversion from "${normalizedFrom}" to "${normalizedTo}".`);
  }

  // Convert to base currency (INR) first, then to destination currency
  const amountInInr = amount * fromRate;
  const converted = amountInInr / toRate;

  return Number(converted.toFixed(2));
};

export const formatCurrency = (amount, currencyCode = "INR") => {
  const code = (currencyCode || "INR").toUpperCase();
  const locale = LOCALES[code] || "en-IN";

  // JPY has no decimal fractions in standard formatting
  const maxDecimals = code === "JPY" ? 0 : 2;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: maxDecimals
  }).format(amount);
};
