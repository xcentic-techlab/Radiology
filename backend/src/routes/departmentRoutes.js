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
import Department from "../models/Department.js";


const router = express.Router();

/**********************************
 *  CREATE / LIST / UPDATE / DELETE
 **********************************/
router.delete(
  "/:id",
  auth,
  permit("admin", "super_admin"),
  async (req, res) => {
    try {
      const dept = await Department.findById(req.params.id);
      if (!dept) return res.status(404).json({ message: "Department not found" });

      await Department.findByIdAndDelete(req.params.id);

      res.json({ success: true, message: "Department deleted" });
    } catch (err) {
      console.error("DELETE DEPT ERROR:", err);
      res.status(500).json({ message: "Server error deleting department" });
    }
  }
);

router.get("/:id", async (req, res) => {
  const dep = await Department.findById(req.params.id);
  if (!dep) return res.status(404).json({ message: "Not found" });
  res.json(dep);
});



router.get("/", auth, listDepartments);
router.post("/", auth, permit("super_admin", "admin"), createDepartment);
router.put("/:id", auth, permit("super_admin", "admin"), updateDepartment);
router.delete("/:id", auth, permit("super_admin", "admin"), deleteDepartment);

router.get("/:deptId/patients", auth, async (req, res) => {
  try {
    if (!req.params.deptId || req.params.deptId === "undefined") {
      return res.json([]);
    }

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


    if (
      patient.departmentAssignedTo?.toString() !==
      req.user.department?.toString()
    ) {
      return res.status(403).json({ message: "Access denied: Not your patient" });
    }
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


router.put("/:id/update-history", auth, async (req, res) => {
  try {
    const check = await Patient.findById(req.params.id);
    if (!check) return res.status(404).json({ message: "Patient not found" });

    if (
      req.user.role !== "admin" &&
      req.user.role !== "super_admin" &&
      check.departmentAssignedTo?.toString() !== req.user.department?.toString()
    ) {
      return res.status(403).json({ message: "You cannot edit this patient" });
    }


    const { clinicalHistory, previousInjury, previousSurgery } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { clinicalHistory, previousInjury, previousSurgery },
      { new: true }
    );

    res.json({ message: "History updated", patient });
  } catch (err) {
    console.error("Update History Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/add-attachment", auth, async (req, res) => {
  try {
    const check = await Patient.findById(req.params.id);
    if (!check) return res.status(404).json({ message: "Patient not found" });
    if (
      req.user.role !== "admin" &&
      req.user.role !== "super_admin" &&
      check.departmentAssignedTo?.toString() !== req.user.department?.toString()
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { fileName, fileUrl } = req.body;

    await Patient.findByIdAndUpdate(req.params.id, {
      $push: {
        attachments: { fileName, fileUrl }
      }
    });

    res.json({ message: "Attachment Added Successfully" });
  } catch (err) {
    console.error("Attachment Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
