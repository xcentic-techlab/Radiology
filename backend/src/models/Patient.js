import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    address: String,

    contact: {
      phone: String,
      email: String,
    },

    age: Number,
    gender: String,
    caseDescription: String,

    caseType: {
      type: String,
      enum: ["Urgent", "Emergency", "Routine", "STAT"],
      required: true,
    },

    referredDoctor: String,

    patientId: {
      type: String,
      unique: true,
    },

    reportDate: {
      type: Date,
      default: Date.now,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
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

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    assignedDepartment: {
      type: String,
      set: (v) => v?.toLowerCase(),
      default: null,
    },

departmentAssignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    default: null
},


    departmentAssignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    departmentAssignedAt: Date,

    clinicalHistory: String,
    previousInjury: String,
    previousSurgery: String,

    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    govtId: {
      idType: String,
      idNumber: String,
      fileUrl: String,
    },
    selectedTests: [
      {
        testId: String,
        name: String,
        mrp: Number,
        offerRate: Number,
        code: String,
        deptid: Number, 
      },
    ],
  },
  { timestamps: true }
);

patientSchema.pre("save", function (next) {
  if (!this.patientId) {
    this.patientId = "PT-" + Date.now();
  }
  next();
});

export default mongoose.model("Patient", patientSchema);
