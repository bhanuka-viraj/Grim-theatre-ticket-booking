/**
 * PayHere Payment Gateway Configuration
 * https://support.payhere.lk/api-&-mobile-sdk/javascript-sdk
 */

export const payhereConfig = {
  // PayHere Test Merchant (pre-approved for all domains in sandbox)
  // Use this until your domain is approved (takes up to 24 hours)
  // Then replace with: appID: "1232499", appSecret: "MjU0Nzc1MDgyNjEwNDM3NjYxMTEzNTkxNDM0NjM1Mzc4MzY1Mzgw"
  appID: process.env.PAYHERE_APP_ID || "1232499",
  appSecret:
    process.env.PAYHERE_APP_SECRET ||
    "MTczOTkyMjQxODkwODU5OTc1MDgxODQwNDM3MTg5MDg1NjMwNQ==",
  isSandbox: process.env.PAYHERE_SANDBOX === "true" || true,
  currency: process.env.CURRENCY || "LKR",

  // PayHere URLs (not used for JS SDK, kept for reference)
  get checkoutUrl() {
    return this.isSandbox
      ? "https://sandbox.payhere.lk/pay/checkout"
      : "https://www.payhere.lk/pay/checkout";
  },
};

// Debug: Log config on load
console.log("PayHere Config:", {
  appID: payhereConfig.appID,
  appSecret: payhereConfig.appSecret ? "***SET***" : "UNDEFINED",
  isSandbox: payhereConfig.isSandbox,
  currency: payhereConfig.currency,
});

/**
 * Generate PayHere payment hash (MD5)
 * Format: merchant_id + order_id + amount + currency + MD5(merchant_secret)
 */
import crypto from "crypto";
import md5 from "md5";

export function generatePayhereHash(orderId, amount) {
  // Debug: Check if values exist
  if (!payhereConfig.appSecret) {
    throw new Error(
      "PAYHERE_APP_SECRET is not defined in environment variables"
    );
  }
  if (!payhereConfig.appID) {
    throw new Error("PAYHERE_APP_ID is not defined in environment variables");
  }

  const merchantSecret = md5(payhereConfig.appSecret).toUpperCase();
  const amountFormatted = parseFloat(amount).toFixed(2);

  const hashString =
    payhereConfig.appID +
    orderId +
    amountFormatted +
    payhereConfig.currency +
    merchantSecret;

  return md5(hashString).toUpperCase();
}

/**
 * Verify PayHere notification signature
 */
export function verifyPayhereSignature(
  merchantId,
  orderId,
  paymentId,
  amount,
  statusCode,
  md5sig
) {
  const merchantSecret = md5(payhereConfig.appSecret).toUpperCase();
  const amountFormatted = parseFloat(amount).toFixed(2);

  const localHash = md5(
    merchantId +
      orderId +
      amountFormatted +
      payhereConfig.currency +
      statusCode +
      merchantSecret
  ).toUpperCase();

  return localHash === md5sig;
}
