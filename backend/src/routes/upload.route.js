import express from "express";
import { uploadGovtId, uploadReport } from "../middlewares/cloudUpload.js";

const router = express.Router();

router.post("/govt-id", uploadGovtId.single("file"), async (req, res) => {
  return res.json({ success: true, url: req.file.path });
});

router.post("/report", uploadReport.single("file"), async (req, res) => {
  return res.json({ success: true, url: req.file.path });
});

export default router;
