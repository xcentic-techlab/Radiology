import Department from "../models/Department.js";

export async function createDepartment(req, res){
  const { name, code, description } = req.body;
  if(!name) return res.status(400).json({ message: "Name required" });
  const dep = new Department({ name, code, description });
  await dep.save();
  res.status(201).json({ department: dep });
}

export async function listDepartments(req, res){
  const deps = await Department.find().sort("name");
  res.json(deps);
}

export async function updateDepartment(req, res){
  const { id } = req.params;
  const dep = await Department.findByIdAndUpdate(id, req.body, { new: true });
  if(!dep) return res.status(404).json({ message: "Not found" });
  res.json(dep);
}

export async function deleteDepartment(req, res){
  const { id } = req.params;
  await Department.findByIdAndDelete(id);
  res.json({ message: "Deleted" });
}
