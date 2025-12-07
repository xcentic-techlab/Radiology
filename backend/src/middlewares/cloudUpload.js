import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const reportStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "hospital_reports",
    resource_type: "raw",
    allowed_formats: ["pdf"],
    public_id: `report_${Date.now()}`,
  }),
});



/** 🟡 STORAGE FOR GOVT IDs */
const govtStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "govt_ids",
    resource_type: "raw",          // IDs can be images or PDFs
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    public_id: (req, file) => {
      return `govt_${Date.now()}`;
    }
  },
});

// EXPORT BOTH
export const uploadReport = multer({ storage: reportStorage });
export const uploadGovtId = multer({ storage: govtStorage });
