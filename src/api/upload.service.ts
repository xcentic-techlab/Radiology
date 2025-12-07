import axios from "./axios";

export const uploadService = {
  uploadGovId: async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "govt-ids");

    const res = await axios.post("/upload/govt-id", fd, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    return res.data.url; // 👉 returns cloudinary secure URL
  }
};
