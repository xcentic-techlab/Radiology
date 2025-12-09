import express from "express";
import { register, login, me } from "../controllers/authController.js";
import auth from "../middlewares/authMiddleware.js";
import { permit } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/login", login);

router.post("/register",  permit("super_admin","admin"), register);

router.get("/me", auth, me);

export default router;
