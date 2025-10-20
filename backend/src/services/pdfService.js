import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PDF Service - Generates branded PDF tickets using Puppeteer
 */
class PdfService {
  /**
   * Generate PDF ticket
   * @param {Object} ticket - Ticket data from database
   * @returns {Buffer} - PDF buffer
   */
  async generateTicket(ticket) {
    let browser = null;

    try {
      // Read HTML template
      const templatePath = path.join(__dirname, "../../templates/ticket.html");
      let htmlTemplate = await fs.readFile(templatePath, "utf-8");

      // Replace placeholders with actual data (now async because of QR code generation)
      const html = await this.populateTemplate(htmlTemplate, ticket);

      // Launch headless browser
      browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();

      // Set content and wait for assets to load
      await page.setContent(html, {
        waitUntil: "networkidle0",
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
      });

      return pdfBuffer;
    } catch (error) {
      console.error("PDF Generation Error:", error);
      throw new Error("Failed to generate PDF ticket");
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Populate HTML template with ticket data
   */
  async populateTemplate(template, ticket) {
    const eventDate = process.env.EVENT_DATE || "[Event Date]";
    const eventTime = process.env.EVENT_TIME || "[Event Time]";
    const eventVenue = process.env.EVENT_VENUE || "[Event Venue]";
    const eventName = process.env.EVENT_NAME || "Movie Night 2025";

    // Generate QR code as base64 data URL
    const qrData = JSON.stringify({
      ticketNumber: ticket.ticketNumber,
      orderId: ticket.orderId,
      name: ticket.fullName,
      event: eventName,
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    const replacements = {
      "{{TICKET_NUMBER}}": ticket.ticketNumber,
      "{{FULL_NAME}}": ticket.fullName,
      "{{EMAIL}}": ticket.email,
      "{{PHONE}}": ticket.phone,
      "{{EVENT_NAME}}": eventName,
      "{{EVENT_DATE}}": eventDate,
      "{{EVENT_TIME}}": eventTime,
      "{{EVENT_VENUE}}": eventVenue,
      "{{ORDER_ID}}": ticket.orderId,
      "{{PURCHASE_DATE}}": new Date(ticket.createdAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      ),
      "{{AMOUNT}}": `LKR ${ticket.amount.toFixed(2)}`,
      "{{QR_CODE}}": qrCodeDataURL, // QR code as base64 image
    };

    let html = template;
    for (const [placeholder, value] of Object.entries(replacements)) {
      html = html.replace(new RegExp(placeholder, "g"), value);
    }

    return html;
  }
}

export default new PdfService();
