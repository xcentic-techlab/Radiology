import express from "express";
import auth from "../middlewares/mobileAuth.js";
import MobileAppointment from "../models/MobileAppointment.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const {
      procedure,
      center,
      fullName,
      mobile,
      email,
      doctor,
      date,
      time,
      paymentMethod,
    } = req.body;

    if (!procedure || !center || !fullName || !mobile || !date || !time)
      return res.status(400).json({ error: "All required fields must be filled" });

    const newAppt = await MobileAppointment.create({
      user: req.user.id,
      procedure,
      center,
      fullName,
      mobile,
      email,
      doctor,
      date,
      time,
      paymentMethod,
      paymentStatus: paymentMethod === "Pay at Center" ? "Pending" : "Completed",
    });

    res.json({ ok: true, appointment: newAppt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const appts = await MobileAppointment.find({ user: req.user.id }).sort({ date: -1 });
    res.json({ ok: true, appointments: appts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const appt = await MobileAppointment.findOne({ _id: req.params.id, user: req.user.id });
    if (!appt) return res.status(404).json({ error: "Not Found" });
    res.json({ ok: true, appointment: appt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await MobileAppointment.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not Found" });
    res.json({ ok: true, appointment: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await MobileAppointment.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ error: "Not Found" });
    res.json({ ok: true, msg: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;
