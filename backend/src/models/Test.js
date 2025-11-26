import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  itemid: { type: Number },     // Excel itemid
  name: { type: String, required: true },
  price: Number,                // MRP
  offerRate: Number,            // Offer
  code: String,                 // Test code

  // ADD THIS — very important
  departmentName: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  // existing link
  department: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
   departmentName: String
}, { timestamps: true });

export default mongoose.model("Test", testSchema);
