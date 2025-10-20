import Ticket from "../models/Ticket.js";
import mongoose from "mongoose";
import { generateTicketNumber, generateOrderId } from "../utils/helpers.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

/**
 * Ticket Service - Business logic for ticket operations
 * Separated from controllers for better testability and reusability
 */
class TicketService {
  /**
   * Create a new ticket booking (pending payment)
   * Uses MongoDB transactions for atomicity
   */
  async createTicket(bookingData) {
    const { fullName, email, phone } = bookingData;

    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();

    try {
      // Start transaction
      session.startTransaction();

      // Generate unique ticket number (retry if collision)
      let ticketNumber;
      let isUnique = false;
      let attempts = 0;
      const MAX_ATTEMPTS = 10;

      while (!isUnique && attempts < MAX_ATTEMPTS) {
        ticketNumber = generateTicketNumber();
        const existing = await Ticket.findOne({ ticketNumber }).session(
          session
        );
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new ValidationError(
          "Unable to generate unique ticket number. Please try again."
        );
      }

      // Generate unique order ID
      const orderId = generateOrderId();

      // Create ticket in database within transaction
      const [ticket] = await Ticket.create(
        [
          {
            ticketNumber,
            orderId,
            fullName,
            email,
            phone,
            amount: parseFloat(process.env.TICKET_PRICE),
            currency: process.env.CURRENCY || "LKR",
            paymentStatus: "pending",
          },
        ],
        { session }
      );

      // Commit transaction
      await session.commitTransaction();

      return ticket;
    } catch (error) {
      // Rollback transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      // End session
      session.endSession();
    }
  }

  /**
   * Update ticket after successful payment
   */
  async confirmPayment(orderId, paymentData) {
    const ticket = await Ticket.findOne({ orderId });

    if (!ticket) {
      throw new NotFoundError("Ticket");
    }

    ticket.paymentStatus = "paid";
    ticket.paymentId = paymentData.paymentId;
    ticket.paymentMethod = paymentData.paymentMethod;

    await ticket.save();
    return ticket;
  }

  /**
   * Mark ticket as failed payment
   */
  async failPayment(orderId) {
    const ticket = await Ticket.findOne({ orderId });

    if (!ticket) {
      throw new NotFoundError("Ticket");
    }

    ticket.paymentStatus = "failed";
    await ticket.save();
    return ticket;
  }

  /**
   * Get ticket by ticket number
   */
  async getTicketByNumber(ticketNumber) {
    const ticket = await Ticket.findOne({ ticketNumber });

    if (!ticket) {
      throw new NotFoundError("Ticket");
    }

    return ticket;
  }

  /**
   * Get ticket by order ID
   */
  async getTicketByOrderId(orderId) {
    const ticket = await Ticket.findOne({ orderId });

    if (!ticket) {
      throw new NotFoundError("Ticket");
    }

    return ticket;
  }

  /**
   * Get all tickets (for admin)
   */
  async getAllTickets(filters = {}) {
    const query = {};

    // Filter by payment status
    if (filters.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }

    // Filter by redemption status
    if (filters.isRedeemed !== undefined) {
      query.isRedeemed = filters.isRedeemed;
    }

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .select("-__v");

    return tickets;
  }

  /**
   * Get ticket statistics (for admin dashboard)
   */
  async getStatistics() {
    const totalTickets = await Ticket.countDocuments();
    const paidTickets = await Ticket.countDocuments({ paymentStatus: "paid" });
    const pendingTickets = await Ticket.countDocuments({
      paymentStatus: "pending",
    });
    const failedTickets = await Ticket.countDocuments({
      paymentStatus: "failed",
    });
    const redeemedTickets = await Ticket.countDocuments({ isRedeemed: true });

    const totalRevenue = await Ticket.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return {
      totalTickets,
      paidTickets,
      pendingTickets,
      failedTickets,
      redeemedTickets,
      totalRevenue: totalRevenue[0]?.total || 0,
    };
  }

  /**
   * Mark ticket as PDF generated
   */
  async markPdfGenerated(ticketId) {
    const ticket = await Ticket.findById(ticketId);
    if (ticket) {
      ticket.pdfGenerated = true;
      await ticket.save();
    }
    return ticket;
  }

  /**
   * Mark ticket email as sent
   */
  async markEmailSent(ticketId) {
    const ticket = await Ticket.findById(ticketId);
    if (ticket) {
      ticket.emailSent = true;
      ticket.emailSentAt = new Date();
      await ticket.save();
    }
    return ticket;
  }
}

export default new TicketService();
