import express from "express";
import {
  createCase,
  getCaseById,
  getCasesByDepartment,
  updateCase,
  assignCase,
  uploadCaseReport
} from "../controllers/caseController.js";
import auth from "../middlewares/authMiddleware.js";
import { permit } from "../middlewares/roleMiddleware.js";
import { uploadReport as upload } from "../middlewares/cloudUpload.js";
import Case from "../models/Case.js";
import Report from "../models/Report.js";


const router = express.Router();



router.delete(
  "/:id",
  auth,
  permit("department_user", "admin", "super_admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const caseData = await Case.findById(id);
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      if (caseData.reportId) {
        await Report.findByIdAndDelete(caseData.reportId);
      }

      await Case.findByIdAndDelete(id);

      res.json({ success: true, message: "Case deleted successfully" });
    } catch (err) {
      console.error("DELETE CASE ERROR:", err);
      res.status(500).json({ message: "Server error deleting case" });
    }
  }
);


router.post("/create", createCase);
router.get("/department/:deptId", getCasesByDepartment);
router.get("/:id", getCaseById);
router.put("/:id", updateCase);
router.put("/:id/assign", assignCase);

router.post(
  "/:id/upload-report",
  auth,
  permit("department_user", "admin", "super_admin"),
  upload.single("file"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      report.reportFile = {
        url: req.file.path,
        public_id: req.file.filename,
        filename: req.file.originalname,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
      };

      report.status = "report_uploaded";
      await report.save();

      res.json({ message: "File saved", report });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.delete(
  "/:id",
  auth,
  permit("department_user", "admin", "super_admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const caseData = await Case.findById(id);
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      if (caseData.reportId) {
        await Report.findByIdAndDelete(caseData.reportId);
      }

      await Case.findByIdAndDelete(id);

      res.json({ success: true, message: "Case deleted successfully" });
    } catch (err) {
      console.error("DELETE CASE ERROR:", err);
      res.status(500).json({ message: "Server error deleting case" });
    }
  }
);



export default router;
