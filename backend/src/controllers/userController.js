import User from "../models/User.js";
import bcrypt from "bcryptjs";


/**
 * GET all users (Admin)
 */
export async function getAllUsers(req, res) {
  const users = await User.find().select("-passwordHash").populate("department");
  res.json(users);
}

/**
 * GET user by ID
 */
export async function getUserById(req, res) {
  const { id } = req.params;
  const user = await User.findById(id).select("-passwordHash").populate("department");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
}

/**
 * Update user
 */
export async function updateUser(req, res) {
  const { id } = req.params;
  const updates = req.body;

  // Prevent changing password directly here
  delete updates.passwordHash;

  const user = await User.findByIdAndUpdate(id, updates, { new: true })
    .select("-passwordHash")
    .populate("department");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
}

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "User deleted" });

  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * Deactivate user
 */
export async function deactivateUser(req, res) {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ message: "User deactivated", user });
}

/**
 * Activate user
 */
export async function activateUser(req, res) {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true }
  );

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ message: "User activated", user });
}

export async function createUser(req, res) {
  try {
    const { name, email, phone, password, role, department } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role,
      department
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
}