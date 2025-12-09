import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  room: String,
  isRead: { type: Boolean, default: false },
  data: Object
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
