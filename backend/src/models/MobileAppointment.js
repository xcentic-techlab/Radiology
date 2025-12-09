import mongoose from "mongoose";

const { Schema } = mongoose;

const appointmentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "MobileUser", required: true },
  procedure: { type: String, required: true }, 
  center: { type: String, required: true }, 
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  doctor: { type: String },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  paymentMethod: { type: String, enum: ["Pay Now", "Pay at Center"], required: true },
  paymentStatus: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const MobileAppointment = mongoose.model("MobileAppointment", appointmentSchema);
export default MobileAppointment;
