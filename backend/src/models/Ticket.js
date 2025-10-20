import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    // Unique 6-digit ticket number
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^\d{6}$/,
    },

    // Customer details
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // Payment details
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
      sparse: true, // PayHere payment ID (received after payment)
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "LKR",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },

    // Ticket status
    isRedeemed: {
      type: Boolean,
      default: false,
    },
    redeemedAt: {
      type: Date,
    },

    // Email delivery status
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },

    // PDF generation
    pdfGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for efficient queries
ticketSchema.index({ email: 1, createdAt: -1 });
ticketSchema.index({ paymentStatus: 1, createdAt: -1 });

// Virtual for formatted ticket display
ticketSchema.virtual("formattedTicketNumber").get(function () {
  return `#${this.ticketNumber}`;
});

// Instance method to mark as redeemed
ticketSchema.methods.redeem = function () {
  this.isRedeemed = true;
  this.redeemedAt = new Date();
  return this.save();
};

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
