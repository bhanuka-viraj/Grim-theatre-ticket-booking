#!/usr/bin/env node

/**
 * Clear All Tickets Script
 * WARNING: This will delete ALL ticket records from the database
 * Use with caution - this action cannot be undone
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, ".env") });

const MONGODB_URI =
  "mongodb+srv://ijsescgrimtheatre_db_user:jfx9lZs1BENGYBLa@cluster0.pa8zmim.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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

async function clearAllTickets() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n⚠️  WARNING: This will delete ALL ticket records!");

    // Count tickets before deletion
    const count = await Ticket.countDocuments();
    console.log(`📊 Found ${count} ticket(s) in database`);

    if (count === 0) {
      console.log("✨ Database is already empty");
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log("\n🗑️  Deleting all tickets...");
    const result = await Ticket.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} ticket(s)`);

    console.log("\n📊 Final count:", await Ticket.countDocuments());
    console.log("✨ Database cleared successfully!");

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
clearAllTickets();
