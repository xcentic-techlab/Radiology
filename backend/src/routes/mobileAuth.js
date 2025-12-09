import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import MobileUser from "../models/MobileUser.js";
import Otp from "../models/Otp.js";
import { sendOtp } from "../utils/smsMock.js";
import MobilePatient from "../models/MobilePatient.js"; 

dotenv.config();

const router = express.Router();

// function generateOtp() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

console.log("LOADED OTP FN:", generateOtp());



function generateOtp() {
  return "123456";   
}


async function handleOtpSend(mobile, userData = {}) {
  let user = await MobileUser.findOne({ mobile });
  if (!user && userData.createNew) {
    user = await MobileUser.create({
      mobile,
      fullName: userData.fullName,
      email: userData.email,
    });
  } else if (!user && !userData.createNew) {
    throw new Error("User not found. Please sign up first.");
  }

  const otpCode = generateOtp();
  const expiryMin = parseInt(process.env.OTP_EXPIRY_MIN || "5", 10);
  const expiresAt = new Date(Date.now() + expiryMin * 60 * 1000);

  await Otp.findOneAndUpdate(
    { mobile },
    { otp: otpCode, expiresAt },
    { upsert: true, new: true }
  );



  await sendOtp(mobile, otpCode);
  return expiresAt;
}


router.post("/signup", async (req, res) => {
  try {
    const { fullName, mobile, email } = req.body;
    if (!mobile) return res.status(400).json({ error: "Mobile is required" });

    const existing = await MobileUser.findOne({ mobile });
    if (existing)
      return res.status(400).json({ error: "User already exists. Please sign in." });

    const expiresAt = await handleOtpSend(mobile, { fullName, email, createNew: true });
    res.json({ ok: true, msg: "OTP sent (mock)", expiresAt });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Server error" });
  }
});


router.post("/signin", async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ error: "Mobile number is required" });
    }

    console.log("SIGN-IN MOBILE RECEIVED:", mobile);

    const user = await MobileUser.findOne({ mobile });
    if (!user) {
      return res.status(400).json({ error: "User not found. Please sign up first." });
    }

    const expiresAt = await handleOtpSend(mobile, { createNew: false });

    return res.json({ ok: true, msg: "OTP sent (mock)", expiresAt });

  } catch (err) {
    console.error("SIGNIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/verify", async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp)
      return res.status(400).json({ error: "mobile & otp required" });

    const record = await Otp.findOne({ mobile });
    if (!record)
      return res.status(400).json({ error: "No OTP requested for this number" });

    if (new Date() > record.expiresAt)
      return res.status(400).json({ error: "OTP expired" });

    if (record.otp !== otp)
      return res.status(400).json({ error: "Invalid OTP" });

    let user = await MobileUser.findOne({ mobile });
    if (!user)
      return res.status(400).json({ error: "User not found. Please sign up first." });

    const patient = await MobilePatient.findOne({ "contact.phone": mobile });


    let role = patient ? "patient" : "user";

    const token = jwt.sign(
      { id: user._id, mobile: user.mobile, role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    await Otp.deleteOne({ mobile });

    return res.json({
      ok: true,
      token,
      role,
      user,
      isPatient: !!patient,
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
