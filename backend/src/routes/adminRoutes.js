import express from "express";
import {
  getAllTickets,
  getStatistics,
} from "../controllers/adminController.js";
import { adminAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/helpers.js";

const router = express.Router();

// All admin routes require authentication
router.use(asyncHandler(adminAuth));

// Routes
router.get("/tickets", getAllTickets);
router.get("/statistics", getStatistics);

export default router;
