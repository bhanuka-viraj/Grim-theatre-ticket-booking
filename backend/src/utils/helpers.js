/**
 * Async handler wrapper to eliminate try-catch boilerplate
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Generate a unique 6-digit ticket number
 * Format: NNNNNN (e.g., 123456)
 */
export const generateTicketNumber = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate unique order ID
 * Format: ORD-timestamp-random
 */
export const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount, currency = "LKR") => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Sri Lankan phone number
 * Accepts: 0771234567, +94771234567, 94771234567
 */
export const isValidPhoneLK = (phone) => {
  const phoneRegex = /^(?:\+94|94|0)?[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};
