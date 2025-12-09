import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const reportStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "hospital_reports",
    resource_type: "raw",
    allowedFormats: ["pdf"],
    public_id: `report_${Date.now()}`,
  }),
});

const govtStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "govt_ids",
    resource_type: "auto",        
    allowedFormats: ["jpg", "jpeg", "png", "pdf"],
    public_id: (req, file) => {
      return `govt_${Date.now()}`;
    }
  },
});

export const uploadReport = multer({
  storage: reportStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

export const uploadGovtId = multer({ storage: govtStorage });
