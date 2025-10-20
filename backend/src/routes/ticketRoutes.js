import express from "express";
import { body } from "express-validator";
import {
  createBooking,
  getTicket,
  getTicketByOrder,
  downloadTicket,
  redeemTicket,
  cancelBooking,
} from "../controllers/ticketController.js";
import { validate } from "../middleware/validate.js";
import { isValidEmail, isValidPhoneLK } from "../utils/helpers.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Validation rules for ticket booking
 */
const bookingValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .custom((value) => {
      if (!isValidPhoneLK(value)) {
        throw new Error("Invalid Sri Lankan phone number");
      }
      return true;
    }),
];

// Routes
router.post("/book", bookingValidation, validate, createBooking);
router.get("/order/:orderId", getTicketByOrder);
router.get("/:ticketNumber", getTicket);
router.get("/:ticketNumber/download", downloadTicket);
router.post("/:ticketNumber/redeem", adminAuth, redeemTicket);
router.delete("/:ticketNumber", cancelBooking);

export default router;
