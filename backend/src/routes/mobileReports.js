import express from "express";
import auth from "../middlewares/mobileAuth.js";
import mobileAuth from "../middlewares/mobileAuth.js";
import MobileReport from "../models/MobileReport.js";
import Patient from "../models/Patient.js";

const router = express.Router();
router.post("/", auth, async (req, res) => {
  try {
    const {
      patientId,
      case: caseId,
      procedure,
      indication,
      technique,
      findings,
      impression,
      conclusion,
      notes,
      reportFile,
    } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: "patientId is required" });
    }

    // Fetch patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const phone = patient?.contact?.phone;

    if (!phone) {
      return res.status(400).json({ error: "Patient phone missing" });
    }

    const caseNumber = "CASE-" + Date.now();
    const report = await MobileReport.create({
      phone: phone,   
      patient: patientId,
      case: caseId,
      caseNumber,
      department: req.user.department,
      procedure,
      indication,
      technique,
      findings,
      impression,
      conclusion,
      notes,
      status: "approved",
      reportFile,
      createdBy: req.user.id,
      assignedTo: req.user.id
    });


    res.json({ ok: true, report });

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});




router.get("/", mobileAuth, async (req, res) => {

  try {
    const mobile = req.user.mobile;

    const reports = await MobileReport.find({ phone: mobile })
      .sort({ createdAt: -1 });

    return res.json({ ok: true, reports });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});



router.get("/:id", mobileAuth, async (req, res) => {
  try {
    const mobile = req.user.mobile;
    const report = await MobileReport.findOne({
      _id: req.params.id,
      phone: mobile,  
    });

    if (!report) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json({ ok: true, report });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});


export default router;
