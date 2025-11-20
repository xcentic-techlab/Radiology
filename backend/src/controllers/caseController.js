import Case from "../models/Case.js";
import Patient from "../models/Patient.js";

export const createCase = async (req, res) => {
  try {
    const { patientId, department, assignedTo } = req.body;

    const newCase = await Case.create({
      patientId,
      department,
      assignedTo: assignedTo || null,
      // procedure & scheduledAt auto-set by model defaults
    });

    res.json(newCase);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create case" });
  }
};


export const getCasesByDepartment = async (req, res) => {
  try {
    const cases = await Case.find({ department: req.params.deptId })
      .populate("patientId")
      .populate("assignedTo");

    const formatted = cases.map(c => ({
      ...c._doc,
      patient: c.patientId,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getCaseById = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate({ path: "patientId", select: "-__v", model: "Patient", as: "patient" })
      .populate("assignedTo");

    res.json(caseData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCase = async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const assignCase = async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.body.assignedTo },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const uploadCaseReport = async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      { reportUrl: req.file?.path },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
