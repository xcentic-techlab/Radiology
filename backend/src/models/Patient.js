import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    firstName: { type: String, },
    lastName: { type: String, },

    address: { type: String,},

    contact: {
      phone: { type: String, },
      email: { type: String, },
    },

    age: { type: Number, },
    gender: { type: String, },

    caseDescription: { type: String, },

    caseType: {
      type: String,
      enum: ["Urgent", "Emergency", "Routine", "STAT"],
      require: true
    },

    referredDoctor: String,

    // AUTO Patient ID
    patientId: {
      type: String,
      unique : true
    },

    // Auto date like Mongo
    reportDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: [
        "pending_payment",
        "in_progress",
        "sent_to_department",
        "reported",
        "completed",
      ],
      default: "pending_payment",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // IF using Department Model (Department collection)
    departmentAssignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    // Store department name directly (MRI / CT etc.)
assignedDepartment: {
  type: String,
  set: (v) => v?.toLowerCase(),
  default: null,
},



    // Kisne assign kiya (Reception/Admin)
    departmentAssignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Kab assign kiya
    departmentAssignedAt: Date,

    clinicalHistory: { type: String },
    previousInjury: { type: String },
    previousSurgery: { type: String },

    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],

    govtId: {
  type: {
    idType: {
      type: String,
      enum: ["Aadhaar", "PAN", "VoterID", "DrivingLicense", "Passport"],
      required: true
    },
    idNumber: {
      type: String,
      required: true
    },
    fileUrl: String   // PDF / Image link (optional)
  },
  required: true
},


  },
  { timestamps: true }
);

// AUTO-GENERATE PATIENT ID
patientSchema.pre("save", function (next) {
  if (!this.patientId) {
    this.patientId = "PT-" + Date.now();
  }
  next();
});

export default mongoose.model("Patient", patientSchema);
