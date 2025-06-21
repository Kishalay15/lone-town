import express from "express";
import matchController from "../controllers/matchController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/matches", verifyToken, matchController.getMatches);
router.post("/messages", matchController.sendMessage);
router.post("/create", matchController.createMatch);

//decision
router.post("/pin", matchController.pinMatch);
router.post("/unpin", matchController.unpinMatch);
router.post("/feedback", matchController.giveFeedback);
router.post("/unlock-call", matchController.unlockVideoCall);
router.get("/match/:matchId", matchController.getMatchById);

export default router;
