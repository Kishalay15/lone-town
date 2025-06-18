import express from "express";
import notificationController from "../controllers/notificationController.js";

const router = express.Router();

router.get("/:userId", notificationController.getNotifications);
router.post("/mark-read/:userId", notificationController.markAsRead);

export default router;
