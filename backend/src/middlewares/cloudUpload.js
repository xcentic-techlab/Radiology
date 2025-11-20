import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

/** 🟢 STORAGE FOR REPORT FILES */
const reportStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hospital_reports",
    resource_type: "auto",
  },
});

/** 🟡 STORAGE FOR GOVT IDs */
const govtStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "govt_ids",
    resource_type: "auto",
  },
});

// EXPORT BOTH
export const uploadReport = multer({ storage: reportStorage });
export const uploadGovtId = multer({ storage: govtStorage });
