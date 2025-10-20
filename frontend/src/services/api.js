import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * API Service - Centralized API calls
 */
export const api = {
  // Ticket endpoints
  createBooking: async (bookingData) => {
    const response = await apiClient.post("/tickets/book", bookingData);
    return response.data;
  },

  getTicketByOrder: async (orderId) => {
    const response = await apiClient.get(`/tickets/order/${orderId}`);
    return response.data;
  },

  getTicket: async (ticketNumber) => {
    const response = await apiClient.get(`/tickets/${ticketNumber}`);
    return response.data;
  },

  downloadTicket: (ticketNumber) => {
    return `${API_BASE_URL}/tickets/${ticketNumber}/download`;
  },

  // Payment endpoints
  getPaymentStatus: async (orderId) => {
    const response = await apiClient.get(`/payment/status/${orderId}`);
    return response.data;
  },

  // Admin endpoints
  getAllTickets: async (filters, password) => {
    const response = await apiClient.get("/admin/tickets", {
      params: filters,
      headers: {
        Authorization: `Bearer ${password}`,
      },
    });
    return response.data;
  },

  getStatistics: async (password) => {
    const response = await apiClient.get("/admin/statistics", {
      headers: {
        Authorization: `Bearer ${password}`,
      },
    });
    return response.data;
  },

  redeemTicket: async (ticketNumber, password) => {
    const response = await apiClient.post(
      `/tickets/${ticketNumber}/redeem`,
      {},
      {
        headers: {
          Authorization: `Bearer ${password}`,
        },
      }
    );
    return response.data;
  },
};

export default api;
