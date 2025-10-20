import ticketService from "../services/ticketService.js";
import paymentService from "../services/paymentService.js";
import pdfService from "../services/pdfService.js";
import emailService from "../services/emailService.js";
import { asyncHandler } from "../utils/helpers.js";
import { ValidationError } from "../utils/errors.js";

/**
 * Ticket Controller - Handles HTTP requests for ticket operations
 */

/**
 * @route   POST /api/tickets/book
 * @desc    Create new ticket booking and initialize payment
 * @access  Public
 */
export const createBooking = asyncHandler(async (req, res) => {
  const { fullName, email, phone } = req.body;

  // Create ticket in database (pending payment)
  const ticket = await ticketService.createTicket({
    fullName,
    email,
    phone,
  });

  // Initialize PayHere payment
  const paymentData = await paymentService.initializePayment(ticket);

  res.status(201).json({
    success: true,
    message: "Booking created successfully",
    data: {
      ticket: {
        ticketNumber: ticket.ticketNumber,
        orderId: ticket.orderId,
        fullName: ticket.fullName,
        email: ticket.email,
      },
      payment: paymentData,
    },
  });
});

/**
 * @route   GET /api/tickets/:ticketNumber
 * @desc    Get ticket details by ticket number
 * @access  Public
 */
export const getTicket = asyncHandler(async (req, res) => {
  const { ticketNumber } = req.params;

  const ticket = await ticketService.getTicketByNumber(ticketNumber);

  res.json({
    success: true,
    data: {
      ticketNumber: ticket.ticketNumber,
      fullName: ticket.fullName,
      email: ticket.email,
      paymentStatus: ticket.paymentStatus,
      isRedeemed: ticket.isRedeemed,
      createdAt: ticket.createdAt,
    },
  });
});

/**
 * @route   GET /api/tickets/order/:orderId
 * @desc    Get ticket by order ID (after payment)
 * @access  Public
 */
export const getTicketByOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const ticket = await ticketService.getTicketByOrderId(orderId);

  // Generate PDF if not already generated
  let pdfBuffer;
  if (ticket.paymentStatus === "paid") {
    pdfBuffer = await pdfService.generateTicket(ticket);

    // Mark PDF as generated
    await ticketService.markPdfGenerated(ticket._id);

    // Send email if not sent yet
    if (!ticket.emailSent) {
      const emailResult = await emailService.sendTicketEmail(ticket, pdfBuffer);
      if (emailResult.sent) {
        await ticketService.markEmailSent(ticket._id);
      }
    }
  }

  res.json({
    success: true,
    data: {
      ticket: {
        ticketNumber: ticket.ticketNumber,
        orderId: ticket.orderId,
        fullName: ticket.fullName,
        email: ticket.email,
        paymentStatus: ticket.paymentStatus,
        amount: ticket.amount,
        currency: ticket.currency,
      },
      pdfGenerated: ticket.paymentStatus === "paid",
    },
  });
});

/**
 * @route   GET /api/tickets/:ticketNumber/download
 * @desc    Download PDF ticket
 * @access  Public
 */
export const downloadTicket = asyncHandler(async (req, res) => {
  const { ticketNumber } = req.params;

  const ticket = await ticketService.getTicketByNumber(ticketNumber);

  // In development, allow PDF download even for pending payments (webhook won't work with localhost)
  // In production, strict payment verification
  if (
    process.env.NODE_ENV === "production" &&
    ticket.paymentStatus !== "paid"
  ) {
    throw new ValidationError("Ticket payment is not confirmed");
  }

  // Generate PDF
  const pdfBuffer = await pdfService.generateTicket(ticket);

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="ticket-${ticketNumber}.pdf"`
  );

  res.send(pdfBuffer);
});

/**
 * @route   POST /api/tickets/:ticketNumber/redeem
 * @desc    Redeem a ticket (mark as used)
 * @access  Admin
 */
export const redeemTicket = asyncHandler(async (req, res) => {
  const { ticketNumber } = req.params;

  const ticket = await ticketService.getTicketByNumber(ticketNumber);

  if (ticket.isRedeemed) {
    throw new ValidationError("Ticket has already been redeemed");
  }

  if (ticket.paymentStatus !== "paid") {
    throw new ValidationError("Ticket payment is not confirmed");
  }

  // Mark ticket as redeemed
  ticket.redeem();
  await ticket.save();

  res.json({
    success: true,
    message: "Ticket redeemed successfully",
    data: {
      ticket: {
        ticketNumber: ticket.ticketNumber,
        fullName: ticket.fullName,
        email: ticket.email,
        isRedeemed: ticket.isRedeemed,
        redeemedAt: ticket.redeemedAt,
      },
    },
  });
});

/**
 * @route   DELETE /api/tickets/:ticketNumber
 * @desc    Cancel/delete a pending ticket booking
 * @access  Public
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const { ticketNumber } = req.params;

  const ticket = await ticketService.getTicketByNumber(ticketNumber);

  // Only allow deleting pending tickets
  if (ticket.paymentStatus === "paid") {
    throw new ValidationError("Cannot cancel a paid ticket");
  }

  if (ticket.isRedeemed) {
    throw new ValidationError("Cannot cancel a redeemed ticket");
  }

  // Delete the ticket record
  await ticket.deleteOne();

  res.json({
    success: true,
    message: "Booking cancelled successfully",
  });
});
