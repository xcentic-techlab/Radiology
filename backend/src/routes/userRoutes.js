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
import { deleteUser } from "../controllers/userController.js";

const router = express.Router();

router.delete(
  "/:id",
  auth,
  permit("admin", "super_admin"),
  deleteUser
);

router.post("/", auth, createUser);
router.get("/", auth, getAllUsers);
router.get("/:id", auth, getUserById);

router.put("/:id", auth, permit("super_admin", "admin"), updateUser);
router.patch("/:id/deactivate", auth, permit("super_admin", "admin"), deactivateUser);
router.patch("/:id/activate", auth, permit("super_admin", "admin"), activateUser);

export default router;
