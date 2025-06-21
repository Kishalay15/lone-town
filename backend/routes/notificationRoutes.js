import express from "express";
import notificationController from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, notificationController.getNotifications);
router.post("/mark-read", verifyToken, notificationController.markAsRead);

export default router;
