import XLSX from "xlsx";
import Department from "../models/Department.js";
import Test from "../models/Test.js";

// UNIVERSAL NORMALIZER
function normalize(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")      // multiple spaces → single
    .replace(/[^a-z0-9 ]/g, ""); // remove all special chars
}

export const uploadExcel = async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    for (let row of data) {
      // Normalize ALL incoming strings
      const deptNameRaw = row.deptname || row.Department || row.DEPT || "";
      const deptIdRaw   = row.deptid || row.ID || row.code || "";

      const deptNameExcel = normalize(deptNameRaw);
      const deptIdExcel   = String(deptIdRaw).trim();

      if (!deptNameExcel || !deptIdExcel) continue;

      // Find or create Department
      let dept = await Department.findOne({ deptid: deptIdExcel });

      if (!dept) {
        dept = await Department.create({
          deptid: deptIdExcel,
          name: deptNameExcel,
          code: row.deptcode || "DEP" + deptIdExcel,
          description: row.description || "",
        });
      }

      const itemId = String(row.itemid || row.ItemID || row.TestID || "").trim();
      if (!itemId) continue;

      // Prevent duplicates
      const existingTest = await Test.findOne({
        itemid: itemId,
        department: dept._id,
      });

      if (existingTest) continue;

      // Create Test
      await Test.create({
        itemid: itemId,
        name: row.itemname || row.Name || row.TestName,
        price: row.MRP || row.Price,
        offerRate: row.OfferRate || row.Offer || row.DiscountedPrice,
        code: row.code || row.TestCode,
        department: dept._id,
        deptid: row.deptid,  
        departmentName: deptNameExcel,
      });
    }

    res.json({ message: "Excel imported successfully!" });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: "Upload failed", error });
  }
};
