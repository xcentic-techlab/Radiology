import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String },
  passwordHash: { type: String },
  role: { 
    type: String, 
    enum: ["super_admin","admin","reception","department_user","patient"],
    default: "reception"
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" }, 
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
