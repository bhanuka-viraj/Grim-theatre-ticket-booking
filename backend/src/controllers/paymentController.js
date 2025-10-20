import paymentService from "../services/paymentService.js";
import { asyncHandler } from "../utils/helpers.js";

/**
 * Payment Controller - Handles PayHere payment callbacks
 */

/**
 * @route   POST /api/payment/notify
 * @desc    PayHere payment notification webhook
 * @access  Public (called by PayHere)
 */
export const handlePaymentNotification = asyncHandler(async (req, res) => {
  const notificationData = req.body;

  console.log("📨 PayHere Notification received:", notificationData);

  // Process the payment notification
  const result = await paymentService.processNotification(notificationData);

  if (result.success) {
    console.log("✅ Payment processed successfully:", result.orderId);
  } else {
    console.error("❌ Payment processing failed:", result.message);
  }

  // Always return 200 OK to PayHere
  res.status(200).send("OK");
});

/**
 * @route   GET /api/payment/status/:orderId
 * @desc    Check payment status
 * @access  Public
 */
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // This would typically query the ticket status
  const ticketService = (await import("../services/ticketService.js")).default;
  const ticket = await ticketService.getTicketByOrderId(orderId);

  res.json({
    success: true,
    data: {
      orderId: ticket.orderId,
      paymentStatus: ticket.paymentStatus,
      paymentId: ticket.paymentId,
    },
  });
});
