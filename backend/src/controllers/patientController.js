import Patient from "../models/Patient.js";

export async function createPatient(req, res) {
  try {
    const data = req.body;

    data.createdBy = req.user._id;

    // 🟩 TESTS FIX — ensure selectedTests is always an array
    if (data.selectedTests && Array.isArray(data.selectedTests)) {
      data.selectedTests = data.selectedTests.map(t => ({
        testId: t.testId,
        name: t.name,
        mrp: t.mrp,
        offerRate: t.offerRate,
        code: t.code,
        deptid: t.deptid
      }));
    } else {
      data.selectedTests = [];
    }

    const patient = new Patient(data);
    await patient.save();

    res.status(201).json(patient);
  } catch (err) {
    console.error("Create Patient Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


export async function getPatient(req, res) {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);

    if (!patient)
      return res.status(404).json({ message: "Not found" });

    res.json(patient);
  } catch (err) {
    console.error("Get Patient Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function listPatients(req, res) {
  try {
    const q = req.query.q;
    const query = {};

    if (q)
      query.$or = [
        { firstName: new RegExp(q, "i") },
        { lastName: new RegExp(q, "i") },
        { "contact.phone": new RegExp(q, "i") }
      ];

    const patients = await Patient.find(query)
      .limit(50)
      .sort({ createdAt: -1 });

    res.json(patients);
  } catch (err) {
    console.error("List Patients Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
