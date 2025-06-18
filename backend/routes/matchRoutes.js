import express from "express";
import matchController from "../controllers/matchController.js";

const router = express.Router();

router.get("/matches/:userId", matchController.getMatches);
router.post("/messages", matchController.sendMessage);

export default router;
