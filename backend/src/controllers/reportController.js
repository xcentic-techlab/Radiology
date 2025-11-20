import Report from "../models/Report.js";
import { emitToRoom } from "../utils/socket.js";
import Notification from "../models/Notification.js";
import Patient from "../models/Patient.js";
import "../models/Department.js";
import Case from "../models/Case.js";


export async function createReport(req, res) {
  try {
    const { procedure, scheduledAt, assignedTo, caseId } = req.body;
    const patientId = req.body.patientId;
    const departmentId = req.body.department;

    const patient = await Patient.findById(patientId);
    if (!patient)
      return res.status(404).json({ message: "Patient not found" });

    const r = new Report({
      patient: patientId,
      department: departmentId,
      createdBy: req.user._id,
      assignedTo,
      procedure,
      scheduledAt,
      case: caseId,
      caseNumber: `CASE-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    });

    await r.save();

    // ⭐ IMPORTANT FIX — UPDATE CASE CORRECTLY
    await Case.findByIdAndUpdate(caseId, {
      reportId: r._id,
      status: "pending"   // or "approved" if you want auto approve
    });

    const populated = await r.populate(
      "patient department createdBy assignedTo case"
    );

    emitToRoom(`department_${departmentId}`, "new_report", populated);

    res.status(201).json(populated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Report creation failed" });
  }
}



export async function uploadReportFile(req, res){
  // department or admin uploads report PDF
  const { id } = req.params; // report id
  const file = req.file;
  if(!file) return res.status(400).json({ message: "No file" });

  const r = await Report.findById(id);
  if(!r) return res.status(404).json({ message: "Report not found" });

  r.reportFile = {
    url: `/uploads/${file.filename}`,
    filename: file.originalname,
    uploadedBy: req.user._id,
    uploadedAt: new Date()
  };
  r.status = "report_uploaded";
  await r.save();

  // notify patient / reception / admin
  emitToRoom(`patient_${r.patient}`, "report_uploaded", r);
  emitToRoom(`department_${r.department}`, "report_uploaded", r);
  emitToRoom("admin_room", "report_uploaded", r);

  const populated = await r.populate("patient department createdBy assignedTo");
  res.json(populated);

}

export async function changeStatus(req, res){
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ["in_progress","report_uploaded","reviewed","approved","cancelled","paid"];
  if(!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
  const r = await Report.findByIdAndUpdate(id, { status }, { new: true });
  if(!r) return res.status(404).json({ message: "Not found" });

  // emit updates
  emitToRoom(`department_${r.department}`, "status_changed", r);
  emitToRoom(`patient_${r.patient}`, "status_changed", r);
  // save notification
  const note = await Notification.create({
    title: `Status changed to ${status}`,
    message: `Case ${r.caseNumber} is now ${status}`,
    room: `department_${r.department}`,
    data: { reportId: r._id }
  });
  const populated = await r.populate("patient department createdBy assignedTo");
  res.json(populated);

}

export async function getReport(req, res){
  const { id } = req.params;
  const r = await Report.findById(id).populate("patient department createdBy assignedTo");
  if(!r) return res.status(404).json({ message: "Not found" });
  res.json(r);
}

export async function listReports(req, res){
  // filters: department, status, patientId
  const q = {};
  if(req.query.department) q.department = req.query.department;
  if(req.query.status) q.status = req.query.status;
  if(req.query.patient) q.patient = req.query.patient;
  const list = await Report.find(q).populate("patient department createdBy assignedTo").sort({ createdAt: -1 }).limit(200);
  res.json(list);
}


export async function deleteReport(req, res) {
  const { id } = req.params;

  const report = await Report.findById(id);
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  await Report.findByIdAndDelete(id);

  res.json({ message: "Report deleted successfully" });
}

export async function updateReport(req, res) {
  const { id } = req.params;

  const updates = {};

  if (req.body.procedure !== undefined) updates.procedure = req.body.procedure;
  if (req.body.scheduledAt !== undefined) updates.scheduledAt = req.body.scheduledAt;
  if (req.body.status !== undefined) updates.status = req.body.status;
  if (req.body.findings !== undefined) updates.findings = req.body.findings;
  if (req.body.impression !== undefined) updates.impression = req.body.impression;

  const report = await Report.findByIdAndUpdate(id, updates, { new: true });

  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  const populated = await report.populate(
    "patient department createdBy assignedTo"
  );

  res.json(populated);
}
