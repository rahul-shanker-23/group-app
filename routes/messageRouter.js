import express from "express";
import * as messageController from "./../controllers/messageController.js";
import * as authController from "./../controllers/authController.js";

const router = express.Router();

router.use(authController.protect);

router.get("/:id", messageController.getAll);
router.post("/", messageController.create);

router.post("/like", messageController.like);
router.post("/unlike", messageController.unlike);

export default router;
