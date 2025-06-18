import express from "express";
import matchController from "../controllers/matchController.js";

const router = express.Router();

router.get("/matches/:userId", matchController.getMatches);
router.post("/messages", matchController.sendMessage);

//decision
router.post("/pin", matchController.pinMatch);
router.post("/unpin", matchController.unpinMatch);
router.post("/feedback", matchController.giveFeedback);
router.post("/unlock-call", matchController.unlockVideoCall);

export default router;
