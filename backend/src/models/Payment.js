import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
  amount: Number,
  method: String, // e.g., cash, card, online
  status: { type: String, enum: ["pending","success","failed","refunded"], default: "pending" },
  transactionId: String,
  madeBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // reception or patient
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
