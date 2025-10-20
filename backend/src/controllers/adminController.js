import ticketService from "../services/ticketService.js";
import { asyncHandler } from "../utils/helpers.js";

/**
 * Admin Controller - Admin dashboard endpoints
 */

/**
 * @route   GET /api/admin/tickets
 * @desc    Get all tickets with filters
 * @access  Admin only
 */
export const getAllTickets = asyncHandler(async (req, res) => {
  const { paymentStatus, isRedeemed } = req.query;

  const filters = {};
  if (paymentStatus) {
    filters.paymentStatus = paymentStatus;
  }
  if (isRedeemed !== undefined) {
    filters.isRedeemed = isRedeemed === "true";
  }

  const tickets = await ticketService.getAllTickets(filters);

  res.json({
    success: true,
    count: tickets.length,
    data: tickets,
  });
});

/**
 * @route   GET /api/admin/statistics
 * @desc    Get booking statistics
 * @access  Admin only
 */
export const getStatistics = asyncHandler(async (req, res) => {
  const stats = await ticketService.getStatistics();

  res.json({
    success: true,
    data: stats,
  });
});
