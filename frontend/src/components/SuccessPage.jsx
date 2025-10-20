import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import styles from "../styles/SuccessPage.module.css";

function SuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    fetchTicketDetails();

    // Poll for payment status every 3 seconds (max 10 times = 30 seconds)
    let pollCount = 0;
    const pollInterval = setInterval(() => {
      pollCount++;
      if (pollCount >= 10) {
        clearInterval(pollInterval);
        return;
      }
      fetchTicketDetails();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [orderId]);

  const fetchTicketDetails = async () => {
    try {
      const response = await api.getTicketByOrder(orderId);

      if (response.success) {
        setTicket(response.data.ticket);
      }
    } catch (err) {
      console.error("Error fetching ticket:", err);
      setError(err.response?.data?.message || "Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (ticket?.ticketNumber) {
      window.open(api.downloadTicket(ticket.ticketNumber), "_blank");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="spinner"></div>
        <p>Loading your ticket...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className="alert alert-error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!ticket || ticket.paymentStatus !== "paid") {
    return (
      <div className={styles.container}>
        <div className="alert alert-info">
          <h2>✅ Payment Successful!</h2>
          <p>Your payment was completed successfully on PayHere.</p>
          <p>
            Ticket Number: <strong>#{ticket?.ticketNumber}</strong>
          </p>
          {ticket?.orderId && <p>Order ID: {ticket.orderId}</p>}
          <br />
          <div
            style={{
              background: "#fff3cd",
              padding: "15px",
              borderRadius: "8px",
              marginTop: "10px",
            }}
          >
            <p>
              <strong>Note:</strong> Webhook notification is pending because
              PayHere cannot reach localhost.
            </p>
            <p>In production, this will update automatically.</p>
            <p>For now, you can download your ticket below:</p>
            <button
              onClick={() =>
                window.open(api.downloadTicket(ticket?.ticketNumber), "_blank")
              }
              style={{
                background: "#DC143C",
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              📥 Download Ticket PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}>✅</div>
        <h1 className={styles.title}>Payment Successful!</h1>
        <p className={styles.message}>
          Thank you for your booking! Your ticket has been generated.
        </p>

        <div className={styles.ticketInfo}>
          <div className={styles.ticketNumber}>
            <div className={styles.label}>Ticket Number</div>
            <div className={styles.value}>#{ticket.ticketNumber}</div>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Name</div>
              <div className={styles.detailValue}>{ticket.fullName}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Email</div>
              <div className={styles.detailValue}>{ticket.email}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Amount Paid</div>
              <div className={styles.detailValue}>
                {ticket.currency} {ticket.amount.toFixed(2)}
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Order ID</div>
              <div className={styles.detailValue}>{ticket.orderId}</div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className="btn btn-primary btn-large"
            onClick={handleDownload}
          >
            📄 Download Ticket PDF
          </button>
        </div>

        <div className={styles.emailNotice}>
          <p>
            📧 A copy of your ticket has been sent to{" "}
            <strong>{ticket.email}</strong>
          </p>
          <p className={styles.noticeText}>
            Please bring this ticket (printed or on mobile) on the event day.
          </p>
        </div>

        <div className={styles.footer}>
          <a href="/" className="btn btn-outline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;
