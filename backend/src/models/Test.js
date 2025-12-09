import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  itemid: { type: Number },
  name: { type: String, required: true },
  price: Number,
  offerRate: Number,            
  code: String,                 
  departmentName: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  department: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
   departmentName: String
}, { timestamps: true });

export default mongoose.model("Test", testSchema);
