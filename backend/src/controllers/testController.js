import Test from "../models/Test.js";

export const getTestsByDeptName = async (req, res) => {
  try {
    const deptName = req.params.name.trim().toLowerCase();

    const tests = await Test.find({
      departmentName: deptName,
    });

    res.json(tests);
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ message: "Failed to load tests" });
  }
};
