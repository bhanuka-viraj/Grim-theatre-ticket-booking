import { useState } from "react";
import { api } from "../services/api";
import styles from "../styles/AdminDashboard.module.css";
import QRScanner from "./QRScanner";

function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Try to fetch statistics to validate password
      const response = await api.getStatistics(password);

      if (response.success) {
        setAuthenticated(true);
        setStatistics(response.data);
        await fetchTickets();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid admin password");
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async (filterValue = "all") => {
    setLoading(true);
    try {
      const filters = {};
      if (filterValue === "tickets") {
        // Show only paid tickets (not yet redeemed)
        filters.paymentStatus = "paid";
        filters.isRedeemed = false;
      } else if (filterValue === "redeemed") {
        // Show only redeemed tickets
        filters.isRedeemed = true;
      }
      // "all" shows everything (no filters)

      const response = await api.getAllTickets(filters, password);

      if (response.success) {
        setTickets(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    fetchTickets(newFilter);
  };

  const handleQRScan = async (decodedText) => {
    try {
      // Parse QR code data
      const qrData = JSON.parse(decodedText);
      const ticketNumber = qrData.ticketNumber;

      // Redeem the ticket
      const response = await api.redeemTicket(ticketNumber, password);

      if (response.success) {
        setScanResult({
          success: true,
          message: `Ticket #${ticketNumber} redeemed successfully!.`,
          ticket: response.data.ticket,
        });

        // Refresh tickets list
        await fetchTickets(filter);
      }
    } catch (err) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || "Failed to redeem ticket",
      });
    }
  };

  if (!authenticated) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1>🔐 Admin Login</h1>
          <p>Enter admin password to access dashboard</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="Enter admin password"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-large btn-block"
              disabled={loading || !password}
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>

          <div className={styles.backLink}>
            <a href="/">← Back to Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>📊 Admin Dashboard</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowScanner(!showScanner)}
          >
            {showScanner ? "📋 View Tickets" : "📷 Scan QR Code"}
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setAuthenticated(false)}
          >
            Logout
          </button>
        </div>
      </header>

      {/* QR Scanner Section */}
      {showScanner && (
        <div className={styles.scannerSection}>
          <h2>🎫 Scan Ticket QR Code</h2>
          <p>
            Position the QR code within the camera frame to validate and redeem
            tickets
          </p>

          {scanResult && (
            <div
              className={`alert ${
                scanResult.success ? "alert-success" : "alert-error"
              }`}
              style={{ marginBottom: "20px" }}
            >
              <strong>{scanResult.success ? "✅ Success!" : "❌ Error"}</strong>
              <p>{scanResult.message}</p>
              {scanResult.ticket && (
                <div>
                  <p>
                    <strong>Customer:</strong> {scanResult.ticket.fullName}
                  </p>
                  <p>
                    <strong>Email:</strong> {scanResult.ticket.email}
                  </p>
                  <p>
                    <strong>Redeemed:</strong>{" "}
                    {new Date(scanResult.ticket.redeemedAt).toLocaleString()}
                  </p>
                </div>
              )}
              <button
                onClick={() => setScanResult(null)}
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Scan Next Ticket
              </button>
            </div>
          )}

          {!scanResult && <QRScanner onScan={handleQRScan} />}
        </div>
      )}

      {/* Statistics */}
      {!showScanner && statistics && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎫</div>
            <div className={styles.statValue}>{statistics.totalTickets}</div>
            <div className={styles.statLabel}>Total Bookings</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statValue}>{statistics.paidTickets}</div>
            <div className={styles.statLabel}>Valid Tickets</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎟️</div>
            <div className={styles.statValue}>{statistics.redeemedTickets}</div>
            <div className={styles.statLabel}>Redeemed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statValue}>
              LKR {statistics.totalRevenue.toFixed(2)}
            </div>
            <div className={styles.statLabel}>Total Revenue</div>
          </div>
        </div>
      )}

      {/* Filters */}
      {!showScanner && (
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${
              filter === "all" ? styles.active : ""
            }`}
            onClick={() => handleFilterChange("all")}
          >
            All Bookings
          </button>
          <button
            className={`${styles.filterBtn} ${
              filter === "tickets" ? styles.active : ""
            }`}
            onClick={() => handleFilterChange("tickets")}
          >
            🎫 Valid Tickets
          </button>
          <button
            className={`${styles.filterBtn} ${
              filter === "redeemed" ? styles.active : ""
            }`}
            onClick={() => handleFilterChange("redeemed")}
          >
            ✅ Redeemed
          </button>
        </div>
      )}

      {/* Tickets Table */}
      {!showScanner && (
        <div className={styles.tableContainer}>
          <h2>Ticket Bookings ({tickets.length})</h2>

          {loading ? (
            <div className="spinner"></div>
          ) : tickets.length === 0 ? (
            <p className={styles.noData}>No tickets found.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket._id}>
                      <td className={styles.ticketNumber}>
                        #{ticket.ticketNumber}
                      </td>
                      <td>{ticket.fullName}</td>
                      <td>{ticket.email}</td>
                      <td>{ticket.phone}</td>
                      <td>LKR {ticket.amount.toFixed(2)}</td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            styles[ticket.paymentStatus]
                          }`}
                        >
                          {ticket.paymentStatus}
                        </span>
                      </td>
                      <td>
                        {new Date(ticket.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
