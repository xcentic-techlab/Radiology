import Payment from "../models/Payment.js";
import Report from "../models/Report.js";
import { sendNotification } from "../services/notificationService.js";

/**
 * Create a payment entry (reception or admin)
 */
export async function createPayment(req, res) {
  const { report, amount, method } = req.body;

  const reportDoc = await Report.findById(report);
  if (!reportDoc) return res.status(404).json({ message: "Report not found" });

  const p = new Payment({
    report,
    amount,
    method,
    madeBy: req.user._id,
    status: "pending",
  });

  await p.save();

  // Notify admin + department
  await sendNotification({
    title: "Payment Initiated",
    message: `Payment created for case ${reportDoc.caseNumber}`,
    room: "admin_room",
    data: { paymentId: p._id },
  });

  res.status(201).json(p);
}

/**
 * Update payment status (admin)
 */
export async function updatePaymentStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const valid = ["pending", "success", "failed", "refunded"];
  if (!valid.includes(status))
    return res.status(400).json({ message: "Invalid status" });

  const payment = await Payment.findById(id);
  if (!payment) return res.status(404).json({ message: "Payment not found" });

  payment.status = status;
  await payment.save();

  // Also update report payment status if success
  if (status === "success") {
    await Report.findByIdAndUpdate(payment.report, { paymentStatus: "paid" });
  }

  // Notify patient + admin
  await sendNotification({
    title: "Payment Updated",
    message: `Payment status changed to ${status}`,
    room: "admin_room",
    data: { paymentId: id },
  });

  res.json(payment);
}

/**
 * Get payments by report ID
 */
export async function getPaymentsByReport(req, res) {
  const { reportId } = req.params;
  const payments = await Payment.find({ report: reportId }).sort({
    createdAt: -1,
  });
  res.json(payments);
}

/**
 * Admin: get all payments
 */
export async function getAllPayments(req, res) {
  const payments = await Payment.find()
    .populate("report")
    .populate("madeBy")
    .sort({ createdAt: -1 });

  res.json(payments);
}
