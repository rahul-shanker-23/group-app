import express from "express";
import * as groupController from "./../controllers/groupController.js";
import * as authController from "./../controllers/authController.js";

const router = express.Router();

router.use(authController.protect);

router.get("/", groupController.getAll);
router.post("/", groupController.create);

router.get("/:id", groupController.getOne);
router.delete("/:id", groupController.deleteOne);

router.post("/add", groupController.addUser);

export default router;
