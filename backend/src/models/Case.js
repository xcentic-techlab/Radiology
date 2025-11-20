import mongoose from "mongoose";

const caseSchema = new mongoose.Schema(
  {
    patientId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Patient", 
      required: true 
    },

    department: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Department", 
      required: true 
    },

    assignedTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: null 
    },

    procedure: { 
  type: String, 
//   required: true 
},


    scheduledAt: { 
      type: Date, 
      default: Date.now 
    },

    status: {
  type: String,
  enum: ["pending", "approved"],
  default: "pending"
},


    caseNumber: { 
      type: String, 
      unique: true 
    },

    reportId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Report", 
      default: null 
    },

    reportUrl: String,
  },
  { timestamps: true }
);

// AUTO caseNumber
caseSchema.pre("save", function (next) {
  if (!this.caseNumber) {
    this.caseNumber = "CASE-" + Date.now();
  }
  next();
});

export default mongoose.model("Case", caseSchema);
