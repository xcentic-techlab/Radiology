import express from "express";
import {
  createPayment,
  updatePaymentStatus,
  getPaymentsByReport,
  getAllPayments
} from "../controllers/paymentController.js";

import auth from "../middlewares/authMiddleware.js";
import { permit } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Reception + Admin can create payments
router.post("/", auth, permit("reception", "admin", "super_admin"), createPayment);

// Update status: success/failed/refunded
router.patch("/:id/status", auth, permit("admin", "super_admin"), updatePaymentStatus);

// Get all payments for a report
router.get("/report/:reportId", auth, getPaymentsByReport);

// Admin can see all payments
router.get("/", auth, permit("admin", "super_admin"), getAllPayments);

export default router;
