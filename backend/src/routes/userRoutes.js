import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  createUser
} from "../controllers/userController.js";

import auth from "../middlewares/authMiddleware.js";
import { permit } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/**
 * Super Admin & Admin:
 *  - View all users
 *  - Update users
 *  - Activate / deactivate users
 */
router.post("/", auth, createUser);
router.get("/", auth, getAllUsers);
router.get("/:id", auth, getUserById);

router.put("/:id", auth, permit("super_admin", "admin"), updateUser);
router.patch("/:id/deactivate", auth, permit("super_admin", "admin"), deactivateUser);
router.patch("/:id/activate", auth, permit("super_admin", "admin"), activateUser);

export default router;
