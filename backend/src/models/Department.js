import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    },

    deptid: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

departmentSchema.index({ name: "text", code: "text" });

export default mongoose.model("Department", departmentSchema);
