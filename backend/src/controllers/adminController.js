import XLSX from "xlsx";
import Department from "../models/Department.js";
import Test from "../models/Test.js";

function normalize(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "");
}

function sendProgress(message) {
  if (global.uploadStream) {
    global.uploadStream.write(`data: ${JSON.stringify({ message })}\n\n`);
  }
}

export const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    for (let row of data) {
      const deptNameRaw =
        row.deptname || row.Department || row.DEPT || row.dept || "";
      const deptIdRaw = row.deptid || row.ID || row.Code || row.code || "";

      const deptNameNormalized = normalize(deptNameRaw);
      const deptIdExcel = String(deptIdRaw).trim();

      if (!deptNameNormalized || !deptIdExcel) continue;

      let dept = await Department.findOne({
        $or: [
          { deptid: deptIdExcel },
          { name: deptNameRaw.trim().toLowerCase() },
        ],
      });
      if (!dept) {
        dept = await Department.create({
          deptid: deptIdExcel,
          name: deptNameRaw.trim(),
          code: row.deptcode || "DEP" + deptIdExcel,
          description: row.description || "",
        });

        sendProgress(`Department added: ${dept.name}`);
      }
      const itemId = String(
        row.itemid || row.ItemID || row.TestID || ""
      ).trim();

      if (!itemId) continue;
      const existingTest = await Test.findOne({
        itemid: itemId,
        department: dept._id,
      });

      if (existingTest) continue;
      await Test.create({
        itemid: itemId,
        name: row.itemname || row.Name || row.TestName,
        price: row.MRP || row.Price,
        offerRate: row.OfferRate || row.Offer || row.DiscountedPrice,
        code: row.code || row.TestCode,
        department: dept._id,
        deptid: deptIdExcel,
        departmentName: dept.name,
      });

      sendProgress(`Test imported: ${itemId} (${dept.name})`);
    }

    sendProgress("DONE");

    return res.json({
      success: true,
      message: "Excel imported successfully!",
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    sendProgress("ERROR");

    return res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
};
