// models/Report.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    caseNumber: { type: String, unique: true },
    case: { type: mongoose.Schema.Types.ObjectId, ref: "Case" },


    status: {
  type: String,
  enum: ["pending", "approved"],
  default: "pending",
},


    procedure: String,
    scheduledAt: Date,

    // PROFESSIONAL REPORT FIELDS
    indication: String,
    technique: String,
    findings: String,
    impression: String,
    conclusion: String,
    notes: String,

    phone: { type: String },


    // CLOUDINARY FILE STORE
    reportFile: {
      url: String,
      public_id: String,
      filename: String,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      uploadedAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
