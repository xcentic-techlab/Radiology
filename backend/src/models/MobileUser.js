import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  fullName: { type: String },
  email: { type: String, index: true, sparse: true },
  mobile: { type: String, required: true, unique: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const MobileUser = mongoose.model("MobileUser", userSchema);

export default MobileUser;
