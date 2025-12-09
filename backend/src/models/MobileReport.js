import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "MobileUser" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "MobileUser" },

    caseNumber: { type: String, unique: true },
    case: { type: mongoose.Schema.Types.ObjectId, ref: "Case" },

    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },

    phone: { type: String, required: true },


    procedure: String,
    scheduledAt: Date,

    indication: String,
    technique: String,
    findings: String,
    impression: String,
    conclusion: String,
    notes: String,

    reportFile: {
      url: String,
      public_id: String,
      filename: String,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "MobileUser" },
      uploadedAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MobileReport", reportSchema, "reports");
