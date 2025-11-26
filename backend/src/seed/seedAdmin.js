import User from "../models/User.js";
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
  try {
    const adminEmail = "admin@gmail.com";

    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log("ℹ️ Admin already exists. Skipping seed...");
      return;
    }

    // Create new admin
await User.create({
  name: "Super Admin",
  email: adminEmail,
  passwordHash: await bcrypt.hash("admin123", 10),
  role: "admin",
});


    console.log("✅ Default Admin Created!");
  } catch (error) {
    console.error("❌ Seed Error:", error);
  }
};

export default seedAdmin;
