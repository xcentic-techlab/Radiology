import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";

import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import departmentRoutes from "./src/routes/departmentRoutes.js";
import patientRoutes from "./src/routes/patientRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import uploadRoutes from "./src/routes/upload.route.js";
import { initSocket } from "./src/utils/socket.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import caseRoutes from "./src/routes/caseRoutes.js";
import adminRoutes from "./src/routes/admin.route.js";
import testRoutes from "./src/routes/testRoutes.js";
import seedAdmin from "./src/seed/seedAdmin.js";



dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));


// static upload folder
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tests", testRoutes);


// Error Handler
app.use(errorHandler);

// DB Connect + Server Start
const PORT = process.env.PORT || 4000;

connectDB()
  .then(async() => {

    await seedAdmin();

    const io = new IOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
      },
    });

    initSocket(io);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("DB connection failed:", err);
  });
