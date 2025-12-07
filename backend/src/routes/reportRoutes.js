// routes/reportRoutes.js
import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { permit } from "../middlewares/roleMiddleware.js";
import Report from "../models/Report.js";
import Patient from "../models/Patient.js";
import { uploadReport as upload } from "../middlewares/cloudUpload.js";
import Case from "../models/Case.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();


console.log("🔥 REPORT ROUTES LOADED FROM:", import.meta.url);

router.delete(
  "/:id",
  auth,
  permit("department_user", "admin", "super_admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      console.log("DELETE HIT", req.params.id);
      // Find report
      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Remove Cloudinary file if exists
      if (report.reportFile?.public_id) {
        try {
          await cloudinary.uploader.destroy(report.reportFile.public_id);
        } catch (e) {
          console.log("Cloudinary delete failed", e);
        }
      }

      // Remove link from case
      if (report.caseId) {
        await Case.findByIdAndUpdate(report.caseId, {
          $unset: { reportId: "" },
        });
      }

      // Delete report
      await Report.findByIdAndDelete(id);

      res.json({ success: true, message: "Report deleted successfully" });
    } catch (err) {
      console.error("DELETE REPORT ERROR:", err);
      res.status(500).json({ message: "Server error deleting report" });
    }
  }
);






/* =========================
   ADMIN → GET ALL REPORTS
========================= */
router.get(
  "/department/all",
  auth,
  permit("admin", "super_admin"),
  async (req, res) => {
    try {
      const reports = await Report.find()
        .populate("patient", "firstName lastName")
        .populate("department", "name")
        .sort({ createdAt: -1 });

      res.json(reports);
    } catch (err) {
      console.error("ADMIN REPORT LIST ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   LOAD REPORTS BY DEPARTMENT
========================= */
router.get(
  "/department/:deptId",
  auth,
  permit("department_user", "admin"),
  async (req, res) => {
    try {
      const reports = await Report.find({ department: req.params.deptId })
        .populate("patient")
        .sort({ createdAt: -1 });

      res.json(reports);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);



router.get("/:id", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("patient")
      .populate("department")
      .populate("createdBy")
      .populate("assignedTo");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (err) {
    console.error("GET REPORT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.put(
  "/:id",
  auth,
  permit("department_user", "admin", "super_admin"),
  async (req, res) => {
    try {
      const report = await Report.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!report) return res.status(404).json({ message: "Report not found" });

      res.json(report);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


/* =========================
   CREATE REPORT (CASE BASED)
========================= */
router.post(
  "/create",
  auth,
  permit("department_user", "admin", "super_admin"),
  async (req, res) => {
    try {
      const report = new Report({
  patient: req.body.patientId,
  caseId: req.body.caseId,            // <-- ensure this exists in Report model
  department: req.body.department,
  createdBy: req.user._id,
  assignedTo: req.body.assignedTo || req.user._id,
  caseNumber: `CASE-${Date.now()}`,
  procedure: req.body.procedure,
  indication: req.body.indication,
  technique: req.body.technique,
  findings: req.body.findings,
  impression: req.body.impression,
  conclusion: req.body.conclusion,
  notes: req.body.notes,
  phone: phone,
});

      await report.save();
      res.status(201).json(report);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Failed to create report" });
    }
  }
);


/* =========================
   CLOUDINARY FILE UPLOAD
========================= */
router.post(
  "/upload/:reportId",
  auth,
  permit("department_user", "admin", "super_admin"),
  upload.single("file"),
  async (req, res) => {
    try {
      const { reportId } = req.params;

      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      const report = await Report.findById(reportId);
      if (!report) return res.status(404).json({ message: "Report not found" });

      console.log("DEBUG FILE:", req.file);

      // ⭐ If the file already uploaded by multer-storage-cloudinary
      //    and path is a Cloudinary URL → USE IT DIRECTLY
      const cloudURL = req.file.path;  // ⭐ Already hosted PDF URL

      report.reportFile = {
        url: cloudURL,
        public_id: req.file.filename,  // cloudinary public_id
        filename: req.file.originalname,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
      };

      await report.save();

      res.json({ message: "Uploaded", report });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);




/* =========================
   APPROVE REPORT (ADMIN)
========================= */
router.post(
  "/:id/approve",
  auth,
  permit("admin", "super_admin"),
  async (req, res) => {
    try {
      const report = await Report.findById(req.params.id);
      if (!report)
        return res.status(404).json({ message: "Report not found" });

      report.status = "approved";
      await report.save();

      await Patient.findByIdAndUpdate(report.patient, {
        status: "completed",
      });

      res.json({ message: "Report approved", report });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);



/* ============================================
   CREATE EMPTY REPORT FOR A CASE (QUICK CREATE)
=============================================== */
/* ============================================
   CREATE EMPTY REPORT FOR A CASE (QUICK CREATE)
=============================================== */
router.post(
  "/create/:caseId",
  auth,
  permit("department_user", "admin", "super_admin"),
  async (req, res) => {
    try {
      const { caseId } = req.params;

      // Check case exists
      const caseData = await Case.findById(caseId);
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }

      // Get patient phone
      const patientData = await Patient.findById(caseData.patientId);
      const phone = patientData?.contact?.phone || null;   // ⭐ IMPORTANT ⭐


      // Create empty report
const newReport = await Report.create({
  patient: caseData.patientId,   // ✅ FIXED
  caseId: caseId,
  department: caseData.department,
  createdBy: req.user._id,
  assignedTo: req.user._id,
  findings: "",
  impression: "",
  conclusion: "",
  notes: "",
  status: "pending",
  caseNumber: caseData.caseNumber,
  phone: phone, 
  createdAt: new Date(),
});


      // Save reportId back to case
      caseData.reportId = newReport._id;
      await caseData.save();

      res.json({
        success: true,
        reportId: newReport._id,
      });

    } catch (error) {
      console.error("CREATE EMPTY REPORT ERROR:", error);
      res.status(500).json({ message: "Server error creating report" });
    }
  }
);



export default router;
