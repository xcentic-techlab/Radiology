import express from "express";
import { register, login, me } from "../controllers/authController.js";
import auth from "../middlewares/authMiddleware.js";
import { permit } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// public
router.post("/login", login);

// protected - only admin or super_admin can create users via API
router.post("/register",  permit("super_admin","admin"), register);

// get current user
router.get("/me", auth, me);

export default router;
