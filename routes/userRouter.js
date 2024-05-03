import express from "express";
import * as authController from "./../controllers/authController.js";
import * as userController from "./../controllers/userController.js";

const router = express.Router();

router.post(
  "/signup",
  authController.protect,
  authController.restrictTo("admin"),
  authController.signup
);
router.put(
  "/update",
  authController.protect,
  authController.restrictTo("admin"),
  authController.updateUser
);

router.post("/login", authController.login);
router.get("/logout", authController.protect, authController.logout);

router.get("/", authController.protect, userController.getAllUser);
router.get("/:id", authController.protect, userController.getUser);

export default router;
