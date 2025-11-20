import express from "express";
import {
  createDepartment,
  listDepartments,
  updateDepartment,
  deleteDepartment
} from "../controllers/departmentController.js";
import auth from "../middlewares/authMiddleware.js";
import { permit } from "../middlewares/roleMiddleware.js";
import Patient from "../models/Patient.js";

const router = express.Router();

/**********************************
 *  CREATE / LIST / UPDATE / DELETE
 **********************************/
router.get("/", auth, listDepartments);
router.post("/", auth, permit("super_admin", "admin"), createDepartment);
router.put("/:id", auth, permit("super_admin", "admin"), updateDepartment);
router.delete("/:id", auth, permit("super_admin", "admin"), deleteDepartment);

/**********************************
 *  GET ALL PATIENTS OF THIS DEPT
 **********************************/
router.get("/:deptId/patients", auth, async (req, res) => {
  try {
    const patients = await Patient.find({
      departmentAssignedTo: req.params.deptId,
      status: { $in: ["sent_to_department", "in_progress"] }
    })
      .select("-__v -attachments")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(patients);
  } catch (err) {
    console.error("Dept Patient List Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**********************************
 *  GET FULL DETAILS OF A PATIENT
 *  (Only If Assigned To This Dept)
 **********************************/
router.get("/:id/details", auth, async (req, res) => {
  try {
    let patient = await Patient.findById(req.params.id)
      .select("-__v")
      .populate("createdBy", "name role")
      .populate("departmentAssignedBy", "name role");

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    if (req.user.role === "admin" || req.user.role === "super_admin") {
      return res.json(patient);
    }


    // ❗ BLOCK ACCESS FOR OTHER DEPARTMENTS
    if (
      patient.departmentAssignedTo?.toString() !==
      req.user.department?.toString()
    ) {
      return res.status(403).json({ message: "❌ Access denied: Not your patient" });
    }

    // MASK GOVT ID
    if (patient.govtId?.idNumber) {
      patient.govtId.idNumber =
        patient.govtId.idNumber.slice(-4).padStart(
          patient.govtId.idNumber.length,
          "X"
        );
    }

    res.json(patient);
  } catch (err) {
    console.error("Patient Details Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**********************************
 *  UPDATE CLINICAL HISTORY
 **********************************/
router.put("/:id/update-history", auth, async (req, res) => {
  try {
    const check = await Patient.findById(req.params.id);
    if (!check) return res.status(404).json({ message: "Patient not found" });

    // ❗ ACCESS VALIDATION
    if (
      req.user.role !== "admin" &&
      req.user.role !== "super_admin" &&
      check.departmentAssignedTo?.toString() !== req.user.department?.toString()
    ) {
      return res.status(403).json({ message: "❌ You cannot edit this patient" });
    }


    const { clinicalHistory, previousInjury, previousSurgery } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { clinicalHistory, previousInjury, previousSurgery },
      { new: true }
    );

    res.json({ message: "📝 History updated", patient });
  } catch (err) {
    console.error("Update History Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**********************************
 *  ADD ATTACHMENT
 **********************************/
router.post("/:id/add-attachment", auth, async (req, res) => {
  try {
    const check = await Patient.findById(req.params.id);
    if (!check) return res.status(404).json({ message: "Patient not found" });

    // ❗ ACCESS VALIDATION
    if (
      req.user.role !== "admin" &&
      req.user.role !== "super_admin" &&
      check.departmentAssignedTo?.toString() !== req.user.department?.toString()
    ) {
      return res.status(403).json({ message: "❌ Not allowed" });
    }

    const { fileName, fileUrl } = req.body;

    await Patient.findByIdAndUpdate(req.params.id, {
      $push: {
        attachments: { fileName, fileUrl }
      }
    });

    res.json({ message: "📎 Attachment Added Successfully" });
  } catch (err) {
    console.error("Attachment Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
