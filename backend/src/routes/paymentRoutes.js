import express from "express";
import {
  handlePaymentNotification,
  getPaymentStatus,
} from "../controllers/paymentController.js";

const router = express.Router();

// PayHere webhook - no authentication (PayHere sends notification)
router.post("/notify", handlePaymentNotification);

// Check payment status
router.get("/status/:orderId", getPaymentStatus);

export default router;
