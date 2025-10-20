#!/usr/bin/env node

/**
 * Cleanup Abandoned Tickets Script
 * Removes pending tickets older than X minutes that were never completed
 * Run this periodically via cron job
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend folder (one level up from scripts)
dotenv.config({ path: join(__dirname, "..", ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
const CLEANUP_AGE_MINUTES = process.env.CLEANUP_AGE_MINUTES || 30; // Default 30 minutes

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

// Ticket Schema
const ticketSchema = new mongoose.Schema({
  ticketNumber: String,
  orderId: String,
  fullName: String,
  email: String,
  phone: String,
  amount: Number,
  currency: String,
  paymentStatus: String,
  paymentId: String,
  paymentMethod: String,
  isRedeemed: Boolean,
  redeemedAt: Date,
  pdfGenerated: Boolean,
  emailSent: Boolean,
  createdAt: Date,
  updatedAt: Date,
});

const Ticket = mongoose.model("Ticket", ticketSchema);

async function cleanupAbandonedTickets() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Calculate cutoff time
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - CLEANUP_AGE_MINUTES);

    console.log(`🕐 Cleanup threshold: ${CLEANUP_AGE_MINUTES} minutes`);
    console.log(`📅 Cutoff time: ${cutoffTime.toISOString()}\n`);

    // Find abandoned pending tickets
    const abandonedTickets = await Ticket.find({
      paymentStatus: "pending",
      createdAt: { $lt: cutoffTime },
    });

    console.log(`📊 Found ${abandonedTickets.length} abandoned ticket(s)\n`);

    if (abandonedTickets.length === 0) {
      console.log("✨ No abandoned tickets to clean up");
      await mongoose.connection.close();
      process.exit(0);
    }

    // Display tickets to be deleted
    console.log("🗑️  Tickets to be deleted:");
    abandonedTickets.forEach((ticket) => {
      const age = Math.floor((new Date() - ticket.createdAt) / 1000 / 60);
      console.log(
        `   - ${ticket.ticketNumber} | ${ticket.fullName} | ${ticket.email} | Age: ${age} minutes`
      );
    });
    console.log("");

    // Delete abandoned tickets
    const result = await Ticket.deleteMany({
      paymentStatus: "pending",
      createdAt: { $lt: cutoffTime },
    });

    console.log(
      `✅ Successfully deleted ${result.deletedCount} abandoned ticket(s)`
    );
    console.log("✨ Cleanup completed successfully!\n");

    await mongoose.connection.close();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
cleanupAbandonedTickets();
