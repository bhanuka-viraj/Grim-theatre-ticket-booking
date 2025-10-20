import emailConfig from "../config/email.js";

/**
 * Email Service - Sends emails with PDF attachments
 */
class EmailService {
  /**
   * Send ticket email with PDF attachment
   * @param {Object} ticket - Ticket data
   * @param {Buffer} pdfBuffer - PDF file buffer
   */
  async sendTicketEmail(ticket, pdfBuffer) {
    const transporter = emailConfig.getTransporter();

    if (!emailConfig.isConfigured()) {
      console.log("📧 Email not configured. Would have sent to:", ticket.email);
      console.log("   Ticket Number:", ticket.ticketNumber);
      return { sent: false, reason: "SMTP not configured" };
    }

    const eventName = process.env.EVENT_NAME || "Movie Night 2025";
    const eventDate = process.env.EVENT_DATE || "[Event Date]";
    const eventTime = process.env.EVENT_TIME || "[Event Time]";
    const eventVenue = process.env.EVENT_VENUE || "[Event Venue]";

    const mailOptions = {
      from: process.env.EMAIL_FROM || "IJSE Movie Night <noreply@ijse.lk>",
      to: ticket.email,
      subject: `Your ${eventName} Ticket - #${ticket.ticketNumber}`,
      html: this.getEmailTemplate(
        ticket,
        eventName,
        eventDate,
        eventTime,
        eventVenue
      ),
      attachments: [
        {
          filename: `ticket-${ticket.ticketNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email sent:", info.messageId);
      return { sent: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Email sending failed:", error.message);
      return { sent: false, reason: error.message };
    }
  }

  /**
   * Get HTML email template
   */
  getEmailTemplate(ticket, eventName, eventDate, eventTime, eventVenue) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #000000 0%, #DC143C 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .ticket-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #DC143C;
    }
    .ticket-number {
      font-size: 32px;
      font-weight: bold;
      color: #DC143C;
      text-align: center;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .detail-label {
      font-weight: 600;
      color: #555;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #eee;
      color: #666;
      font-size: 14px;
    }
    .cta-button {
      display: inline-block;
      background: #DC143C;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎬 ${eventName}</h1>
    <p>IJSE Student Committee</p>
  </div>
  
  <div class="content">
    <h2>Hello ${ticket.fullName}!</h2>
    <p>Thank you for booking your ticket. Your payment has been confirmed.</p>
    
    <div class="ticket-number">
      Ticket #${ticket.ticketNumber}
    </div>
    
    <div class="ticket-info">
      <h3>Event Details</h3>
      <div class="detail-row">
        <span class="detail-label">Event:</span>
        <span>${eventName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span>${eventDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span>${eventTime}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Venue:</span>
        <span>${eventVenue}</span>
      </div>
    </div>
    
    <div class="ticket-info">
      <h3>Booking Details</h3>
      <div class="detail-row">
        <span class="detail-label">Name:</span>
        <span>${ticket.fullName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email:</span>
        <span>${ticket.email}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Phone:</span>
        <span>${ticket.phone}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Amount Paid:</span>
        <span>LKR ${ticket.amount.toFixed(2)}</span>
      </div>
    </div>
    
    <p><strong>Important:</strong> Please bring your ticket (PDF attached) on the event day. Show the ticket number at the entrance to receive your physical ticket.</p>
    
    <p>See you at the movies! 🍿</p>
  </div>
  
  <div class="footer">
    <p>IJSE Student Committee<br>
    This is an automated email. Please do not reply.</p>
  </div>
</body>
</html>
    `;
  }
}

export default new EmailService();
