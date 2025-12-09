import Department from "../models/Department.js";
import User from "../models/User.js";  

export async function createDepartment(req, res) {
  try {
    const { name, code, description, deptid } = req.body;

    if (!name || !code || !deptid) {
      return res.status(400).json({ message: "Name, Code and Department ID are required" });
    }

    const cleanDeptId = deptid.trim();

    const dep = await Department.create({
      name,
      code,
      description,
      deptid: cleanDeptId,
    });

    await User.updateMany(
      { "department.deptid": cleanDeptId },
      { $set: { isActive: true } }
    );

    res.status(201).json({
      message: "Department created & employees activated",
      department: dep
    });

  } catch (err) {
    console.error("Create Department Error → ", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}


export async function listDepartments(req, res) {
  const deps = await Department.find().sort("name");
  res.json(deps);
}

export async function updateDepartment(req, res) {
  const { id } = req.params;

  try {
    const dep = await Department.findByIdAndUpdate(id, req.body, { new: true });

    if (!dep) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(dep);

  } catch (err) {
    res.status(500).json({ message: "Update error" });
  }
}


export async function deleteDepartment(req, res) {
  try {
    const { id } = req.params;

    const dep = await Department.findById(id);
    if (!dep) return res.status(404).json({ message: "Department not found" });

    await User.updateMany(
      { "department._id": dep._id.toString() },
      { $set: { isActive: false } }
    );
    await Department.findByIdAndDelete(id);

    res.json({ message: "Department deleted & employees inactivated" });

  } catch (err) {
    console.error("Delete Dept Error", err);
    res.status(500).json({ message: "Server error" });
  }
}

