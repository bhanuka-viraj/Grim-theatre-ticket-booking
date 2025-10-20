import { useState } from "react";
import { api } from "../services/api";
import styles from "../styles/BookingForm.module.css";

function BookingForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPayhere, setShowPayhere] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^(?:\+94|94|0)?[0-9]{9}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Invalid Sri Lankan phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.createBooking(formData);

      if (response.success) {
        setPaymentData(response.data.payment);

        // Trigger PayHere payment
        setTimeout(() => {
          initiatePayHerePayment(response.data.payment);
        }, 500);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const initiatePayHerePayment = (payment) => {
    // Check if PayHere is loaded
    const checkPayHere = () => {
      if (window.payhere) {
        // PayHere is loaded, set up callbacks
        window.payhere.onCompleted = function onCompleted(orderId) {
          console.log("Payment completed. Order ID:", orderId);
          window.location.href = `/success?order_id=${orderId}`;
        };

        window.payhere.onDismissed = async function onDismissed() {
          console.log("Payment dismissed");

          // Delete the pending booking record
          try {
            await api.delete(`/tickets/${bookingData.ticketNumber}`);
            console.log("Pending booking deleted");
          } catch (error) {
            console.error("Failed to delete booking:", error);
          }

          alert(
            "Payment was cancelled. Please book again if you wish to attend."
          );
          navigate("/");
        };

        window.payhere.onError = function onError(error) {
          console.log("Payment error:", error);
          alert("Payment failed. Please try again.");
        };

        // Start the payment
        console.log("Starting PayHere payment with data:", payment);
        window.payhere.startPayment(payment);
      } else {
        // Wait a bit and try again (max 5 attempts)
        console.log("PayHere not loaded yet, waiting...");
        setTimeout(() => {
          if (window.payhere) {
            checkPayHere();
          } else {
            // Fallback after waiting
            console.error("PayHere SDK failed to load");
            alert(
              `PayHere SDK is not loaded. Please check your internet connection and refresh the page.\n\nOrder ID: ${payment.order_id}\nAmount: LKR ${payment.amount}`
            );
          }
        }, 500);
      }
    };

    checkPayHere();
  };

  return (
    <div className={styles.bookingContainer}>
      <div className={styles.header}>
        <h1>🎬 IJSE Movie Night 2025</h1>
        <p className={styles.subtitle}>Book Your Ticket Now!</p>
      </div>

      <div className={styles.eventInfo}>
        <div className={styles.infoItem}>
          <span className={styles.icon}>📅</span>
          <div>
            <div className={styles.infoLabel}>Date</div>
            <div className={styles.infoValue}>December 15, 2025</div>
          </div>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.icon}>🕐</span>
          <div>
            <div className={styles.infoLabel}>Time</div>
            <div className={styles.infoValue}>7:00 PM</div>
          </div>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.icon}>📍</span>
          <div>
            <div className={styles.infoLabel}>Venue</div>
            <div className={styles.infoValue}>IJSE Campus Auditorium</div>
          </div>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.icon}>💰</span>
          <div>
            <div className={styles.infoLabel}>Price</div>
            <div className={styles.infoValue}>LKR 350.00</div>
          </div>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName" className="form-label">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`form-control ${errors.fullName ? "error" : ""}`}
            placeholder="Enter your full name"
            disabled={loading}
          />
          {errors.fullName && (
            <div className="error-message">{errors.fullName}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-control ${errors.email ? "error" : ""}`}
            placeholder="your.email@example.com"
            disabled={loading}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`form-control ${errors.phone ? "error" : ""}`}
            placeholder="0771234567"
            disabled={loading}
          />
          {errors.phone && <div className="error-message">{errors.phone}</div>}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-large btn-block"
          disabled={loading}
        >
          {loading ? "Processing..." : "Proceed to Payment - LKR 350.00"}
        </button>

        <p className={styles.disclaimer}>
          * By clicking "Proceed to Payment", you will be redirected to PayHere
          secure payment gateway. Your ticket will be sent to your email after
          successful payment.
        </p>
      </form>
    </div>
  );
}

export default BookingForm;
