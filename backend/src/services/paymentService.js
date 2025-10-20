import { generatePayhereHash, payhereConfig } from "../config/payhere.js";
import ticketService from "./ticketService.js";
import md5 from "md5";

/**
 * Payment Service - Handles PayHere payment processing
 */
class PaymentService {
  /**
   * Initialize PayHere payment
   * Returns payment data to be sent to PayHere checkout
   */
  async initializePayment(ticket) {
    const { orderId, amount, fullName, email, phone } = ticket;

    // Generate PayHere hash for security
    const hash = generatePayhereHash(orderId, amount);

    console.log("PayHere Payment Debug:", {
      merchant_id: payhereConfig.appID,
      order_id: orderId,
      amount: amount.toFixed(2),
      hash: hash,
      sandbox: true,
    });

    // PayHere payment object
    const paymentData = {
      merchant_id: payhereConfig.appID,
      return_url: `${process.env.FRONTEND_URL}/success?order_id=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel?order_id=${orderId}`,
      notify_url: `${
        process.env.BACKEND_URL || "https://c9376bc3dda8.ngrok-free.app"
      }/api/payment/notify`,

      // Order details
      order_id: orderId,
      items: process.env.EVENT_NAME || "Movie Night Ticket",
      currency: payhereConfig.currency,
      amount: amount.toFixed(2),

      // Customer details
      first_name: fullName.split(" ")[0],
      last_name: fullName.split(" ").slice(1).join(" ") || "Guest",
      email: email,
      phone: phone,
      address: "IJSE Campus",
      city: "Colombo",
      country: "Sri Lanka",

      // Hash for security
      hash: hash,

      // Sandbox mode (boolean true/false for PayHere JS SDK)
      sandbox: true,
    };

    return paymentData;
  }

  /**
   * Process PayHere notification (webhook)
   * Called by PayHere after payment completion
   */
  async processNotification(notificationData) {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      method,
    } = notificationData;

    // Verify signature for security
    // Note: PayHere sends uppercase MD5SIG
    const isValid = this.verifyNotification(
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      status_code,
      md5sig
    );

    if (!isValid) {
      console.error("⚠️  Invalid PayHere signature for order:", order_id);
      return { success: false, message: "Invalid signature" };
    }

    // Status code 2 = Success
    if (status_code === "2") {
      await ticketService.confirmPayment(order_id, {
        paymentId: payment_id,
        paymentMethod: method,
      });

      return { success: true, message: "Payment confirmed", orderId: order_id };
    } else {
      // Payment failed or cancelled
      await ticketService.failPayment(order_id);
      return { success: false, message: "Payment failed", orderId: order_id };
    }
  }

  /**
   * Verify PayHere notification signature
   */
  verifyNotification(
    merchantId,
    orderId,
    paymentId,
    amount,
    statusCode,
    receivedHash
  ) {
    const merchantSecret = md5(payhereConfig.appSecret).toUpperCase();
    const amountFormatted = parseFloat(amount).toFixed(2);

    const localHash = md5(
      merchantId +
        orderId +
        amountFormatted +
        payhereConfig.currency +
        statusCode +
        merchantSecret
    ).toUpperCase();

    return localHash === receivedHash.toUpperCase();
  }
}

export default new PaymentService();
