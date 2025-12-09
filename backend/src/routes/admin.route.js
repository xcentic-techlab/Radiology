import express from "express";
import multer from "multer";
import { uploadExcel } from "../controllers/adminController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post("/upload-excel", upload.single("file"), uploadExcel);

router.get("/upload-progress", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  global.uploadStream = res;
});


export default router;
