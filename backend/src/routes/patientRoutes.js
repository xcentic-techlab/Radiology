import express from "express";
import {
  createPatient,
  getPatient,
  listPatients
} from "../controllers/patientController.js";
import auth from "../middlewares/authMiddleware.js";
import { permit } from "../middlewares/roleMiddleware.js";
import Patient from "../models/Patient.js";
import { uploadGovtId } from "../middlewares/cloudUpload.js";

const router = express.Router();

router.post("/", auth, permit("reception", "admin", "super_admin"), createPatient);

router.get("/:id", auth, getPatient);

router.get("/", auth, listPatients);


router.put("/:id", auth, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (err) {
    console.error("Patient update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/:id/payment", auth, permit("reception", "admin"), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient)
      return res.status(404).json({ message: "Patient not found" });
    patient.status = "in_progress";
    patient.paymentStatus = "paid";

    await patient.save();

    res.json({
      message: "Payment recorded, patient now in_progress",
      patient
    });

  } catch (err) {
    console.error("Payment Update Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/:id/assign-department",
  auth,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { departmentId } = req.body;

      if (!departmentId) {
        return res.status(400).json({ message: "Department ID is required" });
      }

      const patient = await Patient.findById(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      patient.departmentAssignedTo = departmentId;
      patient.assignedDepartment = req.body.departmentName;
      patient.departmentAssignedBy = req.user._id;
      patient.departmentAssignedAt = new Date();
      patient.status = "sent_to_department";

      await patient.save();

      res.json({
        message: "Patient assigned to department successfully",
        patient
      });

    } catch (err) {
      console.error("Assign Department Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


router.patch("/:id/update-history", auth, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        clinicalHistory: req.body.clinicalHistory,
        previousInjury: req.body.previousInjury,
        previousSurgery: req.body.previousSurgery,
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});





router.post(
  "/:id/upload-govt-id",
  auth,
  uploadGovtId.single("file"),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) return res.status(404).json({ message: "Not found" });

      if (!patient.govtId) {
        patient.govtId = {};
      }

      patient.govtId.fileUrl = req.file.path;
      await patient.save();

      res.json({
        message: "Govt ID updated",
        fileUrl: req.file.path,
        patient,
      });
    } catch (err) {
      console.log("Govt ID Upload Error", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Patient.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Patient deleted successfully" });

  } catch (err) {
    console.error("Delete Patient Error:", err);
    res.status(500).json({ message: "Server error deleting patient" });
  }
});




export default router;
