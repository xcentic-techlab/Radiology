import mongoose from "mongoose";

const MobilePatientSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
    },

    name: {
      type: String,
      default: "",
    },

    age: {
      type: Number,
      default: null,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },

    address: {
      type: String,
      default: "",
    },
  },

  { timestamps: true }
);

export default mongoose.model("MobilePatient", MobilePatientSchema);
