import express from "express";
import Test from "../models/Test.js";
import { getTestsByDeptName } from "../controllers/testController.js";  // ⭐ ADD THIS


const router = express.Router();

router.get("/", async (req, res) => {
  const tests = await Test.find().populate("department");
  res.json(tests);
});

router.get("/department/:id", async (req, res) => {
  try {
    const tests = await Test.find({ department: req.params.id });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: "Failed to load tests" });
  }
});

router.get("/by-dept-name/:name", getTestsByDeptName);


export default router;
