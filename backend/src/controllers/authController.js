import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

export async function register(req, res){
  // Only admin or super_admin can create users — enforce via route middleware
  const { name, email, phone, password, role, department } = req.body;
  if(!name) return res.status(400).json({ message: "Name required" });

  const existing = email ? await User.findOne({ email }) : null;
  if(existing) return res.status(400).json({ message: "Email exists" });

  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
  const user = new User({ name, email, phone, passwordHash, role, department });
  await user.save();
  res.status(201).json({ message: "User created", user: { id: user._id, name: user.name, role: user.role } });
}

export async function login(req, res){
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ message: "Email & password required" });
  const user = await User.findOne({ email }).populate("department"); ;
  if(!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if(!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token, user: { id: user._id, name: user.name, role: user.role, department: user.department } });
}

export async function me(req, res){
  res.json({ user: req.user });
}
