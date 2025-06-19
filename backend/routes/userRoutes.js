import express from "express";
import userController from "../controllers/userController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.put("/users/:id", verifyToken, userController.updateUserProfile);
router.post("/users/freeze-toggle", userController.toggleFreeze);
router.get("/:id/analytics", userController.getUserAnalytics);

export default router;
