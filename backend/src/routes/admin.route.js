import express from "express";
import multer from "multer";
import { uploadExcel } from "../controllers/adminController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload-excel", upload.single("file"), uploadExcel);

export default router;
